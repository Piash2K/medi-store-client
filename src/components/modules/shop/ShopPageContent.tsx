"use client";

import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  PackageCheck,
  Search,
  Shapes,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/cart-provider";
import AiSearchSuggestions from "@/components/modules/shop/AiSearchSuggestions";
import { getUser } from "@/services/auth";
import { getCategories, getMedicines } from "@/services/medicine";
import { getMedicineReviews } from "@/services/review";
import { Category, Medicine, MedicinesResponse } from "@/types/medicine";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const STATS_LIMIT = 100;
const FILTER_PREVIEW_LIMIT = 3;

const formatPrice = (value: number) => `BDT ${value.toFixed(2)}`;

const MEDICINE_KEYWORD_HINTS = [
  "tablet",
  "capsule",
  "syrup",
  "drop",
  "drops",
  "cream",
  "ointment",
  "gel",
  "spray",
  "inhaler",
  "injection",
  "powder",
  "pain",
  "fever",
  "cold",
  "cough",
  "allergy",
  "acidity",
  "gastric",
  "diabetes",
  "pressure",
  "vitamin",
  "antibiotic",
  "antiseptic",
  "oral care",
  "skin care",
];

const getShortMedicineDescription = (medicine: Medicine) => {
  const rawDescription = medicine.description?.trim();

  if (rawDescription) {
    return rawDescription.length > 96 ? `${rawDescription.slice(0, 96).trimEnd()}...` : rawDescription;
  }

  const fallbackParts = [medicine.category?.name, medicine.manufacturer]
    .filter(Boolean)
    .join(" • ");

  return fallbackParts || "Trusted medicine with quality checks and easy ordering.";
};

const matchesMedicineSearch = (medicine: Medicine, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    medicine.name,
    medicine.category?.name,
    medicine.manufacturer,
    medicine.description,
    getShortMedicineDescription(medicine),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
};

