import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const ALLOWED_BUCKETS = ["avatars", "prompts"] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

/**
 * POST /api/storage/upload
 * FormData: { file: File, bucket: "avatars" | "prompts", path?: string }
 * Returns: { url: string }
 *
 * - avatars: 프로필 이미지 업로드 (P1-3)
 * - prompts: 상품 이미지 업로드 (P1-2)
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;
  const customPath = formData.get("path") as string | null;

  if (!file || !bucket) {
    return NextResponse.json({ error: "file과 bucket은 필수입니다." }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.includes(bucket as AllowedBucket)) {
    return NextResponse.json(
      { error: `허용되지 않는 버킷입니다. 허용: ${ALLOWED_BUCKETS.join(", ")}` },
      { status: 400 }
    );
  }

  const extension = file.name.split(".").pop() ?? "bin";
  const filePath = customPath ?? `${userId}/${Date.now()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const supabase = createAdminSupabaseClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[Storage] upload error:", uploadError);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
