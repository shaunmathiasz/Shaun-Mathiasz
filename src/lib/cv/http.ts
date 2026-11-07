import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getConfig } from "./config";
import { database } from "./db";
import { CvService, PortalError } from "./service";
import { transport } from "./transport";
export const COOKIE = "__Host-cv-session",
  ADMIN_COOKIE = "__Host-cv-owner",
  GRANT_COOKIE = "__Host-cv-grant";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: privateHeaders });
export function service() {
  const config = getConfig();
  return new CvService(
    database(config.databaseUrl, config.dataEnvironment),
    config,
    transport(config),
  );
}
export function requireOrigin(req: NextRequest) {
  const config = getConfig();
  const allowed = [config.origin];
  if (process.env.VERCEL_URL) allowed.push(`https://${process.env.VERCEL_URL}`);
  if (
    !allowed.includes(req.headers.get("origin") || "") ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new PortalError(403, "Please submit this request from the website.");
}
export async function body(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/json"))
    throw new PortalError(415, "Use a JSON request.");
  const reader = req.body?.getReader();
  if (!reader) throw new PortalError(400, "Please complete the form.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > 12000) {
        await reader.cancel();
        throw new PortalError(413, "The request is too large.");
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new PortalError(400, "The request could not be read.");
  }
}
export function cookie(
  response: NextResponse,
  name: string,
  value: string,
  maxAge = 5400,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}
export function endpoint(
  fn: (req: NextRequest) => Promise<NextResponse>,
  mutating = true,
) {
  return async (req: NextRequest) => {
    try {
      if (mutating) requireOrigin(req);
      return await fn(req);
    } catch (e) {
      if (e instanceof ZodError)
        return json(
          {
            error: "Please check the highlighted fields.",
            fields: e.flatten().fieldErrors,
          },
          400,
        );
      if (e instanceof PortalError) return json({ error: e.message }, e.status);
      // Fixed classifications only: never log SQL, provider responses or request data.
      const code = typeof e === "object" && e !== null && "code" in e
        ? String(e.code) : "";
      const message = e instanceof Error ? e.message : "";
      const safeCode = /^[0-9A-Z_]{2,48}$/.test(code) ? code
        : /^CV_[A-Z_]+$/.test(message) ? message : "UNCLASSIFIED";
      console.error("CV_ENDPOINT_FAILURE", { code: safeCode });
      return json(
        {
          error:
            "CV access is temporarily unavailable. Please contact shaun.emirates@gmail.com.",
          ...(process.env.VERCEL_ENV === "preview" ? {
            reference: safeCode,
            category: e instanceof TypeError ? "TYPE" : e instanceof RangeError ? "RANGE" : "SERVICE",
          } : {}),
        },
        503,
      );
    }
  };
}
export async function owner(req: NextRequest) {
  const s = service(),
    r = await s.require(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
  if (r.verification_status !== "verified" || r.email !== s.config.ownerEmail)
    throw new PortalError(403, "Owner authentication is required.");
  return s;
}
