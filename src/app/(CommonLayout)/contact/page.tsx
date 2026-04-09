import Link from "next/link";
import { Clock3, Mail, MapPin, PhoneCall } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact | MediStore",
  description: "Contact MediStore support for help with orders, checkout, and account issues.",
};

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@medistore.com";
const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+88013-1234-5678";
const supportHours = process.env.NEXT_PUBLIC_SUPPORT_HOURS || "Mon-Fri 9am-6pm EST";

const contactCards = [
  {
    icon: Mail,
    title: "Email",
    value: supportEmail,
    description: "Best for order questions, account help, and general support.",
    href: `mailto:${supportEmail}`,
  },
  {
    icon: PhoneCall,
    title: "Phone",
    value: supportPhone,
    description: "Use this for urgent order or delivery questions.",
    href: `tel:${supportPhone.replace(/[^+\d]/g, "")}`,
  },
  {
    icon: Clock3,
    title: "Hours",
    value: supportHours,
    description: "Our team responds during business hours and the AI help center is available anytime.",
    href: "/help",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-8 bg-linear-to-b from-emerald-50/20 to-background px-4 py-6 dark:from-emerald-950/10 sm:px-6 sm:py-8 lg:px-8">
      <div className="space-y-4">
        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
          Contact MediStore
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-5xl">
          Reach the right help channel quickly.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          For support, order issues, or account questions, choose the channel below. The AI help center can answer common questions immediately.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {contactCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/45 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg font-semibold text-foreground">{card.value}</p>
                <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                  <Link href={card.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-emerald-200/80 bg-linear-to-br from-emerald-500/10 to-teal-500/10 shadow-xl dark:border-emerald-800/60">
        <CardContent className="grid gap-6 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">Need an answer now?</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Visit the Help Center for the Groq assistant, FAQs, and step-by-step guidance for shopping, checkout, and order tracking.
            </p>
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/help">Open Help Center</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/40">
            <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              MediStore support is optimized for digital help, but the store is built to assist customers, sellers, and admins from any device.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
