import { NextResponse } from "next/server";

import { groqChatCompletion, parseGroqJson } from "@/lib/groq";

export const runtime = "nodejs";

type SearchSuggestionsBody = {
  query?: string;
  categories?: string[];
  manufacturers?: string[];
  medicines?: string[];
  medicineKeywords?: string[];
};

type SuggestionsPayload = {
  suggestions?: string[];
};

const normalizeList = (items?: string[]) => {
  return Array.from(
    new Set((items || []).map((item) => item?.trim()).filter((item): item is string => Boolean(item))),
  );
};

const normalizeKey = (value: string) => {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
};

const buildAllowedValueMap = (
  categories: string[],
  manufacturers: string[],
  medicines: string[],
  medicineKeywords: string[],
) => {
  const orderedValues = [...medicines, ...categories, ...manufacturers, ...medicineKeywords]
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 200);

  const map = new Map<string, string>();

  orderedValues.forEach((value) => {
    const key = normalizeKey(value);

    if (!map.has(key)) {
      map.set(key, value);
    }
  });

  return map;
};

const pickFallbackSuggestions = (query: string, allowedValueMap: Map<string, string>) => {
  const lowerQuery = normalizeKey(query);
  const allowedValues = [...allowedValueMap.values()];

  if (!lowerQuery) {
    return allowedValues.slice(0, 5);
  }

  const startsWithMatches = allowedValues.filter((value) => normalizeKey(value).startsWith(lowerQuery));
  const containsMatches = allowedValues.filter((value) => normalizeKey(value).includes(lowerQuery));

  const merged = Array.from(new Set([...startsWithMatches, ...containsMatches]));
  return merged.slice(0, 5);
};

const enforceAllowedSuggestions = (suggestions: string[], allowedValueMap: Map<string, string>) => {
  const safeSuggestions: string[] = [];

  suggestions.forEach((suggestion) => {
    const allowed = allowedValueMap.get(normalizeKey(suggestion));

    if (allowed && !safeSuggestions.includes(allowed)) {
      safeSuggestions.push(allowed);
    }
  });

  return safeSuggestions.slice(0, 5);
};

export async function POST(request: Request) {
  let query = "";
  let categories: string[] = [];
  let manufacturers: string[] = [];
  let medicines: string[] = [];
  let medicineKeywords: string[] = [];

  try {
    const body = (await request.json()) as SearchSuggestionsBody;
    query = typeof body.query === "string" ? body.query.trim() : "";
    categories = normalizeList(body.categories).slice(0, 12);
    manufacturers = normalizeList(body.manufacturers).slice(0, 12);
    medicines = normalizeList(body.medicines).slice(0, 12);
    medicineKeywords = normalizeList(body.medicineKeywords).slice(0, 24);

    const allowedValueMap = buildAllowedValueMap(categories, manufacturers, medicines, medicineKeywords);

    if (!query && allowedValueMap.size === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const contextLines = [
      `Categories: ${categories.join(", ") || "none"}`,
      `Manufacturers: ${manufacturers.join(", ") || "none"}`,
      `Medicines: ${medicines.join(", ") || "none"}`,
      `Medicine keywords: ${medicineKeywords.join(", ") || "none"}`,
    ];

    const responseText = await groqChatCompletion({
      temperature: 0.25,
      maxTokens: 180,
      messages: [
        {
          role: "system",
          content:
            "You are a search suggestion assistant for an online medicine store. Return valid JSON only in this exact shape: {\"suggestions\":[\"...\"]}. Provide 3 to 5 short suggestions. CRITICAL: every suggestion must be exactly one item from the provided categories, manufacturers, medicines, or medicine keywords context. Never invent or rephrase any value.",
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
    const suggestions = normalizeList(parsed.suggestions).slice(0, 8);
    const safeSuggestions = enforceAllowedSuggestions(suggestions, allowedValueMap);

    return NextResponse.json({
      suggestions: safeSuggestions.length > 0 ? safeSuggestions : pickFallbackSuggestions(query, allowedValueMap),
    });
  } catch {
    const allowedValueMap = buildAllowedValueMap(categories, manufacturers, medicines, medicineKeywords);
    return NextResponse.json({ suggestions: pickFallbackSuggestions(query, allowedValueMap) });
  }
}
