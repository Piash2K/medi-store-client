"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Minus, Package, Plus, Trash2, Lock, Truck, ShieldCheck } from "lucide-react";
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

  const hasSelectedExceedingStock = React.useMemo(
    () =>
      selectedItems.some((item) => {
        const stock = stockByItemId[item.id];
        return typeof stock === "number" && stock > 0 && item.quantity > stock;
      }),
    [selectedItems, stockByItemId],
  );

  const hasCheckoutStockIssue = hasSelectedOutOfStock || hasSelectedExceedingStock;

  const subtotal = React.useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const itemsCount = React.useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems],
  );

  const shipping = selectedItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const checkoutHref = React.useMemo(() => {
    if (selectedItemIds.length === 0) {
      return "/checkout";
    }

    const query = selectedItemIds.map((id) => `items=${encodeURIComponent(id)}`).join("&");
    return `/checkout?${query}`;
  }, [selectedItemIds]);

  const areAllItemsSelected = items.length > 0 && selectedItemIds.length === items.length;

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
    <main className="min-h-screen bg-[#f5fbf9] font-['Inter',sans-serif] text-[#171d1c] transition-colors duration-200 dark:bg-background dark:text-slate-100">
      <div className="home-shell py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Cart Items Column */}
          <div className="grow space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight text-[#006a63] font-['Manrope',sans-serif] dark:text-teal-300 md:text-4xl">
                Shopping Cart
              </h1>
              <span className="text-base text-[#3c4947] dark:text-slate-300">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="group flex flex-col items-center rounded-xl border border-[#006a63]/20 bg-white p-8 text-center shadow-sm transition-all hover:bg-[#f8fdfa] dark:border-emerald-900/70 dark:bg-background/80 dark:hover:bg-emerald-950/30 sm:p-12">
                <Package className="mx-auto mb-4 h-16 w-16 text-[#006a63] dark:text-teal-300" />
                <p className="text-lg font-semibold text-[#171d1c] dark:text-slate-100">Your cart is empty</p>
                <Button asChild className="mt-6 rounded-full bg-[#006a63] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Select All Control */}
                <div className="flex items-center space-x-4 rounded-xl border border-[#006a63]/20 bg-white px-6 py-4 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                  <input
                    type="checkbox"
                    checked={areAllItemsSelected}
                    onChange={handleToggleSelectAll}
                    className="h-5 w-5 rounded border-[#bbc9c7] text-[#006a63] accent-[#006a63] transition-all focus:ring-[#006a63] dark:border-slate-700 dark:accent-teal-400"
                  />
                  <span className="text-sm font-semibold text-[#171d1c] dark:text-slate-100">Select All Items</span>
                  <span className="ml-auto text-sm text-[#3c4947] dark:text-slate-400">
                    {selectedItems.length} of {items.length} selected
                  </span>
                </div>

                {/* Item List */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const stock = stockByItemId[item.id];
                    const isOutOfStock = typeof stock === "number" && stock <= 0;
                    const isOverQuantity = typeof stock === "number" && stock > 0 && item.quantity > stock;
                    const hasStockIssue = isOutOfStock || isOverQuantity;

                    return (
                      <div
                        key={item.id}
                        className={`group flex flex-col items-center gap-4 rounded-xl border border-[#006a63]/20 bg-white p-6 shadow-sm transition-all hover:bg-[#f8fdfa] dark:border-emerald-900/70 dark:bg-background/80 dark:hover:bg-emerald-950/30 sm:flex-row sm:gap-6 ${
                          hasStockIssue ? "opacity-80" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleToggleItemSelection(item.id)}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[#bbc9c7] text-[#006a63] accent-[#006a63] transition-all focus:ring-[#006a63] dark:border-slate-700 dark:accent-teal-400"
                        />

                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#006a63]/15 bg-[#e9efed] dark:border-emerald-900/50 dark:bg-emerald-950/30">
                          {isOutOfStock && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#171d1c]/20 backdrop-blur-xs">
                              <span className="rounded-full bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#93000a] uppercase dark:bg-red-950/80 dark:text-red-300">
                                Out of Stock
                              </span>
                            </div>
                          )}
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-8 w-8 text-[#006a63] dark:text-teal-300/40" />
                            </div>
                          )}
                        </div>

                        <div className="grow w-full">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-['Manrope',sans-serif] text-lg font-bold text-[#171d1c] dark:text-slate-100">
                                {item.name}
                              </h3>
                              <p className="mt-0.5 text-xs text-[#3c4947] dark:text-slate-400">
                                Brand: <span className="font-medium text-[#171d1c] dark:text-slate-200">{item.manufacturer || "PharmaCare"}</span>
                              </p>
                            </div>
                            <span className={`text-lg font-bold ${hasStockIssue ? "text-[#3c4947] dark:text-slate-400" : "text-[#006a63] dark:text-teal-300"}`}>
                              BDT {currencyFormatter.format(item.price)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center rounded-full border border-[#006a63]/20 bg-[#f5fbf9] p-1 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#006a63] transition-all hover:bg-[#006a63]/10 disabled:opacity-50 dark:text-teal-300 dark:hover:bg-emerald-900/40"
                                onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                                disabled={hasStockIssue}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 text-sm font-semibold text-[#171d1c] dark:text-slate-100">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#006a63] transition-all hover:bg-[#006a63]/10 disabled:opacity-50 dark:text-teal-300 dark:hover:bg-emerald-900/40"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={hasStockIssue || (typeof stock === "number" && stock !== null && item.quantity >= stock)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#ba1a1a] transition-colors hover:text-[#93000a] dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          {/* Stock info */}
                          {typeof stock === "number" && stock > 0 && (
                            <p className="mt-2 text-xs font-medium text-[#006a63] dark:text-teal-300">Stock: {stock} available</p>
                          )}
                          {isOutOfStock && (
                            <p className="mt-2 text-xs font-medium text-[#ba1a1a] dark:text-red-400">Out of stock</p>
                          )}
                          {isOverQuantity && !isOutOfStock && (
                            <p className="mt-2 text-xs font-medium text-[#ba1a1a] dark:text-red-400">Exceeds available stock</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {items.length > 0 && (
            <aside className="w-full shrink-0 lg:w-96">
              <div className="sticky top-24 rounded-xl border border-[#006a63]/20 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-background/80 sm:p-8">
                <h2 className="mb-6 font-['Manrope',sans-serif] text-2xl font-bold text-[#006a63] dark:text-teal-300">
                  Order Summary
                </h2>

                <div className="mb-8 space-y-4">
                  <div className="flex justify-between text-sm text-[#3c4947] dark:text-slate-300">
                    <span>Subtotal ({itemsCount} items)</span>
                    <span className="font-semibold text-[#171d1c] dark:text-slate-100">BDT {currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#3c4947] dark:text-slate-300">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#006a63] dark:text-teal-300">
                      {selectedItems.length > 0 ? `BDT ${currencyFormatter.format(shipping)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#3c4947] dark:text-slate-300">
                    <span>Tax (Estimated)</span>
                    <span className="font-semibold text-[#171d1c] dark:text-slate-100">BDT {currencyFormatter.format(0)}</span>
                  </div>

                  {/* Total Inset Block */}
                  <div className="mt-4 rounded-lg border border-[#006a63]/20 bg-[#006a63]/5 p-4 dark:border-teal-800/60 dark:bg-teal-950/30">
                    <div className="flex items-center justify-between font-bold text-[#006a63] dark:text-teal-300">
                      <span className="text-lg">Total</span>
                      <span className="text-2xl font-extrabold sm:text-3xl">BDT {currencyFormatter.format(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedItemIds.length > 0 && !hasCheckoutStockIssue ? (
                    <Button asChild className="w-full rounded-lg bg-[#006a63] py-4 text-sm font-bold text-white transition-colors hover:bg-[#5bdacf] hover:text-[#00201d] dark:bg-teal-600 dark:hover:bg-teal-700 dark:hover:text-white">
                      <Link href={checkoutHref}>Proceed to Checkout</Link>
                    </Button>
                  ) : (
                    <Button className="w-full rounded-lg bg-[#006a63]/50 py-4 text-sm font-bold text-white cursor-not-allowed dark:bg-teal-800/50" disabled>
                      Proceed to Checkout
                    </Button>
                  )}

                  {selectedItemIds.length === 0 && (
                    <p className="text-center text-xs font-medium text-[#ba1a1a] dark:text-red-400">Select at least one product to checkout.</p>
                  )}
                  {selectedItemIds.length > 0 && hasCheckoutStockIssue && (
                    <p className="text-center text-xs font-medium text-[#ba1a1a] dark:text-red-400">
                      Some selected items are out of stock or exceed available quantity. Please update cart first.
                    </p>
                  )}

                  <Link
                    href="/shop"
                    className="block w-full rounded-lg border border-[#006a63] bg-white py-3.5 text-center text-sm font-bold text-[#006a63] transition-colors hover:bg-[#006a63]/5 dark:border-teal-500 dark:bg-background/60 dark:text-teal-400 dark:hover:bg-teal-950/30"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Signals */}
                <div className="mt-8 space-y-3.5 border-t border-[#006a63]/15 pt-6 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                    <span className="text-xs text-[#3c4947] dark:text-slate-400">Secure SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                    <span className="text-xs text-[#3c4947] dark:text-slate-400">Expected Delivery: 3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#006a63] dark:text-teal-300" />
                    <span className="text-xs text-[#3c4947] dark:text-slate-400">Licensed Pharmacy Guarantee</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}