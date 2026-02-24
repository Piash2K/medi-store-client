import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-muted-foreground">
            Sign in to continue to MediStore.
          </p>
        </div>

        <form className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="remember"
                className="size-4 rounded border-input"
              />
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground">
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}
