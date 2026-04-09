import type { Locale } from "@/types";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const translations: Record<Locale, Record<string, string>> = { en, es };

export function t(key: string, locale: Locale): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export function isValidLocale(value: string): value is Locale {
  return value === "en" || value === "es";
}
