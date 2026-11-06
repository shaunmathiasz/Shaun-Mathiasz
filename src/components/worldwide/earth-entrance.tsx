"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { DestinationMap } from "./destination-map";
import type { DestinationId } from "@/content/worldwide";
const Earth = dynamic(() => import("./earth"), {
  ssr: false,
  loading: () => (
    <p className="ww-earth-loading" role="status">
      Opening your 3D world…
    </p>
  ),
});
/** Do not compile shaders below the fold. A useful map remains immediately available. */
export function EarthEntrance() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false),
    [mode, setMode] = useState<"auto" | "flat" | "3d">("auto"),
    [selected, setSelected] = useState<DestinationId>("maldives");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.65) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.65 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="ww-earth-entrance">
      {mode === "3d" || (mode === "auto" && visible) ? (
        <Earth />
      ) : (
        <div className="ww-earth-stage">
          <div className="ww-earth-orbit" aria-hidden="true" />
          <div className="ww-earth-fallback">
            <DestinationMap selected={selected} onSelect={setSelected} />
            <p>Six destinations. One connected world.</p>
          </div>
          <div className="ww-earth-controls">
            <button onClick={() => setMode("3d")}>Try 3D Earth</button>
            <button
              onClick={() => setMode("flat")}
              aria-pressed={mode === "flat"}
            >
              Use 2D map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
