"use client";

import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, Minus, Package, Plus, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import { getUser } from "@/services/auth";
import { getMedicineById } from "@/services/medicine";
import { getOrders } from "@/services/order";
import { createReview, getMedicineReviews, MedicineReview } from "@/services/review";
import { Medicine } from "@/types/medicine";

const formatPrice = (value: number) => `BDT ${value.toFixed(2)}`;

const formatReviewDate = (value?: string) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStarClassName = (starIndex: number, averageRating: number) => {
  if (averageRating >= starIndex) {
    return "h-4 w-4 fill-amber-400 text-amber-400";
  }

  return "h-4 w-4 text-amber-400";
};

type MedicineDetailsContentProps = {
  medicineId: string;
};

export default function MedicineDetailsContent({ medicineId }: MedicineDetailsContentProps) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [medicine, setMedicine] = React.useState<Medicine | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [reviewHeadline, setReviewHeadline] = React.useState("");
  const [reviewComment, setReviewComment] = React.useState("");
  const [canReview, setCanReview] = React.useState(false);
  const [reviewStatusMessage, setReviewStatusMessage] = React.useState("Checking review eligibility...");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [reviews, setReviews] = React.useState<MedicineReview[]>([]);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"reviews" | "description" | "usage">("reviews");

  const ratingBreakdown = React.useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((review) => Number(review.rating || 0) === star).length,
    }));

    return counts.map((item) => ({
      ...item,
      percent: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
    }));
  }, [reviews, totalReviews]);

  const loadReviews = React.useCallback(async (medicineReviewId: string) => {
    setIsLoadingReviews(true);

    const reviewsResult = await getMedicineReviews(medicineReviewId);

    setIsLoadingReviews(false);

    if (!reviewsResult.success || !reviewsResult.data) {
      setReviews([]);
      setTotalReviews(0);
      setAverageRating(0);
      return;
    }

    setReviews(reviewsResult.data.reviews || []);
    setTotalReviews(reviewsResult.data.totalReviews || 0);
    setAverageRating(reviewsResult.data.averageRating || 0);
  }, []);

  React.useEffect(() => {
    const loadMedicine = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setIsLoadingReviews(true);

      const result = await getMedicineById(medicineId, { noStore: true });

      if (!result.success || !result.data) {
        setErrorMessage(result.message || "Medicine not found.");
        setMedicine(null);
        setReviews([]);
        setTotalReviews(0);
        setAverageRating(0);
        setIsLoadingReviews(false);
        setIsLoading(false);
        return;
      }

      setMedicine(result.data);

      const medicineReviewId = result.data._id || result.data.id;

      if (medicineReviewId) {
        await loadReviews(medicineReviewId);
      } else {
        setReviews([]);
        setTotalReviews(0);
        setAverageRating(0);
        setIsLoadingReviews(false);
      }

      setIsLoading(false);
    };

    loadMedicine();
  }, [medicineId, loadReviews]);

  React.useEffect(() => {
    const loadReviewEligibility = async () => {
      if (!medicine) {
        return;
      }

      setCanReview(false);
      setReviewStatusMessage("Checking review eligibility...");

      const ordersResult = await getOrders();

      if (!ordersResult.success) {
        setReviewStatusMessage("Please login and purchase this medicine to leave a review.");
        return;
      }

      const medicineIds = new Set<string>([
        medicine._id,
        medicine.id || "",
        medicineId,
      ].filter(Boolean));

      const purchasedMedicine = ordersResult.data.some((order) =>
        order.items.some((item) => {
          const itemMedicineId = item.medicineId || item.medicine?.id || "";
          return medicineIds.has(itemMedicineId);
        }),
      );

      if (!purchasedMedicine) {
        setReviewStatusMessage("You can leave a review after purchasing this medicine.");
        return;
      }

      setCanReview(true);
      setReviewStatusMessage("You can leave a review for this medicine.");
    };

    loadReviewEligibility();
  }, [medicine, medicineId]);

  const handleSubmitReview = async () => {
    if (!medicine) {
      return;
    }

    if (!canReview) {
      await Swal.fire({
        icon: "error",
        title: "Review not allowed",
        text: "You are not eligible to review this medicine yet.",
      });
      return;
    }

    const trimmedComment = reviewComment.trim();
    const trimmedHeadline = reviewHeadline.trim();

    if (!trimmedComment) {
      await Swal.fire({
        icon: "warning",
        title: "Comment required",
        text: "Please write your review comment.",
      });
      return;
    }

    const medicineReviewId = medicine._id || medicine.id;

    if (!medicineReviewId) {
      await Swal.fire({
        icon: "error",
        title: "Invalid medicine",
        text: "Medicine id is missing.",
      });
      return;
    }

    setIsSubmittingReview(true);

    const result = await createReview({
      medicineId: medicineReviewId,
      rating,
      comment: trimmedHeadline ? `${trimmedHeadline}\n\n${trimmedComment}` : trimmedComment,
    });

    setIsSubmittingReview(false);

    if (!result.success) {
      await Swal.fire({
        icon: "error",
        title: "Review failed",
        text: result.message || "Failed to submit review.",
      });
      return;
    }

    setReviewHeadline("");
    setReviewComment("");
    await loadReviews(medicineReviewId);
    await Swal.fire({
      icon: "success",
      title: "Review submitted",
      text: result.message || "Review submitted successfully.",
    });
  };

  if (isLoading) {
    return (
      <section className="w-full bg-[#f2fbf8] dark:bg-emerald-950/10">
        <div className="home-shell">
          {/* Back link */}
          <div className="mb-6 h-5 w-28 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60" />

          {/* Top grid: image + details */}
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
            {/* Image panel */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-teal-50 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
              <div className="aspect-16/10 w-full animate-pulse bg-slate-200/80 dark:bg-slate-700/60" />
            </div>

            {/* Details panel */}
            <div className="py-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-6 w-20 animate-pulse rounded-full bg-teal-100 dark:bg-teal-950/60" />
                <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
              </div>

              {/* Title */}
              <div className="mt-5 space-y-2">
                <div className="h-9 w-5/6 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-7 w-3/5 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/40" />
              </div>

              {/* Description */}
              <div className="mt-3 space-y-2">
                <div className="h-5 w-full animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                <div className="h-5 w-full animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                <div className="h-5 w-4/5 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
              </div>

              {/* Stars + rating text */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-4 w-4 animate-pulse rounded-sm bg-amber-200/80 dark:bg-amber-800/40" />
                  ))}
                </div>
                <div className="h-4 w-32 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
              </div>

              {/* Price + stock */}
              <div className="mt-7 space-y-2">
                <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-300 dark:bg-teal-700" />
                  <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                </div>
              </div>

              {/* Quantity + buttons */}
              <div className="mt-7 border-t border-slate-200 pt-6 dark:border-emerald-900/70">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="h-4 w-16 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                  <div className="h-11 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="h-14 animate-pulse rounded-full bg-teal-700/60 dark:bg-teal-800/60" />
                  <div className="h-14 animate-pulse rounded-full bg-sky-100 dark:bg-slate-800" />
                </div>
              </div>

              {/* Trust badges: 2-col grid */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[1, 2].map((b) => (
                  <div key={b} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                    <div className="h-11 w-11 animate-pulse rounded-full bg-sky-100 dark:bg-slate-800" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60" />
                      <div className="h-3 w-28 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom tabs section */}
          <section className="mt-14">
            <div className="flex flex-wrap gap-8 border-b border-slate-200 pb-4 dark:border-emerald-900/70">
              {[1, 2, 3].map((t) => (
                <div key={t} className="h-6 w-36 animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60" />
              ))}
            </div>
            {/* Reviews grid skeleton */}
            <div className="mt-12 grid items-start gap-10 lg:grid-cols-[380px_1fr]">
              <div className="space-y-8">
                <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm dark:border-emerald-900/70 dark:bg-background/80" />
                <div className="h-36 animate-pulse rounded-xl border border-sky-200 bg-sky-50 dark:border-slate-800 dark:bg-slate-900/50" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-emerald-900/70 dark:bg-background/80 space-y-6">
                <div className="space-y-2">
                  <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/60" />
                  <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="h-12 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/40" />
                  <div className="h-12 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/40" />
                </div>
                <div className="h-36 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/40" />
                <div className="h-12 w-40 animate-pulse rounded-full bg-teal-700/60 dark:bg-teal-800/60" />
              </div>
            </div>
          </section>
        </div>
      </section>
    );
  }

  if (errorMessage || !medicine) {
    return (
      <section className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link href="/shop" className="text-muted-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
        <p className="text-destructive mt-6 text-sm">{errorMessage || "Medicine not found."}</p>
      </section>
    );
  }

  const medicineIdValue = medicine._id || medicine.id || medicine.slug || medicine.name;
  const medicineCheckoutId = medicine._id || medicine.id || "";
  const isAlreadyInCart = items.some((item) => item.id === String(medicineIdValue));
  const isInStock = (medicine.stock || 0) > 0;
  const description = medicine.description || "Trusted medicine with quality checks and easy ordering.";

  const addCurrentMedicineToCart = () => {
    for (let cartCount = 0; cartCount < quantity; cartCount += 1) {
      addItem({
        id: String(medicineIdValue),
        name: medicine.name,
        price: medicine.price,
        manufacturer: medicine.manufacturer,
        category: medicine.category?.name,
        image: medicine.image,
      });
    }
  };

  const guardCustomerPurchaseAccess = async () => {
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
  };

  return (
    <section className="w-full bg-[#f2fbf8] dark:bg-emerald-950/10">
      <div className="home-shell">
        <Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-teal-50 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              {medicine.image ? (
                <Image
                  src={medicine.image}
                  alt={medicine.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-teal-700 shadow-sm dark:bg-emerald-950/70 dark:text-teal-200">
                    <Package className="h-11 w-11" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="py-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 dark:bg-teal-950/60 dark:text-teal-200">
                {medicine.category?.name || "General"}
              </span>
              <span className="inline-flex rounded-full bg-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {medicine.manufacturer || "Unknown manufacturer"}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-4xl">
              {medicine.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              {description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={getStarClassName(index + 1, averageRating)} />
                ))}
              </div>
              <span className="font-medium">
                {averageRating.toFixed(1)}/5 ({totalReviews} review{totalReviews === 1 ? "" : "s"})
              </span>
            </div>

            <div className="mt-7">
              <p className="text-3xl font-bold text-slate-950 dark:text-slate-100">{formatPrice(medicine.price)}</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300">
                <span className={`h-2 w-2 rounded-full ${isInStock ? "bg-teal-600" : "bg-orange-700"}`} />
                {isInStock ? `In Stock - ${medicine.stock} available` : "Out of stock"}
              </p>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-6 dark:border-emerald-900/70">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-slate-950 dark:text-slate-100">Quantity</span>
                <div className="inline-flex w-fit items-center overflow-hidden rounded-full border border-slate-300 bg-white dark:border-emerald-900 dark:bg-background/70">
                  <button
                    type="button"
                    className="inline-flex h-11 w-14 items-center justify-center text-teal-800 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-emerald-950/40"
                    onClick={() => setQuantity((previousValue) => Math.max(previousValue - 1, 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-base font-medium text-slate-950 dark:text-slate-100">{quantity}</span>
                  <button
                    type="button"
                    className="inline-flex h-11 w-14 items-center justify-center text-teal-800 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-emerald-950/40"
                    onClick={() => setQuantity((previousValue) => previousValue + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Button
                  type="button"
                  className="h-14 rounded-full bg-teal-700 text-base font-semibold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-800"
                  disabled={!isInStock || isAlreadyInCart}
                  onClick={async () => {
                    const hasAccess = await guardCustomerPurchaseAccess();

                    if (!hasAccess) {
                      return;
                    }

                    addCurrentMedicineToCart();
                    toast.success(
                      quantity > 1 ? `${quantity} items added to cart` : `${medicine.name} added to cart`,
                    );
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAlreadyInCart ? "Added to Cart" : "Add to Cart"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-14 rounded-full border-0 bg-sky-100 text-base font-semibold text-slate-700 hover:bg-sky-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  disabled={!isInStock || !medicineCheckoutId}
                  onClick={async () => {
                    const hasAccess = await guardCustomerPurchaseAccess();

                    if (!hasAccess) {
                      return;
                    }

                    router.push(
                      `/checkout?buyNow=${encodeURIComponent(medicineCheckoutId)}&qty=${Math.max(quantity, 1)}`,
                    );
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-teal-700 dark:bg-slate-800 dark:text-teal-300">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Free Delivery</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Orders over BDT 500</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-teal-700 dark:bg-slate-800 dark:text-teal-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Verified Seller</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{medicine.seller?.name || "100% Authentic"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex flex-wrap gap-8 border-b border-slate-200 dark:border-emerald-900/70">
            {[
              { id: "reviews", label: "Customer Reviews" },
              { id: "description", label: "Medicine Description" },
              { id: "usage", label: "Usage Guide" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "reviews" | "description" | "usage")}
                className={`border-b-2 pb-4 text-lg font-medium transition ${activeTab === tab.id
                    ? "border-teal-700 text-teal-800 dark:border-teal-300 dark:text-teal-200"
                    : "border-transparent text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "reviews" && (
            <div className="mt-12 grid items-start gap-10 lg:grid-cols-[380px_1fr]">
              <div className="space-y-8">
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                  <p className="text-5xl font-bold text-slate-950 dark:text-slate-100">{averageRating.toFixed(1)}</p>
                  <div className="mt-3 flex justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={getStarClassName(index + 1, averageRating)} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Based on {totalReviews} review{totalReviews === 1 ? "" : "s"}
                  </p>

                  <div className="mt-8 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    {ratingBreakdown.map((item) => (
                      <div key={`rating-${item.star}`} className="grid grid-cols-[20px_1fr_28px] items-center gap-3">
                        <span>{item.star}</span>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-2 rounded-full bg-teal-600" style={{ width: `${item.percent}%` }} />
                        </div>
                        <span className="text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
                  <MessageSquare className="mx-auto h-9 w-9 text-slate-600 dark:text-slate-300" />
                  <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-100">
                    {reviews.length === 0 ? "No reviews yet" : "Customer feedback"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {reviews.length === 0
                      ? "Be the first to review this product and help others make a better decision."
                      : `${reviews.length} customer review${reviews.length === 1 ? "" : "s"} available below.`}
                  </p>
                </div>

                {!isLoadingReviews && reviews.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                    <div className="divide-y divide-slate-100 dark:divide-emerald-900/70">
                      {reviews.map((review) => (
                        <article key={review.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{review.customer?.name || "Customer"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{review.rating || 0}/5 . {formatReviewDate(review.createdAt)}</p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{review.comment || "No comment"}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div id="review-section" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Leave a Review</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{reviewStatusMessage}</p>

                <div className="mt-7 grid gap-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-950 dark:text-slate-100">Your Rating</label>
                      <select
                        value={rating}
                        onChange={(event) => setRating(Number(event.target.value))}
                        className="h-12 w-full rounded-lg border border-slate-300 bg-[#f6fffc] px-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-100"
                        disabled={!canReview || isSubmittingReview}
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-950 dark:text-slate-100">Headline (Optional)</label>
                      <input
                        type="text"
                        value={reviewHeadline}
                        onChange={(event) => setReviewHeadline(event.target.value)}
                        placeholder="Summary of your experience"
                        className="h-12 w-full rounded-lg border border-slate-300 bg-[#f6fffc] px-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-100"
                        disabled={!canReview || isSubmittingReview}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-950 dark:text-slate-100">Your Feedback</label>
                    <textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      placeholder="Share your thoughts about the medicine's effectiveness, packaging, etc."
                      className="min-h-36 w-full rounded-lg border border-slate-300 bg-[#f6fffc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:opacity-60 dark:border-emerald-900 dark:bg-background/70 dark:text-slate-100"
                      disabled={!canReview || isSubmittingReview}
                    />
                  </div>

                  <Button
                    type="button"
                    className="h-12 w-full rounded-full bg-teal-700 px-8 font-semibold text-white hover:bg-teal-800 sm:w-fit"
                    onClick={handleSubmitReview}
                    disabled={!canReview || isSubmittingReview}
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Medicine Description</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300">
                {medicine.description || "No description available for this medicine."}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                  <p className="mt-1 font-medium text-slate-950 dark:text-slate-100">{medicine.category?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manufacturer</p>
                  <p className="mt-1 font-medium text-slate-950 dark:text-slate-100">{medicine.manufacturer || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Stock</p>
                  <p className="mt-1 font-medium text-slate-950 dark:text-slate-100">{isInStock ? `${medicine.stock} available` : "Out of stock"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-emerald-900/70 dark:bg-background/80">
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Usage Guide</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300">
                Follow the directions provided by your physician or pharmacist. Check the package label before use, and avoid exceeding the recommended dose.
              </p>
              <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700 dark:text-slate-300">
                For personalized guidance, consult a qualified healthcare professional before starting or changing medication.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
