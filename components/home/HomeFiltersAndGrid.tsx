"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { PromptProduct } from "@/lib/promptData";
import { Search, ShoppingCart, Eye, Star } from "lucide-react";

type CategoryFilter = "All" | "ChatGPT" | "Midjourney" | "Stable Diffusion" | "Claude";

const categories: CategoryFilter[] = ["All", "ChatGPT", "Midjourney", "Stable Diffusion", "Claude"];

function getCategoryColor(category: string) {
  switch (category) {
    case "ChatGPT": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Midjourney": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "Stable Diffusion": return "bg-purple-50 text-purple-700 border-purple-100";
    case "Claude": return "bg-orange-50 text-orange-700 border-orange-100";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

interface HomeFiltersAndGridProps {
  initialProducts: PromptProduct[];
}

export function HomeFiltersAndGrid({ initialProducts }: HomeFiltersAndGridProps) {
  const t = useTranslations("HomeFiltersAndGrid");
  const { addToCart, isInCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div id="filter-controls-container" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 mb-8 dark:border-zinc-800">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category}
              id={`cat-filter-${category.replace(/\s+/g, "-")}`}
              onClick={() => setActiveCategory(category)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                activeCategory === category
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              {category === "All" ? t("filterAll") : category}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 dark:text-zinc-500" />
          </div>
          <input
            id="prompt-search-input"
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
          />
        </div>
      </div>

      <section id="prompt-grid-section">
        <h2 className="sr-only">{t("featuredPrompts")}</h2>
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 mb-4 dark:bg-zinc-800 dark:text-zinc-500">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium dark:text-zinc-400">{t("noResults")}</p>
            <p className="text-slate-500 text-xs mt-1 dark:text-zinc-500">{t("noResultsHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, idx) => {
              const inCart = isInCart(product.id);
              return (
                <div
                  key={product.id}
                  id={`prompt-card-${product.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 animate-fade-in-up-card"
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.4)}s` }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={idx === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 font-sans mb-1.5">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-slate-300 font-normal dark:text-zinc-600">|</span>
                      <span className="text-slate-500 font-normal dark:text-zinc-500">
                        {t("salesCount", { count: product.salesCount })}
                      </span>
                    </div>

                    <h3 className="font-sans font-bold text-sm sm:text-base text-slate-800 line-clamp-2 min-h-[2.5rem] leading-snug tracking-tight hover:text-indigo-600 transition-colors dark:text-zinc-100 dark:hover:text-indigo-400">
                      <Link id={`prompt-title-link-${product.id}`} href={`/prompt/${product.id}`}>
                        {product.title}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap gap-1 my-3">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-block text-[10px] bg-slate-50 text-slate-600 border border-slate-100 rounded-md px-1.5 py-0.5 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between dark:border-zinc-800">
                      <span className="text-xs text-slate-500 dark:text-zinc-500">{t("price")}</span>
                      <span className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                        {product.price.toLocaleString()}원
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Link
                        id={`prompt-view-details-${product.id}`}
                        href={`/prompt/${product.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t("viewDetails")}</span>
                      </Link>

                      <button
                        id={`prompt-cart-add-${product.id}`}
                        onClick={() => addToCart(product.id)}
                        disabled={inCart}
                        className={`flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          inCart
                            ? "bg-slate-100 text-slate-500 border border-slate-100 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600 dark:border-zinc-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/10 active:scale-[0.98]"
                        }`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{inCart ? t("inCart") : t("addToCart")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
