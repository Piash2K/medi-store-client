"use server";

import { cookies } from "next/headers";

export type CreateOrderPayload = {
  customerId?: string;
  paymentMethod: "COD";
  shippingAddress: string;
  totalAmount: number;
  items: {
    medicineId: string;
    quantity: number;
    price: number;
  }[];
};

export type CreateOrderResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data,
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      success: false,
      message: "Failed to create order",
    };
  }
};
