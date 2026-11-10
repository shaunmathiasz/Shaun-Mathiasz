import { createHmac, createHash, randomUUID } from "node:crypto";
import type { Database, Sql } from "@/lib/cv/db";
import { PortalError } from "@/lib/cv/service";
import { digital, packageName } from "@/config/digital";
import { enquirySchema } from "./schema";
import { safeAttribution } from "./events";
import { escapeHtml } from "@/lib/cv/crypto";
export type DigitalDependencies = {
  captcha(token: string): Promise<boolean>;
  send(
    to: string,
    subject: string,
    text: string,
    html: string,
    key: string,
  ): Promise<string>;
  ownerEmail: string;
  origin: string;
  secret: string;
  preview: boolean;
};
export class DigitalService {
  constructor(
    readonly db: Database,
    readonly deps: DigitalDependencies,
  ) {}
  async rate(key: string, limit: number, seconds: number, sql: Sql = this.db) {
    const bucket = createHmac("sha256", this.deps.secret)
      .update(key)
      .digest("hex");
    const r = await sql.query<{ count: number }>(
      `INSERT INTO sdm_digital.rate_limits(bucket,count,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN sdm_digital.rate_limits.expires_at<now() THEN 1 ELSE sdm_digital.rate_limits.count+1 END,expires_at=CASE WHEN sdm_digital.rate_limits.expires_at<now() THEN excluded.expires_at ELSE sdm_digital.rate_limits.expires_at END RETURNING count`,
      [bucket, seconds],
    );
    if (r.rows[0].count > limit)
      throw new PortalError(429, "Too many requests. Please try again later.");
  }
  async submit(raw: unknown, ip: string) {
    const input = enquirySchema.parse(raw);
    await this.rate("submit-ip:" + ip, 8, 3600);
    if (!(await this.deps.captcha(input.turnstileToken)))
      throw new PortalError(400, "Please complete the security check again.");
    await this.rate("submit-email:" + input.email, 4, 3600);
    const submissionHash = createHmac("sha256", this.deps.secret)
      .update(input.submissionKey)
      .digest("hex");
    const {
      turnstileToken: _token,
      submissionKey: _key,
      website: _trap,
      ...payload
    } = input;
    void _token;
    void _key;
    void _trap;
    const payloadHash = createHmac("sha256", this.deps.secret)
      .update(JSON.stringify(payload))
      .digest("hex");
    return this.db.transaction(async (sql) => {
      const id = randomUUID(),
        reference =
          "SDM-" + randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
      const price =
        digital.packages.find((p) => p.id === input.selectedPackage)?.launchPrice ??
        null;
      const r = await sql.query<{ id: string; reference: string }>(
        `INSERT INTO sdm_digital.enquiries(id,reference,submission_hash,payload_hash,full_name,business_name,business_category,email,phone,selected_package,quoted_package_price,business_location,existing_website,project_description,estimated_budget,preferred_timeline,attribution) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT(submission_hash) DO NOTHING RETURNING id,reference`,
        [
          id,
          reference,
          submissionHash,
          payloadHash,
          input.fullName,
          input.businessName,
          input.businessCategory,
          input.email,
          input.phone,
          input.selectedPackage,
          price,
          input.businessLocation,
          input.existingWebsite
            ? new URL(input.existingWebsite).origin +
              new URL(input.existingWebsite).pathname
            : "",
          input.projectDescription,
          input.estimatedBudget,
          input.preferredTimeline,
          JSON.stringify(safeAttribution(input.attribution)),
        ],
      );
      if (!r.rows[0]) {
        const prior = (
          await sql.query<{ reference: string; payload_hash: string }>(
            "SELECT reference,payload_hash FROM sdm_digital.enquiries WHERE submission_hash=$1",
            [submissionHash],
          )
        ).rows[0];
        if (!prior || prior.payload_hash !== payloadHash)
          throw new PortalError(
            409,
            "Please start a fresh enquiry for changed details.",
          );
        return { reference: prior.reference, created: false };
      }
      await sql.query(
        "INSERT INTO sdm_digital.activity(enquiry_id,action_type,actor_id) VALUES($1,'enquiry_received','customer')",
        [id],
      );
      for (const kind of ["owner", "customer"])
        await sql.query(
          "INSERT INTO sdm_digital.outbox(id,enquiry_id,kind) VALUES($1,$2,$3)",
          [randomUUID(), id, kind],
        );
      return { reference, created: true };
    });
  }
  async worker(limit = 4) {
    const jobs = (
      await this.db.query<{ id: string }>(
        `WITH jobs AS (SELECT id FROM sdm_digital.outbox WHERE state!='sent' AND attempts<8 AND next_attempt_at<=now() AND (lease_until IS NULL OR lease_until<now()) ORDER BY next_attempt_at LIMIT $1 FOR UPDATE SKIP LOCKED) UPDATE sdm_digital.outbox o SET lease_until=now()+interval '2 minutes',attempts=attempts+1 FROM jobs WHERE o.id=jobs.id RETURNING o.id`,
        [limit],
      )
    ).rows;
    for (const job of jobs) {
      try {
        const r = (
          await this.db.query<Record<string, unknown>>(
            "SELECT e.*,o.kind,o.attempts FROM sdm_digital.outbox o JOIN sdm_digital.enquiries e ON e.id=o.enquiry_id WHERE o.id=$1",
            [job.id],
          )
        ).rows[0];
        if (!r) continue;
        const owner = r.kind === "owner";
        const to = owner ? this.deps.ownerEmail : String(r.email);
        if (
          this.deps.preview &&
          to.toLowerCase() !== this.deps.ownerEmail.toLowerCase()
        )
          throw new Error("PREVIEW_RECIPIENT_RESTRICTED");
        const text = owner
          ? `New SDM Digital enquiry ${r.reference}\n\n${r.full_name}\n${r.business_name}\n${r.business_category}\n${r.email}\n${r.phone}\nPackage: ${packageName(String(r.selected_package))}\nLocation: ${r.business_location}\nWebsite: ${r.existing_website}\nBudget: ${r.estimated_budget}\nTimeline: ${r.preferred_timeline}\n\n${r.project_description}\n\nSubmitted: ${new Date(String(r.created_at)).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })} (Asia/Colombo)\nPrivate dashboard: ${this.deps.origin}/admin/digital-solutions`
          : `Hello ${r.full_name},\n\nThank you for contacting SDM Digital. Your enquiry has been received.\nReference: ${r.reference}\nPackage: ${packageName(String(r.selected_package))}\n\nI will review your requirements and contact you to discuss scope and next steps. No project or payment obligation is created by this enquiry.\n\nKind regards,\nShaun Denver Mathiasz\nSDM Digital\n${digital.email}`;
        const html = `<!doctype html><html lang="en"><body style="background:#080f1d;color:#f5f2ea;font-family:Arial,sans-serif;padding:32px"><div style="max-width:600px;margin:auto"><img src="${this.deps.origin}/branding/sdm-digital/sdm_digital_logo_horizontal.webp" alt="SDM Digital" width="300"><h1 style="color:#d2b88a;font-size:24px">${owner ? "A new conversation." : "Your project starts with a conversation."}</h1><div style="white-space:pre-wrap;line-height:1.7">${escapeHtml(text)}</div></div></body></html>`;
        const providerId = await this.deps.send(
          to,
          owner
            ? `SDM Digital enquiry — ${r.reference}`
            : `Your SDM Digital enquiry — ${r.reference}`,
          text,
          html,
          "sdm-digital-" + job.id,
        );
        await this.db.query(
          "UPDATE sdm_digital.outbox SET state='sent',provider_id=$2,sent_at=now(),lease_until=NULL WHERE id=$1",
          [job.id, providerId],
        );
      } catch {
        await this.db.query(
          "UPDATE sdm_digital.outbox SET state='failed',lease_until=NULL,next_attempt_at=now()+least(power(2,attempts)::int*interval '5 minutes',interval '1 day') WHERE id=$1",
          [job.id],
        );
      }
    }
    return jobs.length;
  }
  async cleanup() {
    await this.db.transaction(async (sql) => {
      await sql.query(
        "INSERT INTO sdm_digital.activity(action_type,note) VALUES('retention_cleanup','Scheduled retention cleanup')",
      );
      await sql.query(
        "DELETE FROM sdm_digital.enquiries WHERE created_at<now()-interval '365 days'",
      );
      await sql.query(
        "DELETE FROM sdm_digital.events WHERE created_at<now()-interval '90 days'",
      );
      await sql.query(
        "DELETE FROM sdm_digital.rate_limits WHERE expires_at<now()",
      );
      await sql.query(
        "DELETE FROM sdm_digital.activity WHERE enquiry_id IS NULL AND created_at<now()-interval '365 days'",
      );
    });
  }
}
export const csvCell = (v: unknown) =>
  '"' +
  (v instanceof Date ? v.toISOString() : String(v ?? ""))
    .replace(/^[\s]*[=+@-]/, (s) => "'" + s)
    .replaceAll('"', '""') +
  '"';
export const opaqueDigest = (v: string) =>
  createHash("sha256").update(v).digest("hex");
