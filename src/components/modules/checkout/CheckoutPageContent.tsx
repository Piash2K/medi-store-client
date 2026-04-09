"use client";

import Link from "next/link";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentMethodSelector from "@/components/modules/checkout/PaymentMethodSelector";
import { useCart } from "@/providers/cart-provider";
import { getUser } from "@/services/auth";
import { getMedicineById } from "@/services/medicine";
import { createOrder } from "@/services/order";

const SHIPPING_COST = 60;

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  manufacturer?: string;
};

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart, removeItem } = useCart();
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [checkoutMessage, setCheckoutMessage] = React.useState("");
  const [checkoutError, setCheckoutError] = React.useState("");
  const [buyNowItem, setBuyNowItem] = React.useState<CheckoutItem | null>(null);
  const [isLoadingBuyNow, setIsLoadingBuyNow] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"COD" | "SSLCOMMERZ">("COD");

  const buyNowMedicineId = searchParams.get("buyNow")?.trim() || "";
  const selectedCartItemIds = searchParams
    .getAll("items")
    .map((itemId) => itemId.trim())
    .filter(Boolean);
  const selectedCartItemIdSet = React.useMemo(() => new Set(selectedCartItemIds), [selectedCartItemIds]);
  const rawBuyNowQty = Number.parseInt(searchParams.get("qty") || "1", 10);
  const buyNowQty = Number.isNaN(rawBuyNowQty) ? 1 : Math.max(rawBuyNowQty, 1);
  const isBuyNowMode = Boolean(buyNowMedicineId);
  const isSelectedCartMode = !isBuyNowMode && selectedCartItemIds.length > 0;

  React.useEffect(() => {
    const loadBuyNowMedicine = async () => {
      if (!isBuyNowMode) {
        setBuyNowItem(null);
        return;
      }

      setIsLoadingBuyNow(true);
      setCheckoutError("");

      const medicineResult = await getMedicineById(buyNowMedicineId);
      setIsLoadingBuyNow(false);

      if (!medicineResult.success || !medicineResult.data) {
        setBuyNowItem(null);
        setCheckoutError(medicineResult.message || "Failed to load selected medicine for checkout.");
        return;
      }

      const currentMedicineId = medicineResult.data._id || medicineResult.data.id;

      if (!currentMedicineId) {
        setBuyNowItem(null);
        setCheckoutError("Selected medicine is not available for checkout.");
        return;
      }

      setBuyNowItem({
        id: String(currentMedicineId),
        name: medicineResult.data.name,
        price: medicineResult.data.price,
        quantity: buyNowQty,
        manufacturer: medicineResult.data.manufacturer,
      });
    };

    loadBuyNowMedicine();
  }, [isBuyNowMode, buyNowMedicineId, buyNowQty]);

  const checkoutItems = isBuyNowMode
    ? (buyNowItem ? [buyNowItem] : [])
    : isSelectedCartMode
      ? items.filter((item) => selectedCartItemIdSet.has(item.id))
      : items;

  const subtotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = checkoutItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const itemsCount = checkoutItems.reduce((totalQty, item) => totalQty + item.quantity, 0);

  const handlePlaceOrder = async () => {
    const currentUser = (await getUser()) as Record<string, unknown> | null;
    const checkoutPath = isBuyNowMode
      ? `/checkout?buyNow=${encodeURIComponent(buyNowMedicineId)}&qty=${buyNowQty}`
      : isSelectedCartMode
        ? `/checkout?${selectedCartItemIds.map((itemId) => `items=${encodeURIComponent(itemId)}`).join("&")}`
        : "/checkout";

    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    if (!shippingAddress.trim()) {
      const message = "Please provide your shipping address.";
      setCheckoutError(message);
      setCheckoutMessage("");
      await Swal.fire({ icon: "warning", title: "Missing address", text: message });
      return;
    }

    if (checkoutItems.length === 0) {
      const message = isSelectedCartMode ? "No selected products found for checkout." : "Your cart is empty.";
      setCheckoutError(message);
      setCheckoutMessage("");
      await Swal.fire({ icon: "warning", title: "Checkout unavailable", text: message });
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError("");
    setCheckoutMessage("");

    const result = await createOrder({
      paymentMethod,
      shippingAddress: shippingAddress.trim(),
      shippingCost: shipping,
      items: checkoutItems.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
      })),
    });

    setIsPlacingOrder(false);

    if (!result.success) {
      const message = result.message || "Failed to place order.";
      setCheckoutError(message);
      await Swal.fire({ icon: "error", title: "Order failed", text: message });
      return;
    }

    const successMessage = result.message || "Order created successfully.";
    setCheckoutMessage(successMessage);
    toast.success(successMessage);

    if (paymentMethod === "COD") {
      if (!isBuyNowMode) {
        if (isSelectedCartMode) {
          checkoutItems.forEach((item) => {
            removeItem(item.id);
          });
        } else {
          clearCart();
        }
      }
      router.push("/orders");
    }
    // Note: SSLCommerz payment is handled separately by PaymentMethodSelector
  };

  if (isBuyNowMode && isLoadingBuyNow) {
    return (
      <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-8 flex h-44 items-center justify-center rounded-2xl border bg-card">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
          <p className="text-lg font-medium">No item selected for checkout</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBuyNowMode
              ? "Please return to shop and choose Buy Now again."
              : isSelectedCartMode
                ? "Please return to cart and select products to checkout."
                : "Add medicines to cart before checkout."}
          </p>
          <Button asChild className="mt-4">
            <Link href="/shop">Browse Medicines</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-screen-2xl bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-6 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:to-emerald-950/10">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">Shipping Information</h2>

            <div className="mt-5 space-y-2">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Shipping Address</p>
              <Input
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                placeholder="Piash Islam, 123 Main St, City, Country"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="rounded-2xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-white p-6 dark:border-blue-800/60 dark:from-blue-950/20 dark:to-blue-950/10">
            <PaymentMethodSelector
              isLoading={isPlacingOrder}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              shippingAddress={shippingAddress}
              items={checkoutItems.map((item) => ({
                medicineId: item.id,
                quantity: item.quantity,
              }))}
              shippingCost={shipping}
              onPaymentMethodChange={(method: "COD" | "SSLCOMMERZ") => setPaymentMethod(method)}
            />
          </div>

          {/* COD Place Order Button */}
          {paymentMethod === "COD" && (
            <div className="rounded-2xl border-2 border-teal-200 bg-linear-to-br from-teal-50 to-white p-6 dark:border-teal-800/60 dark:from-teal-950/20 dark:to-teal-950/10">
              {checkoutError && (
                <p className="text-red-700 mb-2 rounded-lg bg-red-50 border-2 border-red-200 p-3 text-sm font-semibold dark:border-red-800/60 dark:bg-red-950/25 dark:text-red-300">
                  {checkoutError}
                </p>
              )}
              {checkoutMessage && (
                <p className="text-emerald-700 mb-2 rounded-lg bg-emerald-50 border-2 border-emerald-200 p-3 text-sm font-semibold dark:border-emerald-800/60 dark:bg-emerald-950/25 dark:text-emerald-300">
                  {checkoutMessage}
                </p>
              )}
              <Button
                className="h-11 w-full text-base bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || (isBuyNowMode && !buyNowItem)}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order with COD"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="mt-3 h-11 w-full text-base border-2 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <Link href={isBuyNowMode ? "/shop" : "/cart"}>
                  {isBuyNowMode ? "Back to Shop" : "Back to Cart"}
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-lg dark:border-emerald-800/60 dark:bg-emerald-950/20">
          <h2 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">Order Summary</h2>

          <div className="mt-5 space-y-2 border-b-2 border-emerald-100 pb-4 dark:border-emerald-800/60">
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm pb-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                  <p className="text-emerald-600 text-xs font-medium dark:text-emerald-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  ৳{currencyFormatter.format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal ({itemsCount} items)</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">৳{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b-2 border-emerald-100 pb-3 dark:border-emerald-800/60">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {shipping === 0 ? "FREE" : `৳${currencyFormatter.format(shipping)}`}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 p-4 border-2 border-emerald-200 dark:border-emerald-800/60 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Total</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-300">৳{currencyFormatter.format(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
