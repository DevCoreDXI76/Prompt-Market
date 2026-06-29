import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR, enUS } from "@clerk/localizations";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import ToastContainer from "@/components/ToastContainer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

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

  const canonicalUrl = getLocalePath(locale, "/");

  return {
    title: {
      default: t("siteTitle"),
      template: "%s | Prompt Market",
    },
    description: t("siteDescription"),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ko: getLocalePath("ko", "/"),
        en: getLocalePath("en", "/"),
        "x-default": getLocalePath("ko", "/"),
      },
    },
    openGraph: {
      title: t("siteTitle"),
      description: t("siteDescription"),
      url: canonicalUrl,
      siteName: "Prompt Market",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Prompt Market",
        },
      ],
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  const clerkLocalization = locale === "ko" ? koKR : enUS;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html
        lang={locale}
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} scroll-smooth`}
      >
        <body className="bg-slate-50/40 text-slate-800 antialiased min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-indigo-900 dark:selection:text-indigo-200">
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ToastProvider>
                <AuthProvider>
                  <CartProvider>
                    <Header />
                    <main className="flex-grow flex flex-col">{children}</main>
                    <FooterContent locale={locale} />
                    <ToastContainer />
                  </CartProvider>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
        {gaId && isProduction && <GoogleAnalytics gaId={gaId} />}
        <Analytics />
      </html>
    </ClerkProvider>
  );
}

async function FooterContent({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Footer" });
  return (
    <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-500 font-sans dark:border-zinc-800 dark:text-zinc-600">
      <div className="max-w-7xl mx-auto px-4">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
