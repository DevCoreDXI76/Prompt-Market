import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PromptNotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">{t("promptTitle")}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{t("promptDescription")}</p>
      <Link
        href="/prompts"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {t("browsePrompts")}
      </Link>
    </div>
  );
}
