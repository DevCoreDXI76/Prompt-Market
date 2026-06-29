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
    title: t("checkout.title"),
    description: t("checkout.description"),
    openGraph: {
      title: `${t("checkout.title")} | Prompt Market`,
      description: t("checkout.description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("checkout.title")} | Prompt Market`,
      description: t("checkout.description"),
      images: ["/og-image.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
