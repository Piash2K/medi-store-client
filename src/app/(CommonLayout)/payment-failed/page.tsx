"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("tran_id") || "";
  const orderId = searchParams.get("order_id") || "";
  const reason = searchParams.get("reason") || "";

  const failureReasons: Record<string, string> = {
    user_cancelled: "You cancelled the payment transaction.",
    invalid_card: "Your card details are invalid. Please check and try again.",
    insufficient_funds: "Insufficient funds in your account.",
    card_expired: "Your card has expired. Please use another card.",
    transaction_failed: "The transaction could not be processed. Please try again.",
    gateway_error: "Payment gateway error. Please try again later.",
  };

  const displayReason = failureReasons[reason] || reason || "Payment was not completed successfully.";

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-amber-100 p-3">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-amber-900">Payment Failed</h1>
        <p className="mt-2 text-sm text-amber-700">{displayReason}</p>

        {orderId && (
          <p className="mt-3 text-xs text-amber-600">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}

        {transactionId && (
          <p className="mt-1 text-xs text-amber-600">
            Transaction ID: <span className="font-mono font-semibold">{transactionId}</span>
          </p>
        )}

        <div className="mt-6 rounded-lg bg-white p-4">
          <div className="text-left">
            <h3 className="text-sm font-semibold text-amber-900">What you can do:</h3>
            <ul className="mt-2 space-y-1 text-xs text-amber-700">
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
              <Button asChild className="w-full">
                <Link href={`/checkout?items=${orderId}`}>Retry Payment</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/orders/${orderId}`}>View Order</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/checkout">Return to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Need help? Contact our support team at support@medistore.com or call us.
        </p>
      </div>
    </section>
  );
}
