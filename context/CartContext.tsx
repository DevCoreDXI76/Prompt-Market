"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PROMPT_PRODUCTS } from "@/lib/promptData";
import { useToast } from "./ToastContext";
import { useAuth, useSupabaseClient } from "./AuthContext";
import { getCart, addCartItem, removeCartItem, removeCartItems } from "@/lib/supabase/carts";

export interface PurchaseItem {
  id: string;
  title: string;
  image: string;
  price: number;
  date: string;
}

interface CartContextType {
  cart: string[];
  purchases: PurchaseItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  addPurchases: (productIds: string[]) => void;
  isPurchased: (productId: string) => boolean;
  refreshPurchases: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "pm_cart";
const PURCHASES_KEY = "pm_purchases";

interface PurchaseRow {
  buyer_id: string;
  prompt_id: string;
  created_at: string;
  prompts: {
    title: string;
    image_urls: string[];
    price: number;
  } | null;
}

function rowToPurchaseItem(row: PurchaseRow): PurchaseItem {
  const date = new Date(row.created_at);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return {
    id: row.prompt_id,
    title: row.prompts?.title ?? row.prompt_id,
    image: row.prompts?.image_urls?.[0] ?? "https://picsum.photos/seed/unknown/150/150",
    price: row.prompts?.price ?? 0,
    date: dateStr,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("CartContext");
  const [cart, setCart] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const { addToast } = useToast();
  const { user, isLoaded } = useAuth();
  const supabase = useSupabaseClient();

  // ── purchases: Supabase (로그인) / localStorage (비로그인) ──────────────────

  const refreshPurchases = useCallback(async () => {
    if (!isLoaded) return;

    if (!user) {
      const saved = localStorage.getItem(PURCHASES_KEY);
      if (saved) {
        try {
          setPurchases(JSON.parse(saved));
        } catch {
          setPurchases([]);
        }
      } else {
        setPurchases([]);
      }
      return;
    }

    const { data, error } = await supabase
      .from("purchases")
      .select("*, prompts(title, image_urls, price)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CartContext] purchases fetch error:", error);
      const saved = localStorage.getItem(PURCHASES_KEY);
      if (saved) {
        try {
          setPurchases(JSON.parse(saved));
        } catch {
          setPurchases([]);
        }
      }
      return;
    }

    setPurchases((data as PurchaseRow[]).map(rowToPurchaseItem));
  }, [isLoaded, user, supabase]);

  useEffect(() => {
    refreshPurchases();
  }, [refreshPurchases]);

  // ── cart: Supabase (로그인) / localStorage (비로그인) ──────────────────────

  const refreshCart = useCallback(async () => {
    if (!isLoaded) return;

    if (!user) {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      return;
    }

    const ids = await getCart(supabase, user.id);
    setCart(ids);
  }, [isLoaded, user, supabase]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // ── cart CRUD ──────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (productId: string) => {
      if (cart.includes(productId)) {
        addToast(t("alreadyInCart"));
        return;
      }

      // 낙관적 UI 업데이트
      setCart((prev) => [...prev, productId]);
      addToast(t("addedToCart"));

      if (user) {
        await addCartItem(supabase, user.id, productId);
      } else {
        const updated = [...cart, productId];
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
      }
    },
    [cart, user, supabase, addToast, t]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      // 낙관적 UI 업데이트
      setCart((prev) => prev.filter((id) => id !== productId));

      if (user) {
        await removeCartItem(supabase, user.id, productId);
      } else {
        const updated = cart.filter((id) => id !== productId);
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
      }
    },
    [cart, user, supabase]
  );

  const isInCart = useCallback((productId: string) => cart.includes(productId), [cart]);

  // ── purchases ──────────────────────────────────────────────────────────────

  const addPurchases = useCallback(
    (productIds: string[]) => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // 낙관적 UI 업데이트
      setPurchases((prevPurchases) => {
        const newItems: PurchaseItem[] = [];
        productIds.forEach((id) => {
          if (prevPurchases.some((p) => p.id === id)) return;
          const product = PROMPT_PRODUCTS.find((p) => p.id === id);
          if (product) {
            newItems.push({
              id,
              title: product.title,
              image: product.images[0] || "https://picsum.photos/seed/unknown/150/150",
              price: product.price,
              date: dateStr,
            });
          }
        });
        const updated = [...newItems, ...prevPurchases];
        if (!user) {
          localStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      // 장바구니에서 구매 완료 항목 제거
      setCart((prev) => prev.filter((id) => !productIds.includes(id)));
      if (user) {
        removeCartItems(supabase, user.id, productIds);
      } else {
        const updated = cart.filter((id) => !productIds.includes(id));
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
      }

      // Supabase INSERT 완료 대기 후 최신 데이터로 동기화
      if (user) {
        setTimeout(() => {
          refreshPurchases();
          refreshCart();
        }, 1500);
      }
    },
    [cart, user, supabase, refreshPurchases, refreshCart]
  );

  const isPurchased = useCallback(
    (productId: string) => purchases.some((p) => p.id === productId),
    [purchases]
  );

  return (
    <CartContext.Provider
      value={{ cart, purchases, addToCart, removeFromCart, isInCart, addPurchases, isPurchased, refreshPurchases }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
