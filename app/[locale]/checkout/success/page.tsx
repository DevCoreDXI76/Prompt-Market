"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { useRouter, Link } from "@/i18n/navigation";
import { Check, Loader2, XCircle, ShoppingBag } from "lucide-react";

type Status = "loading" | "success" | "error";

const REDIRECT_DELAY_MS = 2500;

export default function CheckoutSuccessPage() {
  const t = useTranslations("CheckoutSuccess");
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
      setErrorMessage(t("missingParams"));
      return;
    }

    const amount = Number(amountParam);

    async function confirm() {
      try {
        let pendingProductIds: string[] = [];
        const pendingOrderRaw = sessionStorage.getItem("toss_pending_order");
        if (pendingOrderRaw) {
          try {
            const parsed = JSON.parse(pendingOrderRaw) as { productIds: string[] };
            if (Array.isArray(parsed.productIds)) {
              pendingProductIds = parsed.productIds;
            }
          } catch {
            // sessionStorage parse error — non-critical
          }
        }

        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount, productIds: pendingProductIds }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? t("confirmFailed"));
        }

        if (pendingProductIds.length > 0) {
          addPurchases(pendingProductIds);
        }
        sessionStorage.removeItem("toss_pending_order");

        setStatus("success");

        setTimeout(() => {
          router.push("/my-page");
        }, REDIRECT_DELAY_MS);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("unknownError");
        setErrorMessage(message);
        setStatus("error");
      }
    }

    confirm();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6 text-center flex flex-col items-center gap-6">
      {status === "loading" && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-950 dark:border-blue-800">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin dark:text-blue-400" />
          </div>
          <div className="space-y-1">
            <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50">
              {t("loadingTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {t("loadingDesc")}
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
              {t("successTitle")}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed dark:text-zinc-400">
              {t("successDesc")}
              <br />
              {t("successUnlocked")}
            </p>
            <p className="text-xs text-slate-400 mt-2 dark:text-zinc-500">
              {t("redirectNotice")}
            </p>
          </div>
          <Link
            href="/my-page"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <ShoppingBag className="h-4 w-4" />
            {t("viewPurchases")}
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
              {t("errorTitle")}
            </h1>
            {errorMessage && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {t("errorContact")}
            </p>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {t("backToCart")}
          </Link>
        </>
      )}
    </div>
  );
}
