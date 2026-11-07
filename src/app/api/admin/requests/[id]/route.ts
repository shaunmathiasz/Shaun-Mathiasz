import { randomUUID } from "node:crypto";
import { z } from "zod";
import { endpoint, body, owner, json } from "@/lib/cv/http";
import { PortalError } from "@/lib/cv/service";
export const runtime = "nodejs";
function requestId(req: Request) {
  return z.uuid().parse(new URL(req.url).pathname.split("/").pop());
}
export const DELETE = endpoint(async (req) => {
  const s = await owner(req),
    id = requestId(req);
  await s.db.transaction(async (sql) => {
    await sql.query("DELETE FROM cv_requests WHERE id=$1 AND kind='cv'", [id]);
    await sql.query(
      "INSERT INTO cv_admin_audit(action,request_id) VALUES('Request deleted',$1)",
      [id],
    );
  });
  return json({ deleted: true });
});
export const POST = endpoint(async (req) => {
  const s = await owner(req),
    id = requestId(req);
  z.object({ action: z.literal("retry") })
    .strict()
    .parse(await body(req));
  await s.db.transaction(async (sql) => {
    const r = await sql.query(
      "UPDATE cv_notification_outbox SET id=CASE WHEN provider_id IS NULL THEN id ELSE $2::uuid END,payload_ciphertext=CASE WHEN provider_id IS NULL THEN payload_ciphertext ELSE NULL END,provider_id=NULL,status='queued',attempts=0,next_attempt_at=now(),last_error=NULL WHERE request_id=$1 AND status='failed' AND (lease_until IS NULL OR lease_until<now()) RETURNING id",
      [id, randomUUID()],
    );
    if (!r.rowCount)
      throw new PortalError(409, "Only failed notifications can be retried.");
    await sql.query(
      "UPDATE cv_requests SET notification_status='queued' WHERE id=$1",
      [id],
    );
    await sql.query(
      "INSERT INTO cv_admin_audit(action,request_id) VALUES('Notification retry queued',$1)",
      [id],
    );
  });
  await s.worker(1);
  return json({ queued: true });
});
