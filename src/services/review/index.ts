"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateReviewPayload = {
  medicineId: string;
  rating: number;
  comment: string;
};

export type CreateReviewResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    medicineId?: string;
    rating?: number;
    comment?: string;
    createdAt?: string;
  } | null;
};

export type MedicineReview = {
  id: string;
  medicineId?: string;
  customerId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: string;
    name?: string;
  };
};

export type GetMedicineReviewsResponse = {
  success: boolean;
  message?: string;
  data: {
    totalReviews: number;
    averageRating: number;
    reviews: MedicineReview[];
  } | null;
};

export const getMedicineReviews = async (
  medicineId: string,
): Promise<GetMedicineReviewsResponse> => {
  try {
    const response = await fetch(`${API_URL}/reviews/${medicineId}`, {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();
    const payload = result?.data;

    return {
      success: result?.success ?? response.ok,
      message: result?.message,
      data: payload
        ? {
            totalReviews: Number(payload.totalReviews) || 0,
            averageRating: Number(payload.averageRating) || 0,
            reviews: Array.isArray(payload.reviews) ? (payload.reviews as MedicineReview[]) : [],
          }
        : {
            totalReviews: 0,
            averageRating: 0,
            reviews: [],
          },
    };
  } catch (error) {
    console.error("Get medicine reviews error:", error);
    return {
      success: false,
      message: "Failed to fetch reviews",
      data: {
        totalReviews: 0,
        averageRating: 0,
        reviews: [],
      },
    };
  }
};

export const createReview = async (
  payload: CreateReviewPayload,
): Promise<CreateReviewResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      };
    }

    let response = await fetch(`${API_URL}/reviews/${payload.medicineId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: payload.rating,
        comment: payload.comment,
      }),
      cache: "no-store",
    });

    if (response.status === 404) {
      response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    }

    let result: unknown = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    const parsedResult = (result || {}) as Record<string, unknown>;

    return {
      success: (parsedResult.success as boolean | undefined) ?? response.ok,
      message:
        (parsedResult.message as string | undefined) ||
        (response.ok ? "Review submitted successfully" : `Failed to submit review (${response.status})`),
      data: (parsedResult.data as CreateReviewResponse["data"]) ?? null,
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      success: false,
      message: "Failed to submit review",
      data: null,
    };
  }
};
