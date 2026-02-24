import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Your Trusted Online Medicine Shop
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Buy OTC medicines with confidence. Browse products, add to cart, and
        place orders easily with cash on delivery.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className={buttonVariants({ size: "lg" })}>
          Shop Medicines
        </Link>
        <Link
          href="/register"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Create Account
        </Link>
      </div>
    </section>
  );
}
