import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLocalizedProduct } from "@/lib/promptData";
import { getPromptById } from "@/lib/supabase/prompts";

const BASE_URL = "https://prompt-market.vercel.app";

function getLocalePath(locale: string, path: string): string {
  if (locale === "ko") return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const rawProduct = await getPromptById(id);
  const product = rawProduct ? getLocalizedProduct(rawProduct, locale) : null;

  const title = product ? product.title : t("siteTitle");
  const description = product
    ? product.description.slice(0, 150).replace(/\n/g, " ")
    : t("siteDescription");
  const canonicalUrl = getLocalePath(locale, `/prompt/${id}`);
  const ogImage = product?.images[0]
    ? { url: product.images[0], width: 1200, height: 630, alt: title }
    : { url: "/og-image.png", width: 1200, height: 630, alt: "Prompt Market" };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ko: getLocalePath("ko", `/prompt/${id}`),
        en: getLocalePath("en", `/prompt/${id}`),
        "x-default": getLocalePath("ko", `/prompt/${id}`),
      },
    },
    openGraph: {
      title: `${title} | Prompt Market`,
      description,
      url: canonicalUrl,
      images: [ogImage],
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Prompt Market`,
      description,
      images: [ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function PromptDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
