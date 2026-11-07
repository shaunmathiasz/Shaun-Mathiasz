"use client";
import Image from "next/image";
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  socialPagePreviews,
  type SocialPagePreview,
} from "@/content/social-previews";
import { PlatformArtwork } from "@/components/platform-artwork";
import {
  DEFAULT_PREVIEW_HEIGHT,
  PREVIEW_TIMEOUT_MS,
  embedGeometry,
  readEmbedSignal,
} from "@/lib/social-embed";
type PreviewState = "idle" | "loading" | "ready" | "error";
function PreviewCard({ page }: { page: SocialPagePreview }) {
  const [status, setStatus] = useState<PreviewState>("idle");
  const [attempt, setAttempt] = useState(0);
  const phase = useRef<PreviewState>("idle");
  const latestAttempt = useRef(0);
  const transition = useCallback((next: PreviewState) => {
    phase.current = next;
    setStatus(next);
  }, []);
  const [height, setHeight] = useState(DEFAULT_PREVIEW_HEIGHT);
  const [width, setWidth] = useState(0);
  const shell = useRef<HTMLDivElement>(null),
    iframe = useRef<HTMLIFrameElement>(null),
    errorHeading = useRef<HTMLHeadingElement>(null);
  const focusError = useRef(false);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const token = `__tt_embed__${id}_${attempt}`;
  const active = status !== "idle";
  const geometry = embedGeometry(page.platform, width, height);
  const origin = new URL(page.embedUrl).origin;
  useEffect(() => {
    if (!active || !shell.current) return;
    const el = shell.current;
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);
  useLayoutEffect(() => {
    if (status !== "loading" && status !== "ready") return;
    function receive(event: MessageEvent) {
      if (
        (phase.current !== "loading" && phase.current !== "ready") ||
        latestAttempt.current !== attempt ||
        event.origin !== origin ||
        !iframe.current ||
        event.source !== iframe.current.contentWindow
      )
        return;
      const signal = readEmbedSignal(page.platform, event.data, token);
      if (!signal) return;
      if (signal.height !== undefined) setHeight(signal.height);
      if (signal.ready) transition("ready");
    }
    window.addEventListener("message", receive);
    const timer =
      status === "loading"
        ? window.setTimeout(() => {
            if (
              phase.current !== "loading" ||
              latestAttempt.current !== attempt
            )
              return;
            focusError.current = Boolean(
              shell.current?.contains(document.activeElement),
            );
            transition("error");
          }, PREVIEW_TIMEOUT_MS)
        : undefined;
    return () => {
      window.removeEventListener("message", receive);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [status, attempt, origin, page.platform, token, transition]);
  useEffect(() => {
    if (status === "error" && focusError.current) {
      errorHeading.current?.focus({ preventScroll: true });
      focusError.current = false;
    }
  }, [status]);
  function start() {
    setHeight(DEFAULT_PREVIEW_HEIGHT);
    latestAttempt.current += 1;
    setAttempt(latestAttempt.current);
    transition("loading");
  }
  function fail() {
    focusError.current = true;
    transition("error");
  }
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
      {active ? (
        <div
          className={`provider-shell provider-${status}`}
          ref={shell}
          style={{
            height:
              status === "ready"
                ? geometry.height
                : status === "error"
                  ? DEFAULT_PREVIEW_HEIGHT
                  : Math.max(
                      420,
                      Math.min(DEFAULT_PREVIEW_HEIGHT, geometry.height),
                    ),
          }}
        >
          {(status === "loading" || status === "ready") && (
            <iframe
              key={attempt}
              ref={iframe}
              name={token}
              className="provider-embed"
              data-ready={status === "ready"}
              style={{
                width: geometry.width,
                height,
                scale: geometry.scale,
                transformOrigin: "top left",
              }}
              src={page.embedUrl}
              title={`${page.platform} page preview for ${page.handle}`}
              loading="eager"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              allow="encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              aria-hidden={status !== "ready"}
              tabIndex={status === "ready" ? 0 : -1}
              onError={() => {
                if (
                  latestAttempt.current !== attempt ||
                  (phase.current !== "loading" && phase.current !== "ready")
                )
                  return;
                focusError.current = Boolean(
                  shell.current?.contains(document.activeElement),
                );
                transition("error");
              }}
            />
          )}
          {status === "loading" && (
            <div className="provider-notice" role="status">
              <span className="provider-route-mark" aria-hidden="true">
                ↗
              </span>
              <p className="eyebrow">
                CONNECTING TO {page.platform.toUpperCase()}
              </p>
              <p className="provider-notice-title">
                Opening another perspective.
              </p>
              <p>
                Waiting for the preview. You can also open the profile directly.
              </p>
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Open {page.platform} ↗
              </a>
            </div>
          )}
          {status === "error" && (
            <div className="provider-notice provider-error" role="status">
              <span className="provider-route-mark" aria-hidden="true">
                ↗
              </span>
              <p className="eyebrow">PREVIEW TEMPORARILY UNAVAILABLE</p>
              <h4 ref={errorHeading} tabIndex={-1}>
                A short pause in the journey.
              </h4>
              <p>
                {page.platform} isn’t displaying this preview right now. Try
                again or open the profile directly.
              </p>
              <div className="provider-recovery-actions">
                <button className="button outline-button" onClick={start}>
                  Try {page.platform} again ↻
                </button>
                <a
                  className="button gold-button"
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {page.platform} ↗
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="page-preview-cover">
          <PlatformArtwork platform={page.platform} />
          <div>
            <p className="eyebrow">SHAUN DENVER MATHIASZ</p>
            <p>Explore a different side of the journey.</p>
            <button className="button outline-button" onClick={start}>
              Load {page.platform} preview ↗
            </button>
            <small>Loads content from {page.platform} when you choose.</small>
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
        {(status === "ready" || status === "loading") && (
          <button className="text-link" onClick={fail}>
            Preview not working?
          </button>
        )}
        {active && (
          <button className="text-link" onClick={() => transition("idle")}>
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
