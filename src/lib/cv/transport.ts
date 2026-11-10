import { get } from "@vercel/blob";
import type { CvConfig } from "./config";
import { escapeHtml } from "./crypto";
export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  key: string;
  owner?: boolean;
};
export interface Transport {
  send(email: Email): Promise<string>;
  captcha(token: string, ip: string | null): Promise<boolean>;
  pdf(): Promise<Uint8Array>;
}
export function transport(config: CvConfig): Transport {
  return {
    async send(email) {
      if (
        process.env.VERCEL_ENV === "preview" &&
        email.to.toLowerCase() !== config.ownerEmail.toLowerCase()
      )
        throw new Error("PREVIEW_EMAIL_RECIPIENT_RESTRICTED");
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": email.key,
        },
        body: JSON.stringify({
          from: `Shaun Denver Mathiasz | ${email.owner ? "CV Requests" : "CV Verification"} <${config.fromEmail}>`,
          to: [email.to],
          subject: email.subject.replace(/[\r\n]/g, " "),
          text: email.text,
          html: email.html,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error("EMAIL_PROVIDER_REJECTED");
      const result = await r.json();
      if (typeof result.id !== "string")
        throw new Error("EMAIL_PROVIDER_REJECTED");
      return result.id;
    },
    async captcha(token, ip) {
      try {
        const r = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secret: config.turnstileSecret,
              response: token,
              ...(ip ? { remoteip: ip } : {}),
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        const d = await r.json();
        return (
          r.ok &&
          d.success === true &&
          [new URL(config.origin).hostname, process.env.VERCEL_URL]
            .filter(Boolean)
            .includes(d.hostname) &&
          d.action === "cv-request"
        );
      } catch {
        return false;
      }
    },
    async pdf() {
      const result = await get(config.blobPath, {
        access: "private",
        useCache: false,
      });
      if (!result || result.statusCode !== 200)
        throw new Error("CV_FILE_UNAVAILABLE");
      if (result.blob.size > 5000000) {
        await result.stream.cancel();
        throw new Error("CV_FILE_UNAVAILABLE");
      }
      const bytes = new Uint8Array(
        await new Response(result.stream).arrayBuffer(),
      );
      if (
        bytes.length > 5000000 ||
        Buffer.from(bytes.subarray(0, 5)).toString() !== "%PDF-"
      )
        throw new Error("CV_FILE_UNAVAILABLE");
      return bytes;
    },
  };
}
export function emailLayout(title: string, body: string) {
  return `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><body style="margin:0;background:#060b16;color:#f5f2ea;font-family:Arial,sans-serif"><main style="max-width:560px;margin:auto;padding:40px 24px"><p style="color:#d2b88a;font-size:12px;letter-spacing:2px">SHAUN DENVER MATHIASZ</p><h1 style="font-size:26px;font-weight:400">${escapeHtml(title)}</h1>${body}<p style="color:#b8c2d1;font-size:13px">Kind regards,<br>Shaun Denver Mathiasz<br><a style="color:#d2b88a" href="https://www.shaunmathiasz.com/">www.shaunmathiasz.com</a></p></main></body></html>`;
}
