import Link from "next/link";
import type { Service, Locale } from "@/types";
import PhoneLink from "./PhoneLink";
import OpenStatus from "./OpenStatus";

export default function ServiceCard({
  service,
  locale,
}: {
  service: Service;
  locale: Locale;
}) {
  return (
    <article className="border border-slate-200 rounded-lg bg-white p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/${locale}/services/${service.slug}`}
            className="text-base font-semibold text-slate-900 hover:text-blue-700 hover:underline line-clamp-2"
          >
            {service.name}
          </Link>
          {service.organization && service.organization !== service.name && (
            <p className="text-sm text-slate-500 mt-0.5">{service.organization}</p>
          )}
        </div>
        <OpenStatus
          scheduleStructured={service.scheduleStructured}
          scheduleText={service.scheduleText}
        />
      </div>

      <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
        {service.address && (
          <p className="flex items-start gap-1.5">
            <span aria-hidden="true" className="text-slate-400 mt-0.5">📍</span>
            <span>
              {service.address}
              {service.neighborhood && (
                <span className="text-slate-400"> · {service.neighborhood}</span>
              )}
            </span>
          </p>
        )}
        {service.phone && (
          <p className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-slate-400">📞</span>
            <PhoneLink phone={service.phone} phoneRaw={service.phoneRaw} />
          </p>
        )}
        {service.scheduleText && (
          <p className="flex items-start gap-1.5">
            <span aria-hidden="true" className="text-slate-400 mt-0.5">🕐</span>
            <span className="line-clamp-1">{service.scheduleText}</span>
          </p>
        )}
      </div>

      {service.categories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {service.categories.map((cat) => (
            <span
              key={cat.slug}
              className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
            >
              <span aria-hidden="true">{cat.icon}</span>
              {locale === "es" ? cat.nameEs : cat.nameEn}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
