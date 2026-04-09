"use client";

import { useState } from "react";
import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

export default function CrisisBanner({ locale }: { locale: Locale }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm"
      role="banner"
      aria-live="polite"
    >
      <a
        href={`/${locale}/crisis`}
        className="flex items-center gap-2 font-medium hover:underline"
      >
        <span aria-hidden="true">🆘</span>
        <span>{t("crisis.title", locale)}</span>
        <span className="hidden sm:inline">— {t("crisis.988.desc", locale)}</span>
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 p-1 hover:bg-red-700 rounded"
        aria-label="Dismiss crisis banner"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
