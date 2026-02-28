"use client";

import Link from "next/link";
import * as React from "react";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getMedicineById } from "@/services/medicine";
import { useCart } from "@/providers/cart-provider";

const SHIPPING_COST = 120;
const FREE_SHIPPING_THRESHOLD = 1000;

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function CartPageContent() {
  const { items, removeItem, updateQuantity } = useCart();
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
  const [stockByItemId, setStockByItemId] = React.useState<Record<string, number | null>>({});
  const hasInitializedSelection = React.useRef(false);
  const previousItemIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const loadStock = async () => {
      if (items.length === 0) {
        if (isMounted) {
          setStockByItemId({});
        }
        return;
      }

      const stockEntries = await Promise.all(
        items.map(async (item) => {
          const result = await getMedicineById(item.id, { noStore: true });

          if (!result.success || !result.data) {
            return [item.id, null] as const;
          }

          const stock = typeof result.data.stock === "number" ? result.data.stock : null;
          return [item.id, stock] as const;
        }),
      );

      if (!isMounted) {
        return;
      }

      setStockByItemId(Object.fromEntries(stockEntries));
    };

    loadStock();

    return () => {
      isMounted = false;
    };
  }, [items]);

  React.useEffect(() => {
    const currentItemIds = items.map((item) => item.id);

    setSelectedItemIds((previousSelectedIds) => {
      const itemIdSet = new Set(currentItemIds);

      if (!hasInitializedSelection.current) {
        hasInitializedSelection.current = true;
        previousItemIdsRef.current = currentItemIds;
        return currentItemIds;
      }

      const nextSelectedSet = new Set(previousSelectedIds.filter((id) => itemIdSet.has(id)));
      const previousItemIdSet = new Set(previousItemIdsRef.current);

      currentItemIds.forEach((itemId) => {
        if (!previousItemIdSet.has(itemId)) {
          nextSelectedSet.add(itemId);
        }
      });

      previousItemIdsRef.current = currentItemIds;

      return Array.from(nextSelectedSet);
    });
  }, [items]);

  const selectedItems = React.useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds],
  );

  const hasSelectedOutOfStock = React.useMemo(
    () =>
      selectedItems.some((item) => {
        const stock = stockByItemId[item.id];
        return typeof stock === "number" && stock <= 0;
      }),
    [selectedItems, stockByItemId],
  );

  const hasSelectedOverQuantity = React.useMemo(
    () =>
      selectedItems.some((item) => {
        const stock = stockByItemId[item.id];
        return typeof stock === "number" && stock > 0 && item.quantity > stock;
      }),
    [selectedItems, stockByItemId],
  );

  const hasCheckoutStockIssue = hasSelectedOutOfStock || hasSelectedOverQuantity;

  const subtotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = selectedItems.length > 0 && !hasFreeShipping ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const itemsCount = selectedItems.reduce((totalQty, item) => totalQty + item.quantity, 0);
  const leftForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const areAllItemsSelected = items.length > 0 && selectedItemIds.length === items.length;

  const checkoutSearchParams = new URLSearchParams();
  selectedItemIds.forEach((itemId) => checkoutSearchParams.append("items", itemId));
  const checkoutHref = `/checkout?${checkoutSearchParams.toString()}`;

  const handleToggleSelectAll = () => {
    setSelectedItemIds((previousSelectedIds) =>
      previousSelectedIds.length === items.length ? [] : items.map((item) => item.id),
    );
  };

  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItemIds((previousSelectedIds) =>
      previousSelectedIds.includes(itemId)
        ? previousSelectedIds.filter((id) => id !== itemId)
        : [...previousSelectedIds, itemId],
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success("Item removed from cart");
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Shopping Cart</h1>

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
            <div className="flex flex-col items-start justify-between gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={areAllItemsSelected}
                  onChange={handleToggleSelectAll}
                  className="accent-primary"
                />
                Select All
              </label>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {selectedItems.length} of {items.length} selected
              </p>
            </div>

            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 border-b p-4 last:border-b-0 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => handleToggleItemSelection(item.id)}
                    aria-label={`Select ${item.name}`}
                    className="accent-primary"
                  />

                  <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-18 sm:w-18">
                    <Package className="text-muted-foreground h-8 w-8" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-base leading-tight font-semibold sm:text-xl">{item.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      by {item.manufacturer || "Unknown manufacturer"}
                    </p>
                    <p className="mt-1 text-base font-medium sm:text-lg">BDT {currencyFormatter.format(item.price)}</p>
                    <p className="mt-1 text-sm">
                      {typeof stockByItemId[item.id] === "number" ? (
                        stockByItemId[item.id]! > 0 ? (
                          <span className="text-primary">Stock: {stockByItemId[item.id]}</span>
                        ) : (
                          <span className="text-destructive font-medium">Stock out</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">Stock: N/A</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end lg:gap-6">
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
                      disabled={
                        typeof stockByItemId[item.id] === "number" &&
                        stockByItemId[item.id] !== null &&
                        item.quantity >= stockByItemId[item.id]!
                      }
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xl font-semibold sm:text-2xl">
                      BDT {currencyFormatter.format(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
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

          <aside className="h-fit rounded-2xl border bg-card p-4 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Order Summary</h2>

            <div className="mt-5 space-y-2 text-base sm:text-lg">
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
              <span className="text-xl font-semibold sm:text-2xl">Total</span>
              <span className="text-2xl font-bold sm:text-3xl">BDT {currencyFormatter.format(total)}</span>
            </div>

            {selectedItemIds.length > 0 && !hasCheckoutStockIssue ? (
              <Button asChild className="mt-6 h-11 w-full text-base">
                <Link href={checkoutHref}>Proceed to Checkout</Link>
              </Button>
            ) : (
              <Button className="mt-6 h-11 w-full text-base" disabled>
                Proceed to Checkout
              </Button>
            )}
            {selectedItemIds.length === 0 && (
              <p className="mt-2 text-sm text-destructive">Select at least one product to checkout.</p>
            )}
            {selectedItemIds.length > 0 && hasCheckoutStockIssue && (
              <p className="mt-2 text-sm text-destructive">
                Some selected items are stock out or exceed available stock. Please update cart first.
              </p>
            )}
            <Button asChild variant="outline" className="mt-3 h-11 w-full text-base">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
