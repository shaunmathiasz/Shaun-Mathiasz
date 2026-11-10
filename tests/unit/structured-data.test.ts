import { describe, expect, it } from "vitest";
import { identitySchema, personSchema, profileSchema, entityIds } from "@/lib/structured-data";

describe("professional identity graph", () => {
  it("connects the website and dedicated profile to one person", () => {
    expect(JSON.parse(JSON.stringify(identitySchema))["@graph"]).toHaveLength(2);
    expect(identitySchema["@graph"][1]).toMatchObject({ "@type": "WebSite", publisher: { "@id": entityIds.person } });
    expect(profileSchema).toMatchObject({ "@type": "ProfilePage", mainEntity: { "@id": entityIds.person }, isPartOf: { "@id": entityIds.website } });
    expect(personSchema.name).toBe("Shaun Denver Mathiasz");
    expect(personSchema.alternateName).toContain("Shaun Mathiasz");
  });
  it("does not claim an ongoing degree, IATA diploma or membership as an awarded credential", () => {
    const names = personSchema.hasCredential.map((credential) => credential.name);
    expect(names.some((name) => /BSc|Foundation Diploma|Student Affiliate/.test(name))).toBe(false);
    expect(personSchema.description).toContain("ongoing");
    expect(personSchema.hasCredential.filter((credential) => credential.recognizedBy.name.includes("Oxford")).every((credential) => credential.credentialCategory === "Short course")).toBe(true);
  });
});
