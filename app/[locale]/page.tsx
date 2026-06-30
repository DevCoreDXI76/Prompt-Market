import dynamic from "next/dynamic";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { getLocalizedProducts } from "@/lib/promptData";
import { getPrompts } from "@/lib/supabase/prompts";
import { getLocale } from "next-intl/server";

const BASE_URL = "https://prompt-market.vercel.app";

const HomeFiltersAndGrid = dynamic(
  () =>
    import("@/components/home/HomeFiltersAndGrid").then((m) => ({
      default: m.HomeFiltersAndGrid,
    }))
);

function GridSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 mb-8 dark:border-zinc-800">
        <div className="flex flex-wrap gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-xl bg-slate-100 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-10 w-72 rounded-xl bg-slate-100 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-1/4" />
              <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800 flex justify-between">
                <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-12" />
                <div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function HomeGrid() {
  const locale = await getLocale();
  const products = await getPrompts();
  return (
    <HomeFiltersAndGrid initialProducts={getLocalizedProducts(products, locale)} />
  );
}

async function HomeJsonLd() {
  const locale = await getLocale();
  const canonicalUrl = locale === "ko" ? BASE_URL : `${BASE_URL}/${locale}`;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Prompt Market",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/prompts?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["ko", "en"],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prompt Market",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    sameAs: [],
    description:
      locale === "ko"
        ? "검증된 고품질 AI 프롬프트를 탐색하고 구매할 수 있는 마켓플레이스"
        : "Marketplace for verified, high-quality AI prompts",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ko" ? "홈" : "Home",
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\u003c"),
        }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <div
      id="home-page-container"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <HomeJsonLd />
      <HeroSection />
      <Suspense fallback={<GridSkeleton />}>
        <HomeGrid />
      </Suspense>
    </div>
  );
}
