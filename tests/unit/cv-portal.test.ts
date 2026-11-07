import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import { PGlite } from "@electric-sql/pglite";
import type { QueryResultRow } from "pg";
import { readFile } from "node:fs/promises";
import { CvService } from "@/lib/cv/service";
import type { Database } from "@/lib/cv/db";
import type { CvConfig } from "@/lib/cv/config";
import { configProblems } from "@/lib/cv/config";
import { applicantSchema, locationSchema } from "@/lib/cv/schema";
import {
  newToken,
  newOtp,
  otpHash,
  encrypt,
  decrypt,
  csvCell,
  escapeHtml,
} from "@/lib/cv/crypto";
import { requestMetadata } from "@/lib/cv/metadata";
import { overview } from "@/lib/cv/admin";
import { transport, type Email, type Transport } from "@/lib/cv/transport";
const config: CvConfig = {
  databaseUrl: "postgres://localhost/test",
  resendKey: "fixture",
  fromEmail: "cv@example.org",
  ownerEmail: "shaun.emirates@gmail.com",
  origin: "https://example.org",
  hmacSecret: "fixture-secret-".repeat(4),
  encryptionKey: Buffer.alloc(32, 7).toString("base64"),
  turnstileSecret: "fixture",
  turnstileSiteKey: "fixture",
  blobPath: "cv/private.pdf",
  cronSecret: "fixture-cron-".repeat(4),
  retention: { pendingHours: 24, ipDays: 30, gpsDays: 7, verifiedDays: 90 },
};
const input = {
  fullName: "Avery Example",
  company: "Example Recruitment",
  email: "avery@example.org",
  turnstileToken: "fixture",
};
const metadata = {
  ip: "203.0.113.5",
  country: "GB",
  region: "England",
  city: "London",
  device: "Desktop",
  browser: "Firefox",
  os: "Linux",
  referrer: "https://example.org",
};
let pg: PGlite,
  db: Database,
  s: CvService,
  sends: Email[],
  captcha: boolean,
  failOtp: boolean,
  failOwner: boolean,
  failPdf: boolean;
const io: Transport = {
  async send(e) {
    if ((e.owner && failOwner) || (!e.owner && failOtp))
      throw new Error("Provider failure");
    sends.push(e);
    return `provider-${sends.length}`;
  },
  async captcha() {
    return captcha;
  },
  async pdf() {
    if (failPdf) throw new Error("Unavailable");
    return new Uint8Array(Buffer.from("%PDF-1.4\nfixture"));
  },
};
const latestCode = () =>
  sends
    .filter((e) => !e.owner)
    .at(-1)!
    .text.match(/code is: (\d{6})/)![1];
