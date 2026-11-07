import { randomUUID, createHmac } from "node:crypto";
import type { Database, Sql } from "./db";
import type { CvConfig } from "./config";
import {
  applicantSchema,
  type Applicant,
  type LocationReport,
  type RequestKind,
} from "./schema";
import {
  newToken,
  newOtp,
  tokenHash,
  otpHash,
  equal,
  encrypt,
  decrypt,
  escapeHtml,
  maskEmail,
} from "./crypto";
import type { Metadata } from "./metadata";
import { emailLayout, type Transport, type Email } from "./transport";
export class PortalError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
type Row = {
  id: string;
  kind: RequestKind;
  email: string;
  full_name: string;
  company: string;
  details: Partial<Applicant>;
  session_hash: string;
  session_expires_at: Date;
  submitted_at: Date;
  verified_at: Date | null;
  verification_status: string;
  notification_status: string;
  grant_count: number;
};
type Challenge = {
  request_id: string;
  generation: number;
  otp_hash: string;
  expires_at: Date;
  failed_attempts: number;
  resend_count: number;
  sent_at: Date;
  accepted_at: Date | null;
  consumed_at: Date | null;
};
export const event = async (sql: Sql, id: string, type: string) => {
  await sql.query(
    "INSERT INTO cv_access_events(request_id,event_type) VALUES($1,$2)",
    [id, type],
  );
};
const stale = (date: Date) => new Date(date).getTime() <= Date.now();
export class CvService {
  constructor(
    public db: Database,
    public config: CvConfig,
    public io: Transport,
  ) {}
  async session(
    token: string | undefined,
    kind: RequestKind = "cv",
    sql: Sql = this.db,
    lock = false,
  ) {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const r = await sql.query<Row>(
      `SELECT * FROM cv_requests WHERE session_hash=$1 AND kind=$2 AND session_expires_at>now()${lock ? " FOR UPDATE" : ""}`,
      [tokenHash(token), kind],
    );
    return r.rows[0] ?? null;
  }
  async require(
    token: string | undefined,
    kind: RequestKind = "cv",
    sql: Sql = this.db,
    lock = false,
  ) {
    const r = await this.session(token, kind, sql, lock);
    if (!r)
      throw new PortalError(
        401,
        "Your session has expired. Please start again.",
      );
    return r;
  }
  private key(value: string) {
    return createHmac("sha256", this.config.hmacSecret)
      .update(value)
      .digest("hex");
  }
  async limit(email: string, ip: string | null) {
    await this.db.transaction(async (sql) => {
      for (const [name, max, seconds] of [
        [`ip:${ip ?? "unknown"}`, 20, 3600],
        [`mail:${email}`, 6, 3600],
        [`daily:${ip ?? "unknown"}`, 60, 86400],
      ] as const) {
        const r = await sql.query<{ count: number }>(
          "INSERT INTO cv_rate_limits(bucket,count,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN cv_rate_limits.expires_at<now() THEN 1 ELSE cv_rate_limits.count+1 END,expires_at=CASE WHEN cv_rate_limits.expires_at<now() THEN excluded.expires_at ELSE cv_rate_limits.expires_at END RETURNING count",
          [this.key(name), seconds],
        );
        if (r.rows[0].count > max)
          throw new PortalError(
            429,
            "Too many attempts. Please try again in an hour.",
          );
      }
    });
  }
  private async sendCode(r: Row, code: string, generation: number) {
    const first = r.full_name.split(/\s+/)[0];
    const title = r.kind === "admin" ? "Owner sign-in" : "Verify your email";
    const text = `Hello ${first},\n\n${r.kind === "admin" ? "Use this code to sign in to the private CV request dashboard." : "Thank you for your interest in Shaun Denver Mathiasz’s professional profile."}\n\nYour verification code is: ${code}\n\nThis code expires in five minutes. Enter it on the ${r.kind === "admin" ? "owner sign-in" : "CV Request"} page to continue.\n\nIf you did not request this code, you can safely ignore this email.\n\nKind regards,\nShaun Denver Mathiasz\nhttps://shaun-mathiasz.vercel.app/`;
    try {
      await this.io.send({
        to: r.email,
        subject:
          r.kind === "admin"
            ? "Owner Sign-in — Shaun Denver Mathiasz"
            : "Verify Your Email — Shaun Denver Mathiasz CV Request",
        key: `cv-otp-${r.id}-${generation}`,
        text,
        html: emailLayout(
          title,
          `<p>Hello ${escapeHtml(first)},</p><p>${r.kind === "admin" ? "Use this code to sign in to your private dashboard." : "Thank you for your interest in Shaun Denver Mathiasz’s professional profile."}</p><p>Your verification code is:</p><p style="font-size:34px;letter-spacing:8px;color:#d2b88a">${code}</p><p>This code expires in five minutes. Enter it on the ${r.kind === "admin" ? "owner sign-in" : "CV Request"} page to continue.</p><p>If you did not request this code, you can safely ignore this email.</p>`,
        ),
      });
      await this.db.transaction(async (sql) => {
        const accepted = await sql.query(
          "UPDATE cv_verification_challenges SET accepted_at=now() WHERE request_id=$1 AND generation=$2 AND consumed_at IS NULL RETURNING request_id",
          [r.id, generation],
        );
        if (accepted.rowCount) await event(sql, r.id, "OTP Email Accepted");
      });
    } catch {
      await event(this.db, r.id, "OTP Email Failed");
      throw new PortalError(
        502,
        "The verification email could not be accepted. Please wait 60 seconds, then retry.",
      );
    }
  }
  async create(
    raw: unknown,
    metadata: Metadata,
    previous: string | undefined,
    kind: RequestKind = "cv",
  ) {
    const input = applicantSchema.parse(raw);
    if (kind === "admin" && input.email !== this.config.ownerEmail)
      throw new PortalError(
        403,
        "Owner sign-in is restricted to the website owner.",
      );
    await this.limit(input.email, metadata.ip);
    if (!(await this.io.captcha(input.turnstileToken, metadata.ip)))
      throw new PortalError(400, "Please complete the security check again.");
    const id = randomUUID(),
      session = newToken(),
      locationToken = newToken(),
      code = newOtp();
    const { turnstileToken: _, website: __, ...details } = input;
    void _;
    void __;
    const row = await this.db.transaction(async (sql) => {
      const old = await this.session(previous, kind, sql, true);
      if (old) {
        await sql.query(
          "UPDATE cv_requests SET verification_status=CASE WHEN verification_status='pending' THEN 'replaced' ELSE verification_status END,session_expires_at=now() WHERE id=$1",
          [old.id],
        );
        await sql.query(
          "UPDATE cv_verification_challenges SET consumed_at=now() WHERE request_id=$1",
          [old.id],
        );
        await sql.query(
          "UPDATE cv_access_tokens SET consumed_at=now() WHERE request_id=$1",
          [old.id],
        );
      }
      const r = await sql.query<Row>(
        "INSERT INTO cv_requests(id,kind,full_name,company,email,details,session_hash) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          id,
          kind,
          input.fullName,
          input.company,
          input.email,
          details,
          tokenHash(session),
        ],
      );
      await sql.query(
        "INSERT INTO cv_verification_challenges(request_id,otp_hash,expires_at) VALUES($1,$2,now()+interval '5 minutes')",
        [id, otpHash(this.config.hmacSecret, id, input.email, 0, code)],
      );
      await sql.query(
        "INSERT INTO cv_request_metadata(request_id,ip_ciphertext,ip_country,ip_region,ip_city,device_type,browser,operating_system,referrer,location_token_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          id,
          metadata.ip ? encrypt(metadata.ip, this.config.encryptionKey) : null,
          metadata.country,
          metadata.region,
          metadata.city,
          metadata.device,
          metadata.browser,
          metadata.os,
          metadata.referrer,
          tokenHash(locationToken),
        ],
      );
      await event(sql, id, "Request Created");
      return r.rows[0];
    });
    // The cookie is returned even if provider acceptance fails, so retry is scoped to this request.
    try {
      await this.sendCode(row, code, 0);
      return { session, locationToken, error: null };
    } catch (e) {
      if (e instanceof PortalError)
        return { session, locationToken, error: e.message };
      throw e;
    }
  }
  async status(token: string | undefined, kind: RequestKind = "cv") {
    const r = await this.session(token, kind);
    if (!r) return { stage: "form" as const };
    const c = (
      await this.db.query<Challenge>(
        "SELECT * FROM cv_verification_challenges WHERE request_id=$1",
        [r.id],
      )
    ).rows[0];
    return {
      stage:
        r.verification_status === "verified"
          ? ("verified" as const)
          : ("verify" as const),
      maskedEmail: maskEmail(r.email),
      expiresAt: c?.expires_at?.toISOString(),
      resendAt: new Date(new Date(c.sent_at).getTime() + 60000).toISOString(),
      resendsLeft: 3 - c.resend_count,
      accepted: !!c.accepted_at,
      locked: r.verification_status === "locked",
      grantsRemaining: Math.max(0, 3 - r.grant_count),
    };
  }
  async resend(
    token: string | undefined,
    metadata: Metadata,
    kind: RequestKind = "cv",
  ) {
    const current = await this.require(token, kind);
    await this.limit(current.email, metadata.ip);
    const code = newOtp();
    const data = await this.db.transaction(async (sql) => {
      const r = await this.require(token, kind, sql, true);
      const c = (
        await sql.query<Challenge>(
          "SELECT * FROM cv_verification_challenges WHERE request_id=$1 FOR UPDATE",
          [r.id],
        )
      ).rows[0];
      if (
        r.verification_status !== "pending" ||
        c.consumed_at ||
        c.failed_attempts >= 5
      )
        throw new PortalError(
          429,
          "This request is locked or complete. Please start a new request.",
        );
      if (Date.now() - new Date(c.sent_at).getTime() < 60000)
        throw new PortalError(429, "Please wait 60 seconds between codes.");
      if (c.resend_count >= 3)
        throw new PortalError(
          429,
          "The resend limit has been reached. Please start again later.",
        );
      const generation = c.generation + 1;
      await sql.query(
        "UPDATE cv_verification_challenges SET generation=$2,otp_hash=$3,expires_at=now()+interval '5 minutes',failed_attempts=0,resend_count=resend_count+1,sent_at=now(),accepted_at=NULL WHERE request_id=$1",
        [
          r.id,
          generation,
          otpHash(this.config.hmacSecret, r.id, r.email, generation, code),
        ],
      );
      return { r, generation };
    });
    await this.sendCode(data.r, code, data.generation);
    return this.status(token, kind);
  }
  async verify(
    token: string | undefined,
    code: string,
    kind: RequestKind = "cv",
  ) {
    const grant = newToken(),
      rotatedSession = newToken();
    const result = await this.db.transaction(async (sql) => {
      const r = await this.require(token, kind, sql, true);
      const c = (
        await sql.query<Challenge>(
          "SELECT * FROM cv_verification_challenges WHERE request_id=$1 FOR UPDATE",
          [r.id],
        )
      ).rows[0];
      if (r.verification_status !== "pending" || !c || c.consumed_at)
        throw new PortalError(
          409,
          "This code is no longer available. Please start again.",
        );
      if (c.failed_attempts >= 5)
        throw new PortalError(
          429,
          "The attempt limit has been reached. Please start again later.",
        );
      if (stale(c.expires_at))
        throw new PortalError(
          410,
          "This code has expired. Please request a new code.",
        );
      if (!c.accepted_at)
        throw new PortalError(
          409,
          "Email delivery has not been accepted. Please resend the code.",
        );
      if (
        !equal(
          c.otp_hash,
          otpHash(this.config.hmacSecret, r.id, r.email, c.generation, code),
        )
      ) {
        await sql.query(
          "UPDATE cv_verification_challenges SET failed_attempts=failed_attempts+1 WHERE request_id=$1",
          [r.id],
        );
        if (c.failed_attempts === 4)
          await sql.query(
            "UPDATE cv_requests SET verification_status='locked' WHERE id=$1",
            [r.id],
          );
        await event(sql, r.id, "OTP Verification Failed");
        return false;
      }
      await sql.query(
        "UPDATE cv_verification_challenges SET consumed_at=now() WHERE request_id=$1",
        [r.id],
      );
      await sql.query(
        "UPDATE cv_requests SET verification_status='verified',verified_at=now(),session_hash=$2,session_expires_at=now()+$3*interval '1 minute' WHERE id=$1",
        [r.id, tokenHash(rotatedSession), kind === "admin" ? 480 : 90],
      );
      await event(sql, r.id, "Email Verified");
      if (kind === "cv") {
        await this.issueGrant(sql, r.id, grant);
        await sql.query(
          "INSERT INTO cv_notification_outbox(id,request_id) VALUES($1,$2)",
          [randomUUID(), r.id],
        );
        await sql.query(
          "UPDATE cv_requests SET notification_status='queued' WHERE id=$1",
          [r.id],
        );
        await event(sql, r.id, "Owner Notification Queued");
      } else
        await sql.query(
          "INSERT INTO cv_admin_audit(action) VALUES('Owner signed in')",
        );
      return true;
    });
    if (!result)
      throw new PortalError(
        400,
        "That code is incorrect. Please check your email and try again.",
      );
    return { session: rotatedSession, grant: kind === "cv" ? grant : null };
  }
  private async issueGrant(sql: Sql, id: string, token: string) {
    await sql.query(
      "UPDATE cv_access_tokens SET consumed_at=now() WHERE request_id=$1 AND consumed_at IS NULL",
      [id],
    );
    await sql.query(
      "INSERT INTO cv_access_tokens(id,request_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')",
      [randomUUID(), id, tokenHash(token)],
    );
    await sql.query(
      "UPDATE cv_requests SET grant_count=grant_count+1 WHERE id=$1",
      [id],
    );
    await event(sql, id, "CV Access Granted");
  }
  async renew(token: string | undefined) {
    const grant = newToken();
    await this.db.transaction(async (sql) => {
      const r = await this.require(token, "cv", sql, true);
      if (r.verification_status !== "verified")
        throw new PortalError(403, "Please verify your email first.");
      if (r.grant_count >= 3)
        throw new PortalError(
          429,
          "This session’s download limit has been reached. Please start again later.",
        );
      await this.issueGrant(sql, r.id, grant);
    });
    return grant;
  }
  async download(session: string | undefined, grant: string | undefined) {
    const r = await this.require(session);
    if (
      r.verification_status !== "verified" ||
      !grant ||
      !/^[A-Za-z0-9_-]{43}$/.test(grant)
    )
      throw new PortalError(
        403,
        "Please verify your email and request download access first.",
      );
    const available = (
      await this.db.query<{ id: string }>(
        "SELECT id FROM cv_access_tokens WHERE request_id=$1 AND token_hash=$2 AND consumed_at IS NULL AND expires_at>now()",
        [r.id, tokenHash(grant)],
      )
    ).rows[0];
    if (!available)
      throw new PortalError(
        410,
        "Your download access has expired or was used. Please renew access.",
      );
    let bytes: Uint8Array;
    try {
      bytes = await this.io.pdf();
    } catch {
      throw new PortalError(
        503,
        "CV access is temporarily unavailable. Please contact shaun.emirates@gmail.com.",
      );
    }
    const served = await this.db.transaction(async (sql) => {
      const owner = await this.require(session, "cv", sql, true);
      if (owner.verification_status !== "verified") return false;
      const claimed = await sql.query(
        "UPDATE cv_access_tokens SET consumed_at=now() WHERE request_id=$1 AND token_hash=$2 AND consumed_at IS NULL AND expires_at>now() RETURNING id",
        [owner.id, tokenHash(grant)],
      );
      if (!claimed.rowCount) return false;
      await event(sql, owner.id, "PDF Served");
      return true;
    });
    if (!served)
      throw new PortalError(
        410,
        "Your download access has expired or was used. Please renew access.",
      );
    return bytes;
  }
  async location(session: string | undefined, report: LocationReport) {
    const r = await this.require(session);
    if (
      report.timestamp !== undefined &&
      (report.timestamp > Date.now() + 60000 ||
        report.timestamp < Date.now() - 600000)
    )
      throw new PortalError(400, "The reported position is too old.");
    const data =
      report.status === "granted"
        ? encrypt(
            {
              latitude: report.latitude,
              longitude: report.longitude,
              accuracy: report.accuracy,
              timestamp: report.timestamp,
            },
            this.config.encryptionKey,
          )
        : null;
    const updated = await this.db.query(
      "UPDATE cv_request_metadata SET gps_ciphertext=$3,gps_permission_status=$4,gps_recorded_at=now(),location_expires_at=now() WHERE request_id=$1 AND location_token_hash=$2 AND location_expires_at>now() AND gps_recorded_at IS NULL RETURNING request_id",
      [r.id, tokenHash(report.token), data, report.status],
    );
    if (!updated.rowCount)
      throw new PortalError(
        403,
        "This location update is unavailable. CV verification is unaffected.",
      );
  }
  async reset(token: string | undefined, kind: RequestKind = "cv") {
    await this.db.transaction(async (sql) => {
      const r = await this.session(token, kind, sql, true);
      if (!r) return;
      await sql.query(
        "UPDATE cv_requests SET session_expires_at=now(),verification_status=CASE WHEN verification_status='pending' THEN 'replaced' ELSE verification_status END WHERE id=$1",
        [r.id],
      );
      await sql.query(
        "UPDATE cv_verification_challenges SET consumed_at=now() WHERE request_id=$1",
        [r.id],
      );
      await sql.query(
        "UPDATE cv_access_tokens SET consumed_at=now() WHERE request_id=$1",
        [r.id],
      );
    });
  }
  async worker(limit = 5) {
    await this.db.transaction(async (sql) => {
      const exhausted = await sql.query<{ request_id: string }>(
        "UPDATE cv_notification_outbox SET status='failed',lease_until=NULL,last_error='Worker lease expired at retry limit' WHERE status='processing' AND lease_until<now() AND attempts>=6 RETURNING request_id",
      );
      for (const row of exhausted.rows)
        await sql.query(
          "UPDATE cv_requests SET notification_status='failed' WHERE id=$1",
          [row.request_id],
        );
    });
    for (let i = 0; i < limit; i++) {
      const claimed = await this.db.transaction(async (sql) => {
        const next = (
          await sql.query<{ id: string; request_id: string; attempts: number }>(
            "SELECT id,request_id,attempts FROM cv_notification_outbox WHERE (status IN ('queued','failed') OR (status='processing' AND lease_until<now())) AND attempts<6 AND next_attempt_at<=now() ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1",
          )
        ).rows[0];
        if (!next) return null;
        await sql.query(
          "UPDATE cv_notification_outbox SET status='processing',lease_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id=$1",
          [next.id],
        );
        return next;
      });
      if (!claimed) break;
      try {
        const r = (
          await this.db.query<Row>(
            "SELECT * FROM cv_requests WHERE id=$1 AND kind='cv' AND verification_status='verified'",
            [claimed.request_id],
          )
        ).rows[0];
        if (!r) continue;
        const m = (
          await this.db.query(
            "SELECT * FROM cv_request_metadata WHERE request_id=$1",
            [r.id],
          )
        ).rows[0];
        const served =
          (
            await this.db.query(
              "SELECT id FROM cv_access_events WHERE request_id=$1 AND event_type='PDF Served' LIMIT 1",
              [r.id],
            )
          ).rows.length > 0;
        const time = (t: Date) =>
          new Date(t).toLocaleString("en-GB", {
            timeZone: "Asia/Colombo",
            dateStyle: "medium",
            timeStyle: "short",
          });
        const fields: Record<string, unknown> = {
          "Full Name": r.full_name,
          Company: r.company,
          "Verified Email": r.email,
          "Job Title": r.details.jobTitle,
          "Requester Type": r.details.requesterType,
          Opportunity: r.details.opportunity,
          "Opportunity Location": r.details.opportunityLocation,
          LinkedIn: r.details.linkedinUrl,
          Message: r.details.message,
          "Request ID": r.id,
          "IP Address": decrypt<string>(
            m?.ip_ciphertext ?? null,
            this.config.encryptionKey,
          ),
          "Approximate City": m?.ip_city,
          Region: m?.ip_region,
          Country: m?.ip_country,
          Device: m?.device_type,
          Browser: m?.browser,
          "Submitted (Sri Lanka)": time(r.submitted_at),
          "Verified (Sri Lanka)": time(r.verified_at!),
          "Email Verified": "YES",
          "Company Identity Verified": "NOT VERIFIED",
          "CV Access": "GRANTED",
          "PDF Served": served ? "YES" : "PENDING",
        };
        const text = Object.entries(fields)
          .map(([k, v]) => `${k}: ${v || "Unavailable / not supplied"}`)
          .join("\n");
        const link = `${this.config.origin}/admin/cv-requests/${r.id}`;
        const draft: Email = {
          owner: true,
          to: this.config.ownerEmail,
          subject: `Verified CV Request — ${r.full_name} | ${r.company}`.slice(
            0,
            220,
          ),
          key: `cv-owner-${claimed.id}`,
          text: `NEW VERIFIED CV REQUEST\n\n${text}\n\nPrivate record: ${link}`,
          html: emailLayout(
            "New verified CV request",
            `<p>A professional has verified their email address and requested access to your CV.</p><dl>${Object.entries(
              fields,
            )
              .map(
                ([k, v]) =>
                  `<dt style="color:#d2b88a;margin-top:14px">${escapeHtml(k)}</dt><dd style="margin:4px 0;overflow-wrap:anywhere">${escapeHtml(v || "Unavailable / not supplied")}</dd>`,
              )
              .join(
                "",
              )}</dl><p><a style="color:#d2b88a" href="${escapeHtml(link)}">Open private record</a></p><p>Email verification confirms control of the address, not employment or company identity. A file-serving event does not prove the document was read or saved.</p>`,
          ),
        };
        const frozen = (
          await this.db.query<{ payload_ciphertext: string }>(
            "UPDATE cv_notification_outbox SET payload_ciphertext=COALESCE(payload_ciphertext,$2) WHERE id=$1 RETURNING payload_ciphertext",
            [claimed.id, encrypt(draft, this.config.encryptionKey)],
          )
        ).rows[0];
        if (!frozen) continue;
        const providerId = await this.io.send(
          decrypt<Email>(frozen.payload_ciphertext, this.config.encryptionKey)!,
        );
        await this.db.transaction(async (sql) => {
          await sql.query(
            "UPDATE cv_notification_outbox SET status='accepted',provider_id=$2,lease_until=NULL,last_error=NULL,payload_ciphertext=NULL WHERE id=$1",
            [claimed.id, providerId],
          );
          await sql.query(
            "UPDATE cv_requests SET notification_status='accepted' WHERE id=$1",
            [r.id],
          );
          await event(sql, r.id, "Owner Notification Accepted");
        });
      } catch {
        await this.db.transaction(async (sql) => {
          await sql.query(
            "UPDATE cv_notification_outbox SET status='failed',lease_until=NULL,last_error='Provider acceptance or persistence failed',next_attempt_at=now()+$2*interval '1 minute' WHERE id=$1",
            [claimed.id, Math.min(1440, 5 * 2 ** claimed.attempts)],
          );
          await sql.query(
            "UPDATE cv_requests SET notification_status='failed' WHERE id=$1",
            [claimed.request_id],
          );
          await event(sql, claimed.request_id, "Owner Notification Failed");
        });
      }
    }
  }
  async cleanup() {
    const r = this.config.retention;
    await this.db.transaction(async (sql) => {
      const expired = await sql.query<{ request_id: string }>(
        "UPDATE cv_access_tokens SET consumed_at=now() WHERE consumed_at IS NULL AND expires_at<now() RETURNING request_id",
      );
      for (const grant of expired.rows)
        await event(sql, grant.request_id, "Access Expired");
      await sql.query(
        "DELETE FROM cv_requests WHERE (verified_at IS NULL AND submitted_at<now()-$1*interval '1 hour') OR (kind='cv' AND verified_at<now()-$2*interval '1 day') OR (kind='admin' AND session_expires_at<now())",
        [r.pendingHours, r.verifiedDays],
      );
      await sql.query(
        "UPDATE cv_notification_outbox SET payload_ciphertext=NULL WHERE created_at<now()-$1*interval '1 day'",
        [r.ipDays],
      );
      await sql.query(
        "UPDATE cv_request_metadata SET ip_ciphertext=NULL WHERE request_id IN (SELECT id FROM cv_requests WHERE submitted_at<now()-$1*interval '1 day')",
        [r.ipDays],
      );
      await sql.query(
        "UPDATE cv_request_metadata SET gps_ciphertext=NULL WHERE gps_recorded_at<now()-$1*interval '1 day'",
        [r.gpsDays],
      );
      await sql.query("DELETE FROM cv_rate_limits WHERE expires_at<now()");
      await sql.query(
        "DELETE FROM cv_admin_audit WHERE created_at<now()-interval '30 days'",
      );
      await sql.query(
        "DELETE FROM cv_webhook_receipts WHERE created_at<now()-interval '7 days'",
      );
      await sql.query(
        "DELETE FROM cv_access_tokens WHERE expires_at<now()-interval '1 day'",
      );
      await sql.query(
        "UPDATE cv_verification_challenges SET otp_hash='expired' WHERE expires_at<now()",
      );
    });
  }
}
