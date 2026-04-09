"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { isDynamicServerUsageError } from "@/lib/is-dynamic-server-usage-error";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
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

export type UpdateProfilePayload = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

export type UpdateProfilePhotoResponse = {
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
    if (!isDynamicServerUsageError(error)) {
      console.error("Login error:", error);
    }
    return { success: false, message: "An error occurred" };
  }
};

export const registerUser = async (userData: FieldValues) => {
  try {
    const isFormDataPayload = userData instanceof FormData;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        ...(isFormDataPayload
          ? { body: userData }
          : {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            }),
      },
    );

    const result = await response.json();
    return result;
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Register error:", error);
    }
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
    if (!isDynamicServerUsageError(error)) {
      console.error("Get profile error:", error);
    }
    return {
      success: false,
      message: "Failed to fetch profile",
      data: null,
    };
  }
};

export const updateMyProfile = async (
  payload: UpdateProfilePayload,
): Promise<UserProfileResponse> => {
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
    if (!isDynamicServerUsageError(error)) {
      console.error("Update profile error:", error);
    }
    return {
      success: false,
      message: "Failed to update profile",
      data: null,
    };
  }
};

export const updateMyProfilePhoto = async (
  payload: FormData,
): Promise<UpdateProfilePhotoResponse> => {
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

    const attempts: Array<{ method: "PATCH" | "PUT"; path: string }> = [
      { method: "PATCH", path: "/user/profile/photo" },
      { method: "PUT", path: "/user/profile/photo" },
      { method: "PATCH", path: "/user/profile" },
      { method: "PUT", path: "/user/profile" },
    ];

    let message = "Failed to update profile photo";

    for (const attempt of attempts) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${attempt.path}`, {
        method: attempt.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
        cache: "no-store",
      });

      const result = await response.json();

      if (result?.success) {
        return {
          success: true,
          message: result?.message,
          data: result?.data ?? null,
        };
      }

      message = result?.message || message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Update profile photo error:", error);
    }
    return {
      success: false,
      message: "Failed to update profile photo",
      data: null,
    };
  }
};

type GoogleAuthPayload = {
  email: string;
  name: string;
  profileImage?: string;
  uid: string;
  idToken: string;
  role?: "CUSTOMER" | "SELLER";
};

const getTokenFromAuthResponse = (result: unknown) => {
  const resultData = result as {
    data?: {
      token?: string;
      accessToken?: string;
      jwt?: string;
    };
  };

  return resultData?.data?.token || resultData?.data?.accessToken || resultData?.data?.jwt || "";
};

export const loginOrRegisterWithGoogle = async (payload: GoogleAuthPayload) => {
  const candidatePaths = [
    "/auth/google",
    "/auth/google-login",
    "/auth/social-login",
    "/auth/login/google",
    "/auth/register/google",
  ];

  let fallbackMessage = "Google auth endpoint is not available on the server.";

  for (const path of candidatePaths) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        fallbackMessage = result?.message || fallbackMessage;
        continue;
      }

      const token = getTokenFromAuthResponse(result);

      if (!token) {
        fallbackMessage = result?.message || "Token missing from Google auth response.";
        continue;
      }

      const storeCookie = await cookies();
      storeCookie.set("token", token);

      return {
        success: true,
        message: result?.message || "Google authentication successful.",
      };
    } catch (error) {
      if (!isDynamicServerUsageError(error)) {
        console.error(`Google auth error (${path}):`, error);
      }
    }
  }

  return {
    success: false,
    message: fallbackMessage,
  };
};