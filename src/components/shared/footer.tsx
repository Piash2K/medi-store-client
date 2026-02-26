import Link from "next/link";
import { Pill } from "lucide-react";

import { getCategories } from "@/services/medicine";

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@medistore.com";
const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+88013-1234-5678";
const supportHours = process.env.NEXT_PUBLIC_SUPPORT_HOURS || "Mon-Fri 9am-6pm EST";

export async function Footer() {
  const categories = await getCategories();
  const quickCategories = categories.slice(0, 3);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 text-3xl font-bold tracking-tight">
              <span className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-xl">
                <Pill className="h-5 w-5" />
              </span>
              MediStore
            </Link>
            <p className="max-w-xs text-lg leading-8 text-muted-foreground">
              Your trusted online medicine shop. Quality OTC medicines delivered to your doorstep.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-lg text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-foreground transition-colors">
                  Shop All
                </Link>
              </li>
              {quickCategories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Customer Service</h3>
            <ul className="mt-5 space-y-3 text-lg text-muted-foreground">
              <li>
                <Link href="/orders" className="hover:text-foreground transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-foreground transition-colors">
                  Shop Medicines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Contact</h3>
            <ul className="mt-5 space-y-3 text-lg text-muted-foreground">
              <li>{supportEmail}</li>
              <li>{supportPhone}</li>
              <li>{supportHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-base text-muted-foreground">
          {currentYear} MediStore. All rights reserved. OTC medicines only.
        </div>
      </div>
    </footer>
  );
}
