"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const MOCK_PAYMENT_DELAY_MS = 1500;

type PaymentMethod = "card" | "tosspay" | "bank";

export function PaymentModal({ isOpen, totalPrice, onSuccess, onClose }: PaymentModalProps) {
  const t = useTranslations("PaymentModal");
  const [paymentStep, setPaymentStep] = useState<"ready" | "processing">("ready");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("ready");
      setSelectedMethod("card");
    }
  }, [isOpen]);

  const handlePay = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      onSuccess();
    }, MOCK_PAYMENT_DELAY_MS);
  };

  if (!isOpen) return null;

  const methodButtonClass = (method: PaymentMethod) =>
    `flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
      selectedMethod === method
        ? "border-blue-600 bg-blue-50/20 text-blue-700 font-semibold"
        : "border-slate-100 hover:border-slate-200 text-slate-600"
    }`;

  return (
    <div
      id="toss-payment-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="bg-[#f2f4f6] px-5 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-600 font-extrabold font-sans text-base tracking-tight">{t("brand")}</span>
            <span className="text-slate-800 font-bold text-xs">{t("brandSub")}</span>
          </div>
          <button
            id="toss-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label={t("closeAriaLabel")}
          >
            &#x2715;
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[80vh]">
          {paymentStep === "processing" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">{t("processingTitle")}</p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400 font-medium">{t("mockPayment")}</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{t("priceUnit", { price: totalPrice.toLocaleString() })}</p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">{t("selectMethod")}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="toss-method-card"
                    onClick={() => setSelectedMethod("card")}
                    className={methodButtonClass("card")}
                  >
                    <span className="text-xs">{t("creditCard")}</span>
                  </button>
                  <button
                    id="toss-method-tosspay"
                    onClick={() => setSelectedMethod("tosspay")}
                    className={methodButtonClass("tosspay")}
                  >
                    <span className="text-xs flex items-center gap-1">
                      <span className="text-blue-600 font-extrabold font-sans text-xs">{t("brand")}</span>{t("tossPayLabel")}
                    </span>
                  </button>
                  <button
                    id="toss-method-bank"
                    onClick={() => setSelectedMethod("bank")}
                    className={`col-span-2 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedMethod === "bank"
                        ? "border-blue-600 bg-blue-50/20 text-blue-700 font-semibold"
                        : "border-slate-100 hover:border-slate-200 text-slate-600"
                    }`}
                  >
                    <span className="text-xs">{t("bankTransfer")}</span>
                    <span className="text-[10px] text-slate-400">{t("bankFee")}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <input id="terms-1" type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="terms-1" className="text-xs text-slate-600 font-medium">{t("agreePrivacy")}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="terms-2" type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="terms-2" className="text-xs text-slate-600 font-medium">{t("agreeTerms")}</label>
                </div>
              </div>
            </>
          )}
        </div>

        {paymentStep === "ready" && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <button
              id="toss-pay-submit-btn"
              onClick={handlePay}
              className="w-full bg-[#1b64da] hover:bg-[#1551b8] text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-700/10 transition-all cursor-pointer"
            >
              {t("payButton", { price: totalPrice.toLocaleString() })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
