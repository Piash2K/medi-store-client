"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import PaymentMethodSelector from "@/components/modules/checkout/PaymentMethodSelector";
import { useCart } from "@/providers/cart-provider";
import { getUser } from "@/services/auth";
import { getMedicineById } from "@/services/medicine";
import { createOrder } from "@/services/order";
import { initializeSSLCommerzPayment } from "@/services/payment";

/* ── Constants ──────────────────────────────────────────────────── */
const SHIPPING_COST = 60;

const fmt = new Intl.NumberFormat("en-BD", {
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

/* ── Bento Card (matches reference .bento-card with shop-page dark mode) ── */
function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bento-card rounded-xl border border-[#006a63]/20 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,166,156,0.08)] dark:border-emerald-900/70 dark:bg-background/80 dark:hover:border-teal-800 dark:hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Loading Skeleton ───────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {[120, 260, 140].map((h) => (
              <div
                key={h}
                style={{ height: h }}
                className="animate-pulse rounded-xl border border-[#006a63]/20 bg-[#e9efed] dark:border-emerald-900/70 dark:bg-slate-800/80"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="h-80 animate-pulse rounded-xl border border-[#006a63]/20 bg-[#e9efed] dark:border-emerald-900/70 dark:bg-slate-800/80" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Empty State ────────────────────────────────────────────────── */
function EmptyCheckout({
  isBuyNow,
  isSelectedCart,
  error,
}: {
  isBuyNow: boolean;
  isSelectedCart: boolean;
  error?: string;
}) {
  const message = error
    ? error
    : isBuyNow
    ? "Please return to shop and choose Buy Now again."
    : isSelectedCart
    ? "Please return to cart and select products to checkout."
    : "Add medicines to your cart before checkout.";

  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        <BentoCard className="py-16 text-center">
          <p className="text-lg font-semibold text-[#171d1c] dark:text-slate-100">
            No items selected for checkout
          </p>
          <p className="mt-2 text-sm text-[#3c4947] dark:text-slate-400">
            {message}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-lg bg-[#006a63] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white"
          >
            Browse Medicines
          </Link>
        </BentoCard>
      </div>
    </main>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart, removeItem } = useCart();

  const [shippingAddress, setShippingAddress] = React.useState("");
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");
  const [buyNowItem, setBuyNowItem] = React.useState<CheckoutItem | null>(null);
  const [isLoadingBuyNow, setIsLoadingBuyNow] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"COD" | "SSLCOMMERZ">("COD");

  /* ── URL params ── */
  const buyNowMedicineId = searchParams.get("buyNow")?.trim() || "";
  const selectedCartItemIds = searchParams
    .getAll("items")
    .map((id) => id.trim())
    .filter(Boolean);
  const selectedCartItemIdSet = React.useMemo(
    () => new Set(selectedCartItemIds),
    [selectedCartItemIds],
  );
  const rawQty = Number.parseInt(searchParams.get("qty") || "1", 10);
  const buyNowQty = Number.isNaN(rawQty) ? 1 : Math.max(rawQty, 1);
  const isBuyNow = Boolean(buyNowMedicineId);
  const isSelectedCart = !isBuyNow && selectedCartItemIds.length > 0;

  /* ── Load buy-now medicine ── */
  React.useEffect(() => {
    const load = async () => {
      if (!isBuyNow) { setBuyNowItem(null); return; }
      setIsLoadingBuyNow(true);
      setCheckoutError("");
      const res = await getMedicineById(buyNowMedicineId);
      setIsLoadingBuyNow(false);

      if (!res.success || !res.data) {
        setBuyNowItem(null);
        setCheckoutError(res.message || "Failed to load selected medicine.");
        return;
      }
      const id = res.data._id || res.data.id;
      if (!id) { setCheckoutError("Selected medicine is not available."); return; }

      setBuyNowItem({
        id: String(id),
        name: res.data.name,
        price: res.data.price,
        quantity: buyNowQty,
        manufacturer: res.data.manufacturer,
      });
    };
    load();
  }, [isBuyNow, buyNowMedicineId, buyNowQty]);

  /* ── Derived values ── */
  const checkoutItems: CheckoutItem[] = isBuyNow
    ? buyNowItem ? [buyNowItem] : []
    : isSelectedCart
    ? items.filter((i) => selectedCartItemIdSet.has(i.id))
    : items;

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = checkoutItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const itemsCount = checkoutItems.reduce((s, i) => s + i.quantity, 0);

  /* ── Place COD Order ── */
  const handlePlaceOrderCOD = async () => {
    const user = (await getUser()) as Record<string, unknown> | null;
    const checkoutPath = isBuyNow
      ? `/checkout?buyNow=${encodeURIComponent(buyNowMedicineId)}&qty=${buyNowQty}`
      : isSelectedCart
      ? `/checkout?${selectedCartItemIds.map((id) => `items=${encodeURIComponent(id)}`).join("&")}`
      : "/checkout";

    if (!user) { router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`); return; }

    if (!shippingAddress.trim()) {
      const msg = "Please provide your shipping address.";
      setCheckoutError(msg);
      await Swal.fire({ icon: "warning", title: "Missing address", text: msg });
      return;
    }

    if (checkoutItems.length === 0) {
      const msg = isSelectedCart ? "No selected products found." : "Your cart is empty.";
      setCheckoutError(msg);
      await Swal.fire({ icon: "warning", title: "Checkout unavailable", text: msg });
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError("");

    const result = await createOrder({
      paymentMethod: "COD",
      shippingAddress: shippingAddress.trim(),
      shippingCost: shipping,
      items: checkoutItems.map((i) => ({ medicineId: i.id, quantity: i.quantity })),
    });

    setIsPlacingOrder(false);

    if (!result.success) {
      const msg = result.message || "Failed to place order.";
      setCheckoutError(msg);
      await Swal.fire({ icon: "error", title: "Order failed", text: msg });
      return;
    }

    toast.success(result.message || "Order created successfully.");

    if (!isBuyNow) {
      isSelectedCart ? checkoutItems.forEach((i) => removeItem(i.id)) : clearCart();
    }
    router.push("/orders");
  };

  /* ── SSLCommerz Online Payment ── */
  const handleSSLCommerzPayment = async () => {
    const user = (await getUser()) as Record<string, unknown> | null;
    const checkoutPath = isBuyNow
      ? `/checkout?buyNow=${encodeURIComponent(buyNowMedicineId)}&qty=${buyNowQty}`
      : isSelectedCart
      ? `/checkout?${selectedCartItemIds.map((id) => `items=${encodeURIComponent(id)}`).join("&")}`
      : "/checkout";

    if (!user) { router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`); return; }

    if (!shippingAddress.trim()) {
      const msg = "Please provide your shipping address.";
      setCheckoutError(msg);
      await Swal.fire({ icon: "warning", title: "Missing address", text: msg });
      return;
    }

    if (checkoutItems.length === 0) {
      const msg = isSelectedCart ? "No selected products found." : "Your cart is empty.";
      setCheckoutError(msg);
      await Swal.fire({ icon: "warning", title: "Checkout unavailable", text: msg });
      return;
    }

    setIsInitializingPayment(true);
    setCheckoutError("");

    try {
      const result = await initializeSSLCommerzPayment({
        shippingAddress: shippingAddress.trim(),
        shippingCost: shipping,
        paymentMethod: "SSLCOMMERZ",
        items: checkoutItems.map((i) => ({ medicineId: i.id, quantity: i.quantity })),
      });

      if (!result.success || !result.data?.gatewayPageURL) {
        const msg = result.message || "Could not initialize online payment.";
        setCheckoutError(msg);
        await Swal.fire({ icon: "error", title: "Payment Initialization Failed", text: msg });
        setIsInitializingPayment(false);
        return;
      }

      window.location.href = result.data.gatewayPageURL;
    } catch (err) {
      console.error(err);
      setCheckoutError("Failed to initialize payment.");
      await Swal.fire({ icon: "error", title: "Error", text: "Failed to initialize payment." });
      setIsInitializingPayment(false);
    }
  };

  /* ── Guard Renders ── */
  if (isBuyNow && isLoadingBuyNow) return <LoadingSkeleton />;

  if (checkoutItems.length === 0) {
    return (
      <EmptyCheckout
        isBuyNow={isBuyNow}
        isSelectedCart={isSelectedCart}
        error={checkoutError}
      />
    );
  }

  /* ── Full Page Wrapper ── */
  return (
    <main className="min-h-screen bg-[#f5fbf9] transition-colors duration-200 dark:bg-background">
      <div className="home-shell py-8 sm:py-10">
        {/* ── Back Navigation — professional top placement ── */}
        <div className="mb-6">
          <Link
            href={isBuyNow ? "/shop" : "/cart"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3c4947] transition-colors hover:text-[#006a63] dark:text-slate-400 dark:hover:text-teal-300"
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {isBuyNow ? "Back to Shop" : "Back to Cart"}
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

          {/* ══ Left Column ══════════════════════════════════════════ */}
          <div className="space-y-6 lg:col-span-8">

            {/* ── Card 1: Shipping Information ── */}
            <BentoCard>
              <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#006a63] dark:text-teal-300">
                Shipping Information
              </h2>

              <div className="space-y-1">
                <label
                  htmlFor="shipping-address"
                  className="block text-sm font-semibold text-[#171d1c] dark:text-slate-100"
                >
                  Shipping Address
                </label>
                <input
                  id="shipping-address"
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    if (checkoutError) setCheckoutError("");
                  }}
                  placeholder="Piash Islam, 123 Main St, City, Country"
                  className="w-full rounded-lg border border-[#bbc9c7] bg-white px-4 py-2.5 text-sm text-[#3c4947] placeholder-slate-400 outline-none transition focus:border-[#006a63] focus:ring-2 focus:ring-[#006a63]/20 dark:border-slate-700 dark:bg-background/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-teal-500"
                />
              </div>
            </BentoCard>

            {/* ── Card 2: Payment Method (Radio + Main Action Button + Notices) ── */}
            <BentoCard>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onPaymentMethodChange={(m) => setPaymentMethod(m)}
                onPlaceOrderCOD={handlePlaceOrderCOD}
                onPaySSLCommerz={handleSSLCommerzPayment}
                isPlacingOrder={isPlacingOrder}
                isInitializingPayment={isInitializingPayment}
                checkoutError={checkoutError}
                total={total}
                disabled={isBuyNow && !buyNowItem}
              />
            </BentoCard>


          </div>

          {/* ══ Right Column — Order Summary ═════════════════════════ */}
          <aside className="lg:col-span-4">
            <div className="bento-card sticky top-24 overflow-hidden rounded-xl border border-[#006a63]/20 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,166,156,0.08)] dark:border-emerald-900/70 dark:bg-background/80 dark:hover:border-teal-800">
              <div className="p-6">
                {/* Header */}
                <h3 className="mb-6 text-xl font-semibold text-[#006a63] dark:text-teal-300">
                  Order Summary
                </h3>

                {/* Item List */}
                <div className="mb-8 space-y-4">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#171d1c] dark:text-slate-100">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-sm text-[#006a63] dark:text-teal-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-base font-bold text-[#171d1c] dark:text-slate-100">
                        ৳{fmt.format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal / Shipping */}
                <div className="space-y-4 border-t border-[#bbc9c7]/30 pt-6 text-sm text-[#3c4947] dark:border-slate-700/50 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemsCount} items)</span>
                    <span>৳{fmt.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[#006a63] dark:text-teal-300">
                      {shipping === 0 ? "FREE" : `৳${fmt.format(shipping)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Block — m-4 inset with top border */}
              <div className="m-4 rounded-lg border border-[#006a63]/20 bg-[#006a63]/5 p-4 dark:border-teal-800/60 dark:bg-teal-950/30">
                <div className="flex items-center justify-between font-bold text-[#006a63] dark:text-teal-300">
                  <span className="text-xl">Total</span>
                  <span className="text-3xl font-extrabold">৳{fmt.format(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
