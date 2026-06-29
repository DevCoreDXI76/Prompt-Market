"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  nickname: string;
  profileImage: string;
}

export interface PurchaseItem {
  id: string; // matches product ID
  title: string;
  image: string;
  price: number;
  date: string; // YYYY-MM-DD HH:mm
}

interface Toast {
  id: string;
  message: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (nickname: string, profileImage: string) => void;
  cart: string[]; // item IDs
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  purchases: PurchaseItem[];
  addPurchases: (productIds: string[]) => void;
  isPurchased: (productId: string) => boolean;
  toasts: Toast[];
  addToast: (message: string) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem("pm_user");
      const savedCart = localStorage.getItem("pm_cart");
      const savedPurchases = localStorage.getItem("pm_purchases");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Pre-authenticate with runtime metadata credentials for seamless preview
        const defaultUser: User = {
          email: "devcoredxi00@coredxi.com",
          nickname: "프롬프트마스터",
          profileImage: "https://picsum.photos/seed/user-avatar/150/150",
        };
        setUser(defaultUser);
        localStorage.setItem("pm_user", JSON.stringify(defaultUser));
      }

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedPurchases) {
        setPurchases(JSON.parse(savedPurchases));
      }

      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = (email: string) => {
    const newUser: User = {
      email,
      nickname: email.split("@")[0] || "사용자",
      profileImage: `https://picsum.photos/seed/${email}/150/150`,
    };
    setUser(newUser);
    localStorage.setItem("pm_user", JSON.stringify(newUser));
    addToast("성공적으로 로그인되었습니다.");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pm_user");
    addToast("로그아웃되었습니다.");
  };

  const updateProfile = (nickname: string, profileImage: string) => {
    if (!user) return;
    const updated = { ...user, nickname, profileImage };
    setUser(updated);
    localStorage.setItem("pm_user", JSON.stringify(updated));
    addToast("프로필이 저장되었습니다.");
  };

  const addToCart = (productId: string) => {
    if (cart.includes(productId)) {
      addToast("이미 장바구니에 담긴 상품입니다.");
      return;
    }
    const updatedCart = [...cart, productId];
    setCart(updatedCart);
    localStorage.setItem("pm_cart", JSON.stringify(updatedCart));
    addToast("장바구니에 상품을 담았습니다.");
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((id) => id !== productId);
    setCart(updatedCart);
    localStorage.setItem("pm_cart", JSON.stringify(updatedCart));
    addToast("장바구니에서 삭제되었습니다.");
  };

  const isInCart = (productId: string) => {
    return cart.includes(productId);
  };

  const addPurchases = (productIds: string[]) => {
    const now = new Date();
    // Format: YYYY-MM-DD HH:mm
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Import from our static database dynamically to make sure references are correct
    const { PROMPT_PRODUCTS } = require("@/lib/promptData");

    const newItems: PurchaseItem[] = [];
    productIds.forEach((id) => {
      // Check if already purchased to prevent duplicates
      if (purchases.some((p) => p.id === id)) return;

      const product = PROMPT_PRODUCTS.find((p: any) => p.id === id);
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

    const updatedPurchases = [...newItems, ...purchases]; // Newest purchases first
    setPurchases(updatedPurchases);
    localStorage.setItem("pm_purchases", JSON.stringify(updatedPurchases));

    // Clear those items from cart
    const updatedCart = cart.filter((id) => !productIds.includes(id));
    setCart(updatedCart);
    localStorage.setItem("pm_cart", JSON.stringify(updatedCart));
  };

  const isPurchased = (productId: string) => {
    return purchases.some((p) => p.id === productId);
  };

  const addToast = (message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        cart,
        addToCart,
        removeFromCart,
        isInCart,
        purchases,
        addPurchases,
        isPurchased,
        toasts,
        addToast,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
