import { createPublicClient } from "./client";
import { createAdminSupabaseClient } from "./admin";
import { PROMPT_PRODUCTS } from "@/lib/promptData";
import type { PromptProduct } from "@/lib/promptData";

// Supabase DB 행 타입 (snake_case)
interface PromptRow {
  id: string;
  created_at: string;
  title: string;
  description: string;
  price: number;
  category: string;
  prompt_text: string;
  image_urls: string[];
  tags: string[];
  rating: number;
  author: string;
  views: number;
  sales_count: number;
}

function rowToProduct(row: PromptRow): PromptProduct {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    category: row.category as PromptProduct["category"],
    description: row.description,
    images: row.image_urls ?? [],
    prompt_text: row.prompt_text,
    tags: row.tags ?? [],
    rating: Number(row.rating),
    author: row.author,
    views: row.views,
    salesCount: row.sales_count,
  };
}

function productToRow(
  product: Omit<PromptProduct, "id"> & { id?: string }
): Omit<PromptRow, "created_at"> {
  return {
    id: product.id ?? crypto.randomUUID(),
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    prompt_text: product.prompt_text,
    image_urls: product.images,
    tags: product.tags,
    rating: product.rating,
    author: product.author,
    views: product.views,
    sales_count: product.salesCount,
  };
}

// ─── Public Read ──────────────────────────────────────────────

/**
 * 전체 프롬프트 목록 조회 (판매수 내림차순)
 * Supabase 오류 시 정적 더미 데이터 폴백
 */
export async function getPrompts(): Promise<PromptProduct[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("sales_count", { ascending: false });

    if (error || !data) {
      console.error("[Supabase] getPrompts 오류, 정적 데이터 폴백:", error?.message);
      return PROMPT_PRODUCTS;
    }

    return data.map(rowToProduct);
  } catch (err) {
    console.error("[Supabase] getPrompts 예외, 정적 데이터 폴백:", err);
    return PROMPT_PRODUCTS;
  }
}

/**
 * 단건 프롬프트 조회
 * Supabase 오류 시 정적 더미 데이터 폴백
 */
export async function getPromptById(id: string): Promise<PromptProduct | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return PROMPT_PRODUCTS.find((p) => p.id === id) ?? null;
    }

    return rowToProduct(data);
  } catch (err) {
    console.error("[Supabase] getPromptById 예외, 정적 데이터 폴백:", err);
    return PROMPT_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

// ─── Admin CRUD (service_role 필요) ──────────────────────────

export async function createPrompt(
  product: Omit<PromptProduct, "id"> & { id?: string }
): Promise<PromptProduct | null> {
  const supabase = createAdminSupabaseClient();
  const row = productToRow(product);

  const { data, error } = await supabase
    .from("prompts")
    .insert(row)
    .select()
    .single();

  if (error || !data) {
    console.error("[Supabase] createPrompt 오류:", error?.message);
    return null;
  }

  return rowToProduct(data);
}

export async function updatePrompt(
  id: string,
  product: Partial<Omit<PromptProduct, "id">>
): Promise<PromptProduct | null> {
  const supabase = createAdminSupabaseClient();

  const updateData: Partial<Omit<PromptRow, "id" | "created_at">> = {};
  if (product.title !== undefined) updateData.title = product.title;
  if (product.description !== undefined) updateData.description = product.description;
  if (product.price !== undefined) updateData.price = product.price;
  if (product.category !== undefined) updateData.category = product.category;
  if (product.prompt_text !== undefined) updateData.prompt_text = product.prompt_text;
  if (product.images !== undefined) updateData.image_urls = product.images;
  if (product.tags !== undefined) updateData.tags = product.tags;
  if (product.rating !== undefined) updateData.rating = product.rating;
  if (product.author !== undefined) updateData.author = product.author;
  if (product.views !== undefined) updateData.views = product.views;
  if (product.salesCount !== undefined) updateData.sales_count = product.salesCount;

  const { data, error } = await supabase
    .from("prompts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[Supabase] updatePrompt 오류:", error?.message);
    return null;
  }

  return rowToProduct(data);
}

export async function deletePrompt(id: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("prompts").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] deletePrompt 오류:", error?.message);
    return false;
  }

  return true;
}

export type { PromptProduct };
