"use client";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { photography } from "@/content/visual-assets";
import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
export function HeroAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  return (
    <div className="hero-atmosphere" ref={ref} aria-hidden="true">
      <motion.div style={{ y: reduced || !fine ? 0 : y }}>
        <Image
          src={photography.maldives.src}
          alt=""
          fill
          sizes="(max-width: 600px) 1px, 100vw"
          priority
          quality={50}
        />
      </motion.div>
      <svg viewBox="0 0 1000 300" className="hero-route">
        <path d="M-20 250 Q300 310 500 140 T1020 20" />
        <circle cx="500" cy="140" r="4" />
      </svg>
    </div>
  );
}
