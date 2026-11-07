import { beforeAll, beforeEach, afterAll, it, expect, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import type { Database } from "@/lib/cv/db";
import type { Email, Transport } from "@/lib/cv/transport";
const deps = vi.hoisted(() => ({
  db: null as unknown as Database,
  io: null as unknown as Transport,
  jobs: [] as (() => Promise<void>)[],
}));
vi.mock("@/lib/cv/db", () => ({ database: () => deps.db }));
vi.mock("@/lib/cv/transport", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  transport: () => deps.io,
}));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  after: (fn: () => Promise<void>) => deps.jobs.push(fn),
}));
import { POST as create } from "@/app/api/cv-request/route";
import { POST as verify } from "@/app/api/cv-verify/route";
import { POST as download } from "@/app/api/cv-download/route";
import { POST as location } from "@/app/api/cv-location/route";
import { POST as adminLogin } from "@/app/api/admin/login/route";
import { POST as adminVerify } from "@/app/api/admin/verify/route";
import { POST as adminList } from "@/app/api/admin/requests/route";
import { POST as exportCsv } from "@/app/api/admin/export/route";
import { POST as webhook } from "@/app/api/cv-webhook/route";
import { COOKIE, GRANT_COOKIE, ADMIN_COOKIE } from "@/lib/cv/http";
let pg: PGlite, sends: Email[];
const origin = "https://example.org";
function req(
  path: string,
  payload: unknown = {},
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {},
) {
  return new NextRequest(origin + path, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      Cookie: Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; "),
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}
const fields = {
  fullName: "<script>not executable</script>",
  company: "=A1",
  email: "recruiter@example.org",
  turnstileToken: "fixture",
};
async function flow() {
  const r = await create(req("/api/cv-request", fields)),
    session = r.cookies.get(COOKIE)!.value,
    code = sends.at(-1)!.text.match(/code is: (\d{6})/)![1];
  return { r, session, code };
}
beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(
    await readFile(
      new URL("../../migrations/001_cv_portal.sql", import.meta.url),
      "utf8",
    ),
  );
  const wrap = (client: Pick<PGlite, "query">) => ({
    async query(text: string, values?: unknown[]) {
      const r = await client.query(text, values);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
  });
  deps.db = {
    ...wrap(pg),
    transaction: (fn: Parameters<Database["transaction"]>[0]) =>
      pg.transaction(async (tx) => fn(wrap(tx) as Database)),
  } as unknown as Database;
  const env = {
    DATABASE_URL: "postgres://localhost/test",
    RESEND_API_KEY: "fixture",
    CV_FROM_EMAIL: "cv@example.org",
    CV_APP_ORIGIN: origin,
    CV_OTP_HMAC_SECRET: "test-".repeat(10),
    CV_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 8).toString("base64"),
    TURNSTILE_SECRET_KEY: "fixture",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "fixture",
    CV_BLOB_PATHNAME: "private/cv.pdf",
    BLOB_STORE_ID: "fixture",
    CRON_SECRET: "cron-".repeat(10),
    RESEND_WEBHOOK_SECRET: "whsec_" + Buffer.alloc(32, 1).toString("base64"),
  };
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  deps.io = {
    async send(email) {
      sends.push(email);
      return `id-${sends.length}`;
    },
    async captcha() {
      return true;
    },
    async pdf() {
      return new Uint8Array(Buffer.from("%PDF-1.4\nprivate fixture"));
    },
  };
}, 30000);
beforeEach(async () => {
  await pg.exec(
    "TRUNCATE cv_requests,cv_rate_limits,cv_admin_audit,cv_webhook_receipts RESTART IDENTITY CASCADE",
  );
  sends = [];
  deps.jobs = [];
});
afterAll(async () => {
  await pg.close();
  vi.unstubAllEnvs();
});
it("runs form → OTP → private download through route handlers with secure cookies", async () => {
  const f = await flow();
  expect(f.r.status).toBe(201);
  const sc = f.r.headers.get("set-cookie");
  expect(sc).toContain("HttpOnly");
  expect(sc).toContain("Secure");
  expect(sc).toContain("SameSite=strict");
  const v = await verify(
    req("/api/cv-verify", { code: f.code }, { [COOKIE]: f.session }),
  );
  expect(v.status).toBe(200);
  const cookies = {
    [COOKIE]: v.cookies.get(COOKIE)!.value,
    [GRANT_COOKIE]: v.cookies.get(GRANT_COOKIE)!.value,
  };
  const result = await download(req("/api/cv-download", {}, cookies));
  expect(result.status).toBe(200);
  expect(result.headers.get("cache-control")).toContain("no-store");
  expect(result.headers.get("content-disposition")).toContain(
    "Shaun_Denver_Mathiasz_CV.pdf",
  );
  expect(await result.text()).toMatch(/^%PDF-/);
  expect((await download(req("/api/cv-download", {}, cookies))).status).toBe(
    410,
  );
  expect(deps.jobs).toHaveLength(1);
  await deps.jobs[0]();
  const owner = sends.find((e) => e.owner)!;
  expect(owner.html).not.toContain("<script>not executable</script>");
  expect(owner.html).toContain("&lt;script&gt;");
});
it("rejects cross-origin mutation before sending email or writing request data", async () => {
  expect(
    (
      await create(
        req("/api/cv-request", fields, {}, { Origin: "https://evil.example" }),
      )
    ).status,
  ).toBe(403);
  expect(sends).toHaveLength(0);
});
it("rejects oversized and malformed bodies without leaking details", async () => {
  const oversized = await create(
    req("/api/cv-request", { message: "x".repeat(13000) }),
  );
  expect(oversized.status).toBe(413);
  const invalid = await create(req("/api/cv-request", { email: "invalid" }));
  expect(invalid.status).toBe(400);
  expect((await invalid.json()).fields).toHaveProperty("email");
});
it("rejects unverified/private administration and exports", async () => {
  const f = await flow();
  for (const handler of [adminList, exportCsv]) {
    const r = await handler(
      req("/api/admin/requests", {}, { [ADMIN_COOKIE]: f.session }),
    );
    expect(r.status).toBe(401);
  }
  expect((await download(req("/api/cv-download"))).status).toBe(401);
});
it("authorises only verified owner sessions for list and sanitised export", async () => {
  const r = await adminLogin(
    req("/api/admin/login", {
      email: "shaun.emirates@gmail.com",
      turnstileToken: "fixture",
    }),
  );
  const pending = r.cookies.get(ADMIN_COOKIE)!.value;
  expect(
    (
      await adminList(
        req("/api/admin/requests", {}, { [ADMIN_COOKIE]: pending }),
      )
    ).status,
  ).toBe(403);
  const code = sends.at(-1)!.text.match(/code is: (\d{6})/)![1],
    v = await adminVerify(
      req("/api/admin/verify", { code }, { [ADMIN_COOKIE]: pending }),
    );
  const ownerCookie = v.cookies.get(ADMIN_COOKIE)!.value;
  await flow();
  const listed = await adminList(
    req("/api/admin/requests", {}, { [ADMIN_COOKIE]: ownerCookie }),
  );
  expect(listed.status).toBe(200);
  expect((await listed.json()).rows).toHaveLength(1);
  const csv = await exportCsv(
    req("/api/admin/export", {}, { [ADMIN_COOKIE]: ownerCookie }),
  );
  expect(csv.status).toBe(200);
  expect(await csv.text()).toContain("'=A1");
});
it("denies arbitrary location tokens even when request IDs are supplied", async () => {
  const f = await flow();
  const r = await location(
    req(
      "/api/cv-location",
      { token: "a".repeat(43), status: "denied" },
      { [COOKIE]: f.session },
    ),
  );
  expect(r.status).toBe(403);
});
it("requires a valid signed provider event before claiming delivery", async () => {
  const f = await flow();
  await verify(
    req("/api/cv-verify", { code: f.code }, { [COOKIE]: f.session }),
  );
  await deps.jobs[0]();
  const outbox = (
    await deps.db.query("SELECT provider_id FROM cv_notification_outbox")
  ).rows[0];
  const event = {
      type: "email.delivered",
      data: { email_id: outbox.provider_id },
    },
    id = "event-test",
    timestamp = String(Math.floor(Date.now() / 1000)),
    signature = createHmac("sha256", Buffer.alloc(32, 1))
      .update(`${id}.${timestamp}.${JSON.stringify(event)}`)
      .digest("base64");
  expect((await webhook(req("/api/cv-webhook", event))).status).toBe(401);
  const headers = {
    "svix-id": id,
    "svix-timestamp": timestamp,
    "svix-signature": "v1," + signature,
  };
  expect(
    (await webhook(req("/api/cv-webhook", event, {}, headers))).status,
  ).toBe(200);
  expect(
    (await webhook(req("/api/cv-webhook", event, {}, headers))).status,
  ).toBe(200);
  expect(
    (
      await deps.db.query(
        "SELECT * FROM cv_access_events WHERE event_type='Owner Notification Delivered'",
      )
    ).rows,
  ).toHaveLength(1);
});
it("owner retry and deletion require authentication and remove associated records", async () => {
  const f = await flow();
  const { DELETE: remove, POST: retry } =
    await import("@/app/api/admin/requests/[id]/route");
  const id = (await deps.db.query("SELECT id FROM cv_requests WHERE kind='cv'"))
    .rows[0].id;
  expect((await remove(req("/api/admin/requests/" + id))).status).toBe(401);
  await verify(
    req("/api/cv-verify", { code: f.code }, { [COOKIE]: f.session }),
  );
  await deps.db.query("UPDATE cv_notification_outbox SET status='failed'");
  const login = await adminLogin(
    req("/api/admin/login", {
      email: "shaun.emirates@gmail.com",
      turnstileToken: "fixture",
    }),
  );
  const code = sends.at(-1)!.text.match(/code is: (\d{6})/)![1];
  const signed = await adminVerify(
    req(
      "/api/admin/verify",
      { code },
      { [ADMIN_COOKIE]: login.cookies.get(ADMIN_COOKIE)!.value },
    ),
  );
  const cookies = { [ADMIN_COOKIE]: signed.cookies.get(ADMIN_COOKIE)!.value };
  expect(
    (
      await retry(
        req("/api/admin/requests/" + id, { action: "retry" }, cookies),
      )
    ).status,
  ).toBe(200);
  expect(
    (await remove(req("/api/admin/requests/" + id, {}, cookies))).status,
  ).toBe(200);
  expect(
    (
      await deps.db.query(
        "SELECT * FROM cv_request_metadata WHERE request_id=$1",
        [id],
      )
    ).rows,
  ).toHaveLength(0);
});
