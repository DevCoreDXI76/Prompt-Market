import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-zinc-50">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{t("description")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <Home className="h-4 w-4" />
          {t("backHome")}
        </Link>
        <Link
          href="/prompts"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Search className="h-4 w-4" />
          {t("browsePrompts")}
        </Link>
      </div>
    </div>
  );
}
