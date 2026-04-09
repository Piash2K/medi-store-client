import { NextResponse } from "next/server";

import { groqChatCompletion, parseGroqJson } from "@/lib/groq";

export const runtime = "nodejs";

type SearchSuggestionsBody = {
  query?: string;
  categories?: string[];
  manufacturers?: string[];
  medicines?: string[];
};

type SuggestionsPayload = {
  suggestions?: string[];
};

const normalizeList = (items?: string[]) => {
  return Array.from(
    new Set((items || []).map((item) => item?.trim()).filter((item): item is string => Boolean(item))),
  );
};

const buildFallbackSuggestions = (
  query: string,
  categories: string[],
  manufacturers: string[],
  medicines: string[],
) => {
  const lowerQuery = query.toLowerCase();
  const pool = [...medicines, ...categories, ...manufacturers];

  const matchedItems = pool
    .filter((item) => item.toLowerCase().includes(lowerQuery))
    .slice(0, 5);

  if (matchedItems.length > 0) {
    return matchedItems;
  }

  return [
    query,
    ...categories.slice(0, 2),
    ...manufacturers.slice(0, 2),
    ...medicines.slice(0, 1),
  ].filter(Boolean).slice(0, 5);
};

export async function POST(request: Request) {
  let query = "";
  let categories: string[] = [];
  let manufacturers: string[] = [];
  let medicines: string[] = [];

  try {
    const body = (await request.json()) as SearchSuggestionsBody;
    query = typeof body.query === "string" ? body.query.trim() : "";
    categories = normalizeList(body.categories).slice(0, 12);
    manufacturers = normalizeList(body.manufacturers).slice(0, 12);
    medicines = normalizeList(body.medicines).slice(0, 12);

    if (!query && categories.length === 0 && manufacturers.length === 0 && medicines.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const contextLines = [
      `Categories: ${categories.join(", ") || "none"}`,
      `Manufacturers: ${manufacturers.join(", ") || "none"}`,
      `Medicines: ${medicines.join(", ") || "none"}`,
    ];

    const responseText = await groqChatCompletion({
      temperature: 0.25,
      maxTokens: 180,
      messages: [
        {
          role: "system",
          content:
            "You are a search suggestion assistant for an online medicine store. Return valid JSON only in this exact shape: {\"suggestions\":[\"...\"]}. Provide 3 to 5 short search phrases. Use only product, category, and manufacturer terms from the context when possible. Avoid medical diagnosis, treatment plans, or claims. Keep suggestions concise and useful.",
        },
        {
          role: "user",
          content: [
            `Query: ${query || "(empty search)"}`,
            ...contextLines,
          ].join("\n"),
        },
      ],
    });

    const parsed = parseGroqJson<SuggestionsPayload>(responseText, { suggestions: [] });
    const suggestions = normalizeList(parsed.suggestions).slice(0, 5);

    return NextResponse.json({
      suggestions: suggestions.length > 0 ? suggestions : buildFallbackSuggestions(query, categories, manufacturers, medicines),
    });
  } catch {
    return NextResponse.json({ suggestions: buildFallbackSuggestions(query, categories, manufacturers, medicines) });
  }
}
