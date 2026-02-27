"use server";

import { cookies } from "next/headers";

import { Category } from "@/types/medicine";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UpdateCategoryPayload = {
  name: string;
  description?: string;
};

export type UpdateCategoryResponse = {
  success: boolean;
  message?: string;
  data?: Category | null;
};

export const updateCategory = async (
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<UpdateCategoryResponse> => {
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

    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: (result?.data as Category) ?? null,
    };
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      message: "Failed to update category",
      data: null,
    };
  }
};
