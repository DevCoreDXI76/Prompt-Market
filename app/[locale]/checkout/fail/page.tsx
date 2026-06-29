"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  const isCanceled = code === "PAY_PROCESS_CANCELED";

  return (
    <div className="mx-auto max-w-md px-4 py-24 sm:px-6 text-center flex flex-col items-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-100 dark:bg-amber-950 dark:border-amber-800">
        <XCircle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
      </div>

      <div className="space-y-2">
        <h1 className="font-bold text-xl text-slate-900 dark:text-zinc-50">
          {isCanceled ? "결제가 취소되었습니다" : "결제에 실패했습니다"}
        </h1>

        {message && !isCanceled && (
          <p className="text-sm text-red-500 dark:text-red-400 max-w-xs mx-auto">
            {decodeURIComponent(message)}
          </p>
        )}

        {isCanceled ? (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            결제를 취소하셨습니다. 다시 결제를 진행하거나 장바구니로 돌아가세요.
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            결제 처리 중 문제가 발생했습니다.
            <br />
            다시 시도하거나 고객센터에 문의해 주세요.
          </p>
        )}

        {code && !isCanceled && (
          <p className="text-xs text-slate-400 font-mono dark:text-zinc-500">
            오류 코드: {code}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/cart"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          장바구니로
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" />
          다시 결제하기
        </button>
      </div>
    </div>
  );
}
