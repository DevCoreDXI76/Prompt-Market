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
    title: t("login.title"),
    description: t("login.description"),
    openGraph: {
      title: `${t("login.title")} | Prompt Market`,
      description: t("login.description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
