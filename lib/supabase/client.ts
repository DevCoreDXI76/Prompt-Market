import { createClient } from "@supabase/supabase-js";

/**
 * 공개(비인증) Supabase 클라이언트 생성
 * - RLS가 없는 public 테이블 조회 등에 사용
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Clerk 세션 토큰을 주입한 인증 Supabase 클라이언트 생성
 * - RLS 정책 적용 테이블 접근에 사용
 * - 클라이언트 컴포넌트: useSession().session.getToken() 전달
 * - 서버 컴포넌트: lib/supabase/server.ts의 createServerSupabaseClient() 사용
 *
 * @param getToken - Clerk 세션 토큰을 반환하는 비동기 함수
 */
export function createAuthenticatedClient(
  getToken: () => Promise<string | null>
) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return getToken();
      },
    }
  );
}
