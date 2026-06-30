import { createAdminSupabaseClient } from "./admin";
import type { PurchaseItem } from "@/context/CartContext";

interface PurchaseRow {
  id: string;
  buyer_id: string;
  prompt_id: string;
  payment_order_id: string | null;
  created_at: string;
  prompts: {
    title: string;
    image_urls: string[];
    price: number;
  } | null;
}

function rowToPurchaseItem(row: PurchaseRow): PurchaseItem {
  const date = new Date(row.created_at);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return {
    id: row.prompt_id,
    title: row.prompts?.title ?? row.prompt_id,
    image: row.prompts?.image_urls?.[0] ?? "https://picsum.photos/seed/unknown/150/150",
    price: row.prompts?.price ?? 0,
    date: dateStr,
  };
}

/**
 * 특정 사용자의 구매 내역을 Supabase에서 조회합니다.
 * prompts 테이블을 join하여 title, image, price를 함께 반환합니다.
 */
export async function getPurchasesByUserId(userId: string): Promise<PurchaseItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, prompts(title, image_urls, price)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] getPurchasesByUserId error:", error);
    return [];
  }

  return (data as PurchaseRow[]).map(rowToPurchaseItem);
}

/**
 * 특정 사용자가 특정 프롬프트를 구매했는지 확인합니다.
 */
export async function hasPurchased(userId: string, promptId: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { count, error } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    console.error("[Supabase] hasPurchased error:", error);
    return false;
  }

  return (count ?? 0) > 0;
}
