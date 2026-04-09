"use client";

import { v4 as uuid } from "uuid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem("bb_session");
  if (!id) {
    id = uuid();
    sessionStorage.setItem("bb_session", id);
  }
  return id;
}

export function trackEvent(
  eventType: string,
  eventData?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const payload = {
    eventType,
    eventData,
    sessionId,
    locale: window.location.pathname.startsWith("/es") ? "es" : "en",
    referrer: document.referrer || null,
  };

  // Use sendBeacon for reliability (works even when page is closing)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/event", JSON.stringify(payload));
  } else {
    fetch("/api/event", {
      method: "POST",
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}
