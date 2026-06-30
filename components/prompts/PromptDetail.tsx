"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { PromptProduct } from "@/lib/promptData";
import { ShoppingCart, Copy, Check, ArrowLeft, Star, Clock, ShieldCheck, CreditCard } from "lucide-react";
import Image from "next/image";

interface PromptDetailProps {
  product: PromptProduct;
}

function getCategoryBadgeColor(category: string) {
  switch (category) {
    case "ChatGPT": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Midjourney": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "Stable Diffusion": return "bg-purple-50 text-purple-700 border-purple-100";
    case "Claude": return "bg-orange-50 text-orange-700 border-orange-100";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

export function PromptDetail({ product }: PromptDetailProps) {
  const router = useRouter();
  const t = useTranslations("PromptDetailPage");
  const { user } = useAuth();
  const { addToCart, isInCart, isPurchased } = useCart();
  const { addToast } = useToast();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const purchased = isPurchased(product.id);
  const inCart = isInCart(product.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(product.prompt_text);
      setCopied(true);
      addToast(t("copiedToast"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast(t("copyFailed"));
    }
  };

  const handleDirectBuy = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    router.push(`/checkout?type=direct&productId=${product.id}`);
  };

  return (
    <div id="prompt-detail-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        id="back-to-home"
        href="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("back")}</span>
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm">
              <Image
                src={product.images[activeImageIdx]}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-${idx}`}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-[4/3] w-20 overflow-hidden rounded-lg border-2 bg-slate-50 transition-all ${
                      activeImageIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/10"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={t("thumbnail")}
                      fill
                      sizes="80px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 border-b border-slate-50 pb-4 mb-4">
              {t("detailInfo")}
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${getCategoryBadgeColor(product.category)}`}>
                  {product.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {t("creator", { author: product.author })}
                </span>
              </div>
              <h1 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 leading-snug tracking-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-1 text-sm font-semibold text-amber-500 font-sans">
                <Star className="fill-current h-4 w-4" />
                <span>{product.rating}</span>
                <span className="text-slate-200 font-normal">|</span>
                <span className="text-slate-400 font-normal text-xs">
                  {t("viewCount", { count: product.views.toLocaleString() })}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{t("price")}</span>
              <span className="font-sans font-bold text-xl sm:text-2xl text-slate-900">
                {t("priceUnit", { price: product.price.toLocaleString() })}
              </span>
            </div>

            <div className="pt-2">
              {purchased ? (
                <div id="purchased-actions-block" className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl bg-indigo-50/50 border border-indigo-100 px-4 py-3 text-indigo-800">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold">{t("alreadyPurchased")}</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 shadow-inner text-white font-mono text-xs relative">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                      <span className="text-[10px] uppercase text-indigo-300 font-bold tracking-wider">
                        {t("unlockPromptCode")}
                      </span>
                      <button
                        id="copy-prompt-btn"
                        onClick={handleCopy}
                        aria-label={copied ? t("copied") : t("copy")}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>{t("copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-slate-400" />
                            <span>{t("copy")}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap select-all max-h-48 overflow-y-auto leading-relaxed text-slate-200 text-[11px]">
                      {product.prompt_text}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center leading-normal whitespace-pre-line">
                    {t("promptUsageHint", { category: product.category })}
                  </p>
                </div>
              ) : (
                <div id="unpurchased-actions-block" className="space-y-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold text-slate-500 leading-normal">
                      {t("locked")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="details-add-to-cart-btn"
                      onClick={() => addToCart(product.id)}
                      disabled={inCart}
                      aria-label={inCart ? t("inCart") : t("addToCart")}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all border cursor-pointer ${
                        inCart
                          ? "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{inCart ? t("inCart") : t("addToCart")}</span>
                    </button>

                    <button
                      id="details-buy-now-btn"
                      onClick={handleDirectBuy}
                      aria-label={t("buyNow")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <span>{t("buyNow")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 flex items-start gap-3">
              <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-normal text-slate-500">
                <p className="font-semibold text-slate-700">{t("digitalDownload")}</p>
                <p className="mt-0.5">{t("digitalDownloadDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
