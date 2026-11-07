import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ownerPage } from "@/lib/cv/owner-page";
import { decrypt } from "@/lib/cv/crypto";
import { AdminActions } from "@/components/cv-admin";
import { PageIntro } from "@/components/ui";
import "../../../request-cv/portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private request record",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const s = await ownerPage(),
    { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const r = (
    await s.db.query("SELECT * FROM cv_requests WHERE id=$1 AND kind='cv'", [
      id,
    ])
  ).rows[0];
  if (!r) notFound();
  const m = (
    await s.db.query("SELECT * FROM cv_request_metadata WHERE request_id=$1", [
      id,
    ])
  ).rows[0];
  const events = (
    await s.db.query(
      "SELECT event_type,created_at FROM cv_access_events WHERE request_id=$1 ORDER BY created_at DESC LIMIT 100",
      [id],
    )
  ).rows;
  const outbox = (
    await s.db.query(
      "SELECT status,attempts,last_error,next_attempt_at FROM cv_notification_outbox WHERE request_id=$1",
      [id],
    )
  ).rows[0];
  const gps = decrypt<Record<string, number>>(
    m?.gps_ciphertext ?? null,
    s.config.encryptionKey,
  );
  const date = (t: Date | null) =>
    t
      ? new Date(t).toLocaleString("en-GB", {
          timeZone: "Asia/Colombo",
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not available";
  const fields: Record<string, unknown> = {
    "Request ID": id,
    Name: r.full_name,
    Organisation: r.company,
    Email: r.email,
    Verification: r.verification_status,
    "Company identity": "Not verified",
    "Submitted (Sri Lanka)": date(r.submitted_at),
    "Verified (Sri Lanka)": date(r.verified_at),
    "Access grants": r.grant_count,
    "Job title": r.details.jobTitle,
    "Requester type": r.details.requesterType,
    Opportunity: r.details.opportunity,
    "Opportunity location": r.details.opportunityLocation,
    LinkedIn: r.details.linkedinUrl,
    Message: r.details.message,
    "IP address (while retained)": decrypt<string>(
      m?.ip_ciphertext ?? null,
      s.config.encryptionKey,
    ),
    "Approximate network country": m?.ip_country,
    "Approximate network region": m?.ip_region,
    "Approximate network city": m?.ip_city,
    Device: m?.device_type,
    Browser: m?.browser,
    "Operating system": m?.operating_system,
    "Referrer origin": m?.referrer,
    "Browser location permission": m?.gps_permission_status,
    "Location recorded (Sri Lanka)": date(m?.gps_recorded_at),
    "Browser-reported latitude": gps?.latitude,
    "Browser-reported longitude": gps?.longitude,
    "Reported accuracy (metres)": gps?.accuracy,
    "Browser position timestamp": gps?.timestamp
      ? new Date(gps.timestamp).toISOString()
      : null,
    Notification: outbox?.status ?? "Not queued",
    "Notification attempts": outbox?.attempts,
    "Last notification error": outbox?.last_error,
  };
  return (
    <>
      <PageIntro
        eyebrow="PRIVATE RECORD"
        title={r.full_name}
        description={`${r.company} · Email control and company identity are distinct.`}
      />
      <section className="cv-record">
        <Link className="text-link" prefetch={false} href="/admin/cv-requests">
          ← All requests
        </Link>
        <dl>
          {Object.entries(fields).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                {v === null || v === undefined || v === ""
                  ? "Unavailable / not supplied"
                  : String(v)}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          Browser-reported coordinates are not independently verified. Network
          geolocation is approximate. PDF-serving events do not establish that
          the document was read or saved.
        </p>
        <AdminActions id={id} notification={r.notification_status} />
        <h2>Request activity</h2>
        <ol>
          {events.map((e, i) => (
            <li key={i}>
              {e.event_type} · {date(e.created_at)}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
