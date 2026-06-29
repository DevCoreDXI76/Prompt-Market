import { notFound } from "next/navigation";
import { getLocalizedProduct } from "@/lib/promptData";
import { getPromptById } from "@/lib/supabase/prompts";
import { PromptDetail } from "@/components/prompts/PromptDetail";

const BASE_URL = "https://prompt-market.vercel.app";

function getLocalePath(locale: string, path: string): string {
  if (locale === "ko") return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

interface PromptDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { id, locale } = await params;
  const rawProduct = await getPromptById(id);

  if (!rawProduct) {
    notFound();
  }

  const product = getLocalizedProduct(rawProduct, locale);
  const canonicalUrl = getLocalePath(locale, `/prompt/${id}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.slice(0, 300).replace(/\n/g, " "),
    image: product.images[0] ?? `${BASE_URL}/og-image.png`,
    url: canonicalUrl,
    brand: {
      "@type": "Organization",
      name: "Prompt Market",
    },
    author: {
      "@type": "Person",
      name: product.author,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      seller: {
        "@type": "Organization",
        name: "Prompt Market",
      },
    },
    aggregateRating: product.rating > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          bestRating: 5,
          worstRating: 1,
          reviewCount: product.salesCount > 0 ? product.salesCount : 1,
        }
      : undefined,
    category: product.category,
    keywords: product.tags.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "ko" ? "홈" : "Home",
        item: locale === "ko" ? BASE_URL : `${BASE_URL}/en`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "ko" ? "전체 프롬프트" : "All Prompts",
        item: getLocalePath(locale, "/prompts"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\u003c"),
        }}
      />
      <PromptDetail product={product} />
    </>
  );
}
