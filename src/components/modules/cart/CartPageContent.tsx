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
    <main className="bg-[#f2fbf9] dark:bg-emerald-950/10 min-h-screen font-['Inter',sans-serif] text-[#171d1c] dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items Column */}
          <div className="grow space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-bold text-[#171d1c] dark:text-slate-100 font-['Manrope',sans-serif] tracking-tight drop-shadow-sm">
                Shopping Cart
              </h1>
              <span className="text-[#4f6169] dark:text-slate-300 text-base">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col items-center text-center group bg-white dark:bg-background/80 hover:bg-[#f8fdfa] dark:hover:bg-emerald-950/30 transition-all hover:shadow-xl hover:shadow-[#006a63]/5">
                <Package className="w-16 h-16 text-[#006a63] dark:text-teal-200 mx-auto mb-4" />
                <p className="text-lg font-semibold text-[#171d1c] dark:text-slate-100">Your cart is empty</p>
                <Button asChild className="mt-6 bg-[#00a69c] text-white hover:bg-[#008a82] rounded-full px-8">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Select All Control */}
                <div className="flex items-center space-x-4 py-4 px-6 bg-white dark:bg-emerald-950/30 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 shadow-sm dark:shadow-none">
                  <input
                    type="checkbox"
                    checked={areAllItemsSelected}
                    onChange={handleToggleSelectAll}
                    className="w-5 h-5 rounded border-[#6c7a78] text-[#006a63] focus:ring-[#006a63] transition-all accent-[#006a63]"
                  />
                  <span className="text-sm font-semibold ">Select All Items</span>
                  <span className="text-sm text-[#4f6169] ml-auto">
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
                        className={`p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group bg-white dark:bg-background/80 hover:bg-[#f8fdfa] dark:hover:bg-emerald-950/30 transition-all hover:shadow-xl hover:shadow-[#006a63]/5 ${
                          hasStockIssue ? "opacity-80" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleToggleItemSelection(item.id)}
                          className="w-5 h-5 rounded border-[#6c7a78] text-[#006a63] focus:ring-[#006a63] transition-all accent-[#006a63] shrink-0 mt-1"
                        />

                        <div className="w-24 h-24 bg-[#e9efed] dark:bg-emerald-900/30 rounded-lg overflow-hidden shrink-0 border border-[#bbc9c7] dark:border-emerald-900 relative">
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-[#2b3231]/10 flex items-center justify-center">
                              <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-[#006a63] dark:text-teal-200/40" />
                            </div>
                          )}
                        </div>

                        <div className="grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div>
                              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 font-['Manrope',sans-serif]">
                                {item.name}
                              </h3>
                              <p className="text-sm text-[#4f6169] dark:text-slate-300 mt-1">
                                Brand: {item.manufacturer || "PharmaCare"}
                              </p>
                            </div>
                            <span className={`text-xl font-semibold ${hasStockIssue ? "text-[#3c4947] dark:text-slate-300" : "text-[#006a63] dark:text-teal-200"}`}>
                              BDT {currencyFormatter.format(item.price)}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                            <div className="flex items-center bg-[#e9efed] dark:bg-emerald-900/30 rounded-full p-1 border border-[#bbc9c7] dark:border-emerald-900">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                className="w-8 h-8 flex items-center justify-center text-[#006a63] dark:text-teal-200 hover:bg-[#dee4e2] dark:hover:bg-emerald-900/40 rounded-full transition-all disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                                disabled={hasStockIssue}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 text-sm font-semibold text-[#171d1c] dark:text-slate-100">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center text-[#006a63] dark:text-teal-200 hover:bg-[#dee4e2] dark:hover:bg-emerald-900/40 rounded-full transition-all disabled:opacity-50"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={hasStockIssue || (typeof stock === "number" && stock !== null && item.quantity >= stock)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center text-[#ba1a1a] dark:text-[#ffb4ab] hover:opacity-75 transition-opacity text-sm gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>

                          {/* Stock info */}
                          {typeof stock === "number" && stock > 0 && (
                            <p className="text-xs text-[#006a63] dark:text-teal-200 mt-2">Stock: {stock} available</p>
                          )}
                          {isOutOfStock && (
                            <p className="text-xs text-[#ba1a1a] dark:text-[#ffb4ab] font-medium mt-2">Out of stock</p>
                          )}
                          {isOverQuantity && !isOutOfStock && (
                            <p className="text-xs text-[#ba1a1a] dark:text-[#ffb4ab] font-medium mt-2">Exceeds available stock</p>
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
            <aside className="lg:w-96 w-full">
              <div className="p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col group bg-white dark:bg-background/80 hover:bg-[#f8fdfa] dark:hover:bg-emerald-950/30 transition-all hover:shadow-xl hover:shadow-[#006a63]/5 shadow-lg dark:shadow-none sticky top-24">
                <h2 className="text-2xl font-bold text-[#171d1c] dark:text-slate-100 font-['Manrope',sans-serif] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-base text-[#4f6169] dark:text-slate-300">
                    <span>Subtotal ({itemsCount} items)</span>
                    <span>BDT {currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-base text-[#4f6169] dark:text-slate-300">
                    <span>Shipping</span>
                    <span className="text-[#006a63] dark:text-teal-200 font-medium">
                      {selectedItems.length > 0 ? `BDT ${currencyFormatter.format(shipping)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-base text-[#4f6169] dark:text-slate-300">
                    <span>Tax (Estimated)</span>
                    <span>BDT {currencyFormatter.format(0)}</span>
                  </div>

                  <div className="pt-4 border-t border-[#bbc9c7] dark:border-emerald-900 flex justify-between items-center">
                    <span className="text-xl font-semibold text-[#171d1c] dark:text-slate-100">Total</span>
                    <span className="text-3xl md:text-4xl font-bold text-[#006a63] dark:text-teal-200">
                      BDT {currencyFormatter.format(total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedItemIds.length > 0 && !hasCheckoutStockIssue ? (
                    <Button asChild className="w-full bg-[#00a69c] text-white py-4 rounded-full text-base shadow-md hover:bg-[#008a82] transition-all">
                      <Link href={checkoutHref}>Proceed to Checkout</Link>
                    </Button>
                  ) : (
                    <Button className="w-full bg-[#00a69c]/50 text-white py-4 rounded-full text-base cursor-not-allowed dark:bg-[#00a69c]/30" disabled>
                      Proceed to Checkout
                    </Button>
                  )}

                  {selectedItemIds.length === 0 && (
                    <p className="text-sm text-[#ba1a1a] dark:text-[#ffb4ab] text-center">Select at least one product to checkout.</p>
                  )}
                  {selectedItemIds.length > 0 && hasCheckoutStockIssue && (
                    <p className="text-sm text-[#ba1a1a] dark:text-[#ffb4ab] text-center">
                      Some selected items are out of stock or exceed available quantity. Please update cart first.
                    </p>
                  )}

                  <Button asChild variant="outline" className="w-full border-2 border-[#006a63] dark:border-teal-900 text-[#006a63] dark:text-teal-200 hover:bg-[#006a63]/5 dark:hover:bg-emerald-950/30 rounded-full py-4 text-base">
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Trust Signals */}
                <div className="mt-8 space-y-4 pt-8 border-t border-[#bbc9c7] dark:border-emerald-900">
                  <div className="flex items-center gap-3">
                    <Lock className="text-[#006a63] dark:text-teal-200 w-5 h-5" />
                    <span className="text-sm text-[#4f6169] dark:text-slate-300">Secure SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="text-[#006a63] dark:text-teal-200 w-5 h-5" />
                    <span className="text-sm text-[#4f6169] dark:text-slate-300">Expected Delivery: 3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[#006a63] dark:text-teal-200 w-5 h-5" />
                    <span className="text-sm text-[#4f6169] dark:text-slate-300">Licensed Pharmacy Guarantee</span>
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