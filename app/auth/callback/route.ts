/**
 * 이 라우트는 더 이상 사용되지 않습니다.
 * 인증은 Clerk가 처리하며, OAuth 콜백은 Clerk 내부에서 자동으로 관리됩니다.
 *
 * 이전에는 Supabase Auth OAuth 콜백 처리에 사용되었습니다.
 * Clerk 마이그레이션 이후 이 파일은 레거시 호환성을 위해 유지됩니다.
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`);
}
