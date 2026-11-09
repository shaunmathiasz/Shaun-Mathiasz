export const ANALYTICS_CONSENT_KEY = "sdm-analytics-consent-v1";
const publicPaths = new Set([
  "/", "/about", "/experience", "/portfolio", "/education", "/insights", "/play",
  "/portfolio/uk-outbound-product", "/portfolio/luxury-hospitality",
  "/portfolio/commercial-package-design", "/portfolio/destination-positioning",
  "/insights/a-considered-travel-product", "/insights/hospitality-and-commercial-thinking",
]);
export function isAnalyticsPublicPath(path: string) {
  return publicPaths.has(path.replace(/\/$/, "") || "/");
}
export function analyticsUrlAllowed(url: URL) {
  return url.origin === "https://www.shaunmathiasz.com" && !url.search && isAnalyticsPublicPath(url.pathname);
}
export function analyticsReferrerAllowed(referrer: string) {
  if (!referrer) return true;
  try {
    const url = new URL(referrer);
    return !url.search && !url.hash && !/^\/(request-cv|admin|api|documents|contact)(\/|$)/.test(url.pathname) && (url.hostname !== "www.shaunmathiasz.com" || isAnalyticsPublicPath(url.pathname));
  } catch { return false; }
}
export type AnalyticsConsent = "accepted" | "declined";
export function readAnalyticsConsent(raw: string | null, now = Date.now()): AnalyticsConsent | null {
  try {
    const value = JSON.parse(raw || "null");
    return value?.version === 1 && ["accepted", "declined"].includes(value.choice) &&
      Number.isFinite(value.at) && value.at <= now && now - value.at < 180 * 86400000 ? value.choice : null;
  } catch { return null; }
}
