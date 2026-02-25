"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Loader2, Package, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import { getMedicineById } from "@/services/medicine";
import { Medicine } from "@/types/medicine";

const formatPrice = (value: number) => `BDT ${value.toFixed(2)}`;

type MedicineDetailsContentProps = {
  medicineId: string;
};

export default function MedicineDetailsContent({ medicineId }: MedicineDetailsContentProps) {
  const { addItem } = useCart();
  const [medicine, setMedicine] = React.useState<Medicine | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const loadMedicine = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getMedicineById(medicineId);

      if (!result.success || !result.data) {
        setErrorMessage(result.message || "Medicine not found.");
        setMedicine(null);
        setIsLoading(false);
        return;
      }

      setMedicine(result.data);
      setIsLoading(false);
    };

    loadMedicine();
  }, [medicineId]);

  if (isLoading) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (errorMessage || !medicine) {
    return (
      <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
        <Link href="/shop" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
        <p className="text-destructive mt-6 text-sm">{errorMessage || "Medicine not found."}</p>
      </section>
    );
  }

  const medicineIdValue = medicine._id || medicine.id || medicine.slug || medicine.name;
  const isInStock = (medicine.stock || 0) > 0;

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <Link href="/shop" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="bg-muted/60 relative flex min-h-130 items-center justify-center rounded-2xl border">
          <div className="bg-primary/15 text-primary flex h-18 w-18 items-center justify-center rounded-full">
            <Package className="h-9 w-9" />
          </div>
        </div>

        <div>
          <span className="bg-muted inline-flex rounded-full px-2 py-1 text-xs font-medium">
            {medicine.category?.name || "General"}
          </span>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">{medicine.name}</h1>
          <p className="text-muted-foreground mt-1 text-base">by {medicine.manufacturer || "Unknown"}</p>

          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <Star className="h-4 w-4 text-amber-400" />
            <span className="ml-2">4.8 (234 reviews)</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-4xl font-semibold">{formatPrice(medicine.price)}</p>
          </div>

          <p className="text-muted-foreground mt-4 border-b pb-4 text-base leading-relaxed">
            {medicine.description || "No description available for this medicine."}
          </p>

          <p className="mt-4 text-base font-semibold">
            <span className={isInStock ? "text-primary" : "text-destructive"}>●</span>{" "}
            {isInStock
              ? `In Stock (${medicine.stock} available)`
              : "Out of stock"}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center"
                onClick={() => setQuantity((previousValue) => Math.max(previousValue - 1, 1))}
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center"
                onClick={() => setQuantity((previousValue) => previousValue + 1)}
              >
                +
              </button>
            </div>

            <Button
              type="button"
              className="h-10 min-w-55"
              disabled={!isInStock}
              onClick={() => {
                for (let cartCount = 0; cartCount < quantity; cartCount += 1) {
                  addItem({
                    id: String(medicineIdValue),
                    name: medicine.name,
                    price: medicine.price,
                    manufacturer: medicine.manufacturer,
                    category: medicine.category?.name,
                  });
                }
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <Truck className="text-primary h-4 w-4" />
                <p className="text-sm font-semibold">Free Delivery</p>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">Orders over BDT 500</p>
            </div>

            <div className="rounded-xl border p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-4 w-4" />
                <p className="text-sm font-semibold">Verified Seller</p>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {medicine.seller?.name || "Quality assured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {medicine.description || "No additional details available."}
        </p>
      </div>
    </section>
  );
}
