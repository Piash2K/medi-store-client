"use client";

import * as React from "react";
import { Loader2, CheckCircle2, CreditCard } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { initializeSSLCommerzPayment } from "@/services/payment";

export type PaymentMethodSelectorProps = {
  isLoading: boolean;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  items: {
    medicineId: string;
    quantity: number;
    price: number;
  }[];
  onPaymentMethodChange?: (method: "COD" | "SSLCOMMERZ") => void;
};

type PaymentMethod = "COD" | "SSLCOMMERZ";

export default function PaymentMethodSelector({
  isLoading,
  subtotal,
  shipping,
  total,
  shippingAddress,
  items,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>("COD");
  const [isInitializingPayment, setIsInitializingPayment] = React.useState(false);

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onPaymentMethodChange?.(method);
  };

  const handleSSLCommerzPayment = async () => {
    if (!items.length) {
      toast.error("No items in cart");
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error("Please provide a shipping address");
      return;
    }

    setIsInitializingPayment(true);

    try {
      const result = await initializeSSLCommerzPayment(
        {
          shippingAddress: shippingAddress.trim(),
          paymentMethod: "SSLCOMMERZ",
          items,
        }
      );

      if (!result.success || !result.data?.gatewayPageURL) {
        await Swal.fire({
          icon: "error",
          title: "Payment Initialization Failed",
          text: result.message || "Could not initialize payment. Please try again.",
        });
        setIsInitializingPayment(false);
        return;
      }

      // Redirect to SSLCommerz gateway
      window.location.href = result.data.gatewayPageURL;
    } catch (error) {
      console.error("Payment initialization error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to initialize payment. Please try again.",
      });
      setIsInitializingPayment(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Payment Method</h2>

      <div className="space-y-3">
        {/* COD Option */}
        <label className="has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50">
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={selectedMethod === "COD"}
            onChange={() => handleMethodChange("COD")}
            className="mt-1"
          />
          <div className="flex-1">
            <p className="font-medium">Cash on Delivery (COD)</p>
            <p className="text-sm text-muted-foreground">
              Pay when your order arrives. No payment needed now.
            </p>
          </div>
          {selectedMethod === "COD" && <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />}
        </label>

        {/* SSLCommerz Option */}
        <label className="has-checked:border-primary has-checked:bg-primary/5 flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50">
          <input
            type="radio"
            name="paymentMethod"
            value="SSLCOMMERZ"
            checked={selectedMethod === "SSLCOMMERZ"}
            onChange={() => handleMethodChange("SSLCOMMERZ")}
            className="mt-1"
          />
          <div className="flex-1">
            <p className="font-medium">Pay Now with SSLCommerz</p>
            <p className="text-sm text-muted-foreground">
              Secure online payment using credit/debit card or mobile banking.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                Credit Card
              </span>
              <span className="inline-block rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                Debit Card
              </span>
              <span className="inline-block rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                bKash
              </span>
              <span className="inline-block rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                Nagad
              </span>
            </div>
          </div>
          {selectedMethod === "SSLCOMMERZ" && <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />}
        </label>
      </div>

      {/* Payment Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-medium">
              {shipping === 0 ? "FREE" : `৳${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {selectedMethod === "SSLCOMMERZ" ? (
          <Button
            onClick={handleSSLCommerzPayment}
            disabled={isLoading || isInitializingPayment}
            size="lg"
            className="w-full"
          >
            {isInitializingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ৳{total.toFixed(2)} with SSLCommerz
              </>
            )}
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Choose your payment method above and proceed to checkout
          </p>
        )}
      </div>

      {/* Security Notice */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700">
        <p className="font-medium">🔒 Secure Payment</p>
        <p className="mt-1">
          Your payment information is encrypted and secure. SSLCommerz is a trusted payment gateway
          in Bangladesh.
        </p>
      </div>
    </div>
  );
}
