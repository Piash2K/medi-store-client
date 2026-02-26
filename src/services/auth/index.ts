"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
import { jwtDecode } from "jwt-decode";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileResponse = {
  success: boolean;
  message?: string;
  data: UserProfile | null;
};

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

export const registerUser = async (userData: FieldValues) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "An error occurred" };
  }
};

export const getUser = async () => {
  const storeCookie = await cookies();
  const token = storeCookie.get("token")?.value;
  let decodedData = null;
  if (token) {
    decodedData = await jwtDecode(token);
    return decodedData;
  } else {
    return null;
  }
};

export const logOut= async () => {
  const storeCookie = await cookies();
  storeCookie.delete("token");
};

export const getMyProfile = async (): Promise<UserProfileResponse> => {
  try {
    const storeCookie = await cookies();
    const token = storeCookie.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
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
    console.error("Get profile error:", error);
    return {
      success: false,
      message: "Failed to fetch profile",
      data: null,
    };
  }
};