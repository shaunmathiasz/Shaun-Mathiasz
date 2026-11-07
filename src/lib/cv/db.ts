import { Pool, type QueryResultRow } from "pg";
export interface Sql {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
}
export interface Database extends Sql {
  transaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T>;
}
const pools = new Map<string, { pool: Pool; verified: Promise<void> | null }>();
export function database(
  url: string,
  expected: "production" | "preview",
): Database {
  if (!["production", "preview"].includes(expected))
    throw new Error("CV_DATABASE_ENVIRONMENT_REQUIRED");
  const key = expected + ":" + url;
  let entry = pools.get(key);
  if (!entry) {
    const u = new URL(url),
      local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(u.hostname);
    if (
      process.env.VERCEL === "1" &&
      (decodeURIComponent(u.pathname.slice(1)) !== `shaun_cv_${expected}` ||
        decodeURIComponent(u.username) !== `shaun_cv_${expected}_app`)
    )
      throw new Error("CV_DATABASE_CONFIG_MISMATCH");
    for (const k of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
      u.searchParams.delete(k);
    const pool = new Pool({
      connectionString: u.toString(),
      max: 4,
      statement_timeout: 10000,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      ssl: local ? false : { rejectUnauthorized: true },
      application_name: "shaun-cv-" + expected,
    });
    pool.on("error", () => {});
    entry = { pool, verified: null };
    pools.set(key, entry);
  }
  const state = entry;
  async function guard() {
    if (!state.verified) {
      state.verified = (async () => {
        if (process.env.VERCEL === "1") {
          const identity = await state.pool.query<{
            database: string;
            role: string;
          }>(
            "SELECT current_database() AS database,current_user AS role",
          );
          if (
            identity.rows[0]?.database !== `shaun_cv_${expected}` ||
            identity.rows[0]?.role !== `shaun_cv_${expected}_app`
          )
            throw new Error("CV_DATABASE_TARGET_MISMATCH");
        }
        const r = await state.pool.query<{ environment: string }>(
          "SELECT environment FROM public.cv_portal_environment WHERE singleton=true",
        );
        if (r.rows.length !== 1 || r.rows[0].environment !== expected)
          throw new Error("CV_DATABASE_ENVIRONMENT_MISMATCH");
      })().catch((e) => {
        state.verified = null;
        throw e;
      });
    }
    await state.verified;
  }
  return {
    async query(text, values) {
      await guard();
      return state.pool.query(text, values);
    },
    async transaction(fn) {
      await guard();
      const c = await state.pool.connect();
      try {
        await c.query("BEGIN");
        await c.query("SET LOCAL statement_timeout='10s'");
        const result = await fn(c);
        await c.query("COMMIT");
        return result;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
  };
}
