import { requestMetadata } from "@/lib/cv/metadata";
import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { getConfig } from "@/lib/cv/config";
import { database } from "@/lib/cv/db";
import { requireOrigin, json, owner } from "@/lib/cv/http";
import { PortalError } from "@/lib/cv/service";
import { DigitalService } from "./service";
export { body, json, privateHeaders } from "@/lib/cv/http";
export function digitalService() {
  const c = getConfig();
  return new DigitalService(database(c.databaseUrl, c.dataEnvironment), {
    ownerEmail: c.ownerEmail,
    origin: c.origin,
    secret: c.hmacSecret,
    preview: c.dataEnvironment === "preview",
    async captcha(token) {
      try {
        const r = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: c.turnstileSecret,
              response: token,
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        const d = await r.json();
        return (
          r.ok &&
          d.success === true &&
          d.action === "digital-enquiry" &&
          [new URL(c.origin).hostname, process.env.VERCEL_URL]
            .filter(Boolean)
            .includes(d.hostname)
        );
      } catch {
        return false;
      }
    },
    async send(to, subject, text, html, key) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify({
          from: `SDM Digital | Shaun Denver Mathiasz <${c.fromEmail}>`,
          to: [to],
          subject,
          text,
          html,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error("DIGITAL_EMAIL_FAILED");
      const d = await r.json();
      if (typeof d.id !== "string") throw new Error("DIGITAL_EMAIL_FAILED");
      return d.id;
    },
  });
}
export function digitalEndpoint(
  fn: (req: NextRequest) => Promise<Response>,
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
      return json(
        {
          error:
            "Your enquiry could not be saved just now. Please try again or email shaun.emirates@gmail.com.",
        },
        503,
      );
    }
  };
}
export async function digitalOwner(req: NextRequest) {
  await owner(req);
  return digitalService();
}

export const digitalRequestIp = (req: NextRequest) => requestMetadata(req.headers).ip || "unknown";
