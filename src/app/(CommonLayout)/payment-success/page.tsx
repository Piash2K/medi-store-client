"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/services/payment";
import { getUser } from "@/services/auth";

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
        const user = (await getUser()) as Record<string, unknown> | null;
        if (!user || typeof user.token !== "string") {
          setVerificationError("Authentication required. Please login and try again.");
          setIsVerifying(false);
          return;
        }

        const result = await getPaymentStatus(orderId, user.token as string);

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
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border bg-card">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Verifying your payment...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please wait while we confirm your transaction
          </p>
        </div>
      </section>
    );
  }

  if (verificationError) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-8 w-8 text-red-600"
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
          <h1 className="text-2xl font-bold text-red-900">Payment Verification Failed</h1>
          <p className="mt-2 text-sm text-red-700">{verificationError}</p>

          {orderId && (
            <p className="mt-3 text-xs text-red-600">
              Order ID: <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}

          {transactionId && (
            <p className="mt-1 text-xs text-red-600">
              Transaction ID: <span className="font-mono font-semibold">{transactionId}</span>
            </p>
          )}

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <Link href={`/orders/${orderId}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            If this is a mistake, please contact our support team for assistance.
          </p>
        </div>
      </section>
    );
  }

  if (orderStatus) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="mx-auto max-w-md rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-green-900">Payment Successful!</h1>
          <p className="mt-2 text-sm text-green-700">
            Your payment has been verified and your order is being processed.
          </p>

          <div className="mt-6 rounded-lg bg-white p-4 text-left">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{orderStatus.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">৳{orderStatus.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {orderStatus.status}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Redirecting to order details in 3 seconds...
          </p>

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <Link href={`/orders/${orderStatus.orderId}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
