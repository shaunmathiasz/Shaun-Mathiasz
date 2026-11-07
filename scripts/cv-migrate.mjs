import fs from "node:fs/promises";
import { Pool } from "pg";
import { dataEnvironment } from "../src/lib/cv/config.ts";
const environment = dataEnvironment(),
  url = process.env.CV_MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!environment || !url)
  throw new Error(
    "Set the target environment and its privileged migration connection.",
  );
const u = new URL(url),
  expected = "shaun_cv_" + environment;
if (u.pathname !== "/" + expected)
  throw new Error(
    "Migration target database must match the selected environment.",
  );
const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
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
    for (const file of ["001_cv_portal.sql", "002_environment_guard.sql"]) {
      const source = await fs.readFile(
        new URL("../migrations/" + file, import.meta.url),
        "utf8",
      );
      await c.query(
        source.replace(/^\s*BEGIN\s*;/i, "").replace(/COMMIT\s*;\s*$/i, ""),
      );
    }
    const marker = (
      await c.query(
        "SELECT environment FROM cv_portal_environment WHERE singleton=true",
      )
    ).rows[0];
    if (marker && marker.environment !== environment)
      throw new Error("Environment mismatch");
    await c.query(
      "INSERT INTO cv_portal_environment(singleton,environment) VALUES(true,$1) ON CONFLICT DO NOTHING",
      [environment],
    );
    await c.query(
      "INSERT INTO cv_schema_migrations(version) VALUES('001_cv_portal'),('002_environment_guard') ON CONFLICT DO NOTHING",
    );
    await c.query("COMMIT");
    console.log("CV migrations applied to " + environment + ".");
  } catch {
    await c.query("ROLLBACK");
    throw new Error("Migration failed");
  } finally {
    c.release();
  }
} catch {
  console.error(
    "Migration not confirmed. Check the selected database, migration-role permissions and TLS connectivity. No credentials printed.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
