import { appOrigin } from "@/lib/cv/config";
import { it, expect } from "vitest";
import { outboundReady } from "@/lib/cv/resend-domain";
it("accepts an enabled and fully verified outbound domain", () => {
  expect(
    outboundReady({ status: "verified", capabilities: { sending: "enabled" } }),
  ).toBe(true);
});
it("does not require receiving MX when DKIM and sending records are verified", () => {
  expect(
    outboundReady({
      status: "partially_verified",
      capabilities: { sending: "enabled" },
      records: [
        { record: "DKIM", status: "verified" },
        { record: "SPF", status: "verified" },
        { record: "SPF", status: "verified" },
        { record: "Receiving", status: "pending" },
      ],
    }),
  ).toBe(true);
});
it("does not call disabled sending or unverified DNS ready", () => {
  expect(
    outboundReady({
      status: "verified",
      capabilities: { sending: "disabled" },
    }),
  ).toBe(false);
  expect(
    outboundReady({
      status: "not_started",
      capabilities: { sending: "enabled" },
    }),
  ).toBe(false);
});
it("requires sufficient sending-record evidence when the overall status is partial", () => {
  expect(
    outboundReady({
      status: "partially_verified",
      capabilities: { sending: "enabled" },
    }),
  ).toBe(false);
  expect(
    outboundReady({
      status: "partially_verified",
      capabilities: { sending: "enabled" },
      records: [
        { record: "DKIM", status: "verified" },
        { record: "SPF", status: "pending" },
      ],
    }),
  ).toBe(false);
});

it("uses only the trusted Vercel preview hostname for an automatic preview origin", () => {
  expect(
    appOrigin({
      NODE_ENV: "test",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_URL: "shaun-preview.vercel.app",
    }),
  ).toBe("https://shaun-preview.vercel.app");
  expect(
    appOrigin({
      NODE_ENV: "test",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_URL: "evil.org/path",
    }),
  ).toBeUndefined();
});
it("requires an explicit production origin rather than silently using a preview host", () => {
  expect(
    appOrigin({
      NODE_ENV: "test",
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_URL: "shaun-preview.vercel.app",
    }),
  ).toBeUndefined();
});
it("preserves the explicitly configured canonical origin", () => {
  expect(
    appOrigin({
      NODE_ENV: "test",
      CV_APP_ORIGIN: "https://shaun-mathiasz.vercel.app",
    }),
  ).toBe("https://shaun-mathiasz.vercel.app");
});
