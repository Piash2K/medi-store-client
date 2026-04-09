"use client";

import { useState } from "react";
import { Bot, Loader2, MessageCircleMore, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const suggestedQuestions = [
  "How do I track my order?",
  "How do I contact support?",
  "What should I do if an item is out of stock?",
  "How does checkout work?",
];

export default function SupportAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m MediStore AI. Ask me about orders, checkout, shipping, account access, or support options.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmedMessage } as ChatMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history: nextMessages.slice(-6),
        }),
      });

      const data = (await response.json()) as { answer?: string };

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer || "I could not generate a response right now.",
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "The AI assistant is temporarily unavailable. Please try again shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-emerald-200/80 bg-card shadow-xl dark:border-emerald-800/60">
      <CardHeader className="space-y-3 border-b border-emerald-100/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Groq Assistant</span>
        </div>
        <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-200">Ask MediStore AI anything about your store experience</CardTitle>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Useful for order tracking, checkout, shipping, account help, and store support. It will not provide medical diagnosis.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <Button
              key={question}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(question)}
              className="rounded-full border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            >
              <MessageCircleMore className="mr-2 h-4 w-4" />
              {question}
            </Button>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/30 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/10">
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-100 bg-white text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking with Groq...
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit(draft);
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about orders, shipping, checkout, or support..."
              rows={3}
              className="min-h-28 flex-1 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm outline-none placeholder:text-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100 dark:placeholder:text-emerald-500"
            />
            <Button
              type="submit"
              disabled={isLoading || !draft.trim()}
              className="h-auto rounded-2xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </form>
        </div>

        <p className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Groq API and designed for quick support answers.
        </p>
      </CardContent>
    </Card>
  );
}
