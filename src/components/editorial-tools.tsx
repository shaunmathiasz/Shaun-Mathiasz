"use client";
import { LinkArrow } from "@/components/link-arrow";

import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
/** The same decorative bar, without loading an animation engine on every route. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const total = Math.max(
          1,
          document.documentElement.scrollHeight - innerHeight,
        );
        const progress = Math.max(0, Math.min(1, scrollY / total));
        if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      });
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);
  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="scroll-progress"
      style={{
        transform: "scaleX(0)",
        transition: reduced ? "none" : "transform 120ms ease-out",
      }}
    />
  );
}

export function CopyEmail() {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(site.professionalEmail);
      setStatus("Email address copied.");
    } catch {
      setStatus(
        "Copy unavailable. Select the address above or open your email app.",
      );
    }
  }
  return (
    <div className="copy-email">
      <button className="button outline-button" onClick={copy}>
        Copy Email Address <LinkArrow />
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
export function ArticleTools() {
  const [status, setStatus] = useState("");
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = article.getBoundingClientRect();
        const end =
          rect.height - Math.min(window.innerHeight * 0.6, rect.height);
        const value =
          end > 0
            ? Math.min(
                1,
                Math.max(0, (window.innerHeight * 0.3 - rect.top) / end),
              )
            : rect.top <= window.innerHeight * 0.3
              ? 1
              : 0;
        if (progress.current)
          progress.current.style.transform = `scaleX(${value})`;
      });
    };
    const resize = new ResizeObserver(update);
    resize.observe(article);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: location.href });
        setStatus("Share opened.");
      } else {
        await navigator.clipboard.writeText(location.href);
        setStatus("Article link copied.");
      }
    } catch {
      setStatus(
        "Sharing was cancelled or unavailable. You can copy the address from your browser.",
      );
    }
  }
  return (
    <aside className="reading-tools">
      <span>FIELD NOTES / READING COMPANION</span>
      <button onClick={share}>
        Share / copy link <LinkArrow />
      </button>
      <span role="status">{status}</span>
      <span
        ref={progress}
        className="reading-rule"
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
      />
    </aside>
  );
}
