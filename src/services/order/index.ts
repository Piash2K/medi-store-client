"use server";

import { cookies } from "next/headers";
import { OrderResponse, OrdersResponse } from "@/types/order";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

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

export type UpdateSellerOrderStatusPayload = {
  orderId: string;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
};

export type UpdateSellerOrderStatusResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    status?: string;
    updatedAt?: string;
  } | null;
};

export type CancelCustomerOrderResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    status?: string;
    updatedAt?: string;
  } | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = async () => {
  const storeCookie = await cookies();
  return storeCookie.get("token")?.value;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  try {
    const token = await getToken();

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
    if (!isDynamicServerUsageError(error)) {
      console.error("Create order error:", error);
    }
    return {
      success: false,
      message: "Failed to create order",
    };
  }
};

export const getOrders = async (): Promise<OrdersResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/orders`, {
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
      data: result?.data ?? [],
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get orders error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch orders",
      data: [],
    };
  }
};

export const getSellerOrders = async (): Promise<OrdersResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/seller/orders`, {
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
      data: result?.data ?? [],
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get seller orders error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch seller orders",
      data: [],
    };
  }
};

export const updateSellerOrderStatus = async (
  payload: UpdateSellerOrderStatusPayload,
): Promise<UpdateSellerOrderStatusResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const requestBody = JSON.stringify({
      orderId: payload.orderId,
      status: payload.status,
    });

    let response = await fetch(`${API_URL}/seller/orders`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: requestBody,
      cache: "no-store",
    });

    if (!response.ok) {
      response = await fetch(`${API_URL}/seller/orders/${payload.orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: payload.status }),
        cache: "no-store",
      });
    }

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Update seller order status error:", error);
    }
    return {
      success: false,
      message: "Failed to update order status",
      data: null,
    };
  }
};

export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      };
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
      data: result?.data ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get order by id error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch order",
      data: null,
    };
  }
};

export const cancelCustomerOrder = async (
  orderId: string,
): Promise<CancelCustomerOrderResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      };
    }

    let response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "CANCELLED" }),
      cache: "no-store",
    });

    if (!response.ok) {
      response = await fetch(`${API_URL}/orders`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: "CANCELLED" }),
        cache: "no-store",
      });
    }

    const result = await response.json();

    return {
      success: result?.success ?? false,
      message: result?.message,
      data: result?.data ?? null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Cancel customer order error:", error);
    }
    return {
      success: false,
      message: "Failed to cancel order",
      data: null,
    };
  }
};
