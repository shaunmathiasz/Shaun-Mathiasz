export const INTRO_SESSION_KEY = "shaun-welcome-seen";
export const INTRO_TIMING = { reveal: 900, exitAt: 2700, total: 3200 } as const;
export type IntroPhase = "idle" | "reveal" | "hold" | "exit" | "done";
export function introPhaseAt(elapsed: number): IntroPhase {
  if (elapsed >= INTRO_TIMING.total) return "done";
  if (elapsed >= INTRO_TIMING.exitAt) return "exit";
  if (elapsed >= INTRO_TIMING.reveal) return "hold";
  return "reveal";
}
export function nextIntroBoundary(elapsed: number) {
  return [INTRO_TIMING.reveal, INTRO_TIMING.exitAt, INTRO_TIMING.total]
    .find((boundary) => boundary > elapsed);
}
