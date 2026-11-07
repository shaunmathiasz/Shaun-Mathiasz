import { describe, it, expect } from "vitest";
import { readEmbedSignal, embedGeometry } from "@/lib/social-embed";
describe("social provider message validation", () => {
  it("accepts safe numeric-string height reports", () => {
    expect(
      readEmbedSignal(
        "TikTok",
        { signalSource: "token", height: "680" },
        "token",
      ),
    ).toEqual({ ready: true, height: 680 });
  });
  it("accepts the TikTok SDK signal only with the current frame token and finite height", () => {
    expect(
      readEmbedSignal(
        "TikTok",
        JSON.stringify({ signalSource: "__tt_embed__current", height: 880 }),
        "__tt_embed__current",
      ),
    ).toEqual({ ready: true, height: 880 });
    for (const h of [0, -1, Infinity, NaN, 6001, "100vh"])
      expect(
        readEmbedSignal(
          "TikTok",
          { signalSource: "token", height: h },
          "token",
        ),
      ).toBeNull();
    expect(
      readEmbedSignal(
        "TikTok",
        { signalSource: "stale", height: 680 },
        "token",
      ),
    ).toBeNull();
  });
  it("distinguishes Instagram mounting from later size reports", () => {
    expect(
      readEmbedSignal("Instagram", { type: "MOUNTED", details: {} }, ""),
    ).toEqual({ ready: true });
    expect(
      readEmbedSignal(
        "Instagram",
        { type: "MEASURE", details: { height: 1120 } },
        "",
      ),
    ).toEqual({ ready: false, height: 1120 });
    expect(
      readEmbedSignal("Instagram", { type: "LOADING", details: {} }, ""),
    ).toBeNull();
  });
  it("rejects malformed, oversized and unrelated messages", () => {
    for (const raw of [
      null,
      [],
      42,
      "{broken",
      "x".repeat(10001),
      { type: "MOUNTED" },
      { height: 500 },
    ])
      expect(readEmbedSignal("Instagram", raw, "")).toBeNull();
  });
  it("fits both providers on narrow and wide cards without cropping", () => {
    for (const platform of ["Instagram", "TikTok"] as const)
      for (const width of [240, 288, 322, 350, 620, 900]) {
        const g = embedGeometry(platform, width, 950);
        expect(g.width * g.scale).toBeCloseTo(width);
        expect(g.height).toBe(Math.ceil(950 * g.scale));
        expect(g.scale).toBeLessThanOrEqual(1);
        expect(g.width).toBeGreaterThanOrEqual(
          platform === "Instagram" ? 326 : 288,
        );
      }
  });
});
