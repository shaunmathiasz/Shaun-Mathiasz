import { describe, it, expect } from "vitest";
import { buildConcept, defaults } from "../../src/lib/travel-builder";
describe("illustrative concept reasoning", () => {
  it("changes destination logistics", () => {
    const a = buildConcept(defaults);
    const b = buildConcept({ ...defaults, destination: "Sri Lanka" });
    expect(a.commercial[0]).toContain("inter-island");
    expect(b.commercial[0]).toContain("road");
  });
  it("explains the cost of adding stops", () => {
    expect(
      buildConcept({ ...defaults, priorities: ["More destinations"] }).tradeoff,
    ).toContain("transfer complexity");
  });
  it("makes traveller and accommodation choices explicit", () => {
    const r = buildConcept({
      ...defaults,
      traveller: "Family",
      stay: "Resort",
    });
    expect(r.priorities.join(" ")).toContain("Family");
    expect(r.priorities.join(" ")).toContain("Resort");
  });
  it("provides four high-level days without numeric prices", () => {
    const r = buildConcept(defaults);
    expect(r.days).toHaveLength(4);
    expect(JSON.stringify(r)).not.toMatch(/[$£€]/);
  });
});
