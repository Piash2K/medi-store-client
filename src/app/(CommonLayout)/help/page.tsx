import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SupportAssistant from "@/components/modules/help/SupportAssistant";

export const metadata = {
  title: "Help | MediStore",
  description: "AI support assistant and help resources for MediStore users.",
};

const faqs = [
  {
    question: "How do I track my order?",
    answer: "Open your orders page or ask the AI assistant for tracking guidance and the next step.",
  },
  {
    question: "Can I buy medicines as an admin or seller?",
    answer: "The app keeps buying actions limited to eligible customer accounts.",
  },
  {
    question: "What if I cannot find a product?",
    answer: "Use AI search suggestions in the shop or ask the assistant for product discovery help.",
  },
  {
    question: "Do you provide medical advice?",
    answer: "No. The AI assistant is for store support only and will direct medical questions to a licensed professional.",
  },
];

export default function HelpPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
          Help Center
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-5xl">
          Ask MediStore AI for quick support.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          This help center combines a Groq-powered assistant with simple FAQ answers for shopping, checkout, orders, and support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question} className="border border-border/70 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SupportAssistant />
    </section>
  );
}
