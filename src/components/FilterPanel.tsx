"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { CategoryInfo, DemographicInfo, Locale } from "@/types";
import { t } from "@/lib/i18n";

export default function FilterPanel({
  locale,
  categories,
  demographics,
  neighborhoods,
}: {
  locale: Locale;
  categories: CategoryInfo[];
  demographics: DemographicInfo[];
  neighborhoods: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentDemographic = searchParams.get("demographic") || "";
  const currentNeighborhood = searchParams.get("neighborhood") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/${locale}/services?${params.toString()}`);
    },
    [searchParams, locale, router]
  );

  const clearAll = useCallback(() => {
    router.push(`/${locale}/services`);
  }, [locale, router]);

  const hasFilters = currentCategory || currentDemographic || currentNeighborhood || searchParams.get("q");

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
        aria-label={t("filter.category", locale)}
      >
        <option value="">{t("filter.allCategories", locale)}</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.icon} {locale === "es" ? cat.nameEs : cat.nameEn}
          </option>
        ))}
      </select>

      <select
        value={currentDemographic}
        onChange={(e) => updateFilter("demographic", e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
        aria-label={t("filter.demographic", locale)}
      >
        <option value="">{t("filter.allDemographics", locale)}</option>
        {demographics.map((d) => (
          <option key={d.slug} value={d.slug}>
            {locale === "es" ? d.nameEs : d.nameEn}
          </option>
        ))}
      </select>

      <select
        value={currentNeighborhood}
        onChange={(e) => updateFilter("neighborhood", e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
        aria-label={t("filter.neighborhood", locale)}
      >
        <option value="">{t("filter.allNeighborhoods", locale)}</option>
        {neighborhoods.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          {t("filter.clearAll", locale)}
        </button>
      )}
    </div>
  );
}
