import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 관리자 클라이언트 (service_role key 사용)
 * - RLS 정책을 우회하여 모든 테이블에 읽기/쓰기 가능
 * - 서버 사이드(Server Actions, Route Handlers)에서만 사용할 것
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
