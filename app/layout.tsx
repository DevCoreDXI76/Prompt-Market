import type { ReactNode } from "react";

// Root layout: minimal wrapper for routes outside of [locale] (e.g., /auth/callback)
// The actual HTML shell is provided by app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