const getMedicineKeywordTokens = (medicine: Medicine) => {
  const rawText = [
    medicine.name,
    medicine.category?.name,
    medicine.manufacturer,
    medicine.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return MEDICINE_KEYWORD_HINTS.filter((keyword) => rawText.includes(keyword));
};

export default function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, items } = useCart();
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [allMedicinesCatalog, setAllMedicinesCatalog] = React.useState<Medicine[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [manufacturer, setManufacturer] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [inStockOnly, setInStockOnly] = React.useState(false);

  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [totalPage, setTotalPage] = React.useState(1);
  const [totalMedicines, setTotalMedicines] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [sortBy, setSortBy] = React.useState("relevance");
  const [categoryCounts, setCategoryCounts] = React.useState<Map<string, number>>(new Map());
  const [manufacturerCounts, setManufacturerCounts] = React.useState<Map<string, number>>(new Map());
  const [manufacturers, setManufacturers] = React.useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = React.useState(false);
  const [showAllManufacturers, setShowAllManufacturers] = React.useState(false);
  const [reviewStatsByMedicineId, setReviewStatsByMedicineId] = React.useState<
    Map<string, { averageRating: number; totalReviews: number }>
  >(new Map());
  const medicineSectionTopRef = React.useRef<HTMLDivElement | null>(null);
  const hasMountedPaginationScrollRef = React.useRef(false);
  // Use a ref so loadMedicines can read the latest catalog without
  // being recreated every time loadFilterStats sets a new array.
  const allMedicinesCatalogRef = React.useRef<Medicine[]>([]);

  const aiSearchCatalog = React.useMemo(() => {
    return Array.from(
      new Set(
        [
          ...categories.map((item) => item.name),
          ...manufacturers,
          ...medicines.map((medicine) => medicine.name),
        ]
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item)),
      ),
    ).slice(0, 18);
  }, [categories, manufacturers, medicines]);

  const aiMedicineKeywords = React.useMemo(() => {
    return Array.from(
      new Set(
        medicines.flatMap((medicine) => getMedicineKeywordTokens(medicine)),
      ),
    ).slice(0, 24);
  }, [medicines]);

  const visibleCategories = React.useMemo(() => {
    return showAllCategories ? categories : categories.slice(0, FILTER_PREVIEW_LIMIT);
  }, [categories, showAllCategories]);

  const visibleManufacturers = React.useMemo(() => {
    return showAllManufacturers ? manufacturers : manufacturers.slice(0, FILTER_PREVIEW_LIMIT);
  }, [manufacturers, showAllManufacturers]);

  const loadMedicines = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const normalizedQuery = debouncedSearchTerm.trim().toLowerCase();

    const currentCatalog = allMedicinesCatalogRef.current;

    if (normalizedQuery && currentCatalog.length > 0) {
      const locallyMatchedMedicines = currentCatalog.filter((medicine) => {
        if (medicine.isDeleted) {
          return false;
        }

        if (category && medicine.category?.name !== category) {
          return false;
        }

        if (manufacturer && medicine.manufacturer !== manufacturer) {
          return false;
        }

        if (minPrice && medicine.price < Number(minPrice)) {
          return false;
        }

        if (maxPrice && medicine.price > Number(maxPrice)) {
          return false;
        }

        if (inStockOnly && (medicine.stock || 0) <= 0) {
          return false;
        }

        return matchesMedicineSearch(medicine, normalizedQuery);
      });

      const nextTotalPage = Math.max(1, Math.ceil(locallyMatchedMedicines.length / DEFAULT_LIMIT));
      const safePage = Math.min(page, nextTotalPage);

      if (safePage !== page) {
        setPage(safePage);
      }

      const start = (safePage - 1) * DEFAULT_LIMIT;
      const paginatedMedicines = locallyMatchedMedicines.slice(start, start + DEFAULT_LIMIT);

      const medicineIds = Array.from(
        new Set(
          paginatedMedicines
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

      setMedicines(paginatedMedicines);
      setReviewStatsByMedicineId(nextReviewStatsMap);
      setTotalPage(nextTotalPage);
      setTotalMedicines(locallyMatchedMedicines.length);
      setIsLoading(false);
      return;
    }

    const result = await getMedicines({
      searchTerm: debouncedSearchTerm || undefined,
      category: category || undefined,
      manufacturer: manufacturer || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStockOnly ? true : false,
      page,
      limit: DEFAULT_LIMIT,
    }, { noStore: true });

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
  }, [debouncedSearchTerm, category, manufacturer, minPrice, maxPrice, inStockOnly, page]);

  const loadFilterStats = React.useCallback(async () => {
    const firstPage = await getMedicines({
      inStock: false,
      page: 1,
      limit: STATS_LIMIT,
    }, { noStore: true });

    if (!firstPage.success) {
      setAllMedicinesCatalog([]);
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
            inStock: false,
            page: currentPage,
            limit: STATS_LIMIT,
          }, { noStore: true }),
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
    const filteredCatalog = allMedicines.filter((medicine) => !medicine.isDeleted);
    allMedicinesCatalogRef.current = filteredCatalog;
    setAllMedicinesCatalog(filteredCatalog);
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
    if (!hasMountedPaginationScrollRef.current) {
      hasMountedPaginationScrollRef.current = true;
      return;
    }

    window.requestAnimationFrame(() => {
      const medicineSectionTop = medicineSectionTopRef.current;

      if (!medicineSectionTop) {
        return;
      }

      const navbarOffset = 64;
      const top = medicineSectionTop.getBoundingClientRect().top + window.scrollY - navbarOffset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    });
  }, [page]);

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
    setInStockOnly(false);
    setPage(DEFAULT_PAGE);
  };

  const sortedMedicines = React.useMemo(() => {
    const filteredMedicines = inStockOnly
      ? medicines.filter((medicine) => (medicine.stock || 0) > 0)
      : medicines;

    const nextMedicines = [...filteredMedicines];

    if (sortBy === "price-low-high") {
      nextMedicines.sort((firstMedicine, secondMedicine) => firstMedicine.price - secondMedicine.price);
      return nextMedicines;
    }

    if (sortBy === "price-high-low") {
      nextMedicines.sort((firstMedicine, secondMedicine) => secondMedicine.price - firstMedicine.price);
      return nextMedicines;
    }

    if (sortBy === "name-a-z") {
      nextMedicines.sort((firstMedicine, secondMedicine) => firstMedicine.name.localeCompare(secondMedicine.name));
      return nextMedicines;
    }

    if (sortBy === "rating-high-low") {
      nextMedicines.sort((firstMedicine, secondMedicine) => {
        const firstRating = reviewStatsByMedicineId.get(firstMedicine._id || firstMedicine.id || "")?.averageRating || 0;
        const secondRating = reviewStatsByMedicineId.get(secondMedicine._id || secondMedicine.id || "")?.averageRating || 0;

        return secondRating - firstRating;
      });
      return nextMedicines;
    }

    if (sortBy === "stock-high-low") {
      nextMedicines.sort((firstMedicine, secondMedicine) => (secondMedicine.stock || 0) - (firstMedicine.stock || 0));
      return nextMedicines;
    }

    return filteredMedicines;
  }, [medicines, sortBy, inStockOnly, reviewStatsByMedicineId]);

  const paginationItems = React.useMemo(() => {
    const items: Array<number | "..."> = [];

    if (totalPage <= 7) {
      for (let pageNumber = 1; pageNumber <= totalPage; pageNumber += 1) {
        items.push(pageNumber);
      }

      return items;
    }

    items.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPage - 1, page + 1);

    if (start > 2) {
      items.push("...");
    }

    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      items.push(pageNumber);
    }

    if (end < totalPage - 1) {
      items.push("...");
    }

    items.push(totalPage);

    return items;
  }, [page, totalPage]);

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

  const guardCustomerPurchaseAccess = React.useCallback(async () => {
    const user = (await getUser()) as { role?: string } | null;
    const role = user?.role?.toUpperCase();

    if (role !== "SELLER" && role !== "ADMIN") {
      return true;
    }

    const messageByRole: Record<"SELLER" | "ADMIN", string> = {
      SELLER: "Seller accounts cannot buy medicines or add items to cart.",
      ADMIN: "Admin accounts cannot buy medicines or add items to cart.",
    };

    await Swal.fire({
      icon: "warning",
      title: "Action not allowed",
      text: messageByRole[role],
      confirmButtonText: "OK",
    });

    return false;
  }, []);

  return (
    <section className="w-full bg-[#f2fbf8] dark:bg-emerald-950/10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-screen-2xl lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-emerald-100 bg-white/80 px-4 py-4 dark:border-emerald-900/60 dark:bg-background/70 sm:px-6 lg:sticky lg:top-12 lg:self-start lg:border-r lg:border-b-0 lg:px-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Filters</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Precision Search</p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-center gap-3 rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700 dark:bg-teal-950/50 dark:text-teal-200">
                <Shapes className="h-5 w-5" />
                <span>Categories</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {visibleCategories.map((item, index) => (
                  <label
                    key={`${item._id}-${item.name}-${index}`}
                    className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={category === item.name}
                        onChange={() => {
                          setCategory((prev) => (prev === item.name ? "" : item.name));
                          setPage(DEFAULT_PAGE);
                        }}
                        className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {categoryCounts.get(item.name) || 0}
                    </span>
                  </label>
                ))}
              </div>
              {categories.length > FILTER_PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="mt-2.5 text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  {showAllCategories ? "See Less" : "See More"}
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Building2 className="h-5 w-5" />
                <span>Manufacturers</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {manufacturers.length > 0 ? (
                  visibleManufacturers.map((item, index) => (
                    <label
                      key={`${item}-${index}`}
                      className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-800 dark:text-slate-200"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={manufacturer === item}
                          onChange={() => {
                            setManufacturer((prev) => (prev === item ? "" : item));
                            setPage(DEFAULT_PAGE);
                          }}
                          className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                        />
                        <span className="truncate">{item}</span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {manufacturerCounts.get(item) || 0}
                      </span>
                    </label>
                  ))
                ) : (
                  <Input
                    value={manufacturer}
                    onChange={(event) => {
                      setManufacturer(event.target.value);
                      setPage(DEFAULT_PAGE);
                    }}
                    placeholder="Manufacturer"
                    className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 dark:border-emerald-900 dark:bg-background/60 dark:text-slate-100"
                  />
                )}
              </div>
              {manufacturers.length > FILTER_PREVIEW_LIMIT && (
                <button
                  type="button"
                  onClick={() => setShowAllManufacturers((prev) => !prev)}
                  className="mt-2.5 text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  {showAllManufacturers ? "See Less" : "See More"}
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="h-5 w-5" />
                <span>Price Range</span>
              </div>
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={maxPrice || "1000"}
                  onChange={(event) => {
                    setMinPrice("0");
                    setMaxPrice(event.target.value);
                    setPage(DEFAULT_PAGE);
                  }}
                  className="w-full accent-teal-700"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>BDT {minPrice || "0"}</span>
                  <span>BDT {maxPrice || "1000"}+</span>
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => {
                  setInStockOnly(event.target.checked);
                  setPage(DEFAULT_PAGE);
                }}
                className="h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span>In Stock Only</span>
            </label>

            <div className="grid gap-2">
              <Button type="button" onClick={handleApplyFilters} className="h-10 rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-700">
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters} className="h-10 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-emerald-900 dark:text-slate-200 dark:hover:bg-emerald-950/30">
                Clear Filters
              </Button>
            </div>
          </div>
        </aside>

        <div ref={medicineSectionTopRef} className="flex min-w-0 flex-col px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-8 grid gap-5 xl:grid-cols-[1fr_minmax(520px,0.9fr)] xl:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
                Shop All Medicine
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
                Browse our extensive pharmaceutical inventory. High-precision care delivered directly to your doorstep.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {totalMedicines > 0 ? `${totalMedicines} medicines available` : "No medicines found"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search medication, symptoms, or brand..."
                  className="h-12 rounded-xl border-slate-300 bg-white/80 pl-12 text-slate-800 shadow-none placeholder:text-slate-500 focus-visible:ring-teal-600 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-100"
                />

                <AiSearchSuggestions
                  query={searchTerm}
                  categories={categories.map((item) => item.name)}
                  manufacturers={manufacturers}
                  medicines={aiSearchCatalog}
                  medicineKeywords={aiMedicineKeywords}
                  onSelectSuggestion={(suggestion) => {
                    setSearchTerm(suggestion);
                    setPage(DEFAULT_PAGE);
                  }}
                />
              </div>

              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white/80 px-11 text-sm font-medium text-slate-700 shadow-none outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-100"
                  aria-label="Sort medicines"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="rating-high-low">Rating: High to Low</option>
                  <option value="stock-high-low">Stock: High to Low</option>
                </select>
                <ChevronRight className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 rotate-90 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="min-h-176">
            {isLoading && (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`shop-skeleton-${index}`}
                    className="flex h-full min-h-112 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm dark:border-emerald-900/70 dark:bg-background/80"
                  >
                    {/* Image Skeleton */}
                    <div className="h-44 w-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />

                    {/* Content Skeleton */}
                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="h-6 w-3/5 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                        <div className="h-6 w-1/4 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                      </div>

                      <div className="h-4 w-2/5 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />

                      <div className="space-y-1.5 pt-1">
                        <div className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                        <div className="h-3.5 w-4/5 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <div className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                        <div className="h-6 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                      </div>

                      <div className="mt-auto flex items-center gap-2 pt-4">
                        <div className="h-10 flex-1 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                        <div className="h-10 flex-1 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && errorMessage && <p className="mt-6 text-sm text-destructive">{errorMessage}</p>}

            {!isLoading && !errorMessage && sortedMedicines.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No medicines found.</p>
            )}

            {!isLoading && !errorMessage && sortedMedicines.length > 0 && (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                {sortedMedicines.map((medicine, index) => {
                  const medicineReviewId = medicine._id || medicine.id || "";
                  const medicineCheckoutId = getMedicineCheckoutId(medicine);
                  const medicineCartId = getMedicineCartId(medicine);
                  const isAlreadyInCart = cartItemIdSet.has(medicineCartId);
                  const isInStock = (medicine.stock || 0) > 0;
                  const reviewStats = reviewStatsByMedicineId.get(medicineReviewId);
                  const averageRating = reviewStats?.averageRating || 0;
                  const totalReviewsForMedicine = reviewStats?.totalReviews || 0;
                  const stockLabel = isInStock ? `In stock (${medicine.stock})` : "Stock out";
                  let stockBadgeLabel = "Available";
                  let stockBadgeClassName = "bg-teal-600";

                  if (!isInStock) {
                    stockBadgeLabel = "Out of Stock";
                    stockBadgeClassName = "bg-orange-700";
                  } else if ((medicine.stock || 0) <= 5) {
                    stockBadgeLabel = "Low Stock";
                    stockBadgeClassName = "bg-amber-700";
                  }

                  return (
                    <article
                      key={`${medicine._id}-${medicine.name}-${index}`}
                      className="group flex h-full min-h-112 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl dark:border-emerald-900/70 dark:bg-background/80 dark:hover:border-teal-800"
                    >
                      <div className="relative h-44 overflow-hidden bg-teal-50 dark:bg-emerald-950/40">
                        <Link
                          href={`/shop/${getMedicinePathId(medicine)}`}
                          className="block h-full"
                          aria-label={`View details for ${medicine.name}`}
                        >
                          <div className="relative flex h-full items-center justify-center overflow-hidden">
                            {medicine.image ? (
                              <Image
                                src={medicine.image}
                                alt={medicine.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-teal-700 shadow-sm dark:bg-emerald-950/70 dark:text-teal-200">
                                <ShoppingCart className="h-9 w-9" />
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-900 shadow-sm backdrop-blur dark:bg-background/90 dark:text-slate-100">
                          <Star className="h-3.5 w-3.5 fill-teal-600 text-teal-600" />
                          <span>{averageRating.toFixed(1)}</span>
                          <span className="text-slate-500">({totalReviewsForMedicine})</span>
                        </div>

                        <span
                          className={`absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${stockBadgeClassName
                            }`}
                        >
                          {stockBadgeLabel}
                        </span>

                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute right-4 bottom-4 z-20 h-10 w-10 rounded-full border border-white/70 bg-white/95 text-teal-700 shadow-lg backdrop-blur transition hover:bg-white hover:text-teal-800 disabled:opacity-60 dark:border-emerald-900/40 dark:bg-background/90 dark:text-teal-300"
                          aria-label={`Add ${medicine.name} to cart`}
                          disabled={!isInStock || isAlreadyInCart}
                          onClick={async () => {
                            const hasAccess = await guardCustomerPurchaseAccess();

                            if (!hasAccess || isAlreadyInCart || !isInStock) {
                              return;
                            }

                            addItem({
                              id: medicineCartId,
                              name: medicine.name,
                              price: medicine.price,
                              manufacturer: medicine.manufacturer,
                              category: medicine.category?.name,
                              image: medicine.image,
                            });

                            toast.success(`${medicine.name} added to cart`);
                          }}
                        >
                          <Heart className={`h-4.5 w-4.5 ${isAlreadyInCart ? "fill-current" : ""}`} />
                        </Button>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <Link
                          href={`/shop/${getMedicinePathId(medicine)}`}
                          className="block"
                          aria-label={`Open ${medicine.name} details`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="line-clamp-2 min-h-14 text-xl leading-7 font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                              {medicine.name}
                            </h2>
                            <p className="shrink-0 text-lg font-bold text-teal-800 dark:text-teal-300">
                              {formatPrice(medicine.price)}
                            </p>
                          </div>
                          <p className="mt-2 line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                            {medicine.manufacturer || "Unknown manufacturer"}
                          </p>
                          <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {getShortMedicineDescription(medicine)}
                          </p>
                        </Link>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-200">
                            {medicine.category?.name || "General"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <PackageCheck className="h-3.5 w-3.5" />
                            {stockLabel}
                          </span>
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="flex w-full items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-10 w-full flex-1 rounded-lg border-slate-300 px-3 text-slate-800 hover:bg-slate-50 dark:border-emerald-900 dark:text-slate-100 dark:hover:bg-emerald-950/30"
                              disabled={!medicineCheckoutId || !isInStock}
                              onClick={async () => {
                                const hasAccess = await guardCustomerPurchaseAccess();

                                if (!hasAccess) {
                                  return;
                                }

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
                              className="h-10 w-full flex-1 rounded-lg bg-teal-600 px-4 text-white shadow-sm hover:bg-teal-700"
                              asChild
                            >
                              <Link href={`/shop/${getMedicinePathId(medicine)}`}>
                                View Detail
                              </Link>
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

          <div className="mt-auto pt-10">
            <div className="flex items-center justify-center gap-3 py-4">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-200 dark:hover:bg-emerald-950/30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {paginationItems.map((item, index) => {
                if (item === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="inline-flex h-10 min-w-10 items-center justify-center px-1 text-sm text-slate-500 dark:text-slate-400"
                    >
                      ...
                    </span>
                  );
                }

                const isActive = page === item;

                return (
                  <button
                    key={`page-${item}`}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${isActive
                      ? "bg-teal-700 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-teal-700 dark:text-slate-300 dark:hover:bg-background/70 dark:hover:text-teal-300"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
                disabled={page >= totalPage}
                className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-200 dark:hover:bg-emerald-950/30"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
