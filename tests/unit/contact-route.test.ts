import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/contact/route";
const valid = {
  name: "Recruiter",
  email: "recruiter@example.com",
  message: "A professional opportunity in travel product development.",
  consent: true,
  website: "",
};
let counter = 0;
function request(body: unknown, origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: origin,
      "x-forwarded-for": `test-${++counter}`,
    },
    body: JSON.stringify(body),
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("contact endpoint", () => {
  it("rejects foreign origins", async () =>
    expect((await POST(request(valid, "https://foreign.example"))).status).toBe(
      403,
    ));
  it("validates on the server", async () =>
    expect((await POST(request({ ...valid, email: "bad" }))).status).toBe(400));
  it("fails closed when delivery is unconfigured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await POST(request(valid));
    expect(response.status).toBe(503);
    expect((await response.json()).message).toContain("not been sent");
  });
  it("reports provider failure without claiming delivery", async () => {
    vi.stubEnv("RESEND_API_KEY", "test");
    vi.stubEnv("CONTACT_FROM", "test@example.com");
    vi.stubEnv("CONTACT_TO", "recipient@example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const res = await POST(request(valid));
    expect(res.status).toBe(502);
  });
  it("limits repeated attempts on a warm instance", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const ip = "rate-limit-test";
    let res;
    for (let i = 0; i < 6; i++) {
      const req = request(valid);
      req.headers.set("x-forwarded-for", ip);
      res = await POST(req);
    }
    expect(res?.status).toBe(429);
  });
});
