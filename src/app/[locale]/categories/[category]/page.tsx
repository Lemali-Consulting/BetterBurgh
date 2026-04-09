import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isValidLocale(locale)) notFound();

  // Redirect to services page with category filter
  redirect(`/${locale}/services?category=${category}`);
}
