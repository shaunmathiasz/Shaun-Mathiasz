"use client";
import { LinkArrow } from "./link-arrow";
import { useIntroduction } from "@/lib/use-introduction";
export function HomeIntroduction() {
  const { phase, skip } = useIntroduction();
  if (phase === "idle" || phase === "done") return null;
  return (
    <aside className="identity-intro" data-phase={phase} aria-label="Welcome introduction">
      <p className="intro-kicker">A WIDER PERSPECTIVE / COLOMBO · THE WORLD</p>
      <span className="intro-name">
        <span>Shaun Denver</span>
        <span>Mathiasz<span className="intro-full-stop">.</span></span>
      </span>
      <p className="intro-tagline">BEYOND DESTINATIONS.<br />TOWARDS POSSIBILITIES.</p>
      <div className="intro-horizon" aria-hidden="true"><span /></div>
      <div className="intro-bottom">
        <span>TRAVEL / COMMERCE / STRATEGY</span>
        <button type="button" onClick={skip}>Skip intro <LinkArrow /></button>
      </div>
    </aside>
  );
}
