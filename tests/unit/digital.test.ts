import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { Database, Sql } from "@/lib/cv/db";
import { DigitalService, csvCell } from "@/lib/digital/service";
import { leadDetail, leadOverview, updateLead } from "@/lib/digital/admin";
import { enquirySchema } from "@/lib/digital/schema";
import { safeAttribution } from "@/lib/digital/events";
import { eventSchema } from "@/lib/digital/event-schema";
import { digital } from "@/config/digital";
let pg: PGlite,
  db: Database,
  s: DigitalService,
  captcha = true,
  emailFail = false,
  sends: { to: string; html: string; key: string }[] = [];
const input = () => ({
  fullName: "Test Business Owner",
  businessName: "Preview Villa",
  businessCategory: "Hospitality",
  email: "qa@example.test",
  phone: "+94 77 123 4567",
  selectedPackage: "growth",
  existingWebsite: "https://example.test/path?secret=discard#discard",
  businessLocation: "Galle",
  projectDescription: "An accessible website for a small villa business.",
  preferredTimeline: "Flexible",
  estimatedBudget: "Discuss scope",
  consent: true,
  turnstileToken: "controlled-local-test",
  submissionKey: randomUUID(),
  attribution: {
    utm_source: "instagram",
    utm_campaign: "sdm-digital-launch",
    utm_term: "private@example.test",
  },
});
const migration = () => readFile("migrations/004_sdm_digital.sql", "utf8");
beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(await migration());
  const adapt = (client: { query: PGlite["query"] }): Sql => ({
    async query<T extends Record<string, unknown>>(q: string, v?: unknown[]) {
      const r = await client.query<T>(q, v);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
  });
  db = {
    ...adapt(pg),
    transaction: async (fn) => pg.transaction(async (tx) => fn(adapt(tx))),
  };
}, 30000);
afterAll(async () => pg.close());
beforeEach(async () => {
  await pg.exec(
    "TRUNCATE sdm_digital.enquiries,sdm_digital.activity,sdm_digital.tasks,sdm_digital.outbox,sdm_digital.rate_limits,sdm_digital.events CASCADE",
  );
  captcha = true;
  emailFail = false;
  sends = [];
  s = new DigitalService(db, {
    ownerEmail: "owner@example.test",
    origin: "https://preview.example.test",
    secret: "test-hmac-key-0000000000000000000000",
    preview: false,
    captcha: async () => captcha,
    send: async (to, _subject, _text, html, key) => {
      if (emailFail) throw Error("provider down");
      sends.push({ to, html, key });
      return "provider-" + sends.length;
    },
  });
});
describe("SDM Digital real SQL integration", () => {
  it("keeps the approved commercial prices and proposed claims private", () => {
    expect(digital.packages.map((p) => p.price)).toEqual([
      24900, 59900, 119900,
    ]);
    expect(digital.publishReferencePrices).toBe(false);
  });
  it("migration can run twice without touching existing unrelated records", async () => {
    await pg.exec(
      "CREATE TABLE IF NOT EXISTS public.unrelated_test(value text); INSERT INTO public.unrelated_test VALUES ('retained')",
    );
    await pg.exec(await migration());
    expect(
      (await pg.query("SELECT value FROM public.unrelated_test")).rows,
    ).toEqual([{ value: "retained" }]);
  });
  it("saves one enquiry, price snapshot, audit and two outbox rows atomically", async () => {
    const r = await s.submit(input(), "ip");
    expect(r.created).toBe(true);
    const lead = (await db.query("SELECT * FROM sdm_digital.enquiries"))
      .rows[0];
    expect(lead.quoted_package_price).toBe(59900);
    expect(lead.proposal_amount).toBe(0);
    expect(lead.existing_website).toBe("https://example.test/path");
    expect(lead.attribution).toEqual({
      utm_source: "instagram",
      utm_campaign: "sdm-digital-launch",
    });
    expect(
      (await db.query("SELECT * FROM sdm_digital.outbox")).rows,
    ).toHaveLength(2);
    expect(
      (await db.query("SELECT * FROM sdm_digital.activity")).rows,
    ).toHaveLength(1);
    expect(sends).toHaveLength(0);
  });
  it("deduplicates a retried submission and rejects changed payload with the same key", async () => {
    const i = input(),
      a = await s.submit(i, "ip"),
      b = await s.submit(i, "ip");
    expect(b).toEqual({ reference: a.reference, created: false });
    await expect(
      s.submit({ ...i, businessName: "Changed company" }, "ip"),
    ).rejects.toMatchObject({ status: 409 });
    expect(
      (await db.query("SELECT * FROM sdm_digital.outbox")).rows,
    ).toHaveLength(2);
  });
  it("rejects invalid contact, consent, oversized fields and honeypot before insertion", async () => {
    for (const bad of [
      { phone: "abc" },
      { consent: false },
      { projectDescription: "x".repeat(3001) },
      { website: "spam" },
      { selectedPackage: "fake" },
      { email: "invalid" },
    ])
      expect(enquirySchema.safeParse({ ...input(), ...bad }).success).toBe(
        false,
      );
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(0);
  });
  it("rejects a failed security check without saving or sending", async () => {
    captcha = false;
    await expect(s.submit(input(), "ip")).rejects.toMatchObject({
      status: 400,
    });
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(0);
    expect(sends).toHaveLength(0);
  });
  it("persists rate limits across service instances", async () => {
    for (let i = 0; i < 4; i++) await s.submit(input(), "ip");
    await expect(s.submit(input(), "ip")).rejects.toMatchObject({
      status: 429,
    });
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(4);
  });
  it("keeps persisted enquiries when email fails and retries with stable idempotency keys", async () => {
    await s.submit(input(), "ip");
    emailFail = true;
    await s.worker();
    expect(
      (await db.query("SELECT * FROM sdm_digital.outbox WHERE state='failed'"))
        .rows,
    ).toHaveLength(2);
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(1);
    emailFail = false;
    await db.query(
      "UPDATE sdm_digital.outbox SET next_attempt_at=now()-interval '1 second'",
    );
    await s.worker();
    expect(sends).toHaveLength(2);
    await s.worker();
    expect(sends).toHaveLength(2);
    expect(
      (await db.query("SELECT * FROM sdm_digital.outbox WHERE state='sent'"))
        .rows,
    ).toHaveLength(2);
  });
  it("does not send preview acknowledgements to arbitrary recipients", async () => {
    s = new DigitalService(db, { ...s.deps, preview: true });
    await s.submit(input(), "ip");
    await s.worker();
    expect(sends).toHaveLength(1);
    expect(sends[0].to).toBe("owner@example.test");
  });
  it("escapes untrusted project content in HTML email", async () => {
    await s.submit(
      {
        ...input(),
        projectDescription: '<script>alert("not executed")</script>',
      },
      "ip",
    );
    await s.worker();
    expect(sends.find((x) => x.to === "owner@example.test")?.html).toContain(
      "&lt;script&gt;",
    );
  });
  it("records genuine owner status transitions, notes, amounts and tasks", async () => {
    await s.submit(input(), "ip");
    const id = String(
      (await db.query("SELECT id FROM sdm_digital.enquiries")).rows[0].id,
    );
    await updateLead(s, id, { action: "status", status: "QUALIFIED" });
    await updateLead(s, id, { action: "note", note: "Private follow-up note" });
    await updateLead(s, id, {
      action: "values",
      proposalAmount: 70000,
      acceptedAmount: 0,
      collectedAmount: 0,
    });
    await updateLead(s, id, {
      action: "task",
      title: "Discuss requirements",
      dueAt: "2026-11-11T04:30:00.000Z",
    });
    const d = await leadDetail(s, id);
    expect(d.lead.status).toBe("QUALIFIED");
    expect(d.tasks).toHaveLength(1);
    expect(
      d.activity.some(
        (a) => a.previous_status === "NEW" && a.new_status === "QUALIFIED",
      ),
    ).toBe(true);
    await updateLead(s, id, { action: "complete_task", taskId: d.tasks[0].id });
    expect((await leadDetail(s, id)).tasks[0].completed_at).toBeTruthy();
  });
  it("reports actual records with no invented sales values and supports filters", async () => {
    await s.submit(input(), "ip");
    const r = await leadOverview(s, {});
    expect(r.summary.total).toBe(1);
    expect(r.summary.won).toBe(0);
    expect(r.summary.accepted).toBe("0");
    expect((await leadOverview(s, { status: "LOST" })).rows).toHaveLength(0);
    expect(
      (await leadOverview(s, { search: "Preview Villa" })).rows,
    ).toHaveLength(1);
  });
  it("deletes related personal data while retaining a non-personal deletion audit", async () => {
    await s.submit(input(), "ip");
    const id = String(
      (await db.query("SELECT id FROM sdm_digital.enquiries")).rows[0].id,
    );
    await updateLead(s, id, { action: "delete", confirmation: "DELETE" });
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM sdm_digital.outbox")).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "SELECT action_type,note,enquiry_id FROM sdm_digital.activity",
        )
      ).rows,
    ).toEqual([
      {
        action_type: "lead_deleted",
        note: "Owner deleted an enquiry and related personal data",
        enquiry_id: null,
      },
    ]);
  });
  it("drops personal UTM values and refuses analytics with unexpected parameters", () => {
    expect(
      safeAttribution({
        utm_source: "my@email.test",
        utm_campaign: "personal-name",
        utm_medium: "social",
      }),
    ).toEqual({ utm_medium: "social" });
    expect(
      eventSchema.safeParse({
        eventId: randomUUID(),
        name: "generate_lead",
        consent: true,
        email: "private@test.example",
      }).success,
    ).toBe(false);
  });
  it("neutralises spreadsheet formula payloads and preserves quoting", () => {
    for (const v of ["=CMD()", "+1234", "  @test", "\n-formula"])
      expect(csvCell(v)).toMatch(/^"'/);
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it("rolls back the enquiry if its notification outbox cannot be committed", async () => {
    const broken: Database = {
      ...db,
      transaction: (fn) =>
        db.transaction((sql) =>
          fn({
            query: async (q, v) => {
              if (q.startsWith("INSERT INTO sdm_digital.outbox"))
                throw Error("simulated write failure");
              return sql.query(q, v);
            },
          }),
        ),
    };
    const fail = new DigitalService(broken, s.deps);
    await expect(fail.submit(input(), "ip")).rejects.toThrow(
      "simulated write failure",
    );
    expect(
      (await db.query("SELECT * FROM sdm_digital.enquiries")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("SELECT * FROM sdm_digital.activity")).rows,
    ).toHaveLength(0);
  });
  it("does not process leased or exhausted notification jobs", async () => {
    await s.submit(input(), "ip");
    await db.query(
      "UPDATE sdm_digital.outbox SET lease_until=now()+interval '1 hour'",
    );
    expect(await s.worker()).toBe(0);
    await db.query("UPDATE sdm_digital.outbox SET lease_until=NULL,attempts=8");
    expect(await s.worker()).toBe(0);
    expect(sends).toHaveLength(0);
  });
  it("expires the abuse buckets instead of permanently locking a visitor", async () => {
    await s.rate("test", 1, 60);
    await expect(s.rate("test", 1, 60)).rejects.toMatchObject({ status: 429 });
    await db.query(
      "UPDATE sdm_digital.rate_limits SET expires_at=now()-interval '1 second'",
    );
    await expect(s.rate("test", 1, 60)).resolves.toBeUndefined();
  });
  it("Preview owner setup aborts before mutation on a different database", async () => {
    const isolated = new PGlite();
    try {
      await isolated.exec(
        "CREATE TABLE public.cv_portal_environment(singleton boolean,environment text); INSERT INTO public.cv_portal_environment VALUES(true,'preview')",
      );
      const source = await readFile(
        "migrations/004_sdm_digital_preview_owner.sql",
        "utf8",
      );
      await expect(isolated.exec(source)).rejects.toThrow(
        "Preview database identity required",
      );
      await isolated.exec("ROLLBACK");
      expect(
        (await isolated.query("SELECT to_regnamespace('sdm_digital') AS name"))
          .rows,
      ).toEqual([{ name: null }]);
    } finally {
      await isolated.close();
    }
  });
});
