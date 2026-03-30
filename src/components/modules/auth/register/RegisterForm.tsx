"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Building2, ClipboardCheck, Microscope } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "CUSTOMER" | "SELLER";
  profileImage?: FileList;
};

export default function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        await Swal.fire({
          icon: "warning",
          title: "Password mismatch",
          text: "Passwords do not match.",
        });
        return;
      }

      const imageFile = data.profileImage?.[0];
      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          await Swal.fire({
            icon: "warning",
            title: "Invalid image",
            text: "Please upload a valid image file.",
          });
          return;
        }

        if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
          await Swal.fire({
            icon: "warning",
            title: "Image too large",
            text: "Image size must be 5MB or less.",
          });
          return;
        }
      }

      const payload = new FormData();
      payload.append("name", data.name);
      payload.append("email", data.email);
      payload.append("password", data.password);
      payload.append("role", data.role);

      if (imageFile) {
        payload.append("profileImage", imageFile);
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBaseUrl) {
        toast.error("API URL is not configured. Please check environment variables.");
        return;
      }

      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        body: payload,
      });

      let result: { success?: boolean; message?: string } | null = null;
      try {
        result = (await response.json()) as { success?: boolean; message?: string };
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        toast.error(result?.message || "Registration failed. Please try again.");
        return;
      }

      toast.success("Registration successful! Please login.");

      router.push("/login");
    } catch (error) {
      console.log(error);
      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again.",
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_10%_18%,#3b82f655,transparent_34%),radial-gradient(circle_at_90%_16%,#2563eb66,transparent_30%),linear-gradient(140deg,#1d4ed8_0%,#1e40af_52%,#1d4ed8_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[7%] top-[15%] h-12 w-12 rounded-full border border-white/30" />
        <div className="absolute left-[22%] top-[36%] h-6 w-6 rounded-full border border-white/35" />
        <div className="absolute right-[11%] top-[22%] h-10 w-10 rounded-full border border-white/30" />
        <div className="absolute right-[8%] bottom-[16%] h-12 w-12 rounded-full border border-white/25" />
        <div className="absolute left-[40%] top-[12%] h-16 w-16 rounded-full bg-white/6 blur-xl" />
        <div className="absolute right-[34%] bottom-[18%] h-20 w-20 rounded-full bg-white/6 blur-xl" />
      </div>

      <div className="relative mx-auto max-w-6xl rounded-sm border border-white/20 bg-transparent shadow-2xl">
        <div className="grid lg:grid-cols-2">
          <aside className="bg-[linear-gradient(145deg,#1456d8_0%,#1149c9_62%,#1042be_100%)] px-8 py-10 text-white sm:px-12 lg:py-14">
            <div className="space-y-5 border-b border-white/25 pb-7">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Create your MediStore account</h2>
              <p className="max-w-md text-white/85">
                Fast onboarding for customers and sellers with secure profile setup and trusted marketplace access.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <Building2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Smooth Account Setup</p>
                  <p className="text-sm text-white/85">Create your account in minutes with a simple guided flow.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <Microscope className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Trusted Verification</p>
                  <p className="text-sm text-white/85">Built-in validation helps keep profile and account data accurate.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <ClipboardCheck className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Ready For Marketplace</p>
                  <p className="text-sm text-white/85">Buy or sell OTC medicines right after successful registration.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-slate-50 p-6 text-slate-900 sm:p-8 dark:bg-slate-950 dark:text-slate-100">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sign up for your account</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Join MediStore to buy or sell OTC medicines.
              </p>
            </div>

            <form
              id="register-form"
              className="mt-6 grid gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Controller
                name="name"
                control={form.control}
                rules={{ required: "Full name is required" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor="register-name" className="text-sm font-medium">
                      Full name
                    </label>
                    <Input
                      {...field}
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor="register-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      {...field}
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="password"
                  control={form.control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <label htmlFor="register-password" className="text-sm font-medium">
                        Password
                      </label>
                      <Input
                        {...field}
                        id="register-password"
                        type="password"
                        placeholder="Create password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  rules={{ required: "Confirm password is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <label htmlFor="register-confirm-password" className="text-sm font-medium">
                        Confirm password
                      </label>
                      <Input
                        {...field}
                        id="register-confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-destructive">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="register-role" className="text-sm font-medium">
                      Register as
                    </label>
                    <select
                      {...field}
                      id="register-role"
                      className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border border-slate-300/90 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900/70"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SELLER">Seller</option>
                    </select>
                  </div>
                )}
              />

              <Controller
                name="profileImage"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="register-profile-image" className="text-sm font-medium">
                      Profile image (optional)
                    </label>
                    <Input
                      ref={field.ref}
                      id="register-profile-image"
                      type="file"
                      accept="image/*"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files)}
                      className="border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Accepted image files up to 5MB.</p>
                  </div>
                )}
              />

              <Button
                type="submit"
                className="mt-2 h-11 w-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_100%)] text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:opacity-95"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue-700 underline-offset-4 hover:underline dark:text-blue-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
