import { notFound } from "next/navigation";
import { isValidLocale, t } from "@/lib/i18n";
import { getServices } from "@/lib/db";
import type { Locale } from "@/types";
import MapPageClient from "@/components/MapPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return { title: t("nav.map", locale as Locale) };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const services = getServices();

  return <MapPageClient services={services} locale={locale as Locale} />;
}