async function create(email = input.email, previous?: string) {
  return s.create({ ...input, email }, metadata, previous);
}
async function verified() {
  const r = await create();
  const v = await s.verify(r.session, latestCode());
  return { ...r, ...v };
}
async function cooldown() {
  await db.query(
    "UPDATE cv_verification_challenges SET sent_at=now()-interval '61 seconds'",
  );
}
beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(
    await readFile(
      new URL("../../migrations/001_cv_portal.sql", import.meta.url),
      "utf8",
    ),
  );
  db = {
    query: async <T extends QueryResultRow>(
      text: string,
      values?: unknown[],
    ) => {
      const r = await pg.query<T>(text, values);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
    transaction: (fn) =>
      pg.transaction(async (tx) =>
        fn({
          query: async <T extends QueryResultRow>(
            text: string,
            values?: unknown[],
          ) => {
            const r = await tx.query<T>(text, values);
            return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
          },
        }),
      ),
  } as Database;
}, 30000);
beforeEach(async () => {
  await pg.exec(
    "TRUNCATE cv_requests,cv_rate_limits,cv_admin_audit,cv_webhook_receipts RESTART IDENTITY CASCADE",
  );
  sends = [];
  captcha = true;
  failOtp = false;
  failOwner = false;
  failPdf = false;
  s = new CvService(db, config, io);
});
afterAll(async () => {
  await pg.close();
});
describe("CV validation and cryptography", () => {
  it("accepts personal emails and rejects missing, excessive, malformed and honeypot fields", () => {
    expect(
      applicantSchema.parse({ ...input, email: "person@gmail.com" }).email,
    ).toBe("person@gmail.com");
    for (const change of [
      { email: "broken" },
      { company: "" },
      { fullName: "x".repeat(101) },
      { message: "x".repeat(2001) },
      { website: "spam" },
      { linkedinUrl: "javascript:alert(1)" },
    ])
      expect(applicantSchema.safeParse({ ...input, ...change }).success).toBe(
        false,
      );
  });
  it("generates six numerical digits and unpredictable tokens with bound OTP HMACs", () => {
    const a = newToken(),
      b = newToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[\w-]{43}$/);
    for (let i = 0; i < 20; i++) expect(newOtp()).toMatch(/^\d{6}$/);
    const h = otpHash(config.hmacSecret, "id", "a@b.org", 0, "000001");
    expect(h).not.toContain("000001");
    expect(h).not.toBe(
      otpHash(config.hmacSecret, "id", "a@b.org", 1, "000001"),
    );
    expect(h).not.toBe(
      otpHash(config.hmacSecret, "id", "other@b.org", 0, "000001"),
    );
  });
  it("encrypts private data with authentication and neutralises HTML and CSV injection", () => {
    const encrypted = encrypt(
      { latitude: 7.123, longitude: 80.1 },
      config.encryptionKey,
    );
    expect(encrypted).not.toContain("latitude");
    expect(decrypt(encrypted, config.encryptionKey)).toEqual({
      latitude: 7.123,
      longitude: 80.1,
    });
    expect(() =>
      decrypt(encrypted.replace(/.$/, "!"), config.encryptionKey),
    ).toThrow();
    expect(escapeHtml('<img onerror="x">')).not.toContain("<img");
    expect(csvCell('=HYPERLINK("evil")')).toContain("'=HYPERLINK");
  });
  it("ignores forwarded IP and location outside the Vercel trusted runtime", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4",
      "x-vercel-forwarded-for": "203.0.113.5",
      "x-vercel-ip-country": "GB",
      referer: "https://site.org/private?email=secret",
    });
    expect(requestMetadata(headers, false).ip).toBeNull();
    expect(requestMetadata(headers, false).country).toBeNull();
    expect(requestMetadata(headers, true).ip).toBe("203.0.113.5");
    expect(requestMetadata(headers, true).referrer).toBe("https://site.org");
    expect(
      requestMetadata(new Headers({ "x-forwarded-for": "1.2.3.4" }), true).ip,
    ).toBeNull();
  });
  it("fails closed without all infrastructure configuration", () => {
    const missing = configProblems({ NODE_ENV: "test" });
    expect(missing).toContain("RESEND_API_KEY");
    expect(missing).toContain("DATABASE_URL");
    expect(missing).toContain("BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN");
  });
});
describe("Transactional OTP lifecycle", () => {
  it("persists only protected secrets and reports provider acceptance accurately", async () => {
    const r = await create();
    expect(r.error).toBeNull();
    const row = (await db.query("SELECT * FROM cv_verification_challenges"))
      .rows[0];
    expect(row.otp_hash).not.toBe(latestCode());
    expect(row.accepted_at).toBeTruthy();
    expect((await s.status(r.session)).accepted).toBe(true);
    expect(
      (await db.query("SELECT * FROM cv_requests")).rows[0].session_hash,
    ).not.toBe(r.session);
  });
  it("does not create a request or send email when bot verification fails", async () => {
    captcha = false;
    await expect(create()).rejects.toMatchObject({ status: 400 });
    expect(sends).toHaveLength(0);
    expect((await db.query("SELECT * FROM cv_requests")).rows).toHaveLength(0);
  });
  it("does not claim delivery or allow verification when email acceptance fails", async () => {
    failOtp = true;
    const r = await create();
    expect(r.error).toMatch(/could not be accepted/);
    expect((await s.status(r.session)).accepted).toBe(false);
    await expect(s.verify(r.session, "000000")).rejects.toMatchObject({
      status: 409,
    });
    await cooldown();
    failOtp = false;
    await s.resend(r.session, metadata);
    expect((await s.status(r.session)).accepted).toBe(true);
  });
  it("verifies once and atomically grants access and queues the owner notification", async () => {
    const r = await create(),
      code = latestCode(),
      v = await s.verify(r.session, code);
    expect((await s.status(v.session)).stage).toBe("verified");
    expect(
      (await db.query("SELECT * FROM cv_access_tokens")).rows,
    ).toHaveLength(1);
    expect(
      (await db.query("SELECT * FROM cv_notification_outbox")).rows,
    ).toHaveLength(1);
    await expect(s.verify(r.session, code)).rejects.toMatchObject({
      status: 401,
    });
    await expect(s.verify(v.session, code)).rejects.toMatchObject({
      status: 409,
    });
  });
  it("serialises simultaneous correct-code redemptions", async () => {
    const r = await create(),
      code = latestCode();
    const results = await Promise.allSettled([
      s.verify(r.session, code),
      s.verify(r.session, code),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      (await db.query("SELECT * FROM cv_access_tokens")).rows,
    ).toHaveLength(1);
  });
  it("commits failed attempts and locks the fifth failure", async () => {
    const r = await create(),
      bad = latestCode() === "111111" ? "222222" : "111111";
    for (let i = 0; i < 5; i++)
      await expect(s.verify(r.session, bad)).rejects.toMatchObject({
        status: 400,
      });
    expect(
      (await db.query("SELECT failed_attempts FROM cv_verification_challenges"))
        .rows[0].failed_attempts,
    ).toBe(5);
    expect((await s.status(r.session)).locked).toBe(true);
    await expect(s.verify(r.session, latestCode())).rejects.toMatchObject({
      status: 409,
    });
  });
  it("rejects expired codes without consuming the grant budget", async () => {
    const r = await create();
    await db.query(
      "UPDATE cv_verification_challenges SET expires_at=now()-interval '1 second'",
    );
    await expect(s.verify(r.session, latestCode())).rejects.toMatchObject({
      status: 410,
    });
    expect(
      (await db.query("SELECT * FROM cv_access_tokens")).rows,
    ).toHaveLength(0);
  });
  it("enforces cooldown, invalidates the old code and limits resends to three", async () => {
    const r = await create(),
      old = latestCode();
    await expect(s.resend(r.session, metadata)).rejects.toMatchObject({
      status: 429,
    });
    await cooldown();
    await s.resend(r.session, metadata);
    const c = (await db.query("SELECT * FROM cv_verification_challenges"))
      .rows[0];
    expect(c.generation).toBe(1);
    expect(c.otp_hash).not.toBe(
      otpHash(config.hmacSecret, c.request_id, input.email, 1, old),
    );
    for (let i = 0; i < 2; i++) {
      await cooldown();
      await s.resend(r.session, metadata);
    }
    await cooldown();
    await expect(s.resend(r.session, metadata)).rejects.toMatchObject({
      status: 429,
    });
  });
  it("invalidates an old email challenge when the email changes", async () => {
    const r = await create(),
      code = latestCode(),
      next = await create("other@example.org", r.session);
    await expect(s.verify(r.session, code)).rejects.toMatchObject({
      status: 401,
    });
    expect((await s.status(next.session)).stage).toBe("verify");
    expect(
      (
        await db.query(
          "SELECT verification_status FROM cv_requests WHERE email=$1",
          [input.email],
        )
      ).rows[0].verification_status,
    ).toBe("replaced");
  });
  it("rate limits email flooding using hashes instead of raw identifiers", async () => {
    for (let i = 0; i < 6; i++) await create();
    await expect(create()).rejects.toMatchObject({ status: 429 });
    expect(sends).toHaveLength(6);
    const rows = (await db.query("SELECT bucket FROM cv_rate_limits")).rows;
    expect(JSON.stringify(rows)).not.toContain(input.email);
    expect(JSON.stringify(rows)).not.toContain(metadata.ip);
  });
});
describe("Private access, location and notifications", () => {
  it("serves only the intended verified PDF once and records a serving event", async () => {
    const r = await verified();
    const bytes = await s.download(r.session, r.grant!);
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
    await expect(s.download(r.session, r.grant!)).rejects.toMatchObject({
      status: 410,
    });
    expect(
      (
        await db.query(
          "SELECT * FROM cv_access_events WHERE event_type='PDF Served'",
        )
      ).rows,
    ).toHaveLength(1);
  });
  it("denies missing, unverified, wrong-session and expired access", async () => {
    const r = await create();
    await expect(s.download(r.session, newToken())).rejects.toMatchObject({
      status: 403,
    });
    const v = await s.verify(r.session, latestCode());
    const other = await create("other@example.org");
    await expect(s.download(other.session, v.grant!)).rejects.toMatchObject({
      status: 403,
    });
    await db.query(
      "UPDATE cv_access_tokens SET expires_at=now()-interval '1 second'",
    );
    await expect(s.download(v.session, v.grant!)).rejects.toMatchObject({
      status: 410,
    });
    await expect(s.download(undefined, v.grant!)).rejects.toMatchObject({
      status: 401,
    });
  });
  it("claims a download atomically when concurrent requests use the same grant", async () => {
    const r = await verified();
    const results = await Promise.allSettled([
      s.download(r.session, r.grant!),
      s.download(r.session, r.grant!),
    ]);
    expect(results.filter((v) => v.status === "fulfilled")).toHaveLength(1);
  });
  it("does not consume a grant if private PDF retrieval fails", async () => {
    const r = await verified();
    failPdf = true;
    await expect(s.download(r.session, r.grant!)).rejects.toMatchObject({
      status: 503,
    });
    expect(
      (await db.query("SELECT consumed_at FROM cv_access_tokens")).rows[0]
        .consumed_at,
    ).toBeNull();
    failPdf = false;
    expect(await s.download(r.session, r.grant!)).toBeTruthy();
  });
  it("allows two bounded renewals within the verified session and invalidates previous grants", async () => {
    const r = await verified();
    const next = await s.renew(r.session);
    await expect(s.download(r.session, r.grant!)).rejects.toMatchObject({
      status: 410,
    });
    await s.download(r.session, next);
    await s.renew(r.session);
    await expect(s.renew(r.session)).rejects.toMatchObject({ status: 429 });
  });
  it.each(["denied", "unsupported", "unavailable", "timeout"] as const)(
    "continues verification and download with location %s",
    async (status) => {
      const r = await create();
      await s.location(r.session, { token: r.locationToken, status });
      const v = await s.verify(r.session, latestCode());
      expect(await s.download(v.session, v.grant!)).toBeTruthy();
    },
  );
  it("accepts a late authorised position once and encrypts its coordinates", async () => {
    const r = await verified();
    await s.location(r.session, {
      token: r.locationToken,
      status: "granted",
      latitude: 6.927,
      longitude: 79.861,
      accuracy: 20,
      timestamp: Date.now(),
    });
    const m = (await db.query("SELECT * FROM cv_request_metadata")).rows[0];
    expect(m.gps_ciphertext).not.toContain("latitude");
    expect(decrypt(m.gps_ciphertext, config.encryptionKey)).toMatchObject({
      latitude: 6.927,
    });
    await expect(
      s.location(r.session, { token: r.locationToken, status: "denied" }),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("rejects stale, cross-request and unauthorised location reports", async () => {
    const a = await create(),
      b = await create("b@example.org");
    await expect(
      s.location(b.session, { token: a.locationToken, status: "denied" }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      s.location(undefined, { token: a.locationToken, status: "denied" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(
      locationSchema.safeParse({
        token: a.locationToken,
        status: "granted",
        latitude: 999,
        longitude: 0,
        accuracy: 2,
        timestamp: Date.now(),
      }).success,
    ).toBe(false);
  });
  it("persists failed notifications independently of available downloads and retries them", async () => {
    const r = await verified();
    failOwner = true;
    await s.worker(1);
    expect(
      (await db.query("SELECT notification_status FROM cv_requests")).rows[0]
        .notification_status,
    ).toBe("failed");
    expect(await s.download(r.session, r.grant!)).toBeTruthy();
    failOwner = false;
    await db.query("UPDATE cv_notification_outbox SET next_attempt_at=now()");
    await s.worker(1);
    expect(sends.filter((e) => e.owner)).toHaveLength(1);
    const msg = sends.find((e) => e.owner)!;
    expect(msg.text).toContain("Company Identity Verified: NOT VERIFIED");
    expect(msg.text).not.toContain(r.grant!);
    expect(msg.text).not.toContain("latitude");
    expect(
      (await db.query("SELECT status FROM cv_notification_outbox")).rows[0]
        .status,
    ).toBe("accepted");
  });
  it("does not send duplicate notifications after provider acceptance", async () => {
    await verified();
    await s.worker(1);
    await s.worker(1);
    expect(sends.filter((e) => e.owner)).toHaveLength(1);
  });
  it("recovers an abandoned outbox lease", async () => {
    await verified();
    await db.query(
      "UPDATE cv_notification_outbox SET status='processing',lease_until=now()-interval '1 minute'",
    );
    await s.worker(1);
    expect(sends.filter((e) => e.owner)).toHaveLength(1);
  });
});
describe("Owner access and retention", () => {
  it("requires owner email control and never grants an owner challenge CV access", async () => {
    await expect(
      s.create(input, metadata, undefined, "admin"),
    ).rejects.toMatchObject({ status: 403 });
    const r = await s.create(
      { ...input, email: config.ownerEmail },
      metadata,
      undefined,
      "admin",
    );
    await expect(s.require(r.session, "cv")).rejects.toMatchObject({
      status: 401,
    });
    const v = await s.verify(r.session, latestCode(), "admin");
    expect(v.grant).toBeNull();
    expect((await s.status(v.session, "admin")).stage).toBe("verified");
    expect(
      (await db.query("SELECT * FROM cv_access_tokens")).rows,
    ).toHaveLength(0);
  });
  it("reports distinct pending, verified, grant and PDF-serving counts", async () => {
    await create();
    const v = await verified();
    await s.download(v.session, v.grant!);
    const data = await overview(s, {});
    expect(data.summary).toMatchObject({
      total: 2,
      pending: 1,
      verified: 1,
      grants: 1,
      served: 1,
    });
    expect((await overview(s, { search: "' OR true--" })).rows).toHaveLength(0);
  });
  it("deletes expired unverified records and associated metadata/challenges", async () => {
    await create();
    await db.query(
      "UPDATE cv_requests SET submitted_at=now()-interval '25 hours'",
    );
    await s.cleanup();
    expect((await db.query("SELECT * FROM cv_requests")).rows).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM cv_request_metadata")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM cv_verification_challenges")).rows,
    ).toHaveLength(0);
  });
  it("removes precise coordinates after seven days and raw IP after thirty days", async () => {
    const r = await verified();
    await s.location(r.session, {
      token: r.locationToken,
      status: "granted",
      latitude: 6,
      longitude: 79,
      accuracy: 100,
      timestamp: Date.now(),
    });
    await db.query(
      "UPDATE cv_request_metadata SET gps_recorded_at=now()-interval '8 days'",
    );
    await db.query(
      "UPDATE cv_requests SET submitted_at=now()-interval '31 days'",
    );
    await s.cleanup();
    const m = (await db.query("SELECT * FROM cv_request_metadata")).rows[0];
    expect(m.gps_ciphertext).toBeNull();
    expect(m.ip_ciphertext).toBeNull();
    expect((await db.query("SELECT * FROM cv_requests")).rows).toHaveLength(1);
  });
  it("deletes verified records and all their activity at the retention boundary", async () => {
    await verified();
    await db.query(
      "UPDATE cv_requests SET verified_at=now()-interval '91 days'",
    );
    await s.cleanup();
    expect((await db.query("SELECT * FROM cv_requests")).rows).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM cv_notification_outbox")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM cv_access_events")).rows,
    ).toHaveLength(0);
  });
});
describe("Provider adapter", () => {
  it("validates Turnstile action and hostname, not merely success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          hostname: "evil.org",
          action: "cv-request",
        }),
      }),
    );
    expect(await transport(config).captcha("token", null)).toBe(false);
    vi.unstubAllGlobals();
  });
  it("distinguishes provider acceptance from delivery and never sends on HTTP rejection", async () => {
    const e = {
      to: input.email,
      subject: "Subject",
      text: "safe",
      html: "safe",
      key: "idempotent",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "rejected" }),
      }),
    );
    await expect(transport(config).send(e)).rejects.toThrow(
      "EMAIL_PROVIDER_REJECTED",
    );
    vi.unstubAllGlobals();
  });
});
it("freezes notification content across uncertain acceptance retries", async () => {
  await verified();
  failOwner = true;
  await s.worker(1);
  const payload = (
    await db.query("SELECT payload_ciphertext FROM cv_notification_outbox")
  ).rows[0].payload_ciphertext;
  expect(payload).toBeTruthy();
  await db.query("UPDATE cv_requests SET company=$1", [
    "Changed after first attempt",
  ]);
  await db.query("UPDATE cv_notification_outbox SET next_attempt_at=now()");
  failOwner = false;
  await s.worker(1);
  expect(sends.find((e) => e.owner)?.text).toBe(
    decrypt<Email>(payload, config.encryptionKey)!.text,
  );
});
