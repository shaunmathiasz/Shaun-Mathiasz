import { createHmac } from "node:crypto";
import { endpoint, service, json } from "@/lib/cv/http";
import { equal } from "@/lib/cv/crypto";
import { PortalError, event } from "@/lib/cv/service";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const s = service(),
    secret = s.config.webhookSecret;
  if (!secret) throw new PortalError(503, "Webhook unavailable.");
  const id = req.headers.get("svix-id") || "",
    timestamp = req.headers.get("svix-timestamp") || "";
  if (
    !id ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 ||
    !/^\d+$/.test(timestamp)
  )
    throw new PortalError(401, "Invalid signature.");
  const raw = await req.text();
  if (raw.length > 30000) throw new PortalError(413, "Payload too large.");
  const expected = createHmac(
    "sha256",
    Buffer.from(secret.replace(/^whsec_/, ""), "base64"),
  )
    .update(`${id}.${timestamp}.${raw}`)
    .digest("base64");
  const signatures = (req.headers.get("svix-signature") || "").split(" ");
  if (
    !signatures.some((v) => v.startsWith("v1,") && equal(v.slice(3), expected))
  )
    throw new PortalError(401, "Invalid signature.");
  let payload: { type?: string; data?: { email_id?: string } };
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new PortalError(400, "Invalid event.");
  }
  if (
    !["email.delivered", "email.bounced", "email.failed"].includes(
      payload.type || "",
    ) ||
    !payload.data?.email_id
  )
    return json({ received: true });
  await s.db.transaction(async (sql) => {
    const first = await sql.query(
      "INSERT INTO cv_webhook_receipts(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id",
      [id],
    );
    if (!first.rowCount) return;
    const delivered = payload.type === "email.delivered";
    const r = await sql.query<{ request_id: string }>(
      "UPDATE cv_notification_outbox SET status=$2,last_error=$3 WHERE provider_id=$1 RETURNING request_id",
      [
        payload.data!.email_id,
        delivered ? "delivered" : "failed",
        delivered ? null : "Provider reported delivery failure",
      ],
    );
    if (r.rows[0]) {
      await sql.query(
        "UPDATE cv_requests SET notification_status=$2 WHERE id=$1",
        [r.rows[0].request_id, delivered ? "delivered" : "failed"],
      );
      await event(
        sql,
        r.rows[0].request_id,
        delivered
          ? "Owner Notification Delivered"
          : "Owner Notification Failed",
      );
    }
  });
  return json({ received: true });
}, false);
