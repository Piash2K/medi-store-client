"use client";

import Link from "next/link";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
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
  const [reviewComment, setReviewComment] = React.useState("");
  const [canReview, setCanReview] = React.useState(false);
  const [reviewStatusMessage, setReviewStatusMessage] = React.useState("Checking review eligibility...");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const [reviews, setReviews] = React.useState<MedicineReview[]>([]);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [averageRating, setAverageRating] = React.useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(true);

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
      comment: trimmedComment,
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
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  if (errorMessage || !medicine) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
    <section className="mx-auto w-full max-w-7xl bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8 dark:from-emerald-950/10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
        <div className="relative flex min-h-80 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/25 sm:min-h-96 lg:min-h-130">
          {medicine.image ? (
            <Image
              src={medicine.image}
              alt={medicine.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Package className="h-9 w-9" />
            </div>
          )}
        </div>

        <div>
          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
            {medicine.category?.name || "General"}
          </span>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-3xl lg:text-4xl">{medicine.name}</h1>
          <p className="mt-1 text-base text-emerald-600 dark:text-emerald-400">by {medicine.manufacturer || "Unknown"}</p>

          <div className="mt-3 flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={getStarClassName(index + 1, averageRating)} />
            ))}
            <span className="ml-2">
              {averageRating.toFixed(1)} ({totalReviews} review{totalReviews === 1 ? "" : "s"})
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 sm:text-3xl lg:text-4xl">{formatPrice(medicine.price)}</p>
          </div>

          <p className="mt-4 border-b border-emerald-100 pb-4 text-base leading-relaxed text-emerald-700 dark:border-emerald-800/50 dark:text-emerald-300">
            {medicine.description || "No description available for this medicine."}
          </p>

          <p className="mt-4 text-base font-semibold text-emerald-800 dark:text-emerald-200">
            <span className={isInStock ? "text-emerald-600" : "text-destructive"}>●</span>{" "}
            {isInStock
              ? `In Stock (${medicine.stock} available)`
              : "Out of stock"}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center rounded-md border border-emerald-200 bg-white dark:border-emerald-800/60 dark:bg-emerald-950/25">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                onClick={() => setQuantity((previousValue) => Math.max(previousValue - 1, 1))}
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-semibold text-emerald-800 dark:text-emerald-200">{quantity}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                onClick={() => setQuantity((previousValue) => previousValue + 1)}
              >
                +
              </button>
            </div>

            <Button
              type="button"
              className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:min-w-55 sm:w-auto"
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
              className="h-10 w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30 sm:min-w-35 sm:w-auto"
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Free Delivery</p>
              </div>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Orders over BDT 500</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Verified Seller</p>
              </div>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {medicine.seller?.name || "Quality assured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20 sm:p-6">
        <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Details</h2>
        <p className="mt-3 text-sm leading-relaxed text-emerald-700 dark:text-emerald-300">
          {medicine.description || "No additional details available."}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20 sm:p-6">
        <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Customer Reviews</h2>

        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {averageRating.toFixed(1)}
          </span>
          <span>({totalReviews} review{totalReviews === 1 ? "" : "s"})</span>
        </div>

        {isLoadingReviews ? (
          <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/25">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{review.customer?.name || "Customer"}</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {review.rating || 0}
                    </span>
                    <span>{formatReviewDate(review.createdAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{review.comment || "No comment"}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div id="review-section" className="mt-6 rounded-2xl border-2 border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20 sm:p-6">
        <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Leave a Review</h2>
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{reviewStatusMessage}</p>

        <div className="mt-4 grid gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Rating</label>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-emerald-300 bg-white px-3 text-sm text-emerald-700 shadow-sm ring-offset-background placeholder:text-emerald-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:placeholder:text-emerald-500"
              disabled={!canReview || isSubmittingReview}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Comment</label>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your experience with this medicine..."
              className="min-h-28 w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-700 shadow-xs ring-offset-background placeholder:text-emerald-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:placeholder:text-emerald-500"
              disabled={!canReview || isSubmittingReview}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              onClick={handleSubmitReview}
              disabled={!canReview || isSubmittingReview}
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
