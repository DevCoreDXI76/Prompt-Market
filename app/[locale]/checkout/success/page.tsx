"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useRouter, Link } from "@/i18n/navigation";
import { Check, Loader2, XCircle, ShoppingBag } from "lucide-react";

type Status = "loading" | "success" | "error";

const REDIRECT_DELAY_MS = 2500;

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { addPurchases } = useCart();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    const orderId = searchParams.get("orderId");
    const paymentKey = searchParams.get("paymentKey");
    const amountParam = searchParams.get("amount");

    if (!orderId || !paymentKey || !amountParam) {
      setStatus("error");
      setErrorMessage("결제 정보를 확인할 수 없습니다.");
      return;
    }

    const amount = Number(amountParam);

    async function confirm() {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "결제 승인에 실패했습니다.");
        }

        const pendingOrderRaw = sessionStorage.getItem("toss_pending_order");
        if (pendingOrderRaw) {
          try {
            const { productIds } = JSON.parse(pendingOrderRaw) as {
              productIds: string[];
            };
            if (Array.isArray(productIds) && productIds.length > 0) {
              addPurchases(productIds);
            }
          } catch {
            // sessionStorage parse error — non-critical
          }
          sessionStorage.removeItem("toss_pending_order");
        }

        setStatus("success");

        setTimeout(() => {
          router.push("/my-page");
        }, REDIRECT_DELAY_MS);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "결제 처리 중 오류가 발생했습니다.";
        setErrorMessage(message);
        setStatus("error");
      }
    }

    confirm();
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6 text-center flex flex-col items-center gap-6">
      {status === "loading" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-950 dark:border-blue-800">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin dark:text-blue-400" />
          </div>
          <div className="space-y-1">
            <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50">
              결제를 승인하는 중입니다
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              잠시만 기다려 주세요...
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 animate-in zoom-in-50 duration-300">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50">
              결제가 완료되었습니다!
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed dark:text-zinc-400">
              성공적으로 결제가 승인되었습니다.
              <br />
              구매하신 프롬프트 잠금이 해제되었습니다.
            </p>
            <p className="text-xs text-slate-400 mt-2 dark:text-zinc-500">
              곧 구매 내역 페이지로 이동합니다...
            </p>
          </div>
          <Link
            href="/my-page"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <ShoppingBag className="h-4 w-4" />
            구매 내역 보기
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100 dark:bg-red-950 dark:border-red-800">
            <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50">
              결제 승인에 실패했습니다
            </h1>
            {errorMessage && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              다시 시도하시거나 고객센터에 문의해 주세요.
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            장바구니로 돌아가기
          </Link>
        </>
      )}
    </div>
  );
}
