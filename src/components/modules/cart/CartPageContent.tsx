"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Package, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { getUser } from "@/services/auth";
import { createOrder } from "@/services/order";

const SHIPPING_COST = 120;
const FREE_SHIPPING_THRESHOLD = 1000;

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function CartPageContent() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = React.useState("");
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [checkoutMessage, setCheckoutMessage] = React.useState("");
  const [checkoutError, setCheckoutError] = React.useState("");

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length > 0 && !hasFreeShipping ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const itemsCount = items.reduce((totalQty, item) => totalQty + item.quantity, 0);
  const leftForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const handlePlaceOrder = async () => {
    const currentUser = (await getUser()) as Record<string, unknown> | null;

    if (!currentUser) {
      router.push("/login?redirect=/cart");
      return;
    }

    if (!shippingAddress.trim()) {
      setCheckoutError("Please provide your shipping address.");
      setCheckoutMessage("");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("Your cart is empty.");
      setCheckoutMessage("");
      return;
    }

    setIsPlacingOrder(true);
    setCheckoutError("");
    setCheckoutMessage("");

    const customerId =
      (currentUser?.id as string | undefined) ||
      (currentUser?.userId as string | undefined) ||
      (currentUser?.sub as string | undefined);

    if (!customerId) {
      setCheckoutError("Please login again to continue checkout.");
      setIsPlacingOrder(false);
      router.push("/login?redirect=/cart");
      return;
    }

    const result = await createOrder({
      customerId,
      paymentMethod: "COD",
      shippingAddress: shippingAddress.trim(),
      totalAmount: Number(total.toFixed(2)),
      items: items.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    if (!result.success) {
      setCheckoutError(result.message || "Failed to place order.");
      setIsPlacingOrder(false);
      return;
    }

    setCheckoutMessage(result.message || "Order created successfully.");
    clearCart();
    setIsPlacingOrder(false);
    router.push("/orders");
  };

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
          <p className="text-lg font-medium">Your cart is empty</p>
          <Button asChild className="mt-4">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border bg-card">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center justify-between gap-4 border-b p-5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-muted flex h-18 w-18 shrink-0 items-center justify-center rounded-xl">
                    <Package className="text-muted-foreground h-8 w-8" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl leading-tight font-semibold">{item.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by {item.manufacturer || "Unknown manufacturer"}
                    </p>
                    <p className="mt-1 text-lg font-medium">BDT {currencyFormatter.format(item.price)}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <div className="flex items-center rounded-xl border px-2 py-1">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="inline-flex h-8 w-8 items-center justify-center"
                      onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="inline-flex h-8 w-8 items-center justify-center"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-semibold">
                      BDT {currencyFormatter.format(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive mt-1 inline-flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Order Summary</h2>

            <div className="mt-5 space-y-2 text-lg">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal ({itemsCount} items)</span>
                <span className="text-foreground">BDT {currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">BDT {currencyFormatter.format(shipping)}</span>
              </div>
              {!hasFreeShipping && (
                <p className="text-primary text-sm">
                  Add BDT {currencyFormatter.format(leftForFreeShipping)} more for free shipping
                </p>
              )}
            </div>

            <div className="my-5 border-t" />

            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">Total</span>
              <span className="text-3xl font-bold">BDT {currencyFormatter.format(total)}</span>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-sm font-medium">Shipping Address</p>
              <Input
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                placeholder="Piash Islam, 123 Main St, City, Country"
              />
            </div>

            {checkoutError && <p className="text-destructive mt-3 text-sm">{checkoutError}</p>}
            {checkoutMessage && <p className="text-primary mt-3 text-sm">{checkoutMessage}</p>}

            <Button
              className="mt-6 h-11 w-full text-base"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? "Placing Order..." : "Proceed to Checkout"}
            </Button>
            <Button asChild variant="outline" className="mt-3 h-11 w-full text-base">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
