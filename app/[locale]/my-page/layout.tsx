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
    title: t("myPage.title"),
    description: t("myPage.description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
