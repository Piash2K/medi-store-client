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

const reasonStyles = [
  {
    rail: "bg-linear-to-b from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-300",
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-300/30",
    iconWrap: "bg-emerald-500/12 ring-emerald-500/25 dark:bg-emerald-400/18 dark:ring-emerald-300/30",
    icon: "text-emerald-700 dark:text-emerald-200",
  },
  {
    rail: "bg-linear-to-b from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-300",
    chip: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:bg-sky-400/15 dark:text-sky-200 dark:ring-sky-300/30",
    iconWrap: "bg-sky-500/12 ring-sky-500/25 dark:bg-sky-400/18 dark:ring-sky-300/30",
    icon: "text-sky-700 dark:text-sky-200",
  },
  {
    rail: "bg-linear-to-b from-violet-500 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300",
    chip: "bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-300/30",
    iconWrap: "bg-violet-500/12 ring-violet-500/25 dark:bg-violet-400/18 dark:ring-violet-300/30",
    icon: "text-violet-700 dark:text-violet-200",
  },
  {
    rail: "bg-linear-to-b from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-300",
    chip: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-300/30",
    iconWrap: "bg-amber-500/12 ring-amber-500/25 dark:bg-amber-400/18 dark:ring-amber-300/30",
    icon: "text-amber-700 dark:text-amber-200",
  },
] as const;

export default function WhyChooseMediStore() {
  return (
    <section
      id="why-choose-medistore"
      className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-size-[28px_28px] opacity-25" />
      <div className="mx-auto max-w-7xl">
        <div className="relative max-w-3xl text-center sm:text-left">
          <span className="bg-primary/10 text-primary ring-primary/25 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1">
            Trusted Care Platform
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Why Choose MediStore</h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base lg:text-lg">
            A secure, convenient, and dependable way to buy your medicines online.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:gap-5">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            const style = reasonStyles[index % reasonStyles.length];

            return (
              <article
                key={reason.title}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-5 shadow-[0_1px_0_0_hsl(var(--border)/0.8)] transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-card/85 sm:p-6"
              >
                <div className={`absolute inset-y-0 left-0 w-1 ${style.rail}`} aria-hidden="true" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${style.chip}`}>
                    Key Benefit
                  </div>
                  <span className="text-foreground/15 text-3xl leading-none font-bold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className={`mt-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 sm:h-12 sm:w-12 ${style.iconWrap}`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${style.icon}`} />
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
