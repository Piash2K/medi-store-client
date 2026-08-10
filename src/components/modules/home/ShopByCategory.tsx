import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Heart,
  Leaf,
  Pill,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Syringe,
  type LucideIcon,
} from "lucide-react";

import { getCategories } from "@/services/medicine";
import { Category } from "@/types/medicine";

const iconByKeyword: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["pain", "relief", "analgesic", "headache"], icon: Pill },
  { keywords: ["vitamin", "supplement", "nutrition", "mineral"], icon: Sun },
  { keywords: ["first aid", "bandage", "wound", "emergency", "kit"], icon: Heart },
  { keywords: ["cold", "flu", "cough", "fever", "respiratory"], icon: Stethoscope },
  { keywords: ["skin", "beauty", "care", "lotion", "cream", "derma"], icon: Droplets },
  { keywords: ["allergy", "immune", "antihistamine", "sinus"], icon: Syringe },
  { keywords: ["herbal", "natural", "ayur", "organic"], icon: Leaf },
  { keywords: ["safety", "protection", "hygiene", "sanit"], icon: Shield },
];

const fallbackIcons: LucideIcon[] = [Sparkles, Pill, Sun, Heart, Stethoscope, Droplets, Syringe, Leaf, Shield];

const getFallbackIcon = (categoryName: string) => {
  const hash = Array.from(categoryName).reduce((total, char) => total + char.charCodeAt(0), 0);
  return fallbackIcons[hash % fallbackIcons.length];
};

const descriptionByKeyword: Array<{ keywords: string[]; description: string }> = [
  { keywords: ["pain", "relief"], description: "Headache, muscle pain & more" },
  { keywords: ["vitamin", "supplement"], description: "Daily supplements & nutrition" },
  { keywords: ["first aid", "bandage", "wound"], description: "Bandages, antiseptics & kits" },
  { keywords: ["cold", "flu", "cough", "fever"], description: "Cough, cold & flu remedies" },
  { keywords: ["skin", "beauty", "care", "lotion"], description: "Creams, lotions & treatments" },
  { keywords: ["allergy", "immune", "antihistamine"], description: "Antihistamines & relief" },
];

const getCategoryIcon = (categoryName: string) => {
  const normalizedName = categoryName.toLowerCase();
  const match = iconByKeyword.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  return match?.icon || getFallbackIcon(categoryName);
};

const getCategoryDescription = (categoryName: string) => {
  const normalizedName = categoryName.toLowerCase();
  const match = descriptionByKeyword.find(({ keywords }) =>
    keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  return match?.description || `${categoryName} medicines and essentials`;
};

const getCategoryKey = (category: Category, index: number) =>
  `${category._id || category.name}-${index}`;



export default async function ShopByCategory() {
  const categories = await getCategories();
  const homeCategories = categories.slice(0, 6);

  if (homeCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f3f8f6] dark:bg-[#101c1a] home-section">
      <div className="home-shell">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div>
            <h2 className="home-heading text-[#1a2c23] dark:text-white">Shop by Category</h2>
            <p className="home-lead text-[#4b6358] dark:text-[#b5cfc2]">
              Find exactly what you need in our curated pharmacy collection.
            </p>
          </div>
          <Link href="/shop" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline sm:mt-0 lg:text-base">
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {homeCategories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={getCategoryKey(category, index)}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group block rounded-xl bg-white dark:bg-[#162624] border border-[#e6f0ec] dark:border-[#1e2e2b] shadow-sm p-5 transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none cursor-pointer h-full"
                tabIndex={0}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f3f8f6] dark:bg-[#101c1a]">
                    <Icon className="h-7 w-7 text-[#168172] dark:text-[#6ee7b7]" />
                  </span>
                  <h3 className="text-base font-semibold text-[#1a2c23] dark:text-white mb-1 text-center">{category.name}</h3>
                  <p className="text-xs text-[#4b6358] dark:text-[#b5cfc2] text-center">{getCategoryDescription(category.name)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
