import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "ko",
  // Default locale (Korean) has no prefix: /, /prompts, etc.
  // English: /en, /en/prompts, etc.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
