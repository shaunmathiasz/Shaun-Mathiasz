"use client";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
export function DigitalPresenceLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [Animated, setAnimated] = useState<ComponentType | null>(null);
  const reduced = useSafeReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        import("./influence")
          .then((module) => {
            if (active) setAnimated(() => module.Influence);
          })
          .catch(() => {});
      },
      { rootMargin: "600px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [reduced]);
  return <div ref={ref}>{Animated ? <Animated /> : children}</div>;
}
