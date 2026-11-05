import { describe, it, expect } from "vitest";
function luminance(hex: string) {
  const values = hex
    .match(/[a-f\d]{2}/gi)!
    .map((n) => parseInt(n, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function ratio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
describe("core text palette contrast", () => {
  it.each([
    ["#F5F2EA", "#060B16"],
    ["#9DAABD", "#060B16"],
    ["#D2B88A", "#060B16"],
    ["#060B16", "#D2B88A"],
    ["#9DAABD", "#12233B"],
    ["#D2B88A", "#12233B"],
  ])("%s on %s meets normal-text AA contrast", (fg, bg) =>
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5),
  );
});
