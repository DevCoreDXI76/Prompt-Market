import { NextResponse } from "next/server";
import { getPromptsByIds } from "@/lib/supabase/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids = body?.ids;

    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
    }

    const products = await getPromptsByIds(ids);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}
