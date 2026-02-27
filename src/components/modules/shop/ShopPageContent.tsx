"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import { getCategories, getMedicines } from "@/services/medicine";
import { getMedicineReviews } from "@/services/review";
import { Category, Medicine, MedicinesResponse } from "@/types/medicine";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const STATS_LIMIT = 100;

export default function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, items } = useCart();
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [manufacturer, setManufacturer] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");

  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [totalPage, setTotalPage] = React.useState(1);
  const [totalMedicines, setTotalMedicines] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [sortBy, setSortBy] = React.useState("relevance");
  const [categoryCounts, setCategoryCounts] = React.useState<Map<string, number>>(new Map());
  const [manufacturerCounts, setManufacturerCounts] = React.useState<Map<string, number>>(new Map());
  const [manufacturers, setManufacturers] = React.useState<string[]>([]);
  const [reviewStatsByMedicineId, setReviewStatsByMedicineId] = React.useState<
    Map<string, { averageRating: number; totalReviews: number }>
  >(new Map());

  const loadMedicines = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const result = await getMedicines({
      searchTerm: debouncedSearchTerm || undefined,
      category: category || undefined,
      manufacturer: manufacturer || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page,
      limit: DEFAULT_LIMIT,
    });

    if (!result.success) {
      setErrorMessage(result.message || "Failed to load medicines");
      setMedicines([]);
      setReviewStatsByMedicineId(new Map());
      setTotalPage(1);
      setTotalMedicines(0);
      setIsLoading(false);
      return;
    }

    const medicineIds = Array.from(
      new Set(
        result.data
          .map((medicine) => medicine._id || medicine.id)
          .filter((medicineId): medicineId is string => Boolean(medicineId)),
      ),
    );

    const nextReviewStatsMap = new Map<string, { averageRating: number; totalReviews: number }>();

    if (medicineIds.length > 0) {
      const reviewResults = await Promise.all(
        medicineIds.map(async (id) => {
          const reviewResult = await getMedicineReviews(id);

          return {
            id,
            averageRating: reviewResult.success && reviewResult.data ? reviewResult.data.averageRating : 0,
            totalReviews: reviewResult.success && reviewResult.data ? reviewResult.data.totalReviews : 0,
          };
        }),
      );

      reviewResults.forEach((reviewItem) => {
        nextReviewStatsMap.set(reviewItem.id, {
          averageRating: reviewItem.averageRating,
          totalReviews: reviewItem.totalReviews,
        });
      });
    }

    setMedicines(result.data);
    setReviewStatsByMedicineId(nextReviewStatsMap);
    setTotalPage(result.meta?.totalPage || 1);
    setTotalMedicines(result.meta?.total || result.data.length);
    setIsLoading(false);
  }, [debouncedSearchTerm, category, manufacturer, minPrice, maxPrice, page]);

  const loadFilterStats = React.useCallback(async () => {
    const firstPage = await getMedicines({
      page: 1,
      limit: STATS_LIMIT,
    });

    if (!firstPage.success) {
      setCategoryCounts(new Map());
      setManufacturerCounts(new Map());
      setManufacturers([]);
      return;
    }

    const allMedicines: Medicine[] = [...firstPage.data];
    const totalPages = firstPage.meta?.totalPage || 1;

    if (totalPages > 1) {
      const remainingRequests: Promise<MedicinesResponse>[] = [];

      for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
        remainingRequests.push(
          getMedicines({
            page: currentPage,
            limit: STATS_LIMIT,
          }),
        );
      }

      const remainingResults = await Promise.all(remainingRequests);

      remainingResults.forEach((result) => {
        if (result.success) {
          allMedicines.push(...result.data);
        }
      });
    }

    const nextCategoryCounts = new Map<string, number>();
    const nextManufacturerCounts = new Map<string, number>();

    allMedicines.forEach((medicine) => {
      const categoryName = medicine.category?.name;
      const manufacturerName = medicine.manufacturer;

      if (categoryName) {
        nextCategoryCounts.set(categoryName, (nextCategoryCounts.get(categoryName) || 0) + 1);
      }

      if (manufacturerName) {
        nextManufacturerCounts.set(
          manufacturerName,
          (nextManufacturerCounts.get(manufacturerName) || 0) + 1,
        );
      }
    });

    setCategoryCounts(nextCategoryCounts);
    setManufacturerCounts(nextManufacturerCounts);
    setManufacturers(Array.from(nextManufacturerCounts.keys()).sort());
  }, []);

  React.useEffect(() => {
    const loadInitialData = async () => {
      const [categoryData] = await Promise.all([getCategories(), loadFilterStats()]);
      setCategories(categoryData);
    };

    loadInitialData();
  }, [loadFilterStats]);

  React.useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(DEFAULT_PAGE);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  React.useEffect(() => {
    const categoryFromQuery = searchParams.get("category")?.trim() || "";
    if (!categoryFromQuery) {
      return;
    }

    setCategory(categoryFromQuery);
    setPage(DEFAULT_PAGE);
  }, [searchParams]);

  const handleApplyFilters = () => {
    setPage(DEFAULT_PAGE);
    loadMedicines();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setManufacturer("");
    setMinPrice("");
    setMaxPrice("");
    setPage(DEFAULT_PAGE);
  };

  const sortedMedicines = React.useMemo(() => {
    const nextMedicines = [...medicines];

    if (sortBy === "price-low-high") {
      nextMedicines.sort((firstMedicine, secondMedicine) => firstMedicine.price - secondMedicine.price);
      return nextMedicines;
    }

    if (sortBy === "price-high-low") {
      nextMedicines.sort((firstMedicine, secondMedicine) => secondMedicine.price - firstMedicine.price);
      return nextMedicines;
    }

    return medicines;
  }, [medicines, sortBy]);

  const getMedicineCartId = React.useCallback((medicine: Medicine) => {
    const medicineWithOptionalId = medicine as Medicine & { id?: string };

    return (
      medicine._id ||
      medicineWithOptionalId.id ||
      medicine.slug ||
      `${medicine.name}-${medicine.manufacturer || "unknown"}-${medicine.price}`
    );
  }, []);

  const getMedicinePathId = React.useCallback((medicine: Medicine) => {
    return medicine._id || medicine.id || medicine.slug || getMedicineCartId(medicine);
  }, [getMedicineCartId]);

  const getMedicineCheckoutId = React.useCallback((medicine: Medicine) => {
    return medicine._id || medicine.id || "";
  }, []);

  const cartItemIdSet = React.useMemo(() => new Set(items.map((item) => item.id)), [items]);

  return (
    <section className="w-full px-4 py-8 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
      <h1 className="text-4xl font-bold tracking-tight">Shop All Medicines</h1>
      <p className="mt-2 text-base text-muted-foreground">Browse our collection of quality OTC medicines</p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-20 h-fit rounded-2xl border bg-card p-5">
          <h2 className="text-2xl font-semibold">Filters</h2>

          <div className="mt-5 space-y-7">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search medicines..."
                className="pl-9"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold">Categories</h3>
              <div className="mt-3 space-y-2.5">
                {categories.map((item, index) => (
                  <label
                    key={`${item._id}-${item.name}-${index}`}
                    className="flex cursor-pointer items-center justify-between gap-2 text-base"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={category === item.name}
                        onChange={() =>
                          setCategory((prev) => (prev === item.name ? "" : item.name))
                        }
                        className="accent-primary"
                      />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {categoryCounts.get(item.name) || 0}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Price Range</h3>
              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={maxPrice || "1000"}
                  onChange={(event) => {
                    setMinPrice("0");
                    setMaxPrice(event.target.value);
                  }}
                  className="accent-primary w-full"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>BDT {minPrice || "0"}</span>
                  <span>BDT {maxPrice || "1000"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Manufacturer</h3>
              <div className="mt-3 space-y-2.5">
                {manufacturers.length > 0 ? (
                  manufacturers.map((item, index) => (
                    <label
                      key={`${item}-${index}`}
                      className="flex cursor-pointer items-center justify-between gap-2 text-base"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={manufacturer === item}
                          onChange={() =>
                            setManufacturer((prev) => (prev === item ? "" : item))
                          }
                          className="accent-primary"
                        />
                        {item}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {manufacturerCounts.get(item) || 0}
                      </span>
                    </label>
                  ))
                ) : (
                  <Input
                    value={manufacturer}
                    onChange={(event) => setManufacturer(event.target.value)}
                    placeholder="Manufacturer"
                  />
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-base">
              <input type="checkbox" className="accent-primary" />
              <span>In Stock Only</span>
            </label>

            <div className="flex gap-2">
              <Button type="button" onClick={handleApplyFilters} className="flex-1">
                Apply
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-lg text-muted-foreground">Showing {totalMedicines} medicines</p>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low-high">Sort by: Price Low to High</option>
              <option value="price-high-low">Sort by: Price High to Low</option>
            </select>
          </div>

          <div className="min-h-170">
            {isLoading && (
              <div className="mt-10 flex items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            )}

            {!isLoading && errorMessage && <p className="mt-6 text-sm text-destructive">{errorMessage}</p>}

            {!isLoading && !errorMessage && sortedMedicines.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No medicines found.</p>
            )}

            {!isLoading && !errorMessage && sortedMedicines.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedMedicines.map((medicine, index) => {
                  const medicineReviewId = medicine._id || medicine.id || "";
                  const medicineCheckoutId = getMedicineCheckoutId(medicine);
                  const medicineCartId = getMedicineCartId(medicine);
                  const isAlreadyInCart = cartItemIdSet.has(medicineCartId);
                  const reviewStats = reviewStatsByMedicineId.get(medicineReviewId);
                  const averageRating = reviewStats?.averageRating || 0;
                  const totalReviewsForMedicine = reviewStats?.totalReviews || 0;

                  return (
                    <article
                      key={`${medicine._id}-${medicine.name}-${index}`}
                      className="overflow-hidden rounded-2xl border bg-card"
                    >
                      <Link
                        href={`/shop/${getMedicinePathId(medicine)}`}
                        className="block"
                        aria-label={`View details for ${medicine.name}`}
                      >
                        <div className="bg-muted/50 relative flex h-52 items-center justify-center">
                          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                            <ShoppingCart className="h-8 w-8" />
                          </div>
                        </div>
                      </Link>

                      <div className="space-y-1.5 p-4">
                        <Link
                          href={`/shop/${getMedicinePathId(medicine)}`}
                          className="block space-y-1.5"
                          aria-label={`Open ${medicine.name} details`}
                        >
                          <span className="bg-muted inline-flex rounded-full px-2 py-1 text-xs font-medium">
                            {medicine.category?.name || "General"}
                          </span>
                          <h2 className="text-2xl leading-tight font-semibold tracking-tight">
                            {medicine.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            by {medicine.manufacturer || "Unknown manufacturer"}
                          </p>

                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{averageRating.toFixed(1)}</span>
                            <span>({totalReviewsForMedicine})</span>
                          </div>
                        </Link>

                        <div className="flex items-center justify-between pt-2">
                          <p className="text-2xl font-semibold">BDT {medicine.price}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 px-3"
                              disabled={!medicineCheckoutId}
                              onClick={() => {
                                router.push(
                                  `/checkout?buyNow=${encodeURIComponent(medicineCheckoutId)}&qty=1`,
                                );
                              }}
                            >
                              Buy Now
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-4"
                              disabled={isAlreadyInCart}
                              onClick={() =>
                                addItem({
                                  id: medicineCartId,
                                  name: medicine.name,
                                  price: medicine.price,
                                  manufacturer: medicine.manufacturer,
                                  category: medicine.category?.name,
                                })
                              }
                            >
                              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                              {isAlreadyInCart ? "Added" : "Add"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border bg-card p-3">
            <p className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPage}
            </p>

            <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
              disabled={page >= totalPage}
            >
              Next
            </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}