import { isValidLocale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { getCategories, getServiceCount } from "@/lib/db";
import type { Locale } from "@/types";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const categories = getCategories();
  const serviceCount = getServiceCount();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {t("site.title", locale as Locale)}
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          {t("site.tagline", locale as Locale)}
        </p>
        <div className="flex justify-center mb-4">
          <SearchBar locale={locale as Locale} autoFocus />
        </div>
        <p className="text-sm text-slate-400">
          {serviceCount} {t("home.serviceCount", locale as Locale)}
        </p>
      </div>

      <section aria-labelledby="categories-heading">
        <h2
          id="categories-heading"
          className="text-lg font-semibold text-slate-800 mb-4"
        >
          {t("home.categoriesHeading", locale as Locale)}
        </h2>
        <CategoryGrid categories={categories} locale={locale as Locale} />
      </section>
    </div>
  );
}
