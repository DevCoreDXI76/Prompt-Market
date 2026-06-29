"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PROMPT_PRODUCTS } from "@/lib/promptData";
import { useToast } from "./ToastContext";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "pm_cart";
const PURCHASES_KEY = "pm_purchases";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("CartContext");
  const [cart, setCart] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedPurchases = localStorage.getItem(PURCHASES_KEY);
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
  }, []);

  const addToCart = useCallback(
    (productId: string) => {
      setCart((prev) => {
        if (prev.includes(productId)) {
          addToast(t("alreadyInCart"));
          return prev;
        }
        const updated = [...prev, productId];
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        addToast(t("addedToCart"));
        return updated;
      });
    },
    [addToast, t]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInCart = useCallback((productId: string) => cart.includes(productId), [cart]);

  const addPurchases = useCallback(
    (productIds: string[]) => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

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
        localStorage.setItem(PURCHASES_KEY, JSON.stringify(updated));
        return updated;
      });

      setCart((prev) => {
        const updated = prev.filter((id) => !productIds.includes(id));
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const isPurchased = useCallback(
    (productId: string) => purchases.some((p) => p.id === productId),
    [purchases]
  );

  return (
    <CartContext.Provider value={{ cart, purchases, addToCart, removeFromCart, isInCart, addPurchases, isPurchased }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
