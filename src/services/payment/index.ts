"use server";

import { cookies } from "next/headers";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = async () => {
  const storeCookie = await cookies();
  return storeCookie.get("token")?.value;
};

export type InitializePaymentPayload = {
  shippingAddress: string;
  shippingCost: number;
  paymentMethod: "SSLCOMMERZ";
  items: {
    medicineId: string;
    quantity: number;
  }[];
};

export type InitializePaymentResponse = {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    transactionId: string;
    gatewayPageURL: string;
    sslcommerz?: Record<string, unknown>;
  };
};

export type PaymentStatusResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
    paymentStatus: "COD" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";
    totalAmount: number;
  };
};

export type RefundRequestPayload = {
  reason?: string;
};

export type RefundResponse = {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    refundStatus: string;
    reason?: string;
  };
};

export type AdminPaymentStatistics = {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  refundedAmount: number;
};

export type AdminPaymentTransaction = {
  id: string;
  orderId: string;
  transactionId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: string;
};

export type AdminPaymentListResponse = {
  success: boolean;
  message?: string;
  data?: {
    transactions: AdminPaymentTransaction[];
    total: number;
    page: number;
    limit: number;
  };
};

/**
 * Initialize SSLCommerz payment session
 */
export const initializeSSLCommerzPayment = async (
  payload: InitializePaymentPayload
): Promise<InitializePaymentResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/orders/sslcommerz/init`, {
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
      console.error("Initialize payment error:", error);
    }
    return {
      success: false,
      message: "Failed to initialize payment",
    };
  }
};

/**
 * Get payment status for an order
 */
export const getPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get payment status error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch payment status",
    };
  }
};

/**
 * Request refund for an order
 */
export const requestRefund = async (
  orderId: string,
  payload: RefundRequestPayload
): Promise<RefundResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/refund`, {
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
      console.error("Request refund error:", error);
    }
    return {
      success: false,
      message: "Failed to request refund",
    };
  }
};

/**
 * Get refund status for an order
 */
export const getRefundStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/refund-status`, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get refund status error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch refund status",
    };
  }
};

/**
 * Get admin payment statistics
 */
export const getAdminPaymentStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: AdminPaymentStatistics; message?: string }> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const url = `${API_URL}/admin/payments/statistics${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get admin statistics error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch payment statistics",
    };
  }
};

/**
 * Get admin payment transactions with filters
 */
export const getAdminPaymentTransactions = async (
  filters?: {
    page?: number;
    limit?: number;
    status?: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<AdminPaymentListResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = `${API_URL}/admin/payments/transactions${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get payment transactions error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch payment transactions",
    };
  }
};

/**
 * Get admin failed transactions
 */
export const getAdminFailedTransactions = async (
  page?: number,
  limit?: number
): Promise<AdminPaymentListResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const url = `${API_URL}/admin/payments/failed${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get failed transactions error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch failed transactions",
    };
  }
};

/**
 * Get admin refunded transactions
 */
export const getAdminRefundedTransactions = async (
  page?: number,
  limit?: number
): Promise<AdminPaymentListResponse> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const url = `${API_URL}/admin/payments/refunds${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get refunded transactions error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch refunded transactions",
    };
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (
  orderId: string
): Promise<{ success: boolean; data?: AdminPaymentTransaction; message?: string }> => {
  try {
    const token = await getToken();

    if (!token) {
      return {
        success: false,
        message: "Unauthorized. Please login first.",
      };
    }

    const response = await fetch(`${API_URL}/admin/payments/${orderId}`, {
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
      data: result?.data,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Get transaction details error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch transaction details",
    };
  }
};
