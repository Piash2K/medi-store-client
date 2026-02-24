"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

export const loginUser = async (userData: FieldValues) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );

    const result = await response.json();
    const storeCookie = await cookies();
    if (result.success) {
      storeCookie.set("token", result.data.token);
      return result;
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred" };
  }
};
