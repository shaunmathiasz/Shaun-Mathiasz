"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useSafeReducedMotion } from "./use-safe-reduced-motion";
import { INTRO_SESSION_KEY, introPhaseAt, nextIntroBoundary, type IntroPhase } from "./introduction";

// Client-only timeline survives React effect re-subscriptions and route remounts.
const initial = { phase: "idle" as IntroPhase };
let snapshot = initial;
let startedAt = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
function publish(phase: IntroPhase) {
  if (snapshot.phase === phase) return;
  snapshot = { phase };
  listeners.forEach((notify) => notify());
}
export function finishIntroduction() {
  clearTimeout(timer);
  document.removeEventListener("visibilitychange", tick);
  // Do not leave keyboard focus on a disappearing Skip button.
  const panel = document.querySelector(".identity-intro");
  if (panel?.contains(document.activeElement))
    document.getElementById("main")?.focus({ preventScroll: true });
  try { sessionStorage.setItem(INTRO_SESSION_KEY, "seen"); } catch { /* In-memory session remains valid. */ }
  publish("done");
}
function tick() {
  if (snapshot.phase === "done") return;
  clearTimeout(timer);
  const elapsed = performance.now() - startedAt;
  const phase = introPhaseAt(elapsed);
  if (phase === "done") return finishIntroduction();
  publish(phase);
  const boundary = nextIntroBoundary(elapsed);
  if (boundary !== undefined) timer = setTimeout(tick, Math.max(1, boundary - elapsed));
}
function begin() {
  if (snapshot.phase !== "idle") return;
  let seen = false;
  let paused = false;
  try { seen = sessionStorage.getItem(INTRO_SESSION_KEY) === "seen"; } catch { /* Use in-memory state. */ }
  try { paused = localStorage.getItem("shaun-motion") === "paused"; } catch { /* Browser preference still applies. */ }
  if (seen || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced") {
    finishIntroduction();
    return;
  }
  startedAt = performance.now();
  document.addEventListener("visibilitychange", tick);
  tick();
}
function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    // Strict Mode immediately re-subscribes; actual navigation completes it.
    queueMicrotask(() => {
      if (!listeners.size && snapshot.phase !== "idle" && snapshot.phase !== "done")
        finishIntroduction();
    });
  };
}
const getSnapshot = () => snapshot;
const getServerSnapshot = () => initial;
export function useIntroduction() {
  const reduced = useSafeReducedMotion();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => { if (reduced) finishIntroduction(); else begin(); }, [reduced]);
  useEffect(() => {
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape" && snapshot.phase !== "idle" && snapshot.phase !== "done")
        finishIntroduction();
    };
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, []);
  return { phase: reduced ? "done" : state.phase, skip: finishIntroduction };
}
