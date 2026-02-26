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
};

export type UpdateSellerMedicineResponse = {
  success: boolean;
  message?: string;
  data?: Medicine | null;
};

const getToken = async () => {
  const storeCookie = await cookies();
  return storeCookie.get("token")?.value;
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

    const response = await fetch(`${API_URL}/seller/medicines/${medicineId}`, {
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
