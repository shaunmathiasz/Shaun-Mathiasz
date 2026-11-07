// Explicit synthetic security fixtures. Requires the isolated Preview database role.
// No CAPTCHA solving, real OTP extraction, production writes or fake delivery claims.
import { neon } from "@neondatabase/serverless";
import { createInterface } from "node:readline";
import { randomBytes, randomUUID, createHash } from "node:crypto";
const rl = createInterface({ input: process.stdin });
let raw = "";
for await (const line of rl) {
  if (line === "END") break;
  raw += line;
}
rl.close();
let cfg;
try {
  cfg = JSON.parse(raw);
} catch {
  console.log(
    JSON.stringify({ ok: false, error: "Invalid test configuration" }),
  );
  process.exit(1);
}
const base = new URL(cfg.baseUrl);
if (
  base.protocol !== "https:" ||
  !(
    base.hostname.endsWith(".vercel.app") ||
    base.hostname === "cv-preview.shaunmathiasz.com"
  )
)
  throw new Error("Use the exact isolated Preview hostname.");
const sql = neon(cfg.databaseUrl),
  ids = [],
  results = [];
const token = () => randomBytes(32).toString("base64url"),
  hash = (v) => createHash("sha256").update(v).digest("hex");
const check = (name, condition) => {
  results.push({ name, passed: !!condition });
  if (!condition) throw new Error("Runtime assertion failed: " + name);
};
async function api(path, body = {}, session, origin = base.origin) {
  const r = await fetch(base.origin + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(session ? { Cookie: "__Host-cv-session=" + session } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  const data = await r.json().catch(() => ({}));
  results.push({operation:path,status:r.status,reference:data.reference,category:data.category,error:typeof data.error==='string'?data.error:undefined});
  return { status: r.status, data };
}
async function fixture(label, { expired = false, verified = false } = {}) {
  const id = randomUUID(),
    session = token();
  ids.push(id);
  await sql.transaction([
    sql.query(
      "INSERT INTO cv_requests(id,kind,full_name,company,email,details,session_hash,verification_status,verified_at) VALUES($1,'cv','Synthetic security fixture','Automated Preview fixture',$2,'{}',$3,$4,CASE WHEN $4='verified' THEN now() ELSE NULL END)",
      [
        id,
        `fixture-${label}@example.org`,
        hash(session),
        verified ? "verified" : "pending",
      ],
    ),
    sql.query(
      "INSERT INTO cv_verification_challenges(request_id,otp_hash,expires_at,accepted_at) VALUES($1,$2,now()+$3*interval '1 second',now())",
      [id, randomBytes(32).toString("hex"), expired ? -60 : 300],
    ),
  ]);
  return { id, session };
}
try {
  const identity = await sql.query(
    "SELECT current_database() AS db,current_user AS role,environment FROM cv_portal_environment WHERE singleton=true",
  );
  check(
    "Preview database and role enforced",
    identity[0]?.db === "shaun_cv_preview" &&
      identity[0]?.role === "shaun_cv_preview_app" &&
      identity[0]?.environment === "preview",
  );
  const expired = await fixture("expired", { expired: true });
  check(
    "Expired OTP rejected",
    (await api("/api/cv-verify", { code: "123456" }, expired.session))
      .status === 410,
  );
  const pending = await fixture("pending");
  check(
    "Unverified download rejected",
    (await api("/api/cv-download", {}, pending.session)).status === 403,
  );
  check(
    "60-second resend cooldown enforced",
    (await api("/api/cv-resend-code", {}, pending.session)).status === 429,
  );
  const attempts = await fixture("attempts");
  for (let i = 0; i < 5; i++)
    check(
      "Incorrect OTP attempt " + (i + 1) + " rejected",
      (await api("/api/cv-verify", { code: "123456" }, attempts.session))
        .status === 400,
    );
  check(
    "Attempt limit blocks the sixth try",
    [409, 429].includes(
      (await api("/api/cv-verify", { code: "123456" }, attempts.session))
        .status,
    ),
  );
  const locked = (
    await sql.query(
      "SELECT verification_status,failed_attempts FROM cv_requests r JOIN cv_verification_challenges c ON c.request_id=r.id WHERE r.id=$1",
      [attempts.id],
    )
  )[0];
  check(
    "Failed attempts persisted atomically",
    locked.failed_attempts === 5 && locked.verification_status === "locked",
  );
  const grant = await fixture("expired-grant", { verified: true }),
    grantToken = token();
  await sql.query(
    "INSERT INTO cv_access_tokens(id,request_id,token_hash,expires_at) VALUES($1,$2,$3,now()-interval '1 second')",
    [randomUUID(), grant.id, hash(grantToken)],
  );
  const download = await fetch(base.origin + "/api/cv-download", {
    method: "POST",
    headers: {
      Origin: base.origin,
      Cookie:
        "__Host-cv-session=" +
        grant.session +
        "; __Host-cv-grant=" +
        grantToken,
    },
    signal: AbortSignal.timeout(25000),
  });
  check("Expired private grant rejected", download.status === 410);
  check(
    "Cross-origin mutation rejected",
    (
      await api(
        "/api/cv-verify",
        { code: "123456" },
        pending.session,
        "https://invalid.example",
      )
    ).status === 403,
  );
  check(
    "Unauthenticated admin API rejected",
    (await api("/api/admin/requests", {})).status === 401,
  );
  check(
    "Unauthenticated private download rejected",
    (await api("/api/cv-download", {})).status === 401,
  );
  const get = await fetch(base.origin + "/api/cv-download", {
    signal: AbortSignal.timeout(25000),
  });
  check("GET/prefetch cannot consume private access", get.status === 405);
  const old = await fetch(base.origin + "/documents/shaun-mathiasz-cv.pdf", {
    signal: AbortSignal.timeout(25000),
  });
  check("Old public PDF route retired", old.status === 410);
  for (let i = 0; i < 6; i++) {
    const r = await api("/api/cv-request", {
      fullName: "Synthetic security fixture",
      company: "Automated Preview fixture",
      email: "runtime-bot-fixture@example.org",
      turnstileToken: "invalid-token",
    });
    check("Unverified Turnstile token rejected " + (i + 1), r.status === 400);
  }
  check(
    "Per-email rate limit enforced",
    (
      await api("/api/cv-request", {
        fullName: "Synthetic security fixture",
        company: "Automated Preview fixture",
        email: "runtime-bot-fixture@example.org",
        turnstileToken: "invalid-token",
      })
    ).status === 429,
  );
  console.log(JSON.stringify({ ok: true, results }));
} catch (e) {
  console.log(
    JSON.stringify({
      ok: false,
      error: String(e.message)
        .replaceAll(cfg.databaseUrl, "[redacted]")
        .slice(0, 160),
      results,
    }),
  );
  process.exitCode = 1;
} finally {
  for (const id of ids)
    await sql.query(
      "DELETE FROM cv_requests WHERE id=$1 AND company='Automated Preview fixture'",
      [id],
    );
}
