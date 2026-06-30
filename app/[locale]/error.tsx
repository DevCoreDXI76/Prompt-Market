"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error("[ErrorPage]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{t("description")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          {t("retry")}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Home className="h-4 w-4" />
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
