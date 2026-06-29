import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Clerk 세션 토큰을 주입한 서버 사이드 Supabase 클라이언트
 * - Server Components, Route Handlers, Server Actions에서 사용
 * - Clerk의 auth().getToken()으로 인증 토큰 주입
 * - Supabase RLS 정책이 auth.jwt()->>'sub' 기준으로 동작
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
