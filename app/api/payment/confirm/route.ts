import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const SECRET_KEY = process.env.TOSS_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  let body: { paymentKey: string; orderId: string; amount: number; productIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { paymentKey, orderId, amount, productIds } = body;

  if (!paymentKey || !orderId || typeof amount !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: paymentKey, orderId, amount." },
      { status: 400 }
    );
  }

  const encodedKey = Buffer.from(`${SECRET_KEY}:`).toString("base64");

  const tossResponse = await fetch(
    "https://api.tosspayments.com/v1/payments/confirm",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    }
  );

  const data = await tossResponse.json();

  if (!tossResponse.ok) {
    console.error("[TossPayments] Confirmation failed:", data);
    return NextResponse.json(
      { error: data.message ?? "Payment confirmation failed." },
      { status: tossResponse.status }
    );
  }

  // 결제 성공 후 구매 내역을 Supabase purchases 테이블에 저장
  if (Array.isArray(productIds) && productIds.length > 0) {
    const { userId } = await auth();
    if (userId) {
      try {
        const supabase = createAdminSupabaseClient();
        const rows = productIds.map((pid) => ({
          buyer_id: userId,
          prompt_id: pid,
          payment_order_id: `${orderId}-${pid}`,
        }));
        const { error } = await supabase
          .from("purchases")
          .upsert(rows, { onConflict: "payment_order_id" });
        if (error) {
          console.error("[Supabase] purchases upsert failed:", error);
        }
      } catch (err) {
        console.error("[Supabase] purchases insert error:", err);
      }
    }
  }

  return NextResponse.json(data);
}
