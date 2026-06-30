"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShoppingCart, ChevronDown, User, LogOut, Receipt } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function HeaderAuth() {
  const t = useTranslations("HeaderAuth");
  const { cart } = useCart();
  const { user, isLoaded, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded) {
    return <div className="h-9 w-20 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          id="login-header-btn"
          href="/sign-in"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("login")}
        </Link>
        <Link
          id="signup-header-btn"
          href="/sign-up"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {t("signup")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        id="cart-icon-link"
        href="/cart"
        className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-zinc-800"
        aria-label={t("cartAriaLabel")}
      >
        <ShoppingCart className="h-5 w-5" />
        {cart.length > 0 && (
          <span
            id="cart-badge"
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm font-mono border-2 border-white animate-pulse dark:border-zinc-950"
          >
            {cart.length}
          </span>
        )}
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
          aria-label={t("profileMenuAriaLabel")}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
        >
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.nickname}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-zinc-600"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-zinc-200 max-w-[80px] truncate">
            {user.nickname}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
        </button>

        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-slate-100 dark:border-zinc-800 py-1 z-50"
          >
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              {t("profileManagement")}
            </Link>
            <Link
              href="/my-page"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Receipt className="h-4 w-4 text-slate-400" />
              {t("purchaseHistory")}
            </Link>
            <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
