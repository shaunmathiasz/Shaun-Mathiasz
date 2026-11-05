"use client";
import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.animate(
            [
              { opacity: 0.65, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);
  return (
    <motion.div
      ref={ref}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
