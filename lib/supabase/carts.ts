import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 특정 사용자의 장바구니 prompt_id 목록을 Supabase에서 조회합니다.
 * RLS: 본인 cart만 조회 가능 (Clerk JWT 주입 클라이언트 사용)
 */
export async function getCart(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("carts")
    .select("prompt_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Supabase] getCart error:", error);
    return [];
  }

  return (data ?? []).map((row: { prompt_id: string }) => row.prompt_id);
}

/**
 * 장바구니에 프롬프트를 추가합니다.
 * unique(user_id, prompt_id) 제약으로 중복 추가가 방지됩니다.
 */
export async function addCartItem(
  supabase: SupabaseClient,
  userId: string,
  promptId: string
): Promise<void> {
  const { error } = await supabase
    .from("carts")
    .upsert({ user_id: userId, prompt_id: promptId }, { onConflict: "user_id,prompt_id" });

  if (error) {
    console.error("[Supabase] addCartItem error:", error);
  }
}

/**
 * 장바구니에서 프롬프트를 제거합니다.
 */
export async function removeCartItem(
  supabase: SupabaseClient,
  userId: string,
  promptId: string
): Promise<void> {
  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("user_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    console.error("[Supabase] removeCartItem error:", error);
  }
}

/**
 * 구매 완료된 프롬프트들을 장바구니에서 일괄 제거합니다.
 */
export async function removeCartItems(
  supabase: SupabaseClient,
  userId: string,
  promptIds: string[]
): Promise<void> {
  if (promptIds.length === 0) return;

  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("user_id", userId)
    .in("prompt_id", promptIds);

  if (error) {
    console.error("[Supabase] removeCartItems error:", error);
  }
}
