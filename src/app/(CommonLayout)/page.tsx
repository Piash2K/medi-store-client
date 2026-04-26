import { ArrowRight, Bot, Search } from "lucide-react";

import Hero from "@/components/modules/home/Hero";
import FeaturedMedicines from "@/components/modules/home/FeaturedMedicines";
import ShopByCategory from "@/components/modules/home/ShopByCategory";
import WhyChooseMediStore from "@/components/modules/home/WhyChooseMediStore";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 20;

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto w-full max-w-screen-2xl px-2 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#f7fcfa] dark:bg-[#101c1a] p-2 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-[#162624] border border-[#e6f0ec] dark:border-[#1e2e2b] shadow-sm rounded-xl transition-colors">
              <CardContent className="flex flex-col items-start gap-2 p-6">
                <span className="rounded-md bg-[#e6f4ef] dark:bg-[#1e2e2b] p-2 mb-2">
                  <Bot className="h-6 w-6 text-[#168172] dark:text-[#6ee7b7]" />
                </span>
                <h3 className="font-semibold text-lg text-[#1a2c23] dark:text-white">
                  AI Health Assistant
                </h3>
                <p className="text-[#4b6358] dark:text-[#b5cfc2] text-sm">
                  Instant, data-driven health insights powered by our secure
                  medical AI engine.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#162624] border border-[#e6f0ec] dark:border-[#1e2e2b] shadow-sm rounded-xl transition-colors">
              <CardContent className="flex flex-col items-start gap-2 p-6">
                <span className="rounded-md bg-[#ffe9e2] dark:bg-[#2a1a18] p-2 mb-2">
                  <Search className="h-6 w-6 text-[#e48a5b] dark:text-[#fbbf24]" />
                </span>
                <h3 className="font-semibold text-lg text-[#1a2c23] dark:text-white">
                  Smart Symptom Search
                </h3>
                <p className="text-[#4b6358] dark:text-[#b5cfc2] text-sm">
                  Find the right relief quickly with our clinical-grade
                  symptom-matching tool.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-[#162624] border border-[#e6f0ec] dark:border-[#1e2e2b] shadow-sm rounded-xl transition-colors">
              <CardContent className="flex flex-col items-start gap-2 p-6">
                <span className="rounded-md bg-[#e2f6f9] dark:bg-[#18282a] p-2 mb-2">
                  <ArrowRight className="h-6 w-6 text-[#3bb1b7] dark:text-[#67e8f9]" />
                </span>
                <h3 className="font-semibold text-lg text-[#1a2c23] dark:text-white">
                  24/7 Expert Support
                </h3>
                <p className="text-[#4b6358] dark:text-[#b5cfc2] text-sm">
                  Our licensed pharmacists are available around the clock for
                  your safety.
                </p>
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
