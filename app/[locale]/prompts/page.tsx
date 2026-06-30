import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import {
  getPromptsPaginated,
  DEFAULT_PROMPTS_PAGE_SIZE,
  type PromptSortOption,
} from "@/lib/supabase/prompts";
import { PromptsGrid } from "@/components/prompts/PromptsGrid";

interface PromptsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const t = await getTranslations("PromptsPage");
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const category = params.category ?? "All";
  const sort = (params.sort as PromptSortOption) ?? "popular";
  const search = params.q ?? "";

  const { products, total, totalPages } = await getPromptsPaginated({
    page,
    pageSize: DEFAULT_PROMPTS_PAGE_SIZE,
    category,
    search,
    sort,
  });

  return (
    <div id="prompts-page-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <div className="mb-8 space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2 dark:text-zinc-50">
          <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse dark:text-indigo-400" />
          <span>{t("title")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl dark:text-zinc-400">
          {t("description")}
        </p>
      </div>

      <PromptsGrid
        initialProducts={products}
        total={total}
        page={page}
        totalPages={totalPages}
        initialCategory={category}
        initialSort={sort}
        initialSearch={search}
      />
    </div>
  );
}
