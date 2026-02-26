import Link from "next/link";
import {
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
    <section className="bg-muted/40 px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Shop by Category</h2>
          <p className="text-muted-foreground mt-3 text-lg">Find the right medicine for your needs</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {homeCategories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);

            return (
              <Link
                key={getCategoryKey(category, index)}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border bg-card p-6 text-center transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">{category.name}</h3>
                <p className="text-muted-foreground mt-2 text-base leading-6">
                  {getCategoryDescription(category.name)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
