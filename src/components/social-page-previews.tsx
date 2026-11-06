"use client";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import {
  socialPagePreviews,
  type SocialPagePreview,
} from "@/content/social-previews";
import { site } from "@/config/site";
function PreviewCard({ page }: { page: SocialPagePreview }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <article
      className="social-page-card"
      style={{ "--platform-accent": page.accent } as CSSProperties}
    >
      <header>
        <Image
          src={`/logos/social-${page.icon}.svg`}
          alt=""
          width={28}
          height={28}
        />
        <div>
          <h3>{page.platform}</h3>
          <a href={page.url} target="_blank" rel="noopener noreferrer">
            {page.handle} ↗
          </a>
        </div>
      </header>
      {open ? (
        <div className="provider-frame">
          <iframe
            src={page.embedUrl}
            title={`${page.platform} page preview for ${page.handle}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => {
              setOpen(false);
              setFailed(true);
            }}
          />
        </div>
      ) : (
        <div className="page-preview-cover">
          <Image
            src={site.portrait.src}
            alt="Shaun Denver Mathiasz"
            width={600}
            height={450}
            sizes="(max-width:600px) 90vw,45vw"
          />
          <div>
            <p className="eyebrow">SHAUN DENVER MATHIASZ</p>
            <p>A little more of the person behind the perspective.</p>
            <button
              className="button outline-button"
              onClick={() => {
                setOpen(true);
                setFailed(false);
              }}
            >
              Load {page.platform} preview ↗
            </button>
            <small>
              {failed
                ? `You can also explore the page directly on ${page.platform}.`
                : `Loads content from ${page.platform} when you choose.`}
            </small>
          </div>
        </div>
      )}
      <footer>
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Open {page.platform} page ↗
        </a>
        {open && (
          <button className="text-link" onClick={() => setOpen(false)}>
            Close preview ×
          </button>
        )}
      </footer>
    </article>
  );
}
export function SocialPagePreviews() {
  return (
    <section className="section social-page-previews" id="page-previews">
      <div className="section-title">
        <div>
          <p className="eyebrow">ON THE FEED</p>
          <h2>A closer look, beyond the work.</h2>
        </div>
        <p>Explore my Instagram and TikTok pages.</p>
      </div>
      <div className="social-page-grid">
        {socialPagePreviews.map((page) => (
          <PreviewCard key={page.platform} page={page} />
        ))}
      </div>
    </section>
  );
}
