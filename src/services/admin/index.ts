"use server";

import { cookies } from "next/headers";
import { Medicine } from "@/types/medicine";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type AdminUser = {
  id: string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUsersResponse = {
  success: boolean;
  message?: string;
  data: AdminUser[];
};

export type UpdateAdminUserStatusResponse = {
  success: boolean;
  message?: string;
  data?: AdminUser | null;
};

export type AdminOrder = {
  id: string;
  customerId?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  items?: {
    medicine?: {
      seller?: {
        name?: string;
        email?: string;
      };
    };
  }[];
};

export type AdminOrdersResponse = {
  success: boolean;
  message?: string;
  data: AdminOrder[];
};

export type AdminMedicinesResponse = {
  success: boolean;
  message?: string;
  data: Medicine[];
};

export type UpdateAdminMedicinePayload = {
  name: string;
  price: number;
  stock: number;
  manufacturer?: string;
  description?: string;
  categoryId?: string;
};

export type UpdateAdminMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

export type DeleteAdminMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

const parseUsers = (payload: unknown): AdminUser[] => {
  if (Array.isArray(payload)) {
    return payload as AdminUser[];
  }

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.users)) {
      return data.users as AdminUser[];
    }

    if (Array.isArray(data.result)) {
      return data.result as AdminUser[];
    }
  }

  return [];
};

const parseOrders = (payload: unknown): AdminOrder[] => {
  if (Array.isArray(payload)) {
    return payload as AdminOrder[];
  }

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.orders)) {
      return data.orders as AdminOrder[];
    }

    if (Array.isArray(data.result)) {
      return data.result as AdminOrder[];
    }
  }

  return [];
};

const parseMedicines = (payload: unknown): Medicine[] => {
  if (Array.isArray(payload)) {
    return payload as Medicine[];
  }

  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    if (Array.isArray(data.medicines)) {
      return data.medicines as Medicine[];
    }

    if (Array.isArray(data.result)) {
      return data.result as Medicine[];
    }
  }

  return [];
};

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: parseUsers(result?.data),
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get admin users error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch admin users",
      data: [],
    };
  }
};

export const getAdminOrders = async (): Promise<AdminOrdersResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/admin/orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: parseOrders(result?.data),
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get admin orders error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch admin orders",
      data: [],
    };
  }
};

export const updateAdminUserStatus = async (
  userId: string,
  status: "BAN" | "UNBAN",
): Promise<UpdateAdminUserStatusResponse> => {
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

    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: (result?.data as AdminUser) ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Update admin user status error:", error);
    }
    return {
      success: false,
      message: "Failed to update user status",
      data: null,
    };
  }
};

export const getAdminMedicines = async (): Promise<AdminMedicinesResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/admin/medicines`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: parseMedicines(result?.data),
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get admin medicines error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch admin medicines",
      data: [],
    };
  }
};

export const updateAdminMedicine = async (
  medicineId: string,
  payload: UpdateAdminMedicinePayload,
): Promise<UpdateAdminMedicineResponse> => {
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

    const response = await fetch(`${API_URL}/admin/medicines/${medicineId}`, {
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
      data: (result?.data as Medicine) ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Update admin medicine error:", error);
    }
    return {
      success: false,
      message: "Failed to update medicine",
      data: null,
    };
  }
};

export const deleteAdminMedicine = async (
  medicineId: string,
): Promise<DeleteAdminMedicineResponse> => {
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

    const response = await fetch(`${API_URL}/admin/medicines/${medicineId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: (result?.data as Medicine) ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Delete admin medicine error:", error);
    }
    return {
      success: false,
      message: "Failed to delete medicine",
      data: null,
    };
  }
};
