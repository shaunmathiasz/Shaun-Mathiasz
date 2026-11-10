import { Pool } from "pg";
import { get } from "@vercel/blob";
import { getConfig, configProblems } from "../src/lib/cv/config.ts";
import { outboundReady } from "../src/lib/cv/resend-domain.ts";
const missing = configProblems();
if (missing.length) {
  console.error(
    "Missing or invalid configuration (names only):\n" + missing.join("\n"),
  );
  process.exit(1);
}
const c = getConfig();
let failed = false;
try {
  const r = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${c.resendKey}` },
    signal: AbortSignal.timeout(10000),
  });
  if (r.status === 403) {
    console.log(
      "Resend domain-read permission unavailable. Check the existing domain in the Resend dashboard; sending-only API keys may be intentional.",
    );
  } else if (!r.ok) throw new Error();
  else {
    const d = await r.json(),
      domain = c.fromEmail.split("@")[1],
      match = d.data?.find(
        (v) => domain === v.name || domain.endsWith("." + v.name),
      );
    let detail = match;
    if (match) {
      const check = await fetch(
        "https://api.resend.com/domains/" + encodeURIComponent(match.id),
        {
          headers: { Authorization: `Bearer ${c.resendKey}` },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (check.ok) detail = await check.json();
    }
    const ready = outboundReady(detail);
    console.log(
      "Resend outbound sending:",
      ready ? "enabled with verified sending DNS" : "not confirmed",
    );
    if (!ready) failed = true;
  }
} catch {
  failed = true;
  console.error(
    "Resend account/domain check failed. No credentials were printed.",
  );
}
const u = new URL(c.databaseUrl),
  local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
for (const k of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
  u.searchParams.delete(k);
const pool = new Pool({
  connectionString: u.toString(),
  ssl: local ? false : { rejectUnauthorized: true },
  max: 1,
  connectionTimeoutMillis: 8000,
});
try {
  const r = await pool.query(
    "SELECT to_regclass('cv_requests') AS requests,to_regclass('cv_notification_outbox') AS outbox",
  );
  if (!r.rows[0].requests || !r.rows[0].outbox) throw new Error();
  console.log("Database and migration: available.");
} catch {
  failed = true;
  console.error("Database/migration check failed.");
} finally {
  await pool.end();
}
try {
  const r = await get(c.blobPath, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) throw new Error();
  await r.stream.cancel();
  console.log("Private CV object: available through authenticated storage.");
} catch {
  failed = true;
  console.error("Private CV check failed.");
}
console.log(
  "This preflight does not establish real OTP delivery, notification delivery, browser verification or a successful protected PDF download. Complete the preview release checklist.",
);
if (failed) process.exitCode = 1;
