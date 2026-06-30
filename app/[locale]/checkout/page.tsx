"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/context/CartContext";
import { usePromptProducts } from "@/hooks/usePromptProducts";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

function generateOrderId(): string {
  return `PM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

type TossWidgets = Awaited<
  ReturnType<Awaited<ReturnType<typeof loadTossPayments>>["widgets"]>
>;

export default function CheckoutPage() {
  const t = useTranslations("CheckoutPage");
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) ?? "ko";

  const { user: clerkUser } = useUser();
  const { cart } = useCart();

  const orderType = searchParams.get("type") ?? "cart";
  const productId = searchParams.get("productId");

  const productIds =
    orderType === "direct" && productId ? [productId] : cart;

  const { products } = usePromptProducts(productIds);

  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  const orderName =
    products.length === 0
      ? t("defaultPromptName")
      : products.length === 1
      ? products[0].title
      : t("orderNameMultiple", { title: products[0].title, count: products.length - 1 });

  const [orderId] = useState<string>(generateOrderId);
  const [widgets, setWidgets] = useState<TossWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (products.length === 0 || totalAmount <= 0) return;
    initialized.current = true;

    async function initWidgets() {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const customerKey = clerkUser?.id ?? ANONYMOUS;

        const w = tossPayments.widgets({ customerKey });

        await w.setAmount({ currency: "KRW", value: totalAmount });

        await Promise.all([
          w.renderPaymentMethods({
            selector: "#toss-payment-method",
            variantKey: "DEFAULT",
          }),
          w.renderAgreement({
            selector: "#toss-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        setWidgets(w);
        setIsReady(true);
      } catch (err) {
        console.error("[TossPayments] Widget init error:", err);
        setInitError(t("widgetLoadError"));
      }
    }

    initWidgets();
  }, [clerkUser?.id, totalAmount, products.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayment = async () => {
    if (!widgets || isLoading) return;
    setIsLoading(true);

    try {
      const localePath = locale !== "ko" ? `/${locale}` : "";
      const baseUrl = window.location.origin + localePath;

      sessionStorage.setItem(
        "toss_pending_order",
        JSON.stringify({ orderId, productIds, orderType })
      );

      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${baseUrl}/checkout/success`,
        failUrl: `${baseUrl}/checkout/fail`,
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const CANCEL_CODES = ["PAY_PROCESS_CANCELED", "USER_CANCEL"];
      if (error?.code && CANCEL_CODES.includes(error.code)) {
        setIsLoading(false);
        return;
      }
      // Toss SDK가 반환하는 한국어 취소 메시지 처리
      if (error?.message === "취소되었습니다." || error?.message === "취소되었습니다") {
        setIsLoading(false);
        return;
      }
      console.error("[TossPayments] requestPayment error:", err);
      setIsLoading(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 mb-6">{t("noItems")}</p>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToCart")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={orderType === "direct" ? `/prompt/${productId}` : "/cart"}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{orderType === "direct" ? t("backToProduct") : t("backToCart")}</span>
      </Link>

      <h1 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-8 dark:text-zinc-50">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {initError ? (
              <div className="p-8 text-center text-red-500 text-sm">
                {initError}
              </div>
            ) : (
              <>
                <div
                  id="toss-payment-method"
                  className="min-h-[200px]"
                />
                <div
                  id="toss-agreement"
                  className="border-t border-slate-100 dark:border-zinc-800"
                />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-6 dark:border-zinc-800 dark:bg-zinc-900 sticky top-24">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-50 dark:text-zinc-50 dark:border-zinc-800">
              {t("orderSummary")}
            </h2>

            <div className="space-y-3">
              {products.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100 dark:bg-zinc-800 dark:border-zinc-700">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      sizes="72px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mb-1 dark:bg-indigo-950 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug dark:text-zinc-200 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs font-bold text-slate-900 font-sans mt-0.5 dark:text-zinc-100">
                      {t("priceUnit", { price: item.price.toLocaleString() })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs sm:text-sm border-t border-slate-100 pt-4 dark:border-zinc-800">
              <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                <span>{t("subtotal")}</span>
                <span className="font-semibold font-sans text-slate-800 dark:text-zinc-200">
                  {t("priceUnit", { price: totalAmount.toLocaleString() })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                <span>{t("fee")}</span>
                <span className="font-semibold font-sans text-slate-800 dark:text-zinc-200">
                  {t("priceUnit", { price: "0" })}
                </span>
              </div>
              <hr className="border-slate-100 dark:border-zinc-800" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{t("total")}</span>
                <span className="font-bold text-lg sm:text-xl text-indigo-600 dark:text-indigo-400 font-sans">
                  {t("priceUnit", { price: totalAmount.toLocaleString() })}
                </span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!isReady || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1b64da] py-4 text-sm font-bold text-white shadow-lg shadow-blue-700/10 hover:bg-[#1551b8] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("paying")}</span>
                </>
              ) : !isReady ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  <span>{t("widgetLoading")}</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>{t("payButton", { price: totalAmount.toLocaleString() })}</span>
                </>
              )}
            </button>

            <div className="rounded-xl bg-slate-50 p-3 flex items-start gap-2.5 dark:bg-zinc-800">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 dark:text-zinc-500" />
              <p className="text-[10px] sm:text-xs text-slate-400 leading-normal dark:text-zinc-500">
                {t("testModeNotice")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
