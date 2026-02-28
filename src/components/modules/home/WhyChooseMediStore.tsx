import { Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const reasons = [
  {
    title: "Verified Medicines",
    description: "Every product is sourced from trusted providers and quality-checked for safety.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Delivery",
    description: "Quick dispatch and reliable doorstep delivery for your essential medicines.",
    icon: Truck,
  },
  {
    title: "Easy Order Tracking",
    description: "Track your order status in real time from placed to delivered in one dashboard.",
    icon: PackageCheck,
  },
  {
    title: "Support You Can Trust",
    description: "Get timely help for order updates, returns, and medicine-related support needs.",
    icon: Clock3,
  },
] as const;

export default function WhyChooseMediStore() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Why Choose MediStore</h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base lg:text-lg">
            A secure, convenient, and dependable way to buy your medicines online.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:gap-5">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article key={reason.title} className="rounded-2xl border bg-card p-5 sm:p-6">
                <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">{reason.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">{reason.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
