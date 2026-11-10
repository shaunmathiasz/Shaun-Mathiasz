import { LinkArrow } from "@/components/link-arrow";
import Image from "next/image";
import Link from "next/link";
import { digitalPlatforms, combinedAudience } from "@/content/influence";
import { DigitalPresenceLoader } from "./digital-presence-loader";
import type { CSSProperties } from "react";
function Snapshot({ display }: { display: string }) {
  return (
    <>
      <span className="snapshot-number rolling-number" aria-hidden="true">
        {[...display].map((c, i) =>
          /\d/.test(c) ? (
            <span className="rolling-window" key={i}>
              <span>{c}</span>
            </span>
          ) : (
            <span className="rolling-symbol" key={i}>
              {c}
            </span>
          ),
        )}
      </span>
      <span className="rolling-static" aria-hidden="true">
        {display}
      </span>
      <span className="sr-only">{display.replace("~", "Approximately ")}</span>
    </>
  );
}
export function DigitalPresence() {
  return (
    <DigitalPresenceLoader>
      <section
        className="section digital-presence"
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
          {digitalPlatforms.map((p) => (
            <article
              className="digital-platform-card"
              key={p.name}
              style={{ "--platform-accent": p.accent } as CSSProperties}
            >
              <header>
                <Image
                  src={`/logos/social-${p.icon}.svg`}
                  alt=""
                  width={26}
                  height={26}
                />
                <div>
                  <h3>{p.name}</h3>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.handle} <LinkArrow />
                  </a>
                </div>
              </header>
              <dl>
                {p.metrics.map((m, i) => (
                  <div
                    key={m.label}
                    className={
                      i === 0
                        ? "primary-platform-metric"
                        : "secondary-platform-metric"
                    }
                  >
                    <dt>{m.label}</dt>
                    <dd>
                      <Snapshot display={m.display} />
                    </dd>
                  </div>
                ))}
              </dl>
              <a
                className="text-link platform-profile-link"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {p.name} <LinkArrow />
              </a>
            </article>
          ))}
        </div>
        <div className="combined-audience">
          <p className="eyebrow">A CONNECTED WORLD</p>
          <div className="combined-number">
            <Snapshot display={combinedAudience.display} />
          </div>
          <h3>{combinedAudience.label}</h3>
          <p>{combinedAudience.caption}</p>
          <Link prefetch={false} href="/contact#social" className="text-link">
            Explore the profiles <LinkArrow />
          </Link>
        </div>
      </section>
    </DigitalPresenceLoader>
  );
}
