"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { getMedicineById } from "@/services/medicine";
import { useCart } from "@/providers/cart-provider";

const SHIPPING_COST = 60;

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
  const shipping = selectedItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const itemsCount = selectedItems.reduce((totalQty, item) => totalQty + item.quantity, 0);

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
    <section className="mx-auto w-full max-w-7xl bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-3xl lg:text-4xl">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-8 text-center dark:border-emerald-800/60 dark:from-emerald-950/20 dark:to-emerald-950/10">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Your cart is empty</p>
          <Button asChild className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50/40 to-white shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/20 dark:to-emerald-950/10">
            <div className="flex flex-col items-start justify-between gap-2 border-b border-emerald-200 px-4 py-3 dark:border-emerald-800/60 sm:flex-row sm:items-center sm:px-5">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <input
                  type="checkbox"
                  checked={areAllItemsSelected}
                  onChange={handleToggleSelectAll}
                  className="accent-emerald-600"
                />
                Select All
              </label>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 sm:text-sm">
                {selectedItems.length} of {items.length} selected
              </p>
            </div>

            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 border-b border-emerald-100 p-4 last:border-b-0 dark:border-emerald-800/50 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(item.id)}
                    onChange={() => handleToggleItemSelection(item.id)}
                    aria-label={`Select ${item.name}`}
                    className="accent-emerald-600"
                  />

                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 dark:bg-emerald-900/45 sm:h-18 sm:w-18">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-base leading-tight font-semibold text-emerald-800 dark:text-emerald-200 sm:text-xl">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                      by {item.manufacturer || "Unknown manufacturer"}
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                      BDT {currencyFormatter.format(item.price)}
                    </p>
                    <p className="mt-1 text-sm">
                      {typeof stockByItemId[item.id] === "number" ? (
                        stockByItemId[item.id]! > 0 ? (
                          <span className="text-emerald-600">Stock: {stockByItemId[item.id]}</span>
                        ) : (
                          <span className="text-destructive font-medium">Stock out</span>
                        )
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Stock: N/A</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end lg:gap-6">
                  <div className="flex items-center rounded-xl border border-emerald-200 bg-white px-2 py-1 dark:border-emerald-800/60 dark:bg-emerald-950/25">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="inline-flex h-8 w-8 items-center justify-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                      onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-200">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="inline-flex h-8 w-8 items-center justify-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
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
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 sm:text-2xl">
                      BDT {currencyFormatter.format(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-1 inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/20 dark:to-emerald-950/10 sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-2xl">Order Summary</h2>

            <div className="mt-5 space-y-2 text-base sm:text-lg">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span>Subtotal ({itemsCount} items)</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">BDT {currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">BDT {currencyFormatter.format(shipping)}</span>
              </div>
            </div>

            <div className="my-5 border-t border-emerald-200 dark:border-emerald-800/60" />

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-800 dark:text-emerald-200 sm:text-2xl">Total</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 sm:text-3xl">BDT {currencyFormatter.format(total)}</span>
            </div>

            {selectedItemIds.length > 0 && !hasCheckoutStockIssue ? (
              <Button asChild className="mt-6 h-11 w-full bg-emerald-600 text-base text-white hover:bg-emerald-700">
                <Link href={checkoutHref}>Proceed to Checkout</Link>
              </Button>
            ) : (
              <Button className="mt-6 h-11 w-full bg-emerald-400 text-base text-white" disabled>
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
            <Button asChild variant="outline" className="mt-3 h-11 w-full border-emerald-300 text-base text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
