import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertProfile, updateProfileNickname, updateProfileAvatar } from "@/lib/supabase/profiles";

/**
 * POST /api/profile/upsert
 * Body: { nickname?: string; avatarUrl?: string; action?: "upsert" | "nickname" | "avatar" }
 *
 * - action="upsert" (기본): 로그인 시 자동 생성 (P1-1)
 * - action="nickname": 닉네임만 업데이트 (P1-4)
 * - action="avatar": 아바타 URL만 업데이트 (P1-3)
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { nickname?: string; avatarUrl?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nickname, avatarUrl, action = "upsert" } = body;

  try {
    if (action === "nickname" && nickname !== undefined) {
      await updateProfileNickname(userId, nickname);
      return NextResponse.json({ ok: true });
    }

    if (action === "avatar" && avatarUrl !== undefined) {
      await updateProfileAvatar(userId, avatarUrl);
      return NextResponse.json({ ok: true });
    }

    // 기본: upsert — 로그인 시 자동 생성 또는 갱신
    const profile = await upsertProfile(userId, {
      ...(nickname !== undefined && { nickname }),
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[API] /api/profile/upsert error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
