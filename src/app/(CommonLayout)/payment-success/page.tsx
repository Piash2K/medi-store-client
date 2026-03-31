"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/services/payment";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [orderStatus, setOrderStatus] = React.useState<{
    orderId: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
  } | null>(null);
  const [verificationError, setVerificationError] = React.useState("");

  const transactionId = searchParams.get("tran_id") || "";
  const orderId = searchParams.get("order_id") || "";

  React.useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setVerificationError("No order found. Invalid payment reference.");
        setIsVerifying(false);
        return;
      }

      try {
        const result = await getPaymentStatus(orderId);

        if (!result.success || !result.data) {
          setVerificationError(
            result.message || "Failed to verify payment status. Please contact support."
          );
          setIsVerifying(false);
          return;
        }

        const { status, paymentStatus, totalAmount } = result.data;

        // Verify payment was actually processed
        if (paymentStatus !== "PAID") {
          setVerificationError(
            `Payment status is ${paymentStatus}. Please check your order status or try again.`
          );
          setIsVerifying(false);
          return;
        }

        setOrderStatus({
          orderId: result.data.id,
          status,
          paymentStatus,
          totalAmount,
        });

        toast.success("Payment verified successfully!");

        // Auto-redirect after 3 seconds
        const redirectTimer = setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 3000);

        return () => clearTimeout(redirectTimer);
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationError("An error occurred while verifying payment. Please try again.");
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, router]);

  if (isVerifying) {
    return (
      <section className="w-full bg-linear-to-b from-emerald-50/30 to-background px-4 py-8 dark:from-emerald-950/10 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border-2 border-emerald-200 bg-white dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-emerald-600" />
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Verifying your payment...</p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            Please wait while we confirm your transaction
          </p>
        </div>
      </section>
    );
  }

  if (verificationError) {
    return (
      <section className="w-full bg-linear-to-b from-emerald-50/30 to-background px-4 py-8 dark:from-emerald-950/10 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="mx-auto max-w-md rounded-2xl border-2 border-rose-200 bg-rose-50 p-8 text-center shadow-sm dark:border-rose-800/60 dark:bg-rose-950/20">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-rose-100 p-3 dark:bg-rose-900/40">
              <svg
                className="h-8 w-8 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-200">Payment Verification Failed</h1>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{verificationError}</p>

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

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href={`/orders/${orderId}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">
            If this is a mistake, please contact our support team for assistance.
          </p>
        </div>
      </section>
    );
  }

  if (orderStatus) {
    return (
      <section className="w-full bg-linear-to-b from-emerald-50/30 to-background px-4 py-8 dark:from-emerald-950/10 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="mx-auto max-w-md rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">Payment Successful!</h1>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            Your payment has been verified and your order is being processed.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-200 bg-white p-4 text-left dark:border-emerald-800/60 dark:bg-emerald-950/30">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Order ID:</span>
                <span className="font-mono font-semibold text-emerald-900 dark:text-emerald-200">{orderStatus.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Amount Paid:</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">৳{orderStatus.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Status:</span>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
                  {orderStatus.status}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">
            Redirecting to order details in 3 seconds...
          </p>

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href={`/orders/${orderStatus.orderId}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
