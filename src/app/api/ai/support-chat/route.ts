import { NextResponse } from "next/server";

import { groqChatCompletion } from "@/lib/groq";

export const runtime = "nodejs";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type SupportChatBody = {
  message?: string;
  history?: ChatMessage[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SupportChatBody;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message) {
      return NextResponse.json({ answer: "Please send a question to continue." }, { status: 400 });
    }

    const historyText = history
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");

    const responseText = await groqChatCompletion({
      temperature: 0.35,
      maxTokens: 320,
      messages: [
        {
          role: "system",
          content:
            "You are the MediStore support assistant. Answer questions about the store, orders, shipping, categories, account access, cart, checkout, and contact options. Be concise, friendly, and practical. If asked for medical diagnosis, emergency advice, or prescription guidance, refuse briefly and recommend speaking with a licensed professional. Never claim to be a doctor. When appropriate, suggest using the Help page or contacting support.",
        },
        {
          role: "user",
          content: [
            "Conversation history:",
            historyText || "(none)",
            "",
            `Current question: ${message}`,
          ].join("\n"),
        },
      ],
    });

    return NextResponse.json({ answer: responseText });
  } catch {
    return NextResponse.json(
      {
        answer:
          "I could not reach the AI assistant right now. Please try again in a moment or contact support through the Contact page.",
      },
      { status: 200 },
    );
  }
}
