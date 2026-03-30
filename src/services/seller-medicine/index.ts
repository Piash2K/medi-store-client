"use server";

import { cookies } from "next/headers";

import { Medicine } from "@/types/medicine";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UpdateSellerMedicinePayload = {
  name: string;
  price: number;
  stock: number;
  manufacturer?: string;
  description?: string;
  categoryId?: string;
  image?: File;
};

export type CreateSellerMedicinePayload = {
  name: string;
  price: number;
  stock: number;
  manufacturer?: string;
  description?: string;
  categoryId?: string;
  image?: File;
};

export type CreateSellerMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

export type UpdateSellerMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

export type DeleteSellerMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

const getToken = async () => {
  const storeCookie = await cookies();
  return storeCookie.get("token")?.value;
};

const buildMedicineFormData = (
  payload: CreateSellerMedicinePayload | UpdateSellerMedicinePayload,
) => {
  const { image, ...data } = payload;
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  if (data.manufacturer) formData.append("manufacturer", data.manufacturer);
  if (data.description) formData.append("description", data.description);
  if (data.categoryId) formData.append("categoryId", data.categoryId);

  if (image) formData.append("image", image);

  return formData;
};

export const createSellerMedicine = async (
  payload: CreateSellerMedicinePayload,
): Promise<CreateSellerMedicineResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const formData = buildMedicineFormData(payload);

    const response = await fetch(`${API_URL}/seller/medicines`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    console.error("Create seller medicine error:", error);
    return {
      success: false,
      message: "Failed to create medicine",
      data: null,
    };
  }
};

export const updateSellerMedicine = async (
  medicineId: string,
  payload: UpdateSellerMedicinePayload,
): Promise<UpdateSellerMedicineResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const formData = buildMedicineFormData(payload);

    const response = await fetch(`${API_URL}/seller/medicines/${medicineId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    console.error("Update seller medicine error:", error);
    return {
      success: false,
      message: "Failed to update medicine",
      data: null,
    };
  }
};

export const deleteSellerMedicine = async (
  medicineId: string,
): Promise<DeleteSellerMedicineResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/seller/medicines/${medicineId}`, {
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
      data: result?.data ?? null,
    };
  } catch (error) {
    console.error("Delete seller medicine error:", error);
    return {
      success: false,
      message: "Failed to delete medicine",
      data: null,
    };
  }
};
