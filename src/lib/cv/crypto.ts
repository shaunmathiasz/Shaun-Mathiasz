import {
  randomBytes,
  randomInt,
  createHmac,
  createHash,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
export const newToken = () => randomBytes(32).toString("base64url");
export const newOtp = () => randomInt(0, 1000000).toString().padStart(6, "0");
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const otpHash = (
  secret: string,
  id: string,
  email: string,
  generation: number,
  code: string,
) =>
  createHmac("sha256", secret)
    .update(JSON.stringify([id, email, generation, code]))
    .digest("hex");
export function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function encrypt(data: unknown, key: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);
  return [
    iv.toString("base64url"),
    Buffer.concat([
      cipher.update(JSON.stringify(data), "utf8"),
      cipher.final(),
    ]).toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
  ].join(".");
}
export function decrypt<T>(data: string | null, key: string): T | null {
  if (!data) return null;
  const [iv, body, tag] = data.split(".");
  if (
    data.split(".").length !== 3 ||
    ![iv, body, tag].every((v) => /^[A-Za-z0-9_-]+$/.test(v)) ||
    Buffer.from(iv, "base64url").length !== 12 ||
    Buffer.from(tag, "base64url").length !== 16
  )
    throw new Error("Invalid encrypted data");
  const d = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64url"),
    { authTagLength: 16 },
  );
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(
    Buffer.concat([
      d.update(Buffer.from(body, "base64url")),
      d.final(),
    ]).toString(),
  ) as T;
}
export const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"•".repeat(Math.min(5, Math.max(2, name.length - 1)))}@${domain}`;
};
export const escapeHtml = (s: unknown) =>
  String(s ?? "—").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const csvCell = (s: unknown) => {
  let v = String(s ?? "");
  if (/^(?:\s*[=+@-]|[\t\r\n])/.test(v)) v = "'" + v;
  return '"' + v.replace(/"/g, '""') + '"';
};
