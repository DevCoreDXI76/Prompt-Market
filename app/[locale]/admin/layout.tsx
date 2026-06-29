import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 대시보드",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-grow">
      <div className="border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            Admin
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-500">
            Prompt Market 관리자 전용 페이지
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
