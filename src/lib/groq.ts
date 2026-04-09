const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqCompletionOptions = {
  messages: GroqChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

const stripCodeFences = (content: string) => {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

export const parseGroqJson = <T>(content: string, fallback: T): T => {
  try {
    const sanitized = stripCodeFences(content);
    const startIndex = sanitized.indexOf("{");
    const endIndex = sanitized.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return fallback;
    }

    return JSON.parse(sanitized.slice(startIndex, endIndex + 1)) as T;
  } catch {
    return fallback;
  }
};

export async function groqChatCompletion({ messages, temperature = 0.4, maxTokens = 256 }: GroqCompletionOptions) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || "Groq request failed");
  }

  const content = payload.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Groq returned an empty response");
  }

  return content.trim();
}
