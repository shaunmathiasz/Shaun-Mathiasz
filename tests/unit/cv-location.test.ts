import { it, expect } from "vitest";
import { browserLocationMap } from "@/lib/cv/location";

it("links consented coordinates to Google Maps without losing precision", () => {
  const result = browserLocationMap({ latitude: 6.927079, longitude: 79.861244, accuracy: 20 }, "granted")!;
  const url = new URL(result.url);
  expect(url.origin).toBe("https://www.google.com");
  expect(url.pathname).toBe("/maps/search/");
  expect(url.searchParams.get("query")).toBe("6.927079,79.861244");
  expect(url.searchParams.get("api")).toBe("1");
  expect(result.accuracy).toBe(20);
});

it("does not manufacture coordinates for denied, missing or expired data", () => {
  const coords = { latitude: 6, longitude: 79 };
  for (const permission of ["denied", "pending", "unavailable", undefined])
    expect(browserLocationMap(coords, permission)).toBeNull();
  expect(browserLocationMap(null, "granted")).toBeNull();
});

it("rejects malformed coordinates and accepts zero-valued coordinates", () => {
  for (const latitude of [NaN, Infinity, 91, -91, "6"])
    expect(browserLocationMap({ latitude, longitude: 79 }, "granted")).toBeNull();
  for (const longitude of [NaN, Infinity, 181, -181, "79"])
    expect(browserLocationMap({ latitude: 6, longitude }, "granted")).toBeNull();
  expect(browserLocationMap({ latitude: 0, longitude: 0 }, "granted")?.latitude).toBe(0);
});
