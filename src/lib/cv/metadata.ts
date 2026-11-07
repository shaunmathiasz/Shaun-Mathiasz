import { isIP } from "node:net";
export type Metadata = {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  browser: string;
  os: string;
  referrer: string | null;
};
export function requestMetadata(
  headers: Headers,
  vercel = process.env.VERCEL === "1",
): Metadata {
  const clean = (v: string | null, n = 100) =>
    v?.replace(/[\x00-\x1f]/g, "").slice(0, n) || null;
  const geo = (key: string) => {
    if (!vercel) return null;
    try {
      return clean(decodeURIComponent(headers.get(key) || ""));
    } catch {
      return null;
    }
  };
  const reported = vercel
    ? headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    : null;
  const ua = headers.get("user-agent") || "";
  let referrer: string | null = null;
  try {
    const u = new URL(headers.get("referer") || "");
    if (["http:", "https:"].includes(u.protocol)) referrer = u.origin;
  } catch {}
  return {
    ip: reported && isIP(reported) ? reported : null,
    country: geo("x-vercel-ip-country"),
    region: geo("x-vercel-ip-country-region"),
    city: geo("x-vercel-ip-city"),
    device: /ipad|tablet/i.test(ua)
      ? "Tablet"
      : /mobile|android|iphone/i.test(ua)
        ? "Mobile"
        : "Desktop / unknown",
    browser: /Edg\//.test(ua)
      ? "Edge"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown",
    os: /Windows/.test(ua)
      ? "Windows"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS / iPadOS"
          : /Macintosh/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Unknown",
    referrer,
  };
}
