import { notFound } from "next/navigation";
import { isValidLocale, t } from "@/lib/i18n";
import {
  getServices,
  getCategories,
  getDemographics,
  getNeighborhoods,
} from "@/lib/db";
import type { Locale } from "@/types";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ServiceCard from "@/components/ServiceCard";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const query = sp.q || "";
  const title = query
    ? `"${query}" - ${t("nav.services", locale as Locale)}`
    : t("nav.services", locale as Locale);
  return { title };
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const sp = await searchParams;
  const filters = {
    query: sp.q || undefined,
    category: sp.category || undefined,
    demographic: sp.demographic || undefined,
    neighborhood: sp.neighborhood || undefined,
  };

  const services = getServices(filters);
  const categories = getCategories();
  const demographics = getDemographics();
  const neighborhoods = getNeighborhoods();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 flex justify-center">
        <SearchBar locale={locale} initialQuery={filters.query || ""} />
      </div>

      <FilterPanel
        locale={locale}
        categories={categories}
        demographics={demographics}
        neighborhoods={neighborhoods}
      />

      <div className="mt-4" aria-live="polite">
        <p className="text-sm text-slate-500 mb-3">
          {services.length} {t("search.results", locale)}
        </p>
      </div>

      {services.length === 0 ? (
        <p className="text-center text-slate-500 py-12">
          {t("search.noResults", locale)}
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
