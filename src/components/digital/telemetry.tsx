"use client";
import { useEffect } from "react";
import { eventNames, type DigitalEvent } from "@/lib/digital/events";
import {
  analyticsUrlAllowed,
  commercialConsentKey,
  readAnalyticsConsent,
} from "@/lib/analytics-policy";
const pendingGoogleEvents: Record<string, string>[] = [];
function flushGoogleEvents() {
  if (!window.__sdmGtmStarted) return;
  try { if (readAnalyticsConsent(localStorage.getItem(commercialConsentKey)) !== "accepted") { pendingGoogleEvents.length = 0; return; } } catch { return; }
  for (const event of pendingGoogleEvents.splice(0)) window.dataLayer?.push(event);
}
export function digitalEvent(
  name: DigitalEvent,
  params: {
    packageId?: "starter" | "growth" | "premium" | "custom";
    category?:
      | "Villas"
      | "Boutique Hotels"
      | "Guesthouses"
      | "Travel Agencies"
      | "Tour Operators"
      | "Restaurants"
      | "Other Businesses";
  } = {},
) {
  if (
    typeof window === "undefined" ||
    !analyticsUrlAllowed(new URL(location.href)) ||
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  )
    return;
  try {
    if (
      readAnalyticsConsent(localStorage.getItem(commercialConsentKey)) !==
      "accepted"
    )
      return;
  } catch {
    return;
  }
  const event = {
    eventId: crypto.randomUUID(),
    name,
    ...params,
    consent: true,
  };
  void fetch("/api/digital/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
  // Forward only a fixed event vocabulary and fixed package/category enums.
  // Published GTM must map these custom events to a GA4 Event tag; no SDK duplication.
  const googleEvent = { event: name, ...(params.packageId ? { package_id: params.packageId } : {}), ...(params.category ? { industry: params.category } : {}) };
  if (window.__sdmGtmStarted) window.dataLayer?.push(googleEvent);
  else if (pendingGoogleEvents.length < 100) pendingGoogleEvents.push(googleEvent);
}
export function DigitalTelemetry() {
  useEffect(() => {
    const seen = new Set<Element>();
    let viewed = false;
    let observer: IntersectionObserver | undefined;
    window.addEventListener("sdm:gtm-ready", flushGoogleEvents);
    flushGoogleEvents();
    const observe = () => {
      try {
        if (
          readAnalyticsConsent(
            localStorage.getItem(commercialConsentKey),
          ) !== "accepted"
        )
          return;
      } catch {
        return;
      }
      observer?.disconnect();
      document.querySelectorAll("[data-digital-view]").forEach(el => observer?.observe(el));
      if (!viewed) {
        digitalEvent("digital_services_page_view");
        viewed = true;
      }
    };
    observe();
    window.addEventListener("sdm:analytics-consent", observe);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          try {
            if (
              readAnalyticsConsent(
                localStorage.getItem(commercialConsentKey),
              ) !== "accepted"
            )
              continue;
          } catch {
            continue;
          }
          const name = entry.target.getAttribute(
            "data-digital-view",
          ) as DigitalEvent;
          if (eventNames.includes(name)) {
            seen.add(entry.target);
            digitalEvent(name, {
              ...(entry.target.getAttribute("data-package")
                ? {
                    packageId: entry.target.getAttribute("data-package") as
                      | "starter"
                      | "growth"
                      | "premium",
                  }
                : {}),
            });
          }
        }
      },
      { threshold: 0.3 },
    );
    observer = io;
    document
      .querySelectorAll("[data-digital-view]")
      .forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      pendingGoogleEvents.length = 0;
      window.removeEventListener("sdm:gtm-ready", flushGoogleEvents);
      window.removeEventListener("sdm:analytics-consent", observe);
    };
  }, []);
  return null;
}
