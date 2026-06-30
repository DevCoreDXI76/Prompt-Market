"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedTitle } from "@/lib/promptData";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Calendar, ExternalLink, Compass, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function MyPage() {
  const t = useTranslations("MyPage");
  const locale = useLocale();
  const { user } = useAuth();
  const { purchases } = useCart();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-zinc-400">{t("loginRequired")}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {t("goToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="my-page-container" className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-8 border-b border-slate-100 pb-4 dark:text-zinc-50 dark:border-zinc-800">
        {t("title")}
      </h1>

      {purchases.length === 0 ? (
        <div
          id="empty-purchases-state"
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900 animate-scale-in"
        >
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 shadow-inner dark:bg-zinc-800 dark:text-zinc-500">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-slate-700 text-base font-semibold font-sans dark:text-zinc-300">{t("emptyTitle")}</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs dark:text-zinc-500">{t("emptyDesc")}</p>
          <Link
            id="browse-prompts-btn"
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/5 cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <span>{t("browseMarket")}</span>
          </Link>
        </div>
      ) : (
        <div id="purchases-list-block" className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-2 dark:text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{t("ownedPrompts", { count: purchases.length })}</span>
          </div>

          <div className="divide-y divide-slate-100 rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {purchases.map((item, idx) => {
              const displayTitle = getLocalizedTitle(item.title, locale);

              return (
              <div
                key={item.id}
                id={`purchase-item-${item.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 animate-fade-in-up-card"
                style={{ animationDelay: `${Math.min(idx * 0.05, 0.4)}s` }}
              >
                <div className="flex gap-4 items-start sm:items-center min-w-0 flex-1">
                  <div className="relative h-14 w-18 overflow-hidden rounded-xl bg-slate-100 border shrink-0 dark:bg-zinc-800 dark:border-zinc-700">
                    <Image
                      src={item.image}
                      alt={displayTitle}
                      fill
                      sizes="72px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate leading-snug dark:text-zinc-200">
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-zinc-600" />
                      <span>{t("purchaseDate", { date: item.date })}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0">
                  <Link
                    id={`view-again-${item.id}`}
                    href={`/prompt/${item.id}`}
                    className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                  >
                    <span>{t("viewAgain")}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                  </Link>
                </div>
              </div>
            );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-2 dark:text-zinc-600">
            {t("lifetime")}
          </p>
        </div>
      )}
    </div>
  );
}
