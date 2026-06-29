import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.TOSS_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  let body: { paymentKey: string; orderId: string; amount: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { paymentKey, orderId, amount } = body;

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

  return NextResponse.json(data);
}
