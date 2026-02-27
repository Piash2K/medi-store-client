"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

type CancelOrderButtonProps = {
  orderId: string;
  className?: string;
};

export default function CancelOrderButton({ orderId, className }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);

  const getTokenFromCookie = () => {
    if (typeof document === "undefined") {
      return "";
    }

    const tokenCookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("token="));

    if (!tokenCookie) {
      return "";
    }

    return decodeURIComponent(tokenCookie.slice("token=".length));
  };

  const handleCancelOrder = async () => {
    const confirmation = await Swal.fire({
      title: "Cancel order?",
      text: "This order will be cancelled and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel order",
      cancelButtonText: "No",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      const token = getTokenFromCookie();

      if (!token) {
        await Swal.fire({
          icon: "error",
          title: "Authentication required",
          text: "Please login again to cancel this order.",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CANCELLED" }),
        },
      );

      let result: { success?: boolean; message?: string } = {};

      try {
        result = (await response.json()) as { success?: boolean; message?: string };
      } catch {
        result = { success: false, message: "Failed to cancel order" };
      }

      if (!response.ok || !result.success) {
        const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId, status: "CANCELLED" }),
        });

        let fallbackResult: { success?: boolean; message?: string } = {};

        try {
          fallbackResult = (await fallbackResponse.json()) as { success?: boolean; message?: string };
        } catch {
          fallbackResult = { success: false, message: "Failed to cancel order" };
        }

        if (!fallbackResponse.ok || !fallbackResult.success) {
          await Swal.fire({
            icon: "error",
            title: "Cancel failed",
            text: fallbackResult.message || result.message || "Failed to cancel order",
          });
          return;
        }

        toast.success(fallbackResult.message || "Order cancelled successfully");
        router.refresh();
        return;
      }

      toast.success(result.message || "Order cancelled successfully");
      router.refresh();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Cancel failed",
        text: "Something went wrong while cancelling the order.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={() => void handleCancelOrder()}
      disabled={isCancelling}
    >
      {isCancelling ? "Cancelling..." : "Cancel Order"}
    </button>
  );
}
