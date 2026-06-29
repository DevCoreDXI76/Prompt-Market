import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const BASE_URL = "https://prompt-market.vercel.app";

function getLocalePath(locale: string, path: string): string {
  if (locale === "ko") return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const canonicalUrl = getLocalePath(locale, "/prompts");

  return {
    title: t("prompts.title"),
    description: t("prompts.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ko: getLocalePath("ko", "/prompts"),
        en: getLocalePath("en", "/prompts"),
        "x-default": getLocalePath("ko", "/prompts"),
      },
    },
    openGraph: {
      title: `${t("prompts.title")} | Prompt Market`,
      description: t("prompts.description"),
      url: canonicalUrl,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Prompt Market" }],
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("prompts.title")} | Prompt Market`,
      description: t("prompts.description"),
      images: ["/og-image.png"],
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

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
