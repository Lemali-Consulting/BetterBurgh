"use client";

import dynamic from "next/dynamic";
import type { Service, Locale } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-slate-100 text-slate-400">
      Loading map...
    </div>
  ),
});

export default function MapPageClient({
  services,
  locale,
}: {
  services: Service[];
  locale: Locale;
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <MapView services={services} locale={locale} height="100%" />
    </div>
  );
}
