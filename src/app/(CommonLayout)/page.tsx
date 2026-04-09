import Link from "next/link";
import { ArrowRight, Bot, Search, Sparkles } from "lucide-react";

import Hero from "@/components/modules/home/Hero";
import FeaturedMedicines from "@/components/modules/home/FeaturedMedicines";
import ShopByCategory from "@/components/modules/home/ShopByCategory";
import WhyChooseMediStore from "@/components/modules/home/WhyChooseMediStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 20;

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-[2rem] border border-emerald-200/80 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                Groq AI is live
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                AI search suggestions and support are now built into MediStore.
              </h2>
              <p className="text-sm leading-6 text-white/85 sm:text-base">
                Start typing in the shop to get AI-powered suggestions, or visit Help to chat with the support assistant about orders, checkout, and account questions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-emerald-700 hover:bg-emerald-50">
                <Link href="/shop">
                  <Search className="mr-2 h-4 w-4" />
                  Try AI Search
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/help">
                  <Bot className="mr-2 h-4 w-4" />
                  Open AI Help
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="border-white/20 bg-white/10 text-white shadow-none">
              <CardContent className="space-y-2 p-4">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Smart search</h3>
                <p className="text-sm text-white/80">Get medicine, category, and manufacturer suggestions as you type.</p>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-white/10 text-white shadow-none">
              <CardContent className="space-y-2 p-4">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">AI support assistant</h3>
                <p className="text-sm text-white/80">Ask about checkout, shipping, order tracking, and account help.</p>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-white/10 text-white shadow-none">
              <CardContent className="space-y-2 p-4">
                <ArrowRight className="h-5 w-5" />
                <h3 className="font-semibold">New pages</h3>
                <p className="text-sm text-white/80">Explore About, Contact, and Help directly from the site navigation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <ShopByCategory />
      <FeaturedMedicines />
      <WhyChooseMediStore />
    </>
  );
}
