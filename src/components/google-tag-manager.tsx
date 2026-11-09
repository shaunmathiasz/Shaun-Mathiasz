"use client";
import Script from "next/script";
import { gtmBootstrap } from "@/lib/gtm-bootstrap";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsUrlAllowed } from "@/lib/analytics-policy";

declare global {
  interface Window { dataLayer?: unknown[]; __sdmGtmStarted?: boolean; __sdmGtmLastPath?: string; }
}
export function updateGoogleConsent(accepted: boolean) {
  if (!window.__sdmGtmStarted) return;
  // Google's consent queue uses arguments objects, not a separate gtag.js install.
  const consent: (...args: unknown[]) => void = function () {
    window.dataLayer?.push(arguments);
  };
  consent("consent", "update", { analytics_storage: accepted ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
}
export function trackPublicPage() {
  if (!window.__sdmGtmStarted || !analyticsUrlAllowed(new URL(location.href)) || window.__sdmGtmLastPath === location.pathname) return;
  window.__sdmGtmLastPath = location.pathname;
  window.dataLayer?.push({ event: "portfolio_page_view", page_path: location.pathname, page_location: location.origin + location.pathname });
}
export function GoogleTagManager({ id }: { id: string }) {
  const pathname = usePathname();
  useEffect(() => { trackPublicPage(); }, [pathname]);
  return <Script id="google-tag-manager-init" strategy="afterInteractive" onReady={trackPublicPage}>{gtmBootstrap(id)}</Script>;
}
