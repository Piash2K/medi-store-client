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

type CategoryPalette = {
  card: string;
  glow: string;
  iconWrap: string;
  icon: string;
};

const categoryPalettes: CategoryPalette[] = [
  {
    card: "from-rose-500/12 via-background to-background dark:from-rose-400/18 dark:via-background dark:to-background",
    glow: "bg-rose-500/15 dark:bg-rose-300/10",
    iconWrap: "bg-rose-500/15 ring-rose-500/25 dark:bg-rose-400/20 dark:ring-rose-300/35",
    icon: "text-rose-600 dark:text-rose-300",
  },
  {
    card: "from-sky-500/12 via-background to-background dark:from-sky-400/18 dark:via-background dark:to-background",
    glow: "bg-sky-500/15 dark:bg-sky-300/10",
    iconWrap: "bg-sky-500/15 ring-sky-500/25 dark:bg-sky-400/20 dark:ring-sky-300/35",
    icon: "text-sky-600 dark:text-sky-300",
  },
  {
    card: "from-violet-500/12 via-background to-background dark:from-violet-400/18 dark:via-background dark:to-background",
    glow: "bg-violet-500/15 dark:bg-violet-300/10",
    iconWrap: "bg-violet-500/15 ring-violet-500/25 dark:bg-violet-400/20 dark:ring-violet-300/35",
    icon: "text-violet-600 dark:text-violet-300",
  },
  {
    card: "from-emerald-500/12 via-background to-background dark:from-emerald-400/18 dark:via-background dark:to-background",
    glow: "bg-emerald-500/15 dark:bg-emerald-300/10",
    iconWrap: "bg-emerald-500/15 ring-emerald-500/25 dark:bg-emerald-400/20 dark:ring-emerald-300/35",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  {
    card: "from-amber-500/12 via-background to-background dark:from-amber-400/18 dark:via-background dark:to-background",
    glow: "bg-amber-500/15 dark:bg-amber-300/10",
    iconWrap: "bg-amber-500/15 ring-amber-500/25 dark:bg-amber-400/20 dark:ring-amber-300/35",
    icon: "text-amber-600 dark:text-amber-300",
  },
  {
    card: "from-cyan-500/12 via-background to-background dark:from-cyan-400/18 dark:via-background dark:to-background",
    glow: "bg-cyan-500/15 dark:bg-cyan-300/10",
    iconWrap: "bg-cyan-500/15 ring-cyan-500/25 dark:bg-cyan-400/20 dark:ring-cyan-300/35",
    icon: "text-cyan-600 dark:text-cyan-300",
  },
];

const getCategoryPalette = (categoryName: string, index: number) => {
  const hash = Array.from(categoryName).reduce((total, char) => total + char.charCodeAt(0), index);
  return categoryPalettes[hash % categoryPalettes.length];
};

export default async function ShopByCategory() {
  const categories = await getCategories();
  const homeCategories = categories.slice(0, 6);

  if (homeCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/40 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-screen-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Shop by Category</h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base lg:text-lg">
            Find the right medicine for your needs
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {homeCategories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            const palette = getCategoryPalette(category.name, index);

            return (
              <Link
                key={getCategoryKey(category, index)}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br ${palette.card} p-5 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none sm:p-6`}
              >
                <div
                  className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-90 ${palette.glow}`}
                  aria-hidden="true"
                />

                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-1 sm:h-15 sm:w-15 ${palette.iconWrap}`}>
                  <Icon className={`h-7 w-7 sm:h-7.5 sm:w-7.5 ${palette.icon}`} />
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">{category.name}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-6 sm:text-sm">
                  {getCategoryDescription(category.name)}
                </p>

                <span className="text-foreground/70 mt-4 inline-flex items-center text-xs font-medium">
                  Explore Category
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
