import { describe, it, expect } from "vitest";
import { projects } from "../../src/content/projects";
import { articles } from "../../src/content/articles";
import { education } from "../../src/content/profile";
describe("content integrity", () => {
  it("uses unique route-safe slugs", () => {
    const slugs = [...projects, ...articles].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9-]+$/));
  });
  it("does not describe IATA training as completed", () =>
    expect(education.find((e) => e.institution === "IATA")?.status).toBe(
      "Reading",
    ));
  it("publishes approved full-length essays with real publication dates and references", () => {
    articles.forEach((a) => {
      expect(a.status).toBe("Published");
      expect(a.publishedAt).toMatch(/^2026-11-06$/);
      expect(a.body.split(/\s+/).length).toBeGreaterThan(450);
      expect(a.body).toContain("## Further reading");
    });
  });
});

describe("public digital presence snapshots", () => {
  it("preserves approximate metrics and excludes unsupported reach claims", async () => {
    const { digitalPlatforms, combinedAudience } =
      await import("../../src/content/influence");
    expect(digitalPlatforms).toHaveLength(4);
    expect(
      digitalPlatforms[0].metrics.find((m) => m.label === "Profile likes")
        ?.display,
    ).toBe("~120K");
    expect(combinedAudience.display).toBe("~15.4K");
    expect(combinedAudience.caption).toContain("not unique individuals");
    expect(
      digitalPlatforms.flatMap((p) => p.metrics).map((m) => m.label),
    ).not.toContain("Reach");
  });
});
