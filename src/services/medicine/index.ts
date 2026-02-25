import {
  Category,
  MedicineResponse,
  MedicinesQueryParams,
  MedicinesResponse,
} from "@/types/medicine";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getMedicines = async (
  params: MedicinesQueryParams,
): Promise<MedicinesResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.searchTerm) {
      queryParams.set("searchTerm", params.searchTerm);
    }
    if (params.category) {
      queryParams.set("category", params.category);
    }
    if (params.manufacturer) {
      queryParams.set("manufacturer", params.manufacturer);
    }
    if (params.minPrice !== undefined) {
      queryParams.set("minPrice", String(params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      queryParams.set("maxPrice", String(params.maxPrice));
    }
    if (params.page !== undefined) {
      queryParams.set("page", String(params.page));
    }
    if (params.limit !== undefined) {
      queryParams.set("limit", String(params.limit));
    }

    const response = await fetch(
      `${API_URL}/medicines?${queryParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const result = await response.json();
    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? [],
      meta: result?.meta,
    };
  } catch (error) {
    console.error("Get medicines error:", error);
    return {
      success: false,
      message: "Failed to fetch medicines",
      data: [],
    };
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: "GET",
      cache: "no-store",
    });
    const result = await response.json();
    return result?.data ?? [];
  } catch (error) {
    console.error("Get categories error:", error);
    return [];
  }
};

export const getMedicineById = async (medicineId: string): Promise<MedicineResponse> => {
  try {
    const response = await fetch(`${API_URL}/medicines/${medicineId}`, {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    console.error("Get medicine by id error:", error);
    return {
      success: false,
      message: "Failed to fetch medicine",
      data: null,
    };
  }
};
