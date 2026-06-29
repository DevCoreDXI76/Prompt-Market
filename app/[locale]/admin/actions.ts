"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createPrompt,
  updatePrompt,
  deletePrompt,
} from "@/lib/supabase/prompts";
import type { PromptProduct } from "@/lib/promptData";

const ADMIN_USER_ID = process.env.ADMIN_CLERK_USER_ID;

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }
  if (ADMIN_USER_ID && userId !== ADMIN_USER_ID) {
    throw new Error("관리자 권한이 없습니다.");
  }
}

export interface AdminActionResult {
  success: boolean;
  error?: string;
  data?: PromptProduct | null;
}

export async function createPromptAction(
  formData: FormData
): Promise<AdminActionResult> {
  try {
    await assertAdmin();

    const product: Omit<PromptProduct, "id"> & { id?: string } = {
      id: (formData.get("id") as string) || undefined,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as PromptProduct["category"],
      prompt_text: formData.get("prompt_text") as string,
      images: (formData.get("image_urls") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: (formData.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rating: Number(formData.get("rating")),
      author: formData.get("author") as string,
      views: Number(formData.get("views")) || 0,
      salesCount: Number(formData.get("sales_count")) || 0,
    };

    const result = await createPrompt(product);
    revalidatePath("/");
    revalidatePath("/prompts");

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updatePromptAction(
  id: string,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    await assertAdmin();

    const updates: Partial<Omit<PromptProduct, "id">> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as PromptProduct["category"],
      prompt_text: formData.get("prompt_text") as string,
      images: (formData.get("image_urls") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: (formData.get("tags") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rating: Number(formData.get("rating")),
      author: formData.get("author") as string,
      views: Number(formData.get("views")) || 0,
      salesCount: Number(formData.get("sales_count")) || 0,
    };

    const result = await updatePrompt(id, updates);
    revalidatePath("/");
    revalidatePath("/prompts");
    revalidatePath(`/prompt/${id}`);

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deletePromptAction(
  id: string
): Promise<AdminActionResult> {
  try {
    await assertAdmin();

    const ok = await deletePrompt(id);
    if (!ok) throw new Error("삭제에 실패했습니다.");

    revalidatePath("/");
    revalidatePath("/prompts");

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
