import Link from "next/link";
import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

export default function Nav({ locale }: { locale: Locale }) {
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3" aria-label="Main navigation">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="text-xl font-bold text-blue-800 hover:text-blue-900">
          BetterBurgh
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href={`/${locale}/services`} className="text-slate-600 hover:text-slate-900">
            {t("nav.services", locale)}
          </Link>
          <Link href={`/${locale}/crisis`} className="text-red-600 font-medium hover:text-red-700">
            {t("nav.crisis", locale)}
          </Link>
          <Link href={`/${locale}/map`} className="text-slate-600 hover:text-slate-900">
            {t("nav.map", locale)}
          </Link>
          <Link
            href={`/${otherLocale}`}
            className="text-slate-500 hover:text-slate-700 border border-slate-300 rounded px-2 py-1"
          >
            {t("lang.switch", locale)}
          </Link>
        </div>
      </div>
    </nav>
  );
}
