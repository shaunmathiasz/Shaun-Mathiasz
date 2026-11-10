import { beforeEach, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({ marker: "preview", writes: 0, db: "shaun_cv_preview", role: "shaun_cv_preview_app" }));
vi.mock("pg", () => ({
  Pool: class {
    on() {}
    async query(text: string) {
      if (text.startsWith("SELECT current_database()"))
        return { rows: [{ database: state.db, role: state.role }], rowCount: 1 };
      if (text.startsWith("SELECT environment"))
        return {
          rows: state.marker ? [{ environment: state.marker }] : [],
          rowCount: 1,
        };
      state.writes++;
      return { rows: [], rowCount: 0 };
    }
    async connect() {
      return { query: this.query.bind(this), release() {} };
    }
  },
}));
beforeEach(() => {
  vi.resetModules();
  state.marker = "preview";
  state.writes = 0;
  state.db = "shaun_cv_preview";
  state.role = "shaun_cv_preview_app";
  vi.stubEnv("VERCEL", "");
});
it("rejects a Production database before any Preview query can execute", async () => {
  state.marker = "production";
  const { database } = await import("@/lib/cv/db");
  await expect(
    database("postgres://localhost/test", "preview").query(
      "INSERT INTO cv_requests VALUES(1)",
    ),
  ).rejects.toThrow("CV_DATABASE_ENVIRONMENT_MISMATCH");
  expect(state.writes).toBe(0);
});
it("fails closed when the immutable environment marker is missing", async () => {
  state.marker = "";
  const { database } = await import("@/lib/cv/db");
  await expect(
    database("postgres://localhost/test", "preview").query(
      "SELECT private_data",
    ),
  ).rejects.toThrow("CV_DATABASE_ENVIRONMENT_MISMATCH");
});
it("permits matching environments and rejects mismatches before transaction callbacks", async () => {
  const { database } = await import("@/lib/cv/db");
  await database("postgres://localhost/test", "preview").query(
    "SELECT safe_data",
  );
  expect(state.writes).toBe(1);
  const fn = vi.fn();
  await expect(
    database("postgres://localhost/test", "production").transaction(fn),
  ).rejects.toThrow("CV_DATABASE_ENVIRONMENT_MISMATCH");
  expect(fn).not.toHaveBeenCalled();
});

it("rejects a deployed connection to a different database or privileged role", async () => {
  vi.stubEnv("VERCEL", "1");
  state.db = "neondb";
  const { database } = await import("@/lib/cv/db");
  const db = database("postgres://shaun_cv_preview_app@localhost/shaun_cv_preview", "preview");
  await expect(db.query("SELECT private_data")).rejects.toThrow("CV_DATABASE_TARGET_MISMATCH");
  state.db = "shaun_cv_preview";
  state.role = "neondb_owner";
  await expect(db.query("SELECT private_data")).rejects.toThrow("CV_DATABASE_TARGET_MISMATCH");
  expect(state.writes).toBe(0);
  state.role = "shaun_cv_preview_app";
  await db.query("SELECT allowed_data");
  expect(state.writes).toBe(1);
  vi.stubEnv("VERCEL", "");
});
