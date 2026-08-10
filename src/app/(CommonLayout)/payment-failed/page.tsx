"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const failureReasons: Record<string, string> = {
  user_cancelled: "You cancelled the payment transaction.",
  invalid_card: "Your card details are invalid. Please check and try again.",
  insufficient_funds: "Insufficient funds in your account.",
  card_expired: "Your card has expired. Please use another card.",
  transaction_failed: "The transaction could not be processed. Please try again.",
  gateway_error: "Payment gateway error. Please try again later.",
};

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("tran_id") || "";
  const orderId = searchParams.get("order_id") || "";
  const reason = searchParams.get("reason") || "";

  const displayReason = failureReasons[reason] || reason || "Payment was not completed successfully.";

  return (
    <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/30 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-rose-200 bg-rose-50 p-8 text-center shadow-sm dark:border-rose-800/60 dark:bg-rose-950/20">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-rose-100 p-3 dark:bg-rose-900/40">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-200">Payment Failed</h1>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{displayReason}</p>

        {orderId && (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}

        {transactionId && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            Transaction ID: <span className="font-mono font-semibold">{transactionId}</span>
          </p>
        )}

        <div className="mt-6 rounded-lg border border-rose-200 bg-white p-4 dark:border-rose-800/60 dark:bg-rose-950/30">
          <div className="text-left">
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">What you can do:</h3>
            <ul className="mt-2 space-y-1 text-xs text-rose-700 dark:text-rose-300">
              <li>• Check your payment method details and try again</li>
              <li>• Use a different payment method if available</li>
              <li>• Contact your bank if the issue persists</li>
              <li>• Reach out to our support team for assistance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {orderId ? (
            <>
              <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href={`/checkout?items=${orderId}`}>Retry Payment</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                <Link href={`/orders/${orderId}`}>View Order</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="/checkout">Return to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">
          Need help? Contact our support team at support@medistore.com or call us.
        </p>
      </div>
    </section>
  );
}

export default function PaymentFailedPage() {
  return (
    <React.Suspense fallback={
      <section className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-md h-96 animate-pulse rounded-2xl border-2 border-rose-200 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/20" />
      </section>
    }>
      <PaymentFailedContent />
    </React.Suspense>
  );
}
