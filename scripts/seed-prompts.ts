/**
 * Supabase prompts 테이블 시드 스크립트
 * 실행: pnpm seed:prompts
 */
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { buildSeedProducts, SEED_PRODUCT_COUNT } from "./seed-data";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn(".env 파일을 찾을 수 없습니다. 환경 변수가 이미 설정되어 있어야 합니다.");
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: fetchError } = await supabase
    .from("prompts")
    .select("title");

  if (fetchError) {
    console.error("기존 데이터 조회 실패:", fetchError.message);
    process.exit(1);
  }

  const existingTitles = new Set((existing ?? []).map((r) => r.title));
  const seedProducts = buildSeedProducts();
  let inserted = 0;
  let skipped = 0;

  for (const product of seedProducts) {
    if (existingTitles.has(product.title)) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("prompts").insert({
      id: randomUUID(),
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
    });

    if (error) {
      console.error(`삽입 실패 [${product.title}]:`, error.message);
    } else {
      inserted++;
      existingTitles.add(product.title);
    }
  }

  const { count } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true });

  console.log(`\n시드 완료`);
  console.log(`  목표: ${SEED_PRODUCT_COUNT}개`);
  console.log(`  신규 삽입: ${inserted}개`);
  console.log(`  스킵(기존): ${skipped}개`);
  console.log(`  DB 총합: ${count ?? "?"}개`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
