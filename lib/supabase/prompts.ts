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

export type PromptSortOption = "popular" | "rating" | "price-asc" | "price-desc";

export interface GetPromptsPaginatedOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sort?: PromptSortOption;
}

export interface PaginatedPromptsResult {
  products: PromptProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PROMPTS_PAGE_SIZE = 12;

function getSortConfig(sort: PromptSortOption): { column: string; ascending: boolean } {
  switch (sort) {
    case "rating":
      return { column: "rating", ascending: false };
    case "price-asc":
      return { column: "price", ascending: true };
    case "price-desc":
      return { column: "price", ascending: false };
    default:
      return { column: "sales_count", ascending: false };
  }
}

function paginateStaticProducts(
  products: PromptProduct[],
  page: number,
  pageSize: number
): PaginatedPromptsResult {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize;
  return {
    products: products.slice(from, from + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/**
 * 페이지네이션 프롬프트 목록 조회 (Supabase range)
 */
export async function getPromptsPaginated(
  options: GetPromptsPaginatedOptions = {}
): Promise<PaginatedPromptsResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? DEFAULT_PROMPTS_PAGE_SIZE;
  const sort = options.sort ?? "popular";
  const { column, ascending } = getSortConfig(sort);

  try {
    const supabase = createPublicClient();
    let query = supabase.from("prompts").select("*", { count: "exact" });

    if (options.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }

    if (options.search?.trim()) {
      const term = options.search.trim();
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,author.ilike.%${term}%`
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.order(column, { ascending }).range(from, to);

    if (error || !data) {
      console.error("[Supabase] getPromptsPaginated 오류, 정적 데이터 폴백:", error?.message);
      let filtered = [...PROMPT_PRODUCTS];
      if (options.category && options.category !== "All") {
        filtered = filtered.filter((p) => p.category === options.category);
      }
      if (options.search?.trim()) {
        const q = options.search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      filtered.sort((a, b) => {
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return b.salesCount - a.salesCount;
      });
      return paginateStaticProducts(filtered, page, pageSize);
    }

    const total = count ?? data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      products: data.map((row) => rowToProduct(row as PromptRow)),
      total,
      page: Math.min(page, totalPages),
      pageSize,
      totalPages,
    };
  } catch (err) {
    console.error("[Supabase] getPromptsPaginated 예외, 정적 데이터 폴백:", err);
    return paginateStaticProducts(PROMPT_PRODUCTS, page, pageSize);
  }
}

/**
 * 전체 프롬프트 목록 조회 (판매수 내림차순)
 * Supabase 오류 시 정적 더미 데이터 폴백
 */
export async function getPrompts(options?: { limit?: number }): Promise<PromptProduct[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("prompts")
      .select("*")
      .order("sales_count", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

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
 * ID 목록으로 프롬프트 batch 조회 (장바구니·결제용)
 * Supabase 오류 시 정적 더미 데이터 폴백
 */
export async function getPromptsByIds(ids: string[]): Promise<PromptProduct[]> {
  if (ids.length === 0) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .in("id", ids);

    if (error || !data) {
      console.error("[Supabase] getPromptsByIds 오류, 정적 데이터 폴백:", error?.message);
      return ids
        .map((id) => PROMPT_PRODUCTS.find((p) => p.id === id))
        .filter((p): p is PromptProduct => !!p);
    }

    const byId = new Map(data.map((row) => [row.id, rowToProduct(row as PromptRow)]));
    return ids
      .map((id) => byId.get(id) ?? PROMPT_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is PromptProduct => !!p);
  } catch (err) {
    console.error("[Supabase] getPromptsByIds 예외, 정적 데이터 폴백:", err);
    return ids
      .map((id) => PROMPT_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is PromptProduct => !!p);
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
