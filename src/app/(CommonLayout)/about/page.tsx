import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Brain,
  Package,
  ShieldCheck,
  Sparkles,
  Users2,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const metadata = {
  title: "About | MediStore",
  description:
    "Learn about MediStore and our AI-powered shopping experience.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#f2fbf8] dark:bg-emerald-950/10 text-[#171d1c] dark:text-slate-100 font-body-md antialiased">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 lg:py-16">
        <div className="home-shell">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <Badge className="inline-block px-4 py-1.5 mb-6 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#374951] dark:text-teal-200 text-sm font-semibold tracking-wide hover:bg-[#d2e6ef] dark:hover:bg-teal-900/60">
                Modern Pharmacy Experience
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171d1c] dark:text-slate-100 mb-6 leading-tight">
                A modern medicine store built around{" "}
                <span className="text-[#006a63]">speed, clarity, and AI support.</span>
              </h1>
              <p className="text-lg text-[#3c4947] dark:text-slate-300 mb-8 max-w-lg leading-relaxed">
                MediStore is your trusted digital pharmacy for fast, reliable, and AI-powered healthcare solutions. We make medicine shopping simple, safe, and always available.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-teal-600 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg hover:bg-teal-700 transition-all active:scale-95">
                  <Link href="/shop">
                    All Medicines
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-300 dark:border-emerald-900 text-[#171d1c] dark:text-slate-100 px-8 py-3 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-emerald-950/30 transition-all active:scale-95"
                >
                  <Link href="/help">Get Help</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#7af6eb]/30 dark:bg-teal-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#b6cad2]/30 dark:bg-emerald-900/30 rounded-full blur-3xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <Image
                  alt="Professional pharmacist working with high-tech digital systems"
                  className="w-full h-75 sm:h-100 lg:h-125 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvaZSPLzTP0z3nHT_JtMng-gjbWV_kILGsJ9iqMum3YXx0UohJH1gZvUtExDxI_cgyc1VZ3fIPXZW4bIgWTQ4YJK82pHKTCH4xoE9W25EauWrL1OpfC7fEINOXdxsNqMeGpeR5gDaZ7-oRIk_UtVC-unUNvwK-UtPsYR039LW5TEns2UfRG0sOQG-5WV5GG4QFHt6buR_sQ_wjPecZ_p0B0INRUaQVMRlTg53kMxwCXYvefo42oBeTWjdD97_rZAAhq01mtNXjAopy"
                  width={800}
                  height={500}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="home-shell">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-emerald-950/30 transition-all hover:shadow-xl hover:shadow-[#006a63]/5">
              <div className="w-16 h-16 rounded-full bg-[#00a69c]/10 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-[#006a63] dark:text-teal-200 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-2">
                Fast &amp; Reliable Delivery
              </h3>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                Get your medicines delivered quickly and securely, with real-time order tracking and support.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl bg-teal-600 text-white flex flex-col items-center text-center shadow-lg shadow-[#006a63]/20">
              <div className="w-16 h-16 rounded-full bg-white/20 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                24/7 AI Support Response
              </h3>
              <p className="text-sm text-[#7af6eb] dark:text-teal-200">
                Get instant answers to your health and order questions, anytime, powered by our AI assistant.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 flex flex-col items-center text-center group hover:bg-white dark:hover:bg-emerald-950/30 transition-all hover:shadow-xl hover:shadow-[#006a63]/5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[#4f6169] dark:text-slate-400 group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-2">
                Expanding Medicine Selection
              </h3>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                Thousands of authentic medicines and wellness products, with new items added regularly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 lg:py-12 relative overflow-hidden">
        <div className="home-shell relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171d1c] dark:text-slate-100 mb-4">
              The MediStore Standard
            </h2>
            <p className="text-[#3c4947] dark:text-slate-400 max-w-2xl mx-auto">
              Our core values define every interaction, from browsing to unboxing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 hover:border-[#006a63]/30 hover:bg-[#f5fbf9] dark:hover:bg-emerald-950/30 transition-all bg-white dark:bg-background/80">
              <ShieldCheck className="text-[#006a63] mb-4 w-8 h-8" />
              <h4 className="text-lg font-bold text-[#171d1c] dark:text-slate-100 mb-2">
                Verified Quality Medicines
              </h4>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                All medicines are sourced from licensed suppliers and pass strict quality checks.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 hover:border-[#006a63]/30 hover:bg-[#f5fbf9] dark:hover:bg-emerald-950/30 transition-all bg-white dark:bg-background/80">
              <Sparkles className="text-[#006a63] mb-4 w-8 h-8" />
              <h4 className="text-lg font-bold text-[#171d1c] dark:text-slate-100 mb-2">
                Smart Shopping Experience
              </h4>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                Discover alternatives, dosage info, and safe usage tips with our smart search and AI tools.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 hover:border-[#006a63]/30 hover:bg-[#f5fbf9] dark:hover:bg-emerald-950/30 transition-all bg-white dark:bg-background/80">
              <Clock className="text-[#006a63] mb-4 w-8 h-8" />
              <h4 className="text-lg font-bold text-[#171d1c] dark:text-slate-100 mb-2">
                Seamless Delivery Process
              </h4>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                Track your orders in real-time. We ensure safe, temperature-controlled delivery.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-[#bbc9c7] dark:border-emerald-900 hover:border-[#006a63]/30 hover:bg-[#f5fbf9] dark:hover:bg-emerald-950/30 transition-all bg-white dark:bg-background/80">
              <Users2 className="text-[#006a63] mb-4 w-8 h-8" />
              <h4 className="text-lg font-bold text-[#171d1c] dark:text-slate-100 mb-2">
                For Everyone&apos;s Needs
              </h4>
              <p className="text-sm text-[#3c4947] dark:text-slate-400">
                Whether you&apos;re a patient, caregiver, or healthcare provider, MediStore is built for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 lg:py-12">
        <div className="home-shell">
          <div className="rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl relative overflow-hidden bg-linear-to-br from-teal-700 to-teal-500">
            <div
              className="absolute inset-0 bg-white/5 dark:bg-white/10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight text-white">
                Ready to experience the future of pharmacy?
              </h2>
              <p className="text-base sm:text-lg mb-8 lg:mb-12 opacity-90 text-white/90">
                Search smarter, get help faster, and keep your orders moving with
                MediStore&apos;s professional care.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild className="bg-white text-[#006a63] px-8 sm:px-10 py-4 rounded-full text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 shadow-lg">
                  <Link href="/shop">Start Shopping Now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="bg-teal-600/20 border border-white/30 text-white px-8 sm:px-10 py-4 rounded-full text-sm font-semibold hover:bg-white/10 dark:hover:bg-white/20 transition-all active:scale-95"
                >
                  <Link href="/contact">Contact Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}