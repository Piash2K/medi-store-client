import {
  Category,
  MedicineResponse,
  MedicinesQueryParams,
  MedicinesResponse,
} from "@/types/medicine";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC_DATA_REVALIDATE_SECONDS = 20;
const loggedWarnings = new Set<string>();

type PublicFetchOptions = {
  noStore?: boolean;
  revalidate?: number;
};

const getApiBaseUrl = () => {
  return API_URL?.replace(/\/$/, "") || "";
};

const extractErrorText = (error: unknown): string => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (!(error instanceof Error)) {
    return "";
  }

  const cause = error.cause;
  const causeCode =
    typeof cause === "object" && cause !== null && "code" in cause
      ? String((cause as { code?: unknown }).code || "")
      : "";

  return [error.message, causeCode].join(" ").toUpperCase();
};

const isNetworkConnectionError = (error: unknown): boolean => {
  const errorText = extractErrorText(error);

  return (
    errorText.includes("ECONNREFUSED") ||
    errorText.includes("FETCH FAILED") ||
    errorText.includes("FAILED TO FETCH")
  );
};

const warnOnce = (key: string, message: string) => {
  if (loggedWarnings.has(key)) {
    return;
  }

  loggedWarnings.add(key);
  console.warn(message);
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
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      warnOnce(
        "missing-api-url",
        "Missing NEXT_PUBLIC_API_URL. Skipping medicines request and returning empty data.",
      );

      return {
        success: false,
        message: "API URL is not configured",
        data: [],
      };
    }

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
    if (params.inStock !== undefined) {
      queryParams.set("inStock", String(params.inStock));
    }
    if (params.page !== undefined) {
      queryParams.set("page", String(params.page));
    }
    if (params.limit !== undefined) {
      queryParams.set("limit", String(params.limit));
    }

    const response = await fetch(
      `${apiBaseUrl}/medicines?${queryParams.toString()}`,
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
    if (isNetworkConnectionError(error)) {
      warnOnce(
        "medicines-network-error",
        "Medicines API is unreachable (ECONNREFUSED/fetch failed). Check backend server and NEXT_PUBLIC_API_URL.",
      );

      return {
        success: false,
        message: "Unable to connect to medicines API",
        data: [],
      };
    }

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
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      warnOnce(
        "missing-api-url-categories",
        "Missing NEXT_PUBLIC_API_URL. Skipping categories request and returning empty data.",
      );

      return [];
    }

    const fetchConfig = getPublicFetchConfig(options);

    const response = await fetch(`${apiBaseUrl}/categories`, {
      method: "GET",
      ...fetchConfig,
    });
    const result = await response.json();
    return result?.data ?? [];
  } catch (error) {
    if (isNetworkConnectionError(error)) {
      warnOnce(
        "categories-network-error",
        "Categories API is unreachable (ECONNREFUSED/fetch failed). Check backend server and NEXT_PUBLIC_API_URL.",
      );
      return [];
    }

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
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      warnOnce(
        "missing-api-url-medicine-by-id",
        "Missing NEXT_PUBLIC_API_URL. Skipping medicine details request and returning empty data.",
      );

      return {
        success: false,
        message: "API URL is not configured",
        data: null,
      };
    }

    const fetchConfig = getPublicFetchConfig(options);

    const response = await fetch(`${apiBaseUrl}/medicines/${medicineId}`, {
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
    if (isNetworkConnectionError(error)) {
      warnOnce(
        "medicine-by-id-network-error",
        "Medicine details API is unreachable (ECONNREFUSED/fetch failed). Check backend server and NEXT_PUBLIC_API_URL.",
      );

      return {
        success: false,
        message: "Unable to connect to medicines API",
        data: null,
      };
    }

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
