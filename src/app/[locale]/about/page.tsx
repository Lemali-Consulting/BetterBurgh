import { notFound } from "next/navigation";
import { isValidLocale, t } from "@/lib/i18n";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return { title: t("about.title", locale as Locale) };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        {t("about.title", locale as Locale)}
      </h1>
      <div className="prose prose-slate">
        <p>{t("about.description", locale as Locale)}</p>

        <h2>Data Sources</h2>
        <p>
          Service data comes from the{" "}
          <a href="https://data.wprdc.org" target="_blank" rel="noopener noreferrer">
            Western PA Regional Data Center (WPRDC)
          </a>
          , which publishes open datasets about community services in the Pittsburgh region.
        </p>
        <p>
          The data was last updated in February 2020. Some services may have changed
          since then. If you notice outdated information, please use the &ldquo;Report
          outdated info&rdquo; link on any service page.
        </p>

        <h2>Open Source</h2>
        <p>
          BetterBurgh is a free, open-source project. The goal is to make it as easy
          as possible for people in need to find free services in Pittsburgh.
        </p>

        <h2>Privacy</h2>
        <p>
          We collect anonymous usage statistics (what people search for, which
          categories are popular) to understand how the app is used and improve it.
          We do not collect any personal information, IP addresses, or device
          fingerprints.
        </p>
      </div>
    </div>
  );
}
