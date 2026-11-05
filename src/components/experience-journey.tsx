"use client";
import { OrganisationLogo } from "./organisation-logo";
import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import Image from "next/image";
import { experience } from "@/content/profile";
export function ExperienceJourney() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const roles = [...experience].reverse();
  return (
    <section className="section journey" ref={ref}>
      <div className="journey-rail" aria-hidden="true">
        <motion.div style={{ scaleY: reduced ? 1 : scrollYProgress }} />
      </div>
      <p className="eyebrow">
        MY JOURNEY — FROM HOSPITALITY TO GLOBAL BUSINESS
      </p>
      {roles.map((e, i) => (
        <article className="journey-stop" key={e.role}>
          <div className="stop-meta">
            <span className="stamp-number">0{i + 1}</span>
            <p>{e.period}</p>
            <span className="status">
              {i === 2 ? "Current chapter" : "Hospitality foundation"}
            </span>
          </div>
          <div className="journey-card">
            <Image
              src={
                i === 2
                  ? "/images/editorial/london.jpg"
                  : "/images/editorial/maldives.jpg"
              }
              alt={
                i === 2
                  ? "London city skyline representing the UK outbound travel market"
                  : "Maldives island landscape providing destination context"
              }
              width={1200}
              height={800}
              sizes="(max-width:600px) 90vw, 60vw"
            />
            <div className="journey-card-copy">
              <div className="chapter-brands">
                {(i === 2
                  ? ["moresand", "travelcenter"]
                  : ["siyam", "sunsiyam"]
                ).map((id) => (
                  <OrganisationLogo id={id} key={id} />
                ))}
              </div>
              <p className="eyebrow">{e.employer}</p>
              {i === 1 && (
                <p className="chapter-link">
                  Continuing within Siyam World Maldives · Sun Siyam Resorts
                </p>
              )}
              <h2>{e.role}</h2>
              <p>{e.description}</p>
              <details
                onToggle={(event) => {
                  if (event.currentTarget.open)
                    setVisited((v) =>
                      v.includes(e.role) ? v : [...v, e.role],
                    );
                }}
              >
                <summary>
                  Explore this chapter <span>+</span>
                </summary>
                <ul>
                  {e.responsibilities.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="tags">
                  {e.tools.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </details>
              <p className="micro-copy">
                {i === 2
                  ? "UK market focus; based in Colombo."
                  : "Destination imagery is contextual, not a photograph of Shaun’s workplace."}{" "}
              </p>
            </div>
          </div>
        </article>
      ))}
      {!dismissed && (
        <div
          className={
            "passport-reward " + (visited.length === 3 ? "unlocked" : "")
          }
          aria-live="polite"
        >
          {visited.length === 3 ? (
            <>
              <span>✧</span>
              <p className="eyebrow">PASSPORT STAMP / JOURNEY EXPLORER</p>
              <p>Every journey begins with curiosity.</p>
            </>
          ) : (
            <p>
              Open each career chapter to collect a small travel stamp.{" "}
              {visited.length}/3 explored.
            </p>
          )}
          {visited.length === 3 && (
            <button className="text-link" onClick={() => setDismissed(true)}>
              Dismiss stamp ×
            </button>
          )}
        </div>
      )}
    </section>
  );
}
