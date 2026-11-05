"use client";
import { useSyncExternalStore } from "react";
const query = "(prefers-reduced-motion: reduce)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  window.addEventListener("shaun-motion-change", listener);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener("shaun-motion-change", listener);
  };
}
function snapshot() {
  return (
    window.matchMedia(query).matches ||
    document.documentElement.dataset.motion === "reduced"
  );
}
export function useSafeReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
