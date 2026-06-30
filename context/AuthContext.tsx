"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useTranslations } from "next-intl";
import { useUser, useSession, useClerk } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "./ToastContext";
import { createAuthenticatedClient } from "@/lib/supabase/client";

export interface User {
  id: string;      // Clerk user ID (auth.jwt()->>'sub')
  email: string;
  nickname: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  login: () => void;
  logout: () => void;
  updateProfile: (nickname: string, profileImage: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AuthContext");
  const router = useRouter();
  const { addToast } = useToast();

  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();

  // 로그인 시 profiles 레코드 자동 생성 (P1-1)
  // 같은 사용자에 대해 한 세션에서 한 번만 upsert하도록 ref로 추적
  const profileUpsertedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;
    if (profileUpsertedRef.current === clerkUser.id) return;

    profileUpsertedRef.current = clerkUser.id;

    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress ?? "";
    const nickname =
      clerkUser.fullName ??
      clerkUser.username ??
      primaryEmail.split("@")[0] ??
      t("defaultNickname");

    fetch("/api/profile/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }).catch((err) => {
      console.error("[AuthContext] profiles upsert failed:", err);
    });
  }, [isLoaded, isSignedIn, clerkUser, t]);

  const user = useMemo<User | null>(() => {
    if (!isSignedIn || !clerkUser) return null;

    const primaryEmail =
      clerkUser.primaryEmailAddress?.emailAddress ?? "";

    return {
      id: clerkUser.id,
      email: primaryEmail,
      nickname:
        clerkUser.fullName ??
        clerkUser.username ??
        primaryEmail.split("@")[0] ??
        t("defaultNickname"),
      profileImage:
        clerkUser.imageUrl ??
        `https://picsum.photos/seed/${primaryEmail}/150/150`,
    };
  }, [isSignedIn, clerkUser, t]);

  const login = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  const logout = useCallback(async () => {
    await signOut();
    addToast(t("loggedOut"));
    router.push("/");
    router.refresh();
  }, [signOut, addToast, router, t]);

  const updateProfile = useCallback(
    async (nickname: string, profileImage: string) => {
      if (!clerkUser) return;

      try {
        // 1) Clerk 닉네임 업데이트
        await clerkUser.update({ firstName: nickname, lastName: "" });

        // 2) Supabase profiles 닉네임 반영 (P1-4)
        await fetch("/api/profile/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "nickname", nickname }),
        });

        // 3) base64 이미지인 경우 Storage 업로드 후 profiles 반영 (P1-3)
        if (profileImage && profileImage.startsWith("data:")) {
          const fetchResponse = await fetch(profileImage);
          const blob = await fetchResponse.blob();
          const file = new File([blob], "avatar.png", { type: blob.type });

          // Clerk 프로필 사진 동기화
          await clerkUser.setProfileImage({ file });

          // Supabase Storage 업로드
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket", "avatars");
          formData.append("path", `${clerkUser.id}/avatar.png`);

          const uploadRes = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            // profiles.avatar_url 업데이트
            await fetch("/api/profile/upsert", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "avatar", avatarUrl: url }),
            });
          }
        }

        addToast(t("profileSaved"));
      } catch {
        addToast(t("profileSaveFailed"));
      }
    },
    [clerkUser, addToast, t]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoaded, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

/**
 * Clerk 세션 토큰을 주입한 Supabase 클라이언트를 반환하는 훅
 * RLS가 적용된 테이블에 접근할 때 사용하세요.
 *
 * @example
 * const supabase = useSupabaseClient()
 * const { data } = await supabase.from('purchases').select()
 */
export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () => createAuthenticatedClient(async () => session?.getToken() ?? null),
    [session]
  );
}
