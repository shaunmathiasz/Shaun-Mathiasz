"use client";
import { useSyncExternalStore } from "react";
const query = "(hover: hover) and (pointer: fine) and (min-width: 900px)";
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
export function useFinePointer() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
