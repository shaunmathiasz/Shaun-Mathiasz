import { describe, it, expect, vi, afterEach } from "vitest";
import { contactSchema, contactConfigured } from "../../src/lib/contact";
const valid = {
  name: "Recruiter",
  email: "recruiter@example.com",
  message: "I would like to discuss a travel product opportunity.",
  website: "",
  consent: true,
};
afterEach(() => vi.unstubAllEnvs());
describe("contact validation", () => {
  it("accepts a minimal professional enquiry", () =>
    expect(contactSchema.safeParse(valid).success).toBe(true));
  it.each([
    { email: "invalid" },
    { message: "short" },
    { name: " " },
    { website: "https://spam.example" },
    { consent: false },
    { message: "x".repeat(4001) },
  ])("rejects unsafe or incomplete input %j", (patch) =>
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false),
  );
  it("fails closed without all transport configuration", () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("CONTACT_FROM", "");
    vi.stubEnv("CONTACT_TO", "");
    expect(contactConfigured()).toBe(false);
  });
});
