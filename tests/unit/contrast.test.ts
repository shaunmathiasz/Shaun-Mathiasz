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
    ["#F4F0E8", "#090B0F"],
    ["#a0a6b1", "#090B0F"],
    ["#C9A86A", "#090B0F"],
    ["#090B0F", "#C9A86A"],
    ["#a0a6b1", "#171B24"],
    ["#C9A86A", "#171B24"],
  ])("%s on %s meets normal-text AA contrast", (fg, bg) =>
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5),
  );
});
