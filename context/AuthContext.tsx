"use client";

import React, {
  createContext,
  useContext,
  useCallback,
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
        "사용자",
      profileImage:
        clerkUser.imageUrl ??
        `https://picsum.photos/seed/${primaryEmail}/150/150`,
    };
  }, [isSignedIn, clerkUser]);

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
        await clerkUser.update({
          firstName: nickname,
          lastName: "",
        });

        // base64 이미지인 경우 Clerk 프로필 사진 업데이트
        if (profileImage && profileImage.startsWith("data:")) {
          const response = await fetch(profileImage);
          const blob = await response.blob();
          const file = new File([blob], "avatar.png", { type: blob.type });
          await clerkUser.setProfileImage({ file });
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
