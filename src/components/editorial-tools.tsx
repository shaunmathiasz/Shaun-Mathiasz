"use client";
import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { site } from "@/config/site";
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress"
      style={{ scaleX: reduced ? scrollYProgress : spring }}
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
        Copy Email Address ↗
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
export function ArticleTools() {
  const [status, setStatus] = useState("");
  const { scrollYProgress } = useScroll();
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
      <button onClick={share}>Share / copy link ↗</button>
      <span role="status">{status}</span>
      <motion.span
        className="reading-rule"
        style={{ scaleX: scrollYProgress }}
      />
    </aside>
  );
}
