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

export type DeleteCategoryResponse = {
  success: boolean;
  message?: string;
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

export const deleteCategory = async (categoryId: string): Promise<DeleteCategoryResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    let payload: Record<string, unknown> = {};

    try {
      payload = (await response.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }

    return {
      success: (payload.success as boolean | undefined) ?? response.ok,
      message:
        (payload.message as string | undefined) ||
        (response.ok ? "Category deleted successfully" : "Failed to delete category"),
    };
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete category",
    };
  }
};
