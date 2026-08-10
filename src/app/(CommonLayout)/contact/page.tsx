import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, PhoneCall, Clock3, ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Contact | VitaCare Pharmacy",
  description: "Contact our team of licensed pharmacists and healthcare specialists for prescription assistance, order support, and health inquiries.",
};

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vitacare.com";
const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+88013-1234-5678";
const supportHours = process.env.NEXT_PUBLIC_SUPPORT_HOURS || "Mon-Fri 9am-6pm EST";

export default function ContactPage() {
  return (
    <main className="bg-[#f5fbf9] dark:bg-emerald-950/10 min-h-screen text-[#171d1c] dark:text-slate-100">
      <div className="home-shell py-8 sm:py-10">

        {/* Hero Header */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold  mb-4 font-['Manrope',sans-serif] tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-lg text-[#3c4947] max-w-2xl">
            Our team of licensed pharmacists and healthcare specialists are ready to support your health journey with precision and care.
          </p>
        </section>

        {/* Contact Channel Cards (Bento-style Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Email Card */}
          <div className="bg-white dark:bg-emerald-950/30 p-6 rounded-xl border border-[#bbc9c7]/30 dark:border-emerald-900 shadow-[0_4px_20px_rgba(0,166,156,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgba(0,166,156,0.08)] dark:hover:bg-emerald-950/50 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-[#006a63]/10 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-6">
                <Mail className="text-[#006a63] dark:text-teal-200 text-2xl w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-2">Email Support</h3>
              <p className="text-sm text-[#3c4947] dark:text-slate-300 mb-6">Expert medical inquiries and prescription assistance.</p>
              <p className="text-sm font-semibold text-[#171d1c] dark:text-slate-100 mb-8">{supportEmail}</p>
            </div>
            <Button asChild className="w-full bg-[#00a69c] text-white hover:bg-[#008a82] rounded-full py-6">
              <Link href={`mailto:${supportEmail}`}>Open Mail</Link>
            </Button>
          </div>

          {/* Phone Card */}
          <div className="bg-white dark:bg-emerald-950/30 p-6 rounded-xl border border-[#bbc9c7]/30 dark:border-emerald-900 shadow-[0_4px_20px_rgba(0,166,156,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgba(0,166,156,0.08)] dark:hover:bg-emerald-950/50 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-[#006a63]/10 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-6">
                <PhoneCall className="text-[#006a63] dark:text-teal-200 text-2xl w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-2">Call Us</h3>
              <p className="text-sm text-[#3c4947] dark:text-slate-300 mb-6">Immediate assistance with orders or urgent health queries.</p>
              <p className="text-sm font-semibold text-[#171d1c] dark:text-slate-100 mb-8">{supportPhone}</p>
            </div>
            <Button asChild className="w-full bg-[#00a69c] text-white hover:bg-[#008a82] rounded-full py-6">
              <Link href={`tel:${supportPhone.replace(/[^+\d]/g, '')}`}>Call Now</Link>
            </Button>
          </div>

          {/* Hours Card */}
          <div className="bg-white dark:bg-emerald-950/30 p-6 rounded-xl border border-[#bbc9c7]/30 dark:border-emerald-900 shadow-[0_4px_20px_rgba(0,166,156,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgba(0,166,156,0.08)] dark:hover:bg-emerald-950/50 transition-all flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-[#006a63]/10 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mb-6">
                <Clock3 className="text-[#006a63] dark:text-teal-200 text-2xl w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#171d1c] dark:text-slate-100 mb-2">Operating Hours</h3>
              <p className="text-sm text-[#3c4947] dark:text-slate-300 mb-6">Our professional team is available during these hours:</p>
              <div className="flex items-center gap-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-sm font-semibold text-[#171d1c] dark:text-slate-100">{supportHours}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full border-2 border-[#006a63] text-[#006a63] hover:bg-[#006a63]/5 rounded-full py-6">
              <Link href="/help">To Know More</Link>
            </Button>
          </div>
        </div>

        {/* Help Center / AI Assistant Section */}
        <section className="relative overflow-hidden bg-[#d2e6ef]/30 dark:bg-emerald-950/30 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-[#d2e6ef] dark:border-emerald-900 mb-16">
          <div className="relative z-10 flex-1">
            <span className="inline-block bg-[#006a63]/10 dark:bg-teal-900/40 text-[#006a63] dark:text-teal-200 text-xs font-semibold px-4 py-1 rounded-full mb-4">NEW: Smart Assistant</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#171d1c] dark:text-slate-100 mb-4">Intelligent Help Center</h2>
            <p className="text-base text-[#3c4947] dark:text-slate-300 mb-8 max-w-xl">
              Get instant answers to common questions about prescription renewals, delivery tracking, and health insurance coverage through our automated AI clinical assistant.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-[#00a69c] text-white hover:bg-[#008a82] rounded-full px-8 py-6 flex items-center gap-2">
                <Link href="/help">
                  Open Help Center
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#006a63]/20 dark:bg-teal-900/40 blur-3xl rounded-full"></div>
              <Image
                alt="Healthcare Professional Assistant"
                className="relative z-10 w-full h-64 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-emerald-900"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC47sX42uer3fFUJT2EBpRMMT-srjjZWrkeykgXKcyfCRNDTgluYwNxwUv2B21NTAPJv8pnB8x0NWkTpoffzjqJNXvc_PwhqLJC-xjg8fhXywOC3e94eDd0ZFrNEqsiE5vTZQAVTOA0pAIaRngf-3Q4LqsL9qlxKm7JB81l5lCMG7IcX8ywqYuqBpSzqIIaZ4OBEl76jReHjC-5b6mgE0qgAERh_jeKNVHaZol7CBZFDyTBFE_lzsy5TIXlDoBPXZOcxzp7Rum9URko"
                width={600}
                height={400}
              />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}