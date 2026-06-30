"use client";

import { useEffect, useState } from "react";
import type { PromptProduct } from "@/lib/promptData";

export function usePromptProducts(ids: string[]) {
  const [products, setProducts] = useState<PromptProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const idsKey = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch("/api/prompts/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data: { products?: PromptProduct[] }) => {
        if (!cancelled) {
          setProducts(data.products ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { products, isLoading };
}
