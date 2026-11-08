import { it, expect } from "vitest";
import { introPhaseAt, nextIntroBoundary, INTRO_TIMING } from "@/lib/introduction";
it("keeps the welcome visible through reveal, hold and exit for 3.2 seconds", () => {
  expect(INTRO_TIMING.total).toBe(3200);
  expect(introPhaseAt(0)).toBe("reveal");
  expect(introPhaseAt(899)).toBe("reveal");
  expect(introPhaseAt(900)).toBe("hold");
  expect(introPhaseAt(1800)).toBe("hold");
  expect(introPhaseAt(2699)).toBe("hold");
  expect(introPhaseAt(2700)).toBe("exit");
  expect(introPhaseAt(3199)).toBe("exit");
  expect(introPhaseAt(3200)).toBe("done");
});
it("uses absolute boundaries so a delayed or background callback cannot restart the intro", () => {
  expect(nextIntroBoundary(100)).toBe(900);
  expect(nextIntroBoundary(1250)).toBe(2700);
  expect(nextIntroBoundary(3010)).toBe(3200);
  expect(nextIntroBoundary(3200)).toBeUndefined();
  expect(introPhaseAt(60000)).toBe("done");
});
