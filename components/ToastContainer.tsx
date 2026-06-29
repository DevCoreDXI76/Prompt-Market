"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2 } from "lucide-react";

interface ToastItem {
  id: string;
  message: string;
  exiting: boolean;
}

export default function ToastContainer() {
  const { toasts } = useToast();
  const [localToasts, setLocalToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const activeIds = new Set(toasts.map((t) => t.id));

    setLocalToasts((prev) => {
      const prevIds = new Set(prev.map((t) => t.id));

      const updated = prev.map((t) =>
        !activeIds.has(t.id) && !t.exiting ? { ...t, exiting: true } : t
      );

      const incoming = toasts
        .filter((t) => !prevIds.has(t.id))
        .map((t) => ({ id: t.id, message: t.message, exiting: false }));

      return [...updated, ...incoming];
    });
  }, [toasts]);

  const handleAnimationEnd = (id: string) => {
    setLocalToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.exiting) {
        return prev.filter((t) => t.id !== id);
      }
      return prev;
    });
  };

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {localToasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          onAnimationEnd={() => handleAnimationEnd(toast.id)}
          className={`pointer-events-auto bg-slate-900/95 backdrop-blur text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-3 dark:bg-zinc-800/95 dark:border-zinc-700 ${
            toast.exiting ? "animate-toast-exit" : "animate-fade-in-up"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium leading-relaxed font-sans">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  );
}
