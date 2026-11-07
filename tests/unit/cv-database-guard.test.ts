import { beforeEach, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({ marker: "preview", writes: 0 }));
vi.mock("pg", () => ({
  Pool: class {
    on() {}
    async query(text: string) {
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
