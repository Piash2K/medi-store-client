

import HelpPageClient from "./HelpPageClient";
import {
  Package2,
  Truck,
  ShieldCheck,
  ArrowLeftRight,
  Pill,
  FileText,
  Search,
  Verified,
  Lock,
  HeartHandshake,
  Headphones
} from "lucide-react";

export const metadata = {
  title: "Help Center | MediStore",
  description:
    "AI support assistant and help resources for MediStore users. Get instant answers about orders, deliveries, and account settings.",
};

const faqCategories = [
  {
    icon: Package2,
    title: "Order Tracking",
    description:
      "Real-time updates on your prescriptions and health essentials.",
  },
  {
    icon: Truck,
    title: "Shipping & Delivery",
    description:
      "Estimated arrival times, international shipping, and courier partners.",
  },
  {
    icon: ShieldCheck,
    title: "Account & Security",
    description:
      "Manage your health profile, reset passwords, and data privacy.",
  },
  {
    icon: ArrowLeftRight,
    title: "Returns & Refunds",
    description:
      "Policies for medications, hygiene products, and claim processes.",
  },
  {
    icon: Pill,
    title: "Medicine Safety",
    description:
      "Storage guidelines, shelf-life information, and disposal tips.",
  },
  {
    icon: FileText,
    title: "Prescriptions",
    description:
      "Uploading scripts, pharmacist validation, and refill requests.",
  },
];

const trustBadges = [
  { icon: Verified, label: "Verified Pharmacists" },
  { icon: Lock, label: "Secure Payments" },
  { icon: HeartHandshake, label: "HIPAA Compliant" },
  { icon: Headphones, label: "24/7 Support" },
];

export default function HelpPage() {
  return (
    <div className="bg-[#f2fbf8] dark:bg-emerald-950/10 text-[#171d1c] dark:text-slate-100 font-body-md antialiased">
      <main className="home-shell py-8 sm:py-10 min-h-screen">
        {/* Hero Search Section */}
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface mb-4 md:mb-6">
            How can we help you today?
          </h1>
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 md:py-4 pl-11 md:pl-12 pr-4 focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all shadow-sm group-hover:shadow-md text-sm md:text-base"
              placeholder="Search orders, deliveries, or safety guidelines..."
              type="text"
            />
          </div>
        </section>

        {/* Bento Grid FAQ Categories */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 md:mb-16">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col items-center text-center group bg-white dark:bg-emerald-950/30 hover:bg-[#f8fdfa] dark:hover:bg-emerald-950/50 transition-all hover:shadow-xl hover:shadow-[#006a63]/5"
              >
                <div className="w-16 h-16 rounded-full bg-[#00a69c]/10 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-[#006a63] dark:text-teal-200 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-1 md:mb-2">
                  {category.title}
                </h3>
                <p className="text-xs md:text-sm text-[#3c4947] dark:text-slate-300">
                  {category.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* AI Assistant Section */}
        <section className="bg-linear-to-br from-teal-600 to-teal-800 rounded-2xl overflow-hidden relative shadow-xl mb-12 md:mb-16">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 lg:p-12 items-center gap-6 md:gap-8">
            <HelpPageClient />
            <div className="hidden md:block bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 h-80 flex-col justify-end">
              {/* Fake Chat UI */}
              <div className="space-y-3">
                <div className="bg-white/90 rounded-lg p-3 self-start max-w-[80%] shadow-sm">
                  <p className="text-sm text-teal-900">
                    Hello! I&apos;m the MediStore Assistant. How can I help you with your order today?
                  </p>
                </div>
                <div className="bg-teal-500 rounded-lg p-3 self-end ml-auto max-w-[80%] shadow-sm">
                  <p className="text-sm text-white">
                    Can you track my prescription order #9942?
                  </p>
                </div>
                <div className="bg-white/90 rounded-lg p-3 self-start max-w-[80%] shadow-sm">
                  <p className="text-sm text-teal-900">
                    Searching... Your order is currently with our courier and is expected to arrive by 3 PM today.
                  </p>
                </div>
              </div>
              <div className="mt-3 bg-white/20 rounded-lg p-3 flex justify-between items-center">
                <span className="text-white/60 text-sm">Type your question...</span>
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="border-t border-gray-100 dark:border-surface-container pt-8 md:pt-12">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center text-primary dark:text-primary-light">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold tracking-wide text-on-surface dark:text-white">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
