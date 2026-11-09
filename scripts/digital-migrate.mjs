/** Additive migration only. No service creation, CV-table edits or automatic Production migration. */
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { dataEnvironment } from "../src/lib/cv/config.ts";
const environment = dataEnvironment();
if (
  !environment ||
  (environment === "production" &&
    process.env.DIGITAL_ALLOW_PRODUCTION_MIGRATION !== "approved")
)
  throw Error(
    "Select Preview, or explicitly approve the Production migration.",
  );
const url =
  process.env.CV_MIGRATION_DATABASE_URL ||
  process.env.CV_DATABASE_URL ||
  process.env.DATABASE_URL;
if (!url) throw Error("Migration connection unavailable.");
let u;
try { u = new URL(url); } catch { throw Error("Migration connection URL is invalid."); }
const
  local = ["localhost", "127.0.0.1"].includes(u.hostname);
if (!local && u.pathname !== `/shaun_cv_${environment}`)
  throw Error("Migration target does not match the selected environment.");
for (const k of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
  u.searchParams.delete(k);
const pool = new Pool({
  connectionString: u.toString(),
  ssl: local ? false : { rejectUnauthorized: true },
  max: 1,
  connectionTimeoutMillis: 8000,
});
try {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query(
      "SELECT pg_advisory_xact_lock(hashtext('sdm-digital-migration'))",
    );
    const marker = (
      await c.query(
        "SELECT environment FROM public.cv_portal_environment WHERE singleton=true",
      )
    ).rows[0];
    if (marker?.environment !== environment)
      throw Error("Environment mismatch.");
    await c.query(
      await readFile(
        new URL("../migrations/004_sdm_digital.sql", import.meta.url),
        "utf8",
      ),
    );
    if (!local) {
      const role = `shaun_cv_${environment}_app`;
      await c.query(`GRANT USAGE ON SCHEMA sdm_digital TO ${role}`);
      await c.query(
        `GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA sdm_digital TO ${role}`,
      );
      await c.query(
        `GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA sdm_digital TO ${role}`,
      );
    }
    await c.query("COMMIT");
    console.log(
      "SDM Digital additive migration applied to " + environment + ".",
    );
  } catch (error) {
    await c.query("ROLLBACK");
    console.error(
      `Migration failed [${typeof error === "object" && error && "code" in error && /^[A-Z0-9]{5}$/.test(String(error.code)) ? error.code : "UNCLASSIFIED"}]. Verify schema permissions and target environment; no credentials logged.`,
    );
    throw Error("DIGITAL_MIGRATION_FAILED");
  } finally {
    c.release();
  }
} catch {
  console.error("DIGITAL_MIGRATION_NOT_CONFIRMED: check target, schema permissions and TLS connectivity. No credentials logged.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
