import { NextResponse } from "next/server";

import { groqChatCompletion, parseGroqJson } from "@/lib/groq";
import { getMedicines } from "@/services/medicine";

export const runtime = "nodejs";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type SupportChatBody = {
  message?: string;
  history?: ChatMessage[];
};

type RecommendationPayload = {
  summary?: string;
  recommendedMedicineNames?: string[];
};

type InventoryMedicine = {
  name: string;
  price: number;
  stock: number;
  manufacturer: string;
  category: string;
};

const medicineIntentKeywords = [
  "medicine",
  "medicines",
  "pain",
  "fever",
  "cold",
  "flu",
  "headache",
  "cough",
  "tablet",
  "capsule",
  "syrup",
  "recommend",
  "suggest",
  "need",
  "for",
];

const compactText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const isMedicineDiscoveryIntent = (message: string) => {
  const normalizedMessage = compactText(message);
  return medicineIntentKeywords.some((keyword) => normalizedMessage.includes(keyword));
};

const loadInventoryMedicines = async (): Promise<InventoryMedicine[]> => {
  const result = await getMedicines({ page: 1, limit: 1000, inStock: true }, { noStore: true });

  if (!result.success) {
    return [];
  }

  return result.data
    .filter((medicine) => !medicine.isDeleted && (medicine.stock ?? 0) > 0)
    .map((medicine) => ({
      name: medicine.name,
      price: Number(medicine.price || 0),
      stock: Number(medicine.stock || 0),
      manufacturer: medicine.manufacturer || "Unknown",
      category: medicine.category?.name || "General",
    }));
};

const formatInventoryLine = (medicine: InventoryMedicine) => {
  return `${medicine.name} | BDT ${medicine.price.toFixed(2)} | Stock ${medicine.stock} | ${medicine.manufacturer} | ${medicine.category}`;
};

const findCatalogMedicineByName = (inventory: InventoryMedicine[], name: string) => {
  const normalizedName = compactText(name);

  return inventory.find((item) => compactText(item.name) === normalizedName);
};

const getFallbackCatalogMatches = (inventory: InventoryMedicine[], message: string) => {
  const tokens = compactText(message)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)
    .slice(0, 8);

  if (tokens.length === 0) {
    return inventory.slice(0, 3);
  }

  const scored = inventory
    .map((medicine) => {
      const haystack = compactText(
        `${medicine.name} ${medicine.manufacturer} ${medicine.category}`,
      );
      const score = tokens.reduce(
        (count, token) => count + (haystack.includes(token) ? 1 : 0),
        0,
      );

      return { medicine, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.medicine);

  return scored.length > 0 ? scored : inventory.slice(0, 3);
};

const buildCatalogResponse = (summary: string | undefined, medicines: InventoryMedicine[]) => {
  if (medicines.length === 0) {
    return "I could not find matching in-stock medicines in MediStore right now. Please try another keyword or browse the Shop page.";
  }

  const lines = medicines.map(
    (medicine, index) =>
      `${index + 1}. ${medicine.name} - BDT ${medicine.price.toFixed(2)} (Stock: ${medicine.stock})`,
  );

  const safeSummary =
    summary?.trim() ||
    "Here are currently available options from MediStore that match your request:";

  return [
    safeSummary,
    "",
    ...lines,
    "",
    "I can only suggest medicines currently available in MediStore. For dosage or treatment decisions, consult a licensed professional.",
  ].join("\n");
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SupportChatBody;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message) {
      return NextResponse.json({ answer: "Please send a question to continue." }, { status: 400 });
    }

    const inventory = await loadInventoryMedicines();

    if (isMedicineDiscoveryIntent(message)) {
      if (inventory.length === 0) {
        return NextResponse.json({
          answer:
            "I cannot access the current MediStore inventory right now. Please try again soon or open the Shop page to see live availability.",
        });
      }

      const inventoryContext = inventory.slice(0, 120).map(formatInventoryLine).join("\n");

      const recommendationText = await groqChatCompletion({
        temperature: 0.2,
        maxTokens: 260,
        messages: [
          {
            role: "system",
            content:
              "You are MediStore's product recommendation assistant. Recommend medicines ONLY from the provided INVENTORY list. Never invent, guess, or modify medicine names. Return valid JSON only in this shape: {\"summary\":\"...\",\"recommendedMedicineNames\":[\"...\"]}. Include 1-3 medicine names exactly as written in INVENTORY. If no good match exists, return an empty array and a short summary.",
          },
          {
            role: "user",
            content: [
              `User request: ${message}`,
              "",
              "INVENTORY:",
              inventoryContext,
            ].join("\n"),
          },
        ],
      });

      const parsed = parseGroqJson<RecommendationPayload>(recommendationText, {
        summary: "",
        recommendedMedicineNames: [],
      });

      const recommendedMedicines = Array.from(
        new Set(parsed.recommendedMedicineNames || []),
      )
        .map((name) => findCatalogMedicineByName(inventory, name))
        .filter((medicine): medicine is InventoryMedicine => Boolean(medicine))
        .slice(0, 3);

      const safeMedicines =
        recommendedMedicines.length > 0
          ? recommendedMedicines
          : getFallbackCatalogMatches(inventory, message);

      return NextResponse.json({
        answer: buildCatalogResponse(parsed.summary, safeMedicines),
      });
    }

    const historyText = history
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");

    const inventoryNames = inventory.slice(0, 80).map((item) => item.name).join(", ");

    const responseText = await groqChatCompletion({
      temperature: 0.35,
      maxTokens: 320,
      messages: [
        {
          role: "system",
          content:
            "You are the MediStore support assistant. Answer questions about the store, orders, shipping, categories, account access, cart, checkout, and contact options. If mentioning medicines, mention only names from this catalog list and never invent names: " + inventoryNames + ". If asked for medical diagnosis, emergency advice, or prescription guidance, refuse briefly and recommend speaking with a licensed professional. Never claim to be a doctor. When appropriate, suggest using the Help page or contacting support.",
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
