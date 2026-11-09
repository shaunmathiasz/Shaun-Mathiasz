import { randomUUID } from "node:crypto";
import { filterSchema, leadUpdateSchema } from "./schema";
import { PortalError } from "@/lib/cv/service";
import type { DigitalService } from "./service";
export async function leadOverview(s: DigitalService, raw: unknown) {
  const f = filterSchema.parse(raw);
  const values = [f.status, f.package, f.search, f.from ?? null, f.to ?? null];
  const where = `($1='all' OR status=$1) AND ($2='all' OR selected_package=$2) AND ($3='' OR full_name ILIKE '%'||$3||'%' OR business_name ILIKE '%'||$3||'%' OR email ILIKE '%'||$3||'%' OR reference ILIKE '%'||$3||'%') AND ($4::date IS NULL OR created_at>=($4::date::timestamp AT TIME ZONE 'Asia/Colombo')) AND ($5::date IS NULL OR created_at<(($5::date+1)::timestamp AT TIME ZONE 'Asia/Colombo'))`;
  const order =
    f.sort === "oldest"
      ? "created_at ASC"
      : f.sort === "value"
        ? "proposal_amount DESC,created_at DESC"
        : "created_at DESC";
  const summary = (
    await s.db.query(
      `SELECT count(*)::int AS total,count(*) FILTER(WHERE status='NEW')::int AS new,count(*) FILTER(WHERE status='QUALIFIED')::int AS qualified,count(*) FILTER(WHERE status='PROPOSAL_SENT')::int AS proposals,count(*) FILTER(WHERE status='WON')::int AS won,count(*) FILTER(WHERE status='LOST')::int AS lost,coalesce(sum(proposal_amount),0)::text AS quoted,coalesce(sum(accepted_amount) FILTER(WHERE status='WON'),0)::text AS accepted,coalesce(sum(collected_amount),0)::text AS collected,coalesce(sum(proposal_amount) FILTER(WHERE status IN ('QUALIFIED','PROPOSAL_SENT','NEGOTIATING')),0)::text AS pipeline FROM sdm_digital.enquiries WHERE ${where}`,
      values,
    )
  ).rows[0];
  const rows = (
    await s.db.query(
      `SELECT id,reference,business_name,full_name,selected_package,status,proposal_amount,created_at FROM sdm_digital.enquiries WHERE ${where} ORDER BY ${order} LIMIT 25 OFFSET $6`,
      [...values, f.page * 25],
    )
  ).rows;
  const groups = (
    await s.db.query(
      `SELECT selected_package,business_category,status,coalesce(attribution->>'utm_source','Not attributed') AS channel,coalesce(attribution->>'utm_campaign','Not attributed') AS campaign,count(*)::int AS count FROM sdm_digital.enquiries WHERE ${where} GROUP BY selected_package,business_category,status,channel,campaign`,
      values,
    )
  ).rows;
  const trend = (
    await s.db.query(
      `SELECT to_char(created_at AT TIME ZONE 'Asia/Colombo','YYYY-MM') AS month,count(*)::int AS count FROM sdm_digital.enquiries WHERE ${where} GROUP BY month ORDER BY month`,
      values,
    )
  ).rows;
  const pending = (
    await s.db.query(
      `SELECT count(*)::int AS count FROM sdm_digital.tasks t JOIN sdm_digital.enquiries e ON e.id=t.enquiry_id WHERE t.completed_at IS NULL AND t.due_at<=now() AND ($1::date IS NULL OR e.created_at>=($1::date::timestamp AT TIME ZONE 'Asia/Colombo')) AND ($2::date IS NULL OR e.created_at<(($2::date+1)::timestamp AT TIME ZONE 'Asia/Colombo'))`,
      [f.from ?? null, f.to ?? null],
    )
  ).rows[0];
  const events = (
    await s.db.query(
      "SELECT name,count(*)::int AS count FROM sdm_digital.events WHERE ($1::date IS NULL OR created_at>=($1::date::timestamp AT TIME ZONE 'Asia/Colombo')) AND ($2::date IS NULL OR created_at<(($2::date+1)::timestamp AT TIME ZONE 'Asia/Colombo')) GROUP BY name",
      [f.from ?? null, f.to ?? null],
    )
  ).rows;
  return {
    summary,
    rows,
    groups,
    trend,
    pendingFollowups: pending.count,
    events,
    page: f.page,
    analyticsConnection:
      "First-party consented aggregates. GA4 and Vercel reporting APIs not connected.",
  };
}
export async function leadDetail(s: DigitalService, id: string) {
  const lead = (
    await s.db.query("SELECT * FROM sdm_digital.enquiries WHERE id=$1", [id])
  ).rows[0];
  if (!lead) throw new PortalError(404, "Enquiry not found.");
  const activity = (
    await s.db.query(
      "SELECT action_type,previous_status,new_status,note,created_at FROM sdm_digital.activity WHERE enquiry_id=$1 ORDER BY created_at DESC",
      [id],
    )
  ).rows;
  const tasks = (
    await s.db.query(
      "SELECT * FROM sdm_digital.tasks WHERE enquiry_id=$1 ORDER BY due_at",
      [id],
    )
  ).rows;
  const notifications = (
    await s.db.query(
      "SELECT kind,state,attempts,next_attempt_at,sent_at FROM sdm_digital.outbox WHERE enquiry_id=$1",
      [id],
    )
  ).rows;
  return { lead, activity, tasks, notifications };
}
export async function updateLead(s: DigitalService, id: string, raw: unknown) {
  const change = leadUpdateSchema.parse(raw);
  await s.db.transaction(async (sql) => {
    const lead = (
      await sql.query<{ status: string }>(
        "SELECT status FROM sdm_digital.enquiries WHERE id=$1 FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!lead) throw new PortalError(404, "Enquiry not found.");
    if (change.action === "delete") {
      await sql.query("DELETE FROM sdm_digital.enquiries WHERE id=$1", [id]);
      await sql.query(
        "INSERT INTO sdm_digital.activity(action_type,note) VALUES('lead_deleted','Owner deleted an enquiry and related personal data')",
      );
      return;
    }
    if (change.action === "status")
      await sql.query(
        "UPDATE sdm_digital.enquiries SET status=$2,updated_at=now() WHERE id=$1",
        [id, change.status],
      );
    if (change.action === "values")
      await sql.query(
        "UPDATE sdm_digital.enquiries SET proposal_amount=$2,accepted_amount=$3,collected_amount=$4,updated_at=now() WHERE id=$1",
        [
          id,
          change.proposalAmount,
          change.acceptedAmount,
          change.collectedAmount,
        ],
      );
    if (change.action === "task")
      await sql.query(
        "INSERT INTO sdm_digital.tasks(id,enquiry_id,title,due_at) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, change.title, change.dueAt],
      );
    if (change.action === "complete_task")
      await sql.query(
        "UPDATE sdm_digital.tasks SET completed_at=now() WHERE id=$1 AND enquiry_id=$2",
        [change.taskId, id],
      );
    if (change.action === "retry_notifications")
      await sql.query(
        "UPDATE sdm_digital.outbox SET attempts=0,next_attempt_at=now() WHERE enquiry_id=$1 AND state!='sent' AND (lease_until IS NULL OR lease_until<now())",
        [id],
      );
    await sql.query(
      "INSERT INTO sdm_digital.activity(enquiry_id,action_type,previous_status,new_status,note) VALUES($1,$2,$3,$4,$5)",
      [
        id,
        change.action,
        change.action === "status" ? lead.status : null,
        change.action === "status" ? change.status : null,
        change.action === "note"
          ? change.note
          : change.action === "values"
            ? JSON.stringify({
                proposal: change.proposalAmount,
                accepted: change.acceptedAmount,
                collected: change.collectedAmount,
              })
            : "",
      ],
    );
  });
}
