"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800" aria-label={t("ariaLabel")}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          disabled={isPending}
          onClick={() => handleChange(l as Locale)}
          aria-label={t(l as "ko" | "en")}
          aria-pressed={locale === l}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
            locale === l
              ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {l === "ko" && <Globe className="h-3 w-3" />}
          {t(l as "ko" | "en")}
        </button>
      ))}
    </div>
  );
}
