"use client";

import React from "react";
import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { HeaderAuth } from "@/components/HeaderAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link id="logo-link" href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-105 dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="h-5 w-5 text-indigo-400 dark:text-indigo-600" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-slate-900 dark:text-zinc-50">
              Prompt <span className="text-indigo-600 dark:text-indigo-400">Market</span>
            </span>
          </Link>

          <Link
            id="header-nav-prompts"
            href="/prompts"
            className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition-all ${
              pathname === "/prompts"
                ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-zinc-800"
            }`}
          >
            {t("prompts")}
          </Link>
        </div>

        <nav id="header-nav" className="flex items-center gap-3">
          <LanguageSwitcher />
          <ModeToggle />
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}
