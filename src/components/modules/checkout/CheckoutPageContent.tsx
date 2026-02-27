"use client";

import Link from "next/link";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { getUser } from "@/services/auth";
import { getMedicineById } from "@/services/medicine";
import { createOrder } from "@/services/order";

const SHIPPING_COST = 120;
const FREE_SHIPPING_THRESHOLD = 1000;

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
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = checkoutItems.length > 0 && !hasFreeShipping ? SHIPPING_COST : 0;
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

    const customerId =
      (currentUser.id as string | undefined) ||
      (currentUser.userId as string | undefined) ||
      (currentUser.sub as string | undefined);

    if (!customerId) {
      const message = "Please login again to continue checkout.";
      setCheckoutError(message);
      setIsPlacingOrder(false);
      await Swal.fire({ icon: "error", title: "Authentication required", text: message });
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    const result = await createOrder({
      customerId,
      paymentMethod: "COD",
      shippingAddress: shippingAddress.trim(),
      totalAmount: Number(total.toFixed(2)),
      items: checkoutItems.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
        price: item.price,
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
  };

  if (isBuyNowMode && isLoadingBuyNow) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
        <div className="mt-8 flex h-44 items-center justify-center rounded-2xl border bg-card">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
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
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Shipping Information</h2>

          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium">Shipping Address</p>
            <Input
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              placeholder="Piash Islam, 123 Main St, City, Country"
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>Payment Method</span>
            <span className="font-medium text-foreground">Cash on Delivery (COD)</span>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Order Summary</h2>

          <div className="mt-4 space-y-2 border-b pb-4">
            {checkoutItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-foreground">
                  BDT {currencyFormatter.format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-lg">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal ({itemsCount} items)</span>
              <span className="text-foreground">BDT {currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="text-foreground">BDT {currencyFormatter.format(shipping)}</span>
            </div>
          </div>

          <div className="my-5 border-t" />

          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">Total</span>
            <span className="text-3xl font-bold">BDT {currencyFormatter.format(total)}</span>
          </div>

          {checkoutError && <p className="text-destructive mt-3 text-sm">{checkoutError}</p>}
          {checkoutMessage && <p className="text-primary mt-3 text-sm">{checkoutMessage}</p>}

          <Button
            className="mt-6 h-11 w-full text-base"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || (isBuyNowMode && !buyNowItem)}
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </Button>
          <Button asChild variant="outline" className="mt-3 h-11 w-full text-base">
            <Link href={isBuyNowMode ? "/shop" : "/cart"}>{isBuyNowMode ? "Back to Shop" : "Back to Cart"}</Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
