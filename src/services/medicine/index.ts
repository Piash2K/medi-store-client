import {
  Category,
  MedicineResponse,
  MedicinesQueryParams,
  MedicinesResponse,
} from "@/types/medicine";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC_DATA_REVALIDATE_SECONDS = 300;

type PublicFetchOptions = {
  noStore?: boolean;
  revalidate?: number;
};

const getPublicFetchConfig = (options?: PublicFetchOptions): RequestInit => {
  if (options?.noStore) {
    return {
      cache: "no-store",
    };
  }

  return {
    cache: "force-cache",
    next: {
      revalidate: options?.revalidate ?? PUBLIC_DATA_REVALIDATE_SECONDS,
    },
  };
};

export const getMedicines = async (
  params: MedicinesQueryParams,
  options?: PublicFetchOptions,
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
        ...getPublicFetchConfig(options),
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
    if (!isDynamicServerUsageError(error)) {
      console.error("Get medicines error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch medicines",
      data: [],
    };
  }
};

export const getCategories = async (options?: PublicFetchOptions): Promise<Category[]> => {
  try {
    const fetchConfig = getPublicFetchConfig(options);

    const response = await fetch(`${API_URL}/categories`, {
      method: "GET",
      ...fetchConfig,
    });
    const result = await response.json();
    return result?.data ?? [];
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get categories error:", error);
    }
    return [];
  }
};

export const getMedicineById = async (
  medicineId: string,
  options?: PublicFetchOptions,
): Promise<MedicineResponse> => {
  try {
    const fetchConfig = getPublicFetchConfig(options);

    const response = await fetch(`${API_URL}/medicines/${medicineId}`, {
      method: "GET",
      ...fetchConfig,
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get medicine by id error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch medicine",
      data: null,
    };
  }
};
