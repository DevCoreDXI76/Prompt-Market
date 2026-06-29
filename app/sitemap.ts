import type { MetadataRoute } from "next";
import { getPrompts } from "@/lib/supabase/prompts";

const BASE_URL = "https://prompt-market.vercel.app";

function getLocalePath(locale: string, path: string): string {
  if (locale === "ko") return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          ko: getLocalePath("ko", "/"),
          en: getLocalePath("en", "/"),
          "x-default": getLocalePath("ko", "/"),
        },
      },
    },
    {
      url: getLocalePath("en", "/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          ko: getLocalePath("ko", "/"),
          en: getLocalePath("en", "/"),
          "x-default": getLocalePath("ko", "/"),
        },
      },
    },
    {
      url: `${BASE_URL}/prompts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          ko: getLocalePath("ko", "/prompts"),
          en: getLocalePath("en", "/prompts"),
          "x-default": getLocalePath("ko", "/prompts"),
        },
      },
    },
    {
      url: getLocalePath("en", "/prompts"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          ko: getLocalePath("ko", "/prompts"),
          en: getLocalePath("en", "/prompts"),
          "x-default": getLocalePath("ko", "/prompts"),
        },
      },
    },
  ];

  let promptPages: MetadataRoute.Sitemap = [];
  try {
    const prompts = await getPrompts();
    promptPages = prompts.flatMap((prompt) => [
      {
        url: `${BASE_URL}/prompt/${prompt.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: {
            ko: getLocalePath("ko", `/prompt/${prompt.id}`),
            en: getLocalePath("en", `/prompt/${prompt.id}`),
            "x-default": getLocalePath("ko", `/prompt/${prompt.id}`),
          },
        },
      },
      {
        url: getLocalePath("en", `/prompt/${prompt.id}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: {
            ko: getLocalePath("ko", `/prompt/${prompt.id}`),
            en: getLocalePath("en", `/prompt/${prompt.id}`),
            "x-default": getLocalePath("ko", `/prompt/${prompt.id}`),
          },
        },
      },
    ]);
  } catch {
    // Supabase 오류 시 정적 페이지만 포함
  }

  return [...staticPages, ...promptPages];
}
