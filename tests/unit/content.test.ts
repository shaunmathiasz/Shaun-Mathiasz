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
  it("keeps unapproved writing labeled as draft", () =>
    articles.forEach((a) => expect(a.status).toBe("Unpublished draft")));
});
