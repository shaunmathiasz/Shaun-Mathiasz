export const PREVIEW_TIMEOUT_MS = 15000;
export const DEFAULT_PREVIEW_HEIGHT = 680;
export type EmbedPlatform = "Instagram" | "TikTok";
export type EmbedSignal = { ready: boolean; height?: number };
const parseHeight = (value: unknown): number | undefined => {
  const n =
    typeof value === "string" && /^\d{3,4}$/.test(value)
      ? Number(value)
      : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 100 && n <= 6000
    ? n
    : undefined;
};
/** Protocol shapes observed in the official Instagram/TikTok embed SDKs. No SDK code is copied.
 * Caller MUST first verify MessageEvent.origin and MessageEvent.source against this iframe.
 * A readiness signal confirms widget initialisation, not every later provider-side error.
 */
export function readEmbedSignal(
  platform: EmbedPlatform,
  raw: unknown,
  token: string,
): EmbedSignal | null {
  let data: unknown = raw;
  if (typeof raw === "string") {
    if (raw.length > 10000) return null;
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = data as Record<string, unknown>;
  if (platform === "TikTok") {
    const height = parseHeight(value.height);
    return value.signalSource === token && height !== undefined
      ? { ready: true, height }
      : null;
  }
  const details = value.details;
  if (!details || typeof details !== "object" || Array.isArray(details))
    return null;
  const height = parseHeight((details as Record<string, unknown>).height);
  if (value.type === "MOUNTED")
    return { ready: true, ...(height !== undefined ? { height } : {}) };
  if (value.type === "MEASURE" && height !== undefined)
    return { ready: false, height };
  return null;
}
export function embedGeometry(
  platform: EmbedPlatform,
  available: number,
  height: number,
) {
  const minimum = platform === "Instagram" ? 326 : 288;
  const width = Math.max(minimum, available);
  const scale = available > 0 ? Math.min(1, available / width) : 1;
  return { width, scale, height: Math.ceil(height * scale) };
}
