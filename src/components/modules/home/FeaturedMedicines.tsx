import Link from "next/link";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { getMedicines } from "@/services/medicine";
import { Medicine } from "@/types/medicine";

const formatPrice = (price: number) => `BDT ${price.toFixed(2)}`;

const getMedicineId = (medicine: Medicine) => {
  const medicineWithOptionalId = medicine as Medicine & { id?: string };
  return medicine._id || medicineWithOptionalId.id || medicine.slug || medicine.name;
};

export default async function FeaturedMedicines() {
  const result = await getMedicines({ page: 1, limit: 4 });
  const featuredMedicines = result.success ? result.data.slice(0, 4) : [];

  return (
    <section className="bg-muted/40 py-14">
      <div className="mx-auto  px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-5xl font-bold tracking-tight">Featured Medicines</h2>
            <p className="text-muted-foreground mt-3 text-2xl">Popular picks from our verified sellers</p>
          </div>

          <Link href="/shop" className="mt-3 inline-flex items-center gap-2 text-xl font-medium">
            View All
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredMedicines.map((medicine, index) => (
            <article key={getMedicineId(medicine)} className="overflow-hidden rounded-2xl border bg-card">
              <div className="bg-muted/70 relative flex h-80 items-center justify-center">
                {index % 2 === 0 && (
                  <span className="bg-destructive text-destructive-foreground absolute top-3 left-3 rounded-lg px-3 py-1 text-sm font-semibold">
                    Sale
                  </span>
                )}

                <div className="bg-primary/10 text-primary flex h-18 w-18 items-center justify-center rounded-full">
                  <ShoppingCart className="h-9 w-9" />
                </div>
              </div>

              <div className="space-y-2 p-4">
                <span className="bg-muted inline-flex rounded-full px-2 py-1 text-sm font-medium">
                  {medicine.category?.name || "General"}
                </span>

                <h3 className="text-2xl font-semibold tracking-tight">{medicine.name}</h3>

                <p className="text-muted-foreground text-base">by {medicine.manufacturer || "Unknown"}</p>

                <div className="flex items-center gap-1 text-base text-muted-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-foreground">4.{(index % 4) + 5}</span>
                  <span>({(index + 2) * 73})</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <p className="text-3xl font-semibold">{formatPrice(medicine.price)}</p>
                  {index % 2 === 0 && (
                    <p className="text-muted-foreground text-base line-through">
                      {formatPrice(medicine.price * 1.4)}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}

          {featuredMedicines.length === 0 && (
            <div className="col-span-full rounded-2xl border bg-card p-8 text-center text-muted-foreground">
              No featured medicines available right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
