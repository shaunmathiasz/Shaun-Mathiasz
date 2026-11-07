import { z } from "zod";
import type { CvService } from "./service";
export const filtersSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z
    .enum(["all", "pending", "verified", "locked", "replaced"])
    .optional()
    .default("all"),
  page: z.number().int().min(0).max(400).optional().default(0),
});
export async function overview(s: CvService, raw: unknown) {
  const f = filtersSchema.parse(raw);
  const summary = (
    await s.db.query(
      `SELECT count(*)::int AS total,count(*) FILTER(WHERE (submitted_at AT TIME ZONE 'Asia/Colombo')::date=(now() AT TIME ZONE 'Asia/Colombo')::date)::int AS today,count(*) FILTER(WHERE date_trunc('month',submitted_at AT TIME ZONE 'Asia/Colombo')=date_trunc('month',now() AT TIME ZONE 'Asia/Colombo'))::int AS month,count(*) FILTER(WHERE verification_status='pending')::int AS pending,count(*) FILTER(WHERE verification_status='verified')::int AS verified,coalesce(sum(grant_count),0)::int AS grants,count(*) FILTER(WHERE notification_status='failed')::int AS failures FROM cv_requests WHERE kind='cv'`,
    )
  ).rows[0];
  const pdf = (
    await s.db.query(
      "SELECT count(*)::int AS served FROM cv_access_events e JOIN cv_requests r ON r.id=e.request_id WHERE r.kind='cv' AND e.event_type='PDF Served'",
    )
  ).rows[0];
  const rows = (
    await s.db.query(
      `SELECT r.id,r.full_name,r.company,r.email,r.details->>'requesterType' AS requester_type,r.submitted_at,r.verification_status,r.verified_at,r.notification_status,r.grant_count,m.ip_country,(SELECT count(*)::int FROM cv_access_events e WHERE e.request_id=r.id AND e.event_type='PDF Served') AS pdf_served FROM cv_requests r LEFT JOIN cv_request_metadata m ON m.request_id=r.id WHERE r.kind='cv' AND ($1='all' OR r.verification_status=$1) AND ($2='' OR r.full_name ILIKE '%'||$2||'%' OR r.company ILIKE '%'||$2||'%' OR r.email ILIKE '%'||$2||'%') ORDER BY r.submitted_at DESC LIMIT 25 OFFSET $3`,
      [f.status, f.search, 25 * f.page],
    )
  ).rows;
  const recent = (
    await s.db.query(
      "SELECT action,created_at FROM cv_admin_audit ORDER BY created_at DESC LIMIT 8",
    )
  ).rows;
  return { summary: { ...summary, ...pdf }, rows, recent };
}
