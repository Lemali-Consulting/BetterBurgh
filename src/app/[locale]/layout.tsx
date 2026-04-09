import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/types";
import CrisisBanner from "@/components/CrisisBanner";
import Nav from "@/components/Nav";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <CrisisBanner locale={locale as Locale} />
      <Nav locale={locale as Locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-400">
        <p>
          BetterBurgh · Data last updated February 2020 ·{" "}
          <a href="https://data.wprdc.org" className="underline hover:text-slate-600">
            Source: WPRDC
          </a>
        </p>
      </footer>
    </>
  );
}
