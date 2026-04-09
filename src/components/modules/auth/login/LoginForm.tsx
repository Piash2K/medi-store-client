"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Building2, ClipboardCheck, Microscope } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithGooglePopup } from "@/lib/firebase";
import { loginOrRegisterWithGoogle, loginUser } from "@/services/auth";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginUser(data);

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Login failed",
          text: result.message || "Please check your credentials and try again.",
        });
        return;
      }

      toast.success("Login successful!");

      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    } catch (error) {
      console.log(error);
      await Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const googleUser = await signInWithGooglePopup();

      if (!googleUser.email) {
        await Swal.fire({
          icon: "error",
          title: "Google login failed",
          text: "No email was returned from your Google account.",
        });
        return;
      }

      const result = await loginOrRegisterWithGoogle({
        email: googleUser.email,
        name: googleUser.name,
        profileImage: googleUser.photoURL,
        uid: googleUser.uid,
        idToken: googleUser.idToken,
      });

      if (!result.success) {
        await Swal.fire({
          icon: "error",
          title: "Google login failed",
          text: result.message || "Google login endpoint is not configured on the backend.",
        });
        return;
      }

      toast.success("Google login successful!");
      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Google sign-in failed",
        text: "Please try again.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_10%_18%,#10b98155,transparent_34%),radial-gradient(circle_at_90%_16%,#14b8a666,transparent_30%),linear-gradient(140deg,#047857_0%,#065f46_52%,#0f766e_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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
          <aside className="bg-[linear-gradient(145deg,#047857_0%,#0f766e_62%,#115e59_100%)] px-8 py-10 text-white sm:px-12 lg:py-14">
            <div className="space-y-5 border-b border-white/25 pb-7">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back to MediStore</h2>
              <p className="max-w-md text-white/85">
                Login to continue shopping, track orders, and manage your account securely.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <Building2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Quick Access</p>
                  <p className="text-sm text-white/85">Continue from where you left off in just one login.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <Microscope className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Secure Session</p>
                  <p className="text-sm text-white/85">Your account login is protected with token-based authentication.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg border border-white/25 bg-white/15 p-3">
                  <ClipboardCheck className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Track Everything</p>
                  <p className="text-sm text-white/85">Check your orders, profile, and dashboard instantly after sign in.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-emerald-50 p-6 text-slate-900 sm:p-8 dark:bg-slate-950 dark:text-slate-100">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sign in to your account</h1>
              <p className="text-emerald-700 dark:text-slate-300">
                Use your credentials to continue to MediStore.
              </p>
            </div>

            <form
              id="login-form"
              className="mt-6 grid gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
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
                    <label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
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
                  maxLength: {
                    value: 50,
                    message: "Password must be at most 50 characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      className={fieldState.invalid ? "border-red-500" : "border-slate-300/90 bg-white dark:border-slate-700 dark:bg-slate-900/70"}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Button
                type="submit"
                className="mt-2 h-11 w-full bg-[linear-gradient(90deg,#059669_0%,#10b981_100%)] text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:opacity-95"
                disabled={form.formState.isSubmitting || isGoogleLoading}
              >
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={form.formState.isSubmitting || isGoogleLoading}
                className="h-11 w-full border-slate-300/90 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 11.1H12v2.98h5.37c-.23 1.47-1.68 4.31-5.37 4.31-3.23 0-5.86-2.67-5.86-5.96s2.63-5.96 5.86-5.96c1.84 0 3.07.79 3.77 1.46l2.57-2.5C16.7 3.9 14.56 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.19 0 8.62-3.65 8.62-8.79 0-.59-.07-1.04-.15-1.11Z" />
                </svg>
                {isGoogleLoading ? "Connecting Google..." : "Continue with Google"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-emerald-700 dark:text-slate-300">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
