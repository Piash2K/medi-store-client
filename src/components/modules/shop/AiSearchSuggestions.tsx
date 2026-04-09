"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type AiSearchSuggestionsProps = {
  query: string;
  categories: string[];
  manufacturers: string[];
  medicines: string[];
  medicineKeywords: string[];
  onSelectSuggestion: (value: string) => void;
};

const normalizeSuggestions = (items: unknown) => {
  if (!Array.isArray(items)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      items
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item): item is string => Boolean(item)),
    ),
  ).slice(0, 5);
};

export default function AiSearchSuggestions({
  query,
  categories,
  manufacturers,
  medicines,
  medicineKeywords,
  onSelectSuggestion,
}: AiSearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/ai/search-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
            categories,
            manufacturers,
            medicines,
            medicineKeywords,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = (await response.json()) as { suggestions?: unknown };
        setSuggestions(normalizeSuggestions(data.suggestions));
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, categories, manufacturers, medicines, medicineKeywords]);

  if (query.trim().length < 2 && suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-4 w-4" />
          AI Suggestions
        </div>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-300" /> : null}
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(suggestion)}
              className="h-8 rounded-full border-emerald-300 bg-white px-3 text-sm text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          Type at least two characters to get Groq-powered search suggestions.
        </p>
      )}
    </div>
  );
}
