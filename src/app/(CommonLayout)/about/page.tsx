import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope, Truck, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About | MediStore",
  description: "Learn about MediStore and our AI-powered shopping experience.",
};

const stats = [
  { label: "Trusted orders", value: "Fast" },
  { label: "Support response", value: "24/7 AI" },
  { label: "Medicine categories", value: "Growing" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Quality-first catalog",
    description: "We focus on dependable medicines and clear product information so customers can shop with confidence.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted shopping",
    description: "Groq-powered search suggestions and support answers help users find what they need faster.",
  },
  {
    icon: Truck,
    title: "Convenient delivery flow",
    description: "From cart to checkout, the experience is designed to keep ordering simple and predictable.",
  },
  {
    icon: Users2,
    title: "Built for every role",
    description: "Customer, seller, and admin dashboards are tailored for the tasks each team needs to complete.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-5">
          <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">About MediStore</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-5xl">
            A modern medicine store built around speed, clarity, and AI support.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            MediStore combines a clean pharmacy shopping experience with smart AI features that help customers discover products and get help faster.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/shop">
                Browse Medicines
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
              <Link href="/help">Visit Help Center</Link>
            </Button>
          </div>
        </div>

        <Card className="border border-emerald-200/80 bg-linear-to-br from-emerald-500/10 to-white shadow-xl dark:border-emerald-800/60 dark:from-emerald-400/10 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-300">Why people use MediStore</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-white/80 p-4 text-center shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/40">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stat.value}</div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {values.map((value) => {
          const Icon = value.icon;

          return (
            <Card key={value.title} className="border border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-emerald-200/80 bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-xl dark:border-emerald-800/60">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <Stethoscope className="h-4 w-4" />
              AI-powered support
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Search smarter, get help faster, and keep your orders moving.</h2>
          </div>
          <Button asChild className="bg-white text-emerald-700 hover:bg-emerald-50">
            <Link href="/help">Open Help Center</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
