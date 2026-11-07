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
let pool: Pool | undefined;
export function database(url: string): Database {
  if (!pool) {
    const u = new URL(url);
    const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(
      u.hostname,
    );
    for (const k of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
      u.searchParams.delete(k);
    pool = new Pool({
      connectionString: u.toString(),
      max: 4,
      statement_timeout: 10000,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      ssl: local ? false : { rejectUnauthorized: true },
      application_name: "shaun-cv-portal",
    });
    pool.on("error", () => {
      /* Never log database URLs, query parameters or requester details. */
    });
  }
  const query: Sql["query"] = (text, values) => pool!.query(text, values);
  return {
    query,
    async transaction(fn) {
      const c = await pool!.connect();
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
