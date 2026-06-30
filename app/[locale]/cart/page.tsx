"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { usePromptProducts } from "@/hooks/usePromptProducts";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

const ANIMATION_DELAY_MS = 200;

export default function CartPage() {
  const t = useTranslations("CartPage");
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const handleRemoveFromCart = (id: string) => {
    setExitingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      removeFromCart(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, ANIMATION_DELAY_MS);
  };

  const { products: cartItems } = usePromptProducts(cart);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      addToast(t("loginRequired"));
      router.push("/sign-in");
      return;
    }
    router.push("/checkout?type=cart");
  };

  return (
    <div id="cart-page-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-8 border-b border-slate-100 pb-4 dark:text-zinc-50 dark:border-zinc-800">
        {t("title")}
      </h1>

      {cartItems.length === 0 ? (
        <div
          id="empty-cart-state"
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 animate-scale-in"
        >
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 shadow-inner dark:bg-zinc-800 dark:text-zinc-500">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-slate-700 text-base font-semibold font-sans dark:text-zinc-300">
            {t("emptyTitle")}
          </p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs dark:text-zinc-500">
            {t("emptyDesc")}
          </p>
          <Link
            id="continue-shopping-btn"
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/5 cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <span>{t("continueShopping")}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-600" />
          </Link>
        </div>
      ) : (
        <div id="cart-populated-state" className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans dark:text-zinc-500">
                  {t("selectedItems", { count: cartItems.length })}
                </span>
              </div>

              <div id="cart-items-list" className="divide-y divide-slate-100 dark:divide-zinc-800">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    className={`flex gap-4 p-5 sm:items-center transition-opacity ${
                      exitingIds.has(item.id) ? "animate-cart-exit" : ""
                    }`}
                  >
                    <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shrink-0 dark:bg-zinc-800 dark:border-zinc-700">
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mb-1 dark:bg-indigo-950 dark:text-indigo-400">
                        {item.category}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-snug hover:text-indigo-600 transition-colors dark:text-zinc-200 dark:hover:text-indigo-400">
                        <Link id={`cart-title-link-${item.id}`} href={`/prompt/${item.id}`}>
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans mt-0.5 dark:text-zinc-100">
                        {t("priceUnit", { price: item.price.toLocaleString() })}
                      </p>
                    </div>

                    <button
                      id={`delete-cart-item-${item.id}`}
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer self-start sm:self-auto dark:text-zinc-600 dark:hover:text-rose-400 dark:hover:bg-rose-950"
                      aria-label={t("removeItem")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="font-sans font-bold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-50 dark:text-zinc-50 dark:border-zinc-800">
                {t("paymentSummary")}
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold font-sans text-slate-800 dark:text-zinc-200">
                    {t("priceUnit", { price: totalPrice.toLocaleString() })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t("shipping")}</span>
                  <span className="font-semibold font-sans text-slate-800 dark:text-zinc-200">{t("shippingFree")}</span>
                </div>
                <hr className="border-slate-100 dark:border-zinc-800" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{t("total")}</span>
                  <span className="font-sans font-bold text-lg sm:text-xl text-indigo-600 dark:text-indigo-400">
                    {t("priceUnit", { price: totalPrice.toLocaleString() })}
                  </span>
                </div>
              </div>

              <button
                id="initiate-payment-btn"
                onClick={handleCheckoutClick}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t("checkout", { price: totalPrice.toLocaleString() })}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rounded-xl bg-slate-50 p-3 flex items-start gap-2.5 dark:bg-zinc-800">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 dark:text-zinc-500" />
                <p className="text-[10px] sm:text-xs text-slate-400 leading-normal dark:text-zinc-500">
                  {t("testNotice")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
