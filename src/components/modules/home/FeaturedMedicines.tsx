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
    <section className="bg-muted/40 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Featured Medicines</h2>
            <p className="text-muted-foreground mt-2 text-sm sm:mt-3 sm:text-lg lg:text-2xl">
              Popular picks from our verified sellers
            </p>
          </div>

          <Link href="/shop" className="mt-1 inline-flex items-center gap-2 text-sm font-medium sm:mt-3 sm:text-base lg:text-xl">
            View All
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredMedicines.map((medicine, index) => (
            <article key={getMedicineId(medicine)} className="overflow-hidden rounded-2xl border bg-card">
              <div className="bg-muted/70 relative flex h-56 items-center justify-center sm:h-64 lg:h-72 xl:h-80">
                {index % 2 === 0 && (
                  <span className="bg-destructive text-destructive-foreground absolute top-3 left-3 rounded-lg px-3 py-1 text-xs font-semibold sm:text-sm">
                    Sale
                  </span>
                )}

                <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 lg:h-18 lg:w-18">
                  <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9" />
                </div>
              </div>

              <div className="space-y-2 p-4">
                <span className="bg-muted inline-flex rounded-full px-2 py-1 text-xs font-medium sm:text-sm">
                  {medicine.category?.name || "General"}
                </span>

                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{medicine.name}</h3>

                <p className="text-muted-foreground text-sm sm:text-base">by {medicine.manufacturer || "Unknown"}</p>

                <div className="flex items-center gap-1 text-sm text-muted-foreground sm:text-base">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-foreground">4.{(index % 4) + 5}</span>
                  <span>({(index + 2) * 73})</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <p className="text-2xl font-semibold sm:text-3xl">{formatPrice(medicine.price)}</p>
                  {index % 2 === 0 && (
                    <p className="text-muted-foreground text-sm line-through sm:text-base">
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
