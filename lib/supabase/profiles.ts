import { createAdminSupabaseClient } from "./admin";

export interface ProfileRow {
  id: string;
  nickname: string;
  avatar_url: string | null;
  updated_at: string;
}

export interface ProfileData {
  nickname?: string;
  avatar_url?: string | null;
}

/**
 * Clerk userId로 profiles 레코드를 조회합니다.
 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // PGRST116: row not found — 정상 케이스(미가입)이므로 로그 생략
    if (error.code !== "PGRST116") {
      console.error("[Supabase] getProfile error:", error);
    }
    return null;
  }
  return data;
}

/**
 * 로그인 시 profiles 레코드를 자동 생성하거나 갱신합니다. (P1-1)
 * INSERT OR UPDATE — 이미 존재하면 nickname·avatar_url만 갱신합니다.
 */
export async function upsertProfile(
  userId: string,
  data: ProfileData
): Promise<ProfileRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data: row, error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, ...data, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[Supabase] upsertProfile error:", error);
    return null;
  }
  return row;
}

/**
 * profiles 테이블의 닉네임을 업데이트합니다. (P1-4)
 */
export async function updateProfileNickname(
  userId: string,
  nickname: string
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Supabase] updateProfileNickname error:", error);
  }
}

/**
 * profiles 테이블의 아바타 URL을 업데이트합니다. (P1-3)
 */
export async function updateProfileAvatar(
  userId: string,
  avatarUrl: string
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Supabase] updateProfileAvatar error:", error);
  }
}
