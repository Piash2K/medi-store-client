"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/services/auth";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "CUSTOMER" | "SELLER";
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
        toast.error("Passwords do not match", {
          position: "top-right",
        });
        return;
      }

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      const result = await registerUser(payload);

      if (!result?.success) {
        toast.error(result?.message || "Registration failed", {
          position: "top-right",
        });
        return;
      }

      toast.success("Registration successful! Please login.", {
        position: "top-right",
      });

      router.push("/login");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <section className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground">
            Join MediStore to buy or sell OTC medicines.
          </p>
        </div>

        <form
          id="register-form"
          className="mt-6 space-y-4"
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
                  className={fieldState.invalid ? "border-red-500" : ""}
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
                  className={fieldState.invalid ? "border-red-500" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

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
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? "border-red-500" : ""}
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
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  className={fieldState.invalid ? "border-red-500" : ""}
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Seller</option>
                </select>
              </div>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
