"use client";
import { useEffect, useState } from "react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

export function HomeIntroduction() {
  const reduced = useSafeReducedMotion();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem("shaun-intro-v4")) return;
      sessionStorage.setItem("shaun-intro-v4", "seen");
    } catch {
      /* Still expires automatically if session storage is unavailable. */
    }
    // A late-hydrating connection should never receive a delayed introduction.
    if (performance.now() > 1800) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setVisible(false), 1050);
    function skip(e: KeyboardEvent) {
      if (e.key === "Escape") setVisible(false);
    }
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [reduced]);
  if (!visible || reduced) return null;
  return (
    <aside className="identity-intro" aria-label="A brief introduction">
      <span className="intro-name">
        SHAUN DENVER
        <br />
        <strong>MATHIASZ</strong>
      </span>
      <span className="intro-disciplines">TRAVEL / COMMERCE / STRATEGY</span>
      <span className="intro-horizon" aria-hidden="true" />
      <button onClick={() => setVisible(false)}>Skip introduction ↗</button>
    </aside>
  );
}
