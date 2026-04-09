"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

export default function SearchBar({
  locale,
  initialQuery = "",
  autoFocus = false,
}: {
  locale: Locale;
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      router.push(`/${locale}/services?${params.toString()}`);
    },
    [query, locale, router]
  );

  return (
    <form onSubmit={handleSubmit} role="search" className="w-full max-w-2xl">
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          {t("search.placeholder", locale)}
        </label>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder", locale)}
          autoFocus={autoFocus}
          className="w-full px-4 py-3 pl-12 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  );
}
