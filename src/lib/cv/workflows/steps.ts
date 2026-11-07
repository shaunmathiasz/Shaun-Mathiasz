import { FatalError } from "workflow";
type Environment = "production" | "preview";
async function scoped(expected: Environment) {
  const { service } = await import("../http");
  const s = service();
  if (s.config.dataEnvironment !== expected)
    throw new FatalError("CV workflow environment mismatch");
  return s;
}
export async function notificationStep(id: string, expected: Environment) {
  "use step";
  console.info("CV_WORKFLOW_STEP", {
    operation: "notification",
    environment: expected,
  });
  const s = await scoped(expected);
  await s.worker(1, id);
  const r = (
    await s.db.query<{
      status: string;
      attempts: number;
      next_attempt_at: Date;
      lease_until: Date | null;
    }>(
      "SELECT status,attempts,next_attempt_at,lease_until FROM cv_notification_outbox WHERE request_id=$1",
      [id],
    )
  ).rows[0];
  if (!r || ["accepted", "delivered"].includes(r.status) || r.attempts >= 6)
    return null;
  return new Date(
    Math.max(
      Date.now() + 1000,
      new Date(
        r.status === "processing" && r.lease_until
          ? r.lease_until
          : r.next_attempt_at,
      ).getTime(),
    ),
  ).toISOString();
}
export async function pendingDeadline(id: string, expected: Environment) {
  "use step";
  console.info("CV_WORKFLOW_STEP", {
    operation: "retention-plan",
    environment: expected,
  });
  const s = await scoped(expected);
  const r = (
    await s.db.query<{ submitted_at: Date }>(
      "SELECT submitted_at FROM cv_requests WHERE id=$1",
      [id],
    )
  ).rows[0];
  if (!r) return null;
  const created = new Date(r.submitted_at).getTime();
  return {
    pending: new Date(
      created + s.config.retention.pendingHours * 3600000,
    ).toISOString(),
    gps: new Date(
      created + s.config.retention.gpsDays * 86400000,
    ).toISOString(),
    ip: new Date(created + s.config.retention.ipDays * 86400000).toISOString(),
  };
}
export async function pendingPurgeAndPlan(id: string, expected: Environment) {
  "use step";
  const s = await scoped(expected);
  return s.db.transaction(async (sql) => {
    const r = (
      await sql.query<{ submitted_at: Date; verified_at: Date | null }>(
        "SELECT submitted_at,verified_at FROM cv_requests WHERE id=$1 FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!r) return null;
    if (!r.verified_at) {
      await sql.query("DELETE FROM cv_requests WHERE id=$1", [id]);
      return null;
    }
    const m = (
      await sql.query<{ gps_recorded_at: Date | null }>(
        "SELECT gps_recorded_at FROM cv_request_metadata WHERE request_id=$1",
        [id],
      )
    ).rows[0];
    const due = (time: Date, days: number) =>
      new Date(new Date(time).getTime() + days * 86400000).toISOString();
    return {
      gps: due(
        m?.gps_recorded_at ?? r.submitted_at,
        s.config.retention.gpsDays,
      ),
      ip: due(r.submitted_at, s.config.retention.ipDays),
      record: due(r.verified_at, s.config.retention.verifiedDays),
    };
  });
}
export async function retentionPurge(
  id: string,
  expected: Environment,
  kind: "gps" | "ip" | "record",
) {
  "use step";
  console.info("CV_WORKFLOW_STEP", {
    operation: "retention-" + kind,
    environment: expected,
  });
  const s = await scoped(expected);
  if (kind === "gps")
    await s.db.query(
      "UPDATE cv_request_metadata SET gps_ciphertext=NULL WHERE request_id=$1",
      [id],
    );
  else if (kind === "ip") {
    await s.db.query(
      "UPDATE cv_request_metadata SET ip_ciphertext=NULL WHERE request_id=$1",
      [id],
    );
    await s.db.query(
      "UPDATE cv_notification_outbox SET payload_ciphertext=NULL WHERE request_id=$1",
      [id],
    );
  } else await s.db.query("DELETE FROM cv_requests WHERE id=$1", [id]);
}
