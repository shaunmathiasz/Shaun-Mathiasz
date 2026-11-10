"use client";
import { LinkArrow } from "@/components/link-arrow";


import { motionTokens } from "@/lib/motion";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

/** Progressive decoration only: native cursor, scrolling and links stay intact. */
export function CinematicSystem() {
  const pathname = usePathname();
  const reduced = useSafeReducedMotion();
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target.parentElement?.closest("[data-cinematic]")) {
            observer.unobserve(entry.target);
            continue;
          }
          animations.push(
            entry.target.animate(
              [
                { opacity: 0.6, transform: `translateY(${motionTokens.distance.reveal}px)` },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: motionTokens.duration.reveal * 1000, easing: motionTokens.easing },
            ),
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-cinematic], .section-title, .page-intro h1")
      .forEach((el) => observer.observe(el));
    const visibility = new IntersectionObserver((entries) =>
      entries.forEach((entry) => {
        (entry.target as HTMLElement).dataset.motionVisible = String(
          entry.isIntersecting,
        );
      }),
    );
    document
      .querySelectorAll(".hero,.contact-cta")
      .forEach((el) => visibility.observe(el));
    return () => {
      visibility.disconnect();
      observer.disconnect();
      animations.forEach((a) => a.cancel());
    };
  }, [pathname, reduced]);

  useEffect(() => {
    const el = cursor.current;
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 851px)",
    );
    if (!el || reduced) return;
    let frame = 0;
    let active: HTMLElement | null = null;
    let card: HTMLElement | null = null;
    function reset() {
      active?.style.removeProperty("--magnet-x");
      active?.style.removeProperty("--magnet-y");
      card?.style.removeProperty("--tilt-x");
      card?.style.removeProperty("--tilt-y");
      active = card = null;
    }
    function hide() {
      if (el) el.dataset.visible = "false";
      reset();
    }
    function move(e: PointerEvent) {
      if (!fine.matches || e.pointerType !== "mouse" || document.hidden) {
        hide();
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!el) return;
        const target = e.target instanceof Element ? e.target : null;
        if (
          !target ||
          target.closest("input,select,textarea,[contenteditable=true]") ||
          window.getSelection()?.toString()
        ) {
          hide();
          return;
        }
        const next = target.closest<HTMLElement>(".button");
        const nextCard = target.closest<HTMLElement>(
          ".project-card, .hero-portrait",
        );
        if (next !== active || nextCard !== card) reset();
        active = next;
        card = nextCard;
        if (active && !active.matches(":focus-visible")) {
          const r = active.getBoundingClientRect();
          active.style.setProperty(
            "--magnet-x",
            `${Math.max(-4, Math.min(4, (e.clientX - r.left - r.width / 2) * 0.035))}px`,
          );
          active.style.setProperty(
            "--magnet-y",
            `${Math.max(-3, Math.min(3, (e.clientY - r.top - r.height / 2) * 0.035))}px`,
          );
        }
        if (card) {
          const r = card.getBoundingClientRect();
          card.style.setProperty(
            "--tilt-x",
            `${(-(e.clientY - r.top - r.height / 2) / r.height) * 2}deg`,
          );
          card.style.setProperty(
            "--tilt-y",
            `${((e.clientX - r.left - r.width / 2) / r.width) * 2}deg`,
          );
        }
        const hint =
          target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ||
          (target.closest("a,button,summary") ? "link" : "");
        const label = el.querySelector<HTMLElement>("[data-cursor-label]");
        if (label) label.textContent = hint === "link" ? "" : hint;
        el.dataset.icon = hint === "link" ? "true" : "false";
        el.dataset.hint = hint ? "true" : "false";
        el.dataset.visible = "true";
        el.style.transform = `translate3d(${Math.min(e.clientX + 18, window.innerWidth - 82)}px,${Math.min(e.clientY + 18, window.innerHeight - 82)}px,0)`;
      });
    }
    function leave(e: PointerEvent) {
      if (!e.relatedTarget) hide();
    }
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("keydown", hide);
    fine.addEventListener("change", hide);
    return () => {
      cancelAnimationFrame(frame);
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("keydown", hide);
      fine.removeEventListener("change", hide);
    };
  }, [pathname, reduced]);
  return <div ref={cursor} className="cursor-companion" aria-hidden="true"><LinkArrow /><span data-cursor-label /></div>;
}

export function MotionToggle() {
  const reduced = useSafeReducedMotion();
  useEffect(() => {
    try {
      if (localStorage.getItem("shaun-motion") === "paused") {
        document.documentElement.dataset.motion = "reduced";
        window.dispatchEvent(new Event("shaun-motion-change"));
      }
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function toggle() {
    if (document.documentElement.dataset.motion === "reduced")
      delete document.documentElement.dataset.motion;
    else document.documentElement.dataset.motion = "reduced";
    try {
      localStorage.setItem(
        "shaun-motion",
        document.documentElement.dataset.motion === "reduced" ? "paused" : "on",
      );
    } catch {
      /* Optional. */
    }
    window.dispatchEvent(new Event("shaun-motion-change"));
  }
  return (
    <button
      className="motion-toggle"
      aria-pressed={reduced}
      onClick={toggle}
      disabled={
        reduced &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      }
    >
      {reduced ? "Visual effects paused" : "Pause visual effects"}
      <span aria-hidden="true"> {reduced ? "Ⅱ" : "◌"}</span>
    </button>
  );
}
