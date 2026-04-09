import { notFound } from "next/navigation";
import Link from "next/link";
import { isValidLocale, t } from "@/lib/i18n";
import { getServiceBySlug, getAllServiceSlugs } from "@/lib/db";
import type { Locale } from "@/types";
import PhoneLink from "@/components/PhoneLink";
import OpenStatus from "@/components/OpenStatus";

export async function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of ["en", "es"]) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Not Found" };
  return {
    title: service.name,
    description: service.description || `${service.name} - free service in Pittsburgh, PA`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const directionsUrl = service.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(service.address)}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href={`/${locale}/services`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← {t("nav.services", locale as Locale)}
      </Link>

      <article>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{service.name}</h1>
            {service.organization && service.organization !== service.name && (
              <p className="text-slate-500 mt-1">{service.organization}</p>
            )}
          </div>
          <OpenStatus
            scheduleStructured={service.scheduleStructured}
            scheduleText={service.scheduleText}
          />
        </div>

        {service.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {service.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/services?category=${cat.slug}`}
                className="inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100"
              >
                <span aria-hidden="true">{cat.icon}</span>
                {locale === "es" ? cat.nameEs : cat.nameEn}
              </Link>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {service.phone && (
            <div className="p-4 flex items-center gap-3">
              <span className="text-slate-400" aria-hidden="true">📞</span>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {t("service.phone", locale as Locale)}
                </p>
                <PhoneLink phone={service.phone} phoneRaw={service.phoneRaw} className="text-lg" />
              </div>
            </div>
          )}

          {service.address && (
            <div className="p-4 flex items-center gap-3">
              <span className="text-slate-400" aria-hidden="true">📍</span>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {t("service.address", locale as Locale)}
                </p>
                <p className="text-slate-800">{service.address}</p>
                {service.neighborhood && (
                  <p className="text-sm text-slate-500">{service.neighborhood}</p>
                )}
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    {t("service.getDirections", locale as Locale)} →
                  </a>
                )}
              </div>
            </div>
          )}

          {service.scheduleText && (
            <div className="p-4 flex items-start gap-3">
              <span className="text-slate-400 mt-0.5" aria-hidden="true">🕐</span>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {t("service.schedule", locale as Locale)}
                </p>
                <p className="text-slate-800 whitespace-pre-line">{service.scheduleText}</p>
              </div>
            </div>
          )}

          {service.requirements && (
            <div className="p-4 flex items-start gap-3">
              <span className="text-slate-400 mt-0.5" aria-hidden="true">📋</span>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {t("service.requirements", locale as Locale)}
                </p>
                <p className="text-slate-800">{service.requirements}</p>
              </div>
            </div>
          )}

          {service.demographics.length > 0 && (
            <div className="p-4 flex items-start gap-3">
              <span className="text-slate-400 mt-0.5" aria-hidden="true">👥</span>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium">
                  {t("service.servedPopulations", locale as Locale)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {service.demographics.map((d) => (
                    <span
                      key={d.slug}
                      className="text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                    >
                      {locale === "es" ? d.nameEs : d.nameEn}
                    </span>
                  ))}
                </div>
                {service.recommendedFor && (
                  <p className="text-sm text-slate-500 mt-1">{service.recommendedFor}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {service.description && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-700 leading-relaxed">{service.description}</p>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          {t("service.lastUpdated", locale as Locale)}: {service.lastUpdated || "February 2020"} ·{" "}
          <a
            href={`mailto:betterburgh@example.com?subject=Outdated info: ${service.name}`}
            className="underline hover:text-slate-600"
          >
            {t("service.reportOutdated", locale as Locale)}
          </a>
        </p>
      </article>
    </div>
  );
}
