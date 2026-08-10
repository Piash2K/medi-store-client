"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

export type PaymentMethodSelectorProps = {
  selectedMethod: "COD" | "SSLCOMMERZ";
  onPaymentMethodChange: (method: "COD" | "SSLCOMMERZ") => void;
  onPlaceOrderCOD: () => void;
  onPaySSLCommerz: () => void;
  isPlacingOrder: boolean;
  isInitializingPayment: boolean;
  checkoutError?: string;
  total: number;
  disabled?: boolean;
};

type PaymentMethod = "COD" | "SSLCOMMERZ";

const PAYMENT_BADGES = ["Credit Card", "Debit Card", "bKash", "Nagad", "Rocket"];

const fmt = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* ── SVG Icons ─────────────────────────────────────────────────── */
function TruckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5 1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}


function CreditCardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

export default function PaymentMethodSelector({
  selectedMethod,
  onPaymentMethodChange,
  onPlaceOrderCOD,
  onPaySSLCommerz,
  isPlacingOrder,
  isInitializingPayment,
  checkoutError,
  total,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-[#171d1c] dark:text-slate-100">
        Payment Method
      </h2>
      <p className="mb-6 mt-1 text-sm text-[#3c4947] dark:text-slate-400">
        Select how you&apos;d like to pay for your order
      </p>

      <div className="space-y-4">
        {/* ─── Cash on Delivery ─── */}
        <label
          className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-all ${
            selectedMethod === "COD"
              ? "border-2 border-[#006a63] bg-[#006a63]/5 dark:border-teal-500 dark:bg-teal-950/30"
              : "border border-[#bbc9c7] bg-white hover:border-[#006a63]/40 dark:border-emerald-900/70 dark:bg-background/80 dark:hover:border-teal-700/60"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={selectedMethod === "COD"}
            onChange={() => onPaymentMethodChange("COD")}
            className="sr-only"
          />

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              selectedMethod === "COD"
                ? "bg-[#006a63] text-white dark:bg-teal-600"
                : "bg-[#e9efed] text-[#3c4947] dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <TruckIcon />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`text-sm font-semibold ${
                  selectedMethod === "COD"
                    ? "text-[#006a63] dark:text-teal-300"
                    : "text-[#171d1c] dark:text-slate-100"
                }`}
              >
                Cash on Delivery
              </h3>

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  selectedMethod === "COD"
                    ? "border-2 border-[#006a63] dark:border-teal-400"
                    : "border border-[#bbc9c7] dark:border-slate-700"
                }`}
              >
                {selectedMethod === "COD" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#006a63] dark:bg-teal-400" />
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-[#3c4947] dark:text-slate-400">
              Pay when your order arrives. No payment needed now.
            </p>
          </div>
        </label>

        {/* ─── Pay Online — SSLCommerz ─── */}
        <label
          className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-all ${
            selectedMethod === "SSLCOMMERZ"
              ? "border-2 border-[#006a63] bg-[#006a63]/5 dark:border-teal-500 dark:bg-teal-950/30"
              : "border border-[#bbc9c7] bg-white hover:border-[#006a63]/40 dark:border-emerald-900/70 dark:bg-background/80 dark:hover:border-teal-700/60"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="SSLCOMMERZ"
            checked={selectedMethod === "SSLCOMMERZ"}
            onChange={() => onPaymentMethodChange("SSLCOMMERZ")}
            className="sr-only"
          />

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              selectedMethod === "SSLCOMMERZ"
                ? "bg-[#006a63] text-white dark:bg-teal-600"
                : "bg-[#e9efed] text-[#3c4947] dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <CreditCardIcon />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`text-sm font-semibold ${
                  selectedMethod === "SSLCOMMERZ"
                    ? "text-[#006a63] dark:text-teal-300"
                    : "text-[#171d1c] dark:text-slate-100"
                }`}
              >
                Pay Online — SSLCommerz
              </h3>

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  selectedMethod === "SSLCOMMERZ"
                    ? "border-2 border-[#006a63] dark:border-teal-400"
                    : "border border-[#bbc9c7] dark:border-slate-700"
                }`}
              >
                {selectedMethod === "SSLCOMMERZ" && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#006a63] dark:bg-teal-400" />
                )}
              </div>
            </div>
            <p className="mb-2 mt-1 text-xs text-[#3c4947] dark:text-slate-400">
              Credit/Debit Card, bKash, Nagad &amp; more
            </p>

            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded border border-[#bbc9c7]/30 bg-[#e9efed] px-2 py-0.5 text-[10px] text-[#3c4947] dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-300"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </label>

        {/* ─── Selected Payment Action Button (Always First below Radios) ─── */}
        {selectedMethod === "COD" ? (
          <button
            id="place-order-btn"
            type="button"
            onClick={onPlaceOrderCOD}
            disabled={disabled || isPlacingOrder}
            className="w-full rounded-lg bg-[#006a63] py-4 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white"
          >
            {isPlacingOrder ? "Placing Order…" : "Place Order with COD"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onPaySSLCommerz}
            disabled={disabled || isInitializingPayment}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#006a63] py-4 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white"
          >
            {isInitializingPayment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing Payment…
              </>
            ) : (
              `Pay ৳${fmt.format(total)} with SSLCommerz`
            )}
          </button>
        )}

        {/* ─── Error Banner ─── */}
        {checkoutError && (
          <div className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#ba1a1a] dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
            {checkoutError}
          </div>
        )}

        {/* ─── Secure notice (Always below the Action Button) ─── */}
        <div className="flex items-start gap-2 rounded-lg border border-[#006a63]/20 bg-[#006a63]/5 p-4 text-[#006a63] dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300">
          <ShieldCheckIcon className="mt-px h-5 w-5 shrink-0" />
          <div>
            <p className="text-xs font-bold">Secure &amp; Encrypted Checkout</p>
            <p className="mt-0.5 text-[12px] opacity-90">
              Your payment data is protected. SSLCommerz is Bangladesh&apos;s trusted payment gateway.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}
