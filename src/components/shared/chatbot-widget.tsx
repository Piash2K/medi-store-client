"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircleMore, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const quickPrompts = [
  "Track my order",
  "How checkout works",
  "Out of stock item",
];

// Accept isOpen and setIsOpen as props for external control
type ChatbotWidgetProps = {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
};

export default function ChatbotWidget({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: ChatbotWidgetProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  const setIsOpen = externalSetIsOpen || setInternalOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi, I am MediStore AI. Ask about orders, checkout, shipping, and support.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (rawMessage: string) => {
    const message = rawMessage.trim();

    if (!message || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: message } as ChatMessage];
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
          message,
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
    <>
      {isOpen ? (
        <div className="fixed right-4 bottom-20 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl dark:border-emerald-800/60 dark:bg-emerald-950 sm:right-6 sm:bottom-24">
          <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-900/30">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Bot className="h-4 w-4" />
              <p className="text-sm font-semibold">MediStore AI Chat</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex max-h-[60vh] min-h-96 flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto bg-emerald-50/20 p-3 dark:bg-emerald-950/40">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-100 bg-white text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/70 dark:text-emerald-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/70 dark:text-emerald-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="space-y-2 border-t border-emerald-100 p-3 dark:border-emerald-900/60">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void handleSubmit(prompt)}
                    className="rounded-full border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit(draft);
                }}
              >
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="min-h-20 flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900 outline-none placeholder:text-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !draft.trim()}
                  className="h-10 rounded-xl bg-emerald-600 px-3 text-white hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open chatbot"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300 bg-emerald-600 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 sm:right-6 sm:bottom-6"
      >
        <MessageCircleMore className="h-6 w-6" />
      </button>
    </>
  );
}
