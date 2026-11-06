"use client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { animate, useInView } from "motion/react";
import { digitalPlatforms, combinedAudience } from "@/content/influence";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <span className="rolling-window">
      <span
        className="rolling-strip"
        data-roll-digit={digit}
        data-roll-delay={delay}
        style={{ transform: `translateY(-${digit * 1.15}em)` }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i}>{i % 10}</span>
        ))}
      </span>
    </span>
  );
}
function RollingNumber({ display, delay }: { display: string; delay: number }) {
  return (
    <>
      <span className="rolling-static" aria-hidden="true">
        {display}
      </span>
      <span className="rolling-number" aria-hidden="true">
        {[...display].map((char, i) =>
          /\d/.test(char) ? (
            <RollingDigit
              key={i}
              digit={Number(char)}
              delay={delay + i * 0.012}
            />
          ) : (
            <span className="rolling-symbol" key={i}>
              {char}
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{display.replace("~", "Approximately ")}</span>
    </>
  );
}
export function Influence() {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.15 });
  const reduced = useSafeReducedMotion();
  const played = useRef(false);
  useLayoutEffect(() => {
    if (!ref.current) return;
    if (reduced || played.current) {
      if (seen) played.current = true;
      ref.current
        .querySelectorAll<HTMLElement>("[data-roll-digit]")
        .forEach((el) => {
          el.style.transform = `translateY(-${Number(el.dataset.rollDigit) * 1.15}em)`;
        });
      return;
    }
    if (!seen) return;
    played.current = true;
    const runs = [
      ...ref.current.querySelectorAll<HTMLElement>("[data-roll-digit]"),
    ].map((el) =>
      animate(
        el,
        {
          transform: [
            "translateY(0em)",
            `translateY(-${(10 + Number(el.dataset.rollDigit)) * 1.15}em)`,
          ],
        },
        {
          duration: 1.9,
          delay: Number(el.dataset.rollDelay),
          ease: [0.16, 1, 0.3, 1],
        },
      ),
    );
    return () => runs.forEach((run) => run.stop());
  }, [seen, reduced]);

  return (
    <section
      ref={ref}
      className={`section digital-presence ${seen ? "presence-seen" : ""}`}
      data-cinematic
      aria-labelledby="digital-presence-title"
    >
      <div className="section-title">
        <div>
          <p className="eyebrow">BEYOND BORDERS / ONLINE</p>
          <h2 id="digital-presence-title">Digital Presence.</h2>
        </div>
        <p>Connecting, creating and sharing across platforms.</p>
      </div>
      <div className="digital-platform-grid">
        {digitalPlatforms.map((platform, index) => (
          <article
            key={platform.name}
            className="digital-platform-card"
            style={
              {
                "--platform-accent": platform.accent,
                "--presence-delay": `${index * 120}ms`,
              } as CSSProperties
            }
          >
            <header>
              <Image
                src={`/logos/social-${platform.icon}.svg`}
                alt=""
                width={26}
                height={26}
              />
              <div>
                <h3>{platform.name}</h3>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform.handle}
                  <span aria-hidden="true"> ↗</span>
                </a>
              </div>
            </header>
            <dl>
              {platform.metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className={
                    i === 0
                      ? "primary-platform-metric"
                      : "secondary-platform-metric"
                  }
                >
                  <dt>{metric.label}</dt>
                  <dd>
                    <RollingNumber
                      display={metric.display}
                      delay={index * 0.12}
                    />
                  </dd>
                </div>
              ))}
            </dl>
            <a
              className="text-link platform-profile-link"
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {platform.name} ↗
            </a>
          </article>
        ))}
      </div>
      <div className="combined-audience">
        <p className="eyebrow">A CONNECTED WORLD</p>
        <div className="combined-number">
          <RollingNumber display={combinedAudience.display} delay={0.48} />
        </div>
        <h3>{combinedAudience.label}</h3>
        <p>{combinedAudience.caption}</p>
        <Link prefetch={false} href="/contact#social" className="text-link">
          Explore the profiles ↗
        </Link>
      </div>
    </section>
  );
}
