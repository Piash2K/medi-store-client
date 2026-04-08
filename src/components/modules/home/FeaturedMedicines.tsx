import Link from "next/link";
import Image from "next/image";
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
    <section className="bg-muted/40 home-section">
      <div className="home-shell">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div>
            <h2 className="home-heading">Featured Medicines</h2>
            <p className="home-lead">
              Popular picks from our verified sellers
            </p>
          </div>

          <Link href="/shop" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium sm:mt-0 sm:text-sm lg:text-base">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredMedicines.map((medicine, index) => (
            <article key={getMedicineId(medicine)} className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
              <div className="bg-muted/70 relative flex h-48 items-center justify-center sm:h-52 lg:h-56">
                {index % 2 === 0 && (
                  <span className="bg-destructive text-destructive-foreground absolute top-2 left-2 z-10 rounded-md px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs">
                    Sale
                  </span>
                )}

                {medicine.image ? (
                  <Image
                    src={medicine.image}
                    alt={medicine.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14">
                    <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col space-y-1.5 p-3.5 sm:p-4">
                <span className="bg-muted inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium">
                  {medicine.category?.name || "General"}
                </span>

                <h3 className="text-base leading-snug font-semibold tracking-tight sm:text-lg">{medicine.name}</h3>

                <p className="text-muted-foreground text-xs sm:text-sm">by {medicine.manufacturer || "Unknown"}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-foreground">4.{(index % 4) + 5}</span>
                  <span>({(index + 2) * 73})</span>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-1">
                  <p className="text-lg font-semibold sm:text-xl">{formatPrice(medicine.price)}</p>
                  {index % 2 === 0 && (
                    <p className="text-muted-foreground text-xs line-through sm:text-sm">
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
