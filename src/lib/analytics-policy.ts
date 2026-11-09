import { safeAttribution } from "@/lib/digital/events";
export const ANALYTICS_CONSENT_KEY = "sdm-analytics-consent-v1";
const publicPaths = new Set([
  "/services/web-development",
  "/",
  "/about",
  "/experience",
  "/portfolio",
  "/education",
  "/insights",
  "/play",
  "/portfolio/uk-outbound-product",
  "/portfolio/luxury-hospitality",
  "/portfolio/commercial-package-design",
  "/portfolio/destination-positioning",
  "/insights/a-considered-travel-product",
  "/insights/hospitality-and-commercial-thinking",
]);
export function isAnalyticsPublicPath(path: string) {
  return publicPaths.has(path.replace(/\/$/, "") || "/");
}
export function analyticsUrlAllowed(url: URL) {
  const debug = url.searchParams.get("gtm_debug");
  const safeDebugQuery =
    url.searchParams.size === 1 &&
    debug !== null &&
    /^[A-Za-z0-9_-]{1,64}$/.test(debug);
  const entries = [...url.searchParams];
  const approvedServiceCampaign =
    url.pathname.replace(/\/$/, "") === "/services/web-development" &&
    entries.length > 0 &&
    new Set(entries.map(([key]) => key)).size === entries.length &&
    entries.every(([key, value]) =>
      key === "gtm_debug"
        ? /^[A-Za-z0-9_-]{1,64}$/.test(value)
        : safeAttribution({ [key]: value })[key] === value,
    );
  return (
    url.origin === "https://www.shaunmathiasz.com" &&
    (!url.search || safeDebugQuery || approvedServiceCampaign) &&
    isAnalyticsPublicPath(url.pathname)
  );
}
export function analyticsReferrerAllowed(referrer: string) {
  if (!referrer) return true;
  try {
    const url = new URL(referrer);
    return (
      !url.search &&
      !url.hash &&
      !/^\/(request-cv|admin|api|documents|contact)(\/|$)/.test(url.pathname) &&
      (url.hostname !== "www.shaunmathiasz.com" ||
        isAnalyticsPublicPath(url.pathname))
    );
  } catch {
    return false;
  }
}
export type AnalyticsConsent = "accepted" | "declined";
export function readAnalyticsConsent(
  raw: string | null,
  now = Date.now(),
): AnalyticsConsent | null {
  try {
    const value = JSON.parse(raw || "null");
    return value?.version === 1 &&
      ["accepted", "declined"].includes(value.choice) &&
      Number.isFinite(value.at) &&
      value.at <= now &&
      now - value.at < 180 * 86400000
      ? value.choice
      : null;
  } catch {
    return null;
  }
}

/** Commercial consent is separate because the approved provider settings can detect contact details. */
export const isCommercialAnalyticsPath = (path: string) =>
  path.replace(/\/$/, "") === "/services/web-development";
export const commercialConsentKey = "sdm-digital-analytics-consent-v1";
