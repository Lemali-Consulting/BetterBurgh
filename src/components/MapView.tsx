"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { Service, Locale } from "@/types";
import { BUCKETS, primaryBucket } from "@/lib/buckets";

// Pittsburgh center
const DEFAULT_CENTER: [number, number] = [40.4406, -79.9959];
const DEFAULT_ZOOM = 13;

function buildPinHtml(color: string, emoji: string): string {
  // Leaflet positions the 32x42 box via iconAnchor — don't add a CSS transform
  // on top of that or the visible pin drifts away from the popup tip.
  return `
    <div style="position:relative;width:32px;height:42px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));">
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0 C7.2 0 0 7.2 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.2 24.8 0 16 0 Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
      </svg>
      <span style="position:absolute;top:5px;left:0;width:32px;text-align:center;font-size:16px;line-height:22px;pointer-events:none;">${emoji}</span>
    </div>
  `;
}

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
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const layerGroupsRef = useRef<Record<string, LayerGroup>>({});

  const [activeBuckets, setActiveBuckets] = useState<Set<string>>(
    () => new Set(BUCKETS.map((b) => b.slug)),
  );

  // Count services per bucket for the legend.
  const countsByBucket = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const bucket of BUCKETS) counts[bucket.slug] = 0;
    for (const service of services) {
      if (!service.latitude || !service.longitude) continue;
      const bucket = primaryBucket(service.categories);
      counts[bucket.slug]++;
    }
    return counts;
  }, [services]);

  // Init map + build one layer group per bucket.
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const groups: Record<string, LayerGroup> = {};
      for (const bucket of BUCKETS) groups[bucket.slug] = L.layerGroup();
      layerGroupsRef.current = groups;

      for (const service of services) {
        if (!service.latitude || !service.longitude) continue;

        const bucket = primaryBucket(service.categories);
        const catLabel = service.categories
          .map((c) => `${c.icon} ${locale === "es" ? c.nameEs : c.nameEn}`)
          .join(", ");

        const popup = `
          <div style="max-width:250px">
            <strong><a href="/${locale}/services/${service.slug}">${service.name}</a></strong>
            ${service.address ? `<br/><small>${service.address}</small>` : ""}
            ${service.phone ? `<br/><a href="tel:${service.phoneRaw || service.phone}">${service.phone}</a>` : ""}
            ${catLabel ? `<br/><small style="color:#666">${catLabel}</small>` : ""}
          </div>
        `;

        const icon = L.divIcon({
          className: "bb-bucket-pin",
          html: buildPinHtml(bucket.color, bucket.emoji),
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -38],
        });

        L.marker([service.latitude, service.longitude], { icon })
          .bindPopup(popup)
          .addTo(groups[bucket.slug]);
      }

      // Add all active groups to the map initially.
      for (const bucket of BUCKETS) {
        if (activeBuckets.has(bucket.slug)) groups[bucket.slug].addTo(map);
      }
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupsRef.current = {};
      }
    };
    // Intentionally omit activeBuckets — the filter effect below handles it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, locale]);

  // Sync bucket visibility with activeBuckets.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layerGroupsRef.current;
    if (!map || Object.keys(groups).length === 0) return;

    for (const bucket of BUCKETS) {
      const group = groups[bucket.slug];
      if (!group) continue;
      const isOnMap = map.hasLayer(group);
      const shouldBeOn = activeBuckets.has(bucket.slug);
      if (shouldBeOn && !isOnMap) group.addTo(map);
      else if (!shouldBeOn && isOnMap) map.removeLayer(group);
    }
  }, [activeBuckets]);

  function toggleBucket(slug: string) {
    setActiveBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function setAll(on: boolean) {
    setActiveBuckets(on ? new Set(BUCKETS.map((b) => b.slug)) : new Set());
  }

  const allOn = activeBuckets.size === BUCKETS.length;
  const legendTitle = locale === "es" ? "Tipo de servicio" : "Service type";
  const showAll = locale === "es" ? "Todos" : "Show all";
  const hideAll = locale === "es" ? "Ninguno" : "Hide all";

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div style={{ position: "relative", height, width: "100%" }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} role="application" aria-label="Map of services" />

        <div
          role="group"
          aria-label={legendTitle}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "10px 12px",
            fontSize: 13,
            maxWidth: 240,
            color: "#0f172a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
            <strong style={{ fontSize: 13 }}>{legendTitle}</strong>
            <button
              type="button"
              onClick={() => setAll(!allOn)}
              style={{
                fontSize: 11,
                color: "#2563eb",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {allOn ? hideAll : showAll}
            </button>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            {BUCKETS.map((bucket) => {
              const active = activeBuckets.has(bucket.slug);
              const label = locale === "es" ? bucket.nameEs : bucket.nameEn;
              const count = countsByBucket[bucket.slug] ?? 0;
              return (
                <li key={bucket.slug}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: active ? 1 : 0.45 }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleBucket(bucket.slug)}
                      style={{ accentColor: bucket.color, margin: 0 }}
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: bucket.color,
                        color: "white",
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {bucket.emoji}
                    </span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
