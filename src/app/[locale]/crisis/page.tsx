import { notFound } from "next/navigation";
import { isValidLocale, t } from "@/lib/i18n";
import { getCrisisResources } from "@/lib/db";
import type { Locale } from "@/types";
import PhoneLink from "@/components/PhoneLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: t("crisis.title", locale as Locale),
  };
}

export default async function CrisisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const resources = getCrisisResources();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {t("crisis.title", locale as Locale)}
      </h1>
      <p className="text-slate-600 mb-6">
        {t("crisis.subtitle", locale as Locale)}
      </p>

      {/* 988 Featured prominently */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 text-center">
        <p className="text-lg font-bold text-red-800 mb-1">
          {t("crisis.988", locale as Locale)}
        </p>
        <p className="text-sm text-red-600 mb-3">
          {t("crisis.988.desc", locale as Locale)}
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="tel:988"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
            aria-label="Call 988 Suicide and Crisis Lifeline"
          >
            📞 {t("crisis.call", locale as Locale)} 988
          </a>
          <a
            href="sms:988"
            className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-red-200 transition-colors"
            aria-label="Text 988"
          >
            💬 {t("crisis.text", locale as Locale)} 988
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{resource.name}</h2>
                {resource.organization && (
                  <p className="text-sm text-slate-500">{resource.organization}</p>
                )}
                {resource.description && (
                  <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                )}
                {resource.address && (
                  <p className="text-sm text-slate-500 mt-1">📍 {resource.address}</p>
                )}
                {resource.scheduleText && (
                  <p className="text-sm text-slate-500 mt-1">🕐 {resource.scheduleText}</p>
                )}
              </div>
              {resource.phone && (
                <a
                  href={
                    resource.phoneRaw
                      ? `tel:+1${resource.phoneRaw}`
                      : `tel:${resource.phone}`
                  }
                  className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                  aria-label={`Call ${resource.name} at ${resource.phone}`}
                >
                  📞 {resource.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
