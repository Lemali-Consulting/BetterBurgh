"use client";

import { useEffect, useRef } from "react";
import type { Service, Locale } from "@/types";

// Pittsburgh center
const DEFAULT_CENTER: [number, number] = [40.4406, -79.9959];
const DEFAULT_ZOOM = 13;

export default function MapView({
  services,
  locale,
  height = "calc(100vh - 200px)",
}: {
  services: Service[];
  locale: Locale;
  height?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      for (const service of services) {
        if (!service.latitude || !service.longitude) continue;

        const catLabel = service.categories
          .map((c) => (locale === "es" ? c.nameEs : c.nameEn))
          .join(", ");

        const popup = `
          <div style="max-width:250px">
            <strong><a href="/${locale}/services/${service.slug}">${service.name}</a></strong>
            ${service.address ? `<br/><small>${service.address}</small>` : ""}
            ${service.phone ? `<br/><a href="tel:${service.phoneRaw || service.phone}">${service.phone}</a>` : ""}
            ${catLabel ? `<br/><small style="color:#666">${catLabel}</small>` : ""}
          </div>
        `;

        L.marker([service.latitude, service.longitude])
          .bindPopup(popup)
          .addTo(map);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [services, locale]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} style={{ height, width: "100%" }} role="application" aria-label="Map of services" />
    </>
  );
}
