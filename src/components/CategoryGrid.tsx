import Link from "next/link";
import type { CategoryInfo, Locale } from "@/types";

export default function CategoryGrid({
  categories,
  locale,
}: {
  categories: CategoryInfo[];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/${locale}/services?category=${cat.slug}`}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
        >
          <span className="text-2xl" aria-hidden="true">
            {cat.icon}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {locale === "es" ? cat.nameEs : cat.nameEn}
          </span>
        </Link>
      ))}
    </div>
  );
}
