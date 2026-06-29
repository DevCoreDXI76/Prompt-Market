import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("cart.title"),
    description: t("cart.description"),
    openGraph: {
      title: `${t("cart.title")} | Prompt Market`,
      description: t("cart.description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("cart.title")} | Prompt Market`,
      description: t("cart.description"),
      images: ["/og-image.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
