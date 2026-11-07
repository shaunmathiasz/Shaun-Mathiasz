"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { photography } from "@/content/visual-assets";
export function EditorialImage({
  asset,
  caption,
}: {
  asset: keyof typeof photography;
  caption: string;
}) {
  const photo = photography[asset];
  const ref = useRef<HTMLElement>(null);
  const mask = useRef<HTMLDivElement>(null);
  const reduced = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-9, 9]);
  useEffect(() => {
    const el = mask.current;
    if (!el || reduced) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animation = el.animate(
            [
              { clipPath: "inset(3% 3% 5% 3%)", opacity: 0.85 },
              { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
            ],
            { duration: 800, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [reduced]);
  return (
    <figure ref={ref} className="curated-photo">
      <div ref={mask} className="curated-photo-mask">
        <motion.div
          className="curated-photo-motion"
          style={{ y: reduced ? 0 : y }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 600px) 90vw, 45vw"
            quality={75}
          />
        </motion.div>
        <span className="curated-photo-edge" aria-hidden="true" />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
