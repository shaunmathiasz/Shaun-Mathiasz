"use client";
import { LinkArrow } from "@/components/link-arrow";

import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { animate } from "motion/react";
import { careerLocations as places } from "@/content/career-locations";
import { useFinePointer } from "@/lib/use-fine-pointer";
import land from "@/content/land.json";
export function projectPoint(lon: number, lat: number, rotation: number) {
  const a = ((lon - rotation) * Math.PI) / 180,
    b = (lat * Math.PI) / 180;
  return {
    x: 250 + 205 * Math.cos(b) * Math.sin(a),
    y: 250 - 205 * Math.sin(b),
    visible: Math.cos(b) * Math.cos(a) > 0,
  };
}
function coastline(rotation: number) {
  return land
    .map((ring) => {
      let drawing = false;
      return ring
        .map(([lon, lat]) => {
          const p = projectPoint(lon, lat, rotation);
          if (!p.visible) {
            drawing = false;
            return "";
          }
          const cmd = drawing ? "L" : "M";
          drawing = true;
          return `${cmd}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
    })
    .join(" ");
}
export function CareerGlobe() {
  const [rotation, setRotation] = useState(45);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) =>
      setVisible(e.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (paused || !visible || reduced || dragging || !fine) return;
    const timer = setInterval(() => {
      if (!document.hidden) setRotation((v) => (v + 0.16) % 360);
    }, 100);
    return () => clearInterval(timer);
  }, [paused, visible, reduced, dragging, fine]);
  const flight = useRef<{ stop: () => void } | null>(null);
  useEffect(() => {
    if (reduced) flight.current?.stop();
    return () => flight.current?.stop();
  }, [reduced]);
  function choose(i: number) {
    flight.current?.stop();
    setSelected(i);
    setPaused(true);
    if (reduced) setRotation(places[i].lon);
    else {
      const delta = ((places[i].lon - rotation + 540) % 360) - 180;
      flight.current = animate(rotation, rotation + delta, {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: setRotation,
      });
    }
  }
  const place = places[selected];
  return (
    <section className="section borders">
      <div className="section-title">
        <div>
          <p className="eyebrow">CONNECTED BY EXPERIENCE / 03</p>
          <h2>A Career Without Borders.</h2>
        </div>
        <p className="micro-copy">Three connections. Different perspectives.</p>
      </div>
      <div className="globe-layout">
        <div
          className="globe-stage"
          ref={ref}
          data-active={visible && !paused && !reduced}
        >
          <svg
            viewBox="0 0 500 500"
            role="img"
            aria-label="Interactive globe. Use the location buttons or rotate controls below."
            className="career-globe"
            data-cursor="DRAG"
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" || e.pointerType === "touch") {
                flight.current?.stop();
                drag.current = e.clientX;
                setDragging(true);
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            }}
            onPointerMove={(e) => {
              if (drag.current !== null) {
                const delta = e.clientX - drag.current;
                flight.current?.stop();
                drag.current = e.clientX;
                setRotation((v) => v - delta * 0.35);
              }
            }}
            onPointerUp={() => {
              drag.current = null;
              setDragging(false);
            }}
            onPointerCancel={() => {
              drag.current = null;
              setDragging(false);
            }}
          >
            <defs>
              <radialGradient id="ocean" cx="35%" cy="30%" r="75%">
                <stop stopColor="#244b60" />
                <stop offset="1" stopColor="#091321" />
              </radialGradient>
            </defs>
            <circle cx="250" cy="250" r="217" fill="none" stroke="#75b9d01c" />
            <circle
              cx="250"
              cy="250"
              r="230"
              fill="none"
              stroke="#75b9d00c"
              strokeDasharray="1 8"
            />
            <circle
              cx="250"
              cy="250"
              r="205"
              fill="url(#ocean)"
              stroke="#75b9d066"
            />
            {[-60, -30, 0, 30, 60].map((lat) => (
              <ellipse
                key={lat}
                cx="250"
                cy={250 - 205 * Math.sin((lat * Math.PI) / 180)}
                rx={205 * Math.cos((lat * Math.PI) / 180)}
                ry="7"
                fill="none"
                stroke="#75b9d020"
              />
            ))}
            {[0.3, 0.65, 1].map((n) => (
              <ellipse
                key={n}
                cx="250"
                cy="250"
                rx={205 * n}
                ry="205"
                stroke="#75b9d020"
                fill="none"
              />
            ))}
            <path
              d={coastline(rotation)}
              fill="none"
              stroke="#75b9d0"
              strokeOpacity=".65"
              strokeWidth="1.1"
            />
            {[0, 1].map((i) => {
              const a = projectPoint(places[i].lon, places[i].lat, rotation),
                b = projectPoint(places[2].lon, places[2].lat, rotation);
              return a.visible && b.visible ? (
                <path
                  className="globe-route"
                  key={i}
                  d={`M${a.x},${a.y} Q250,80 ${b.x},${b.y}`}
                  fill="none"
                  stroke="#d2b88a"
                  strokeDasharray="4 7"
                />
              ) : null;
            })}
            {places.map((p, i) => {
              const v = projectPoint(p.lon, p.lat, rotation);
              return v.visible ? (
                <g key={p.name}>
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r={selected === i ? 9 : 6}
                    fill="#d2b88a"
                    stroke="#060b16"
                    strokeWidth="3"
                  />
                  <text
                    x={v.x + 12}
                    y={v.y + (i === 1 ? 23 : -10)}
                    fill="#f5f2ea"
                    fontSize="10"
                  >
                    {i === 0 ? "Colombo" : i === 1 ? "Maldives" : "UK market"}
                  </text>
                </g>
              ) : null;
            })}
          </svg>
          <div className="globe-controls">
            <button
              onClick={() => {
                flight.current?.stop();
                setPaused(true);
                setRotation((v) => v - 20);
              }}
              aria-label="Rotate globe west"
            >
              ←
            </button>
            <button
              aria-pressed={paused || Boolean(reduced) || !fine}
              onClick={() => setPaused((v) => !v)}
              disabled={Boolean(reduced) || !fine}
            >
              {reduced
                ? "Reduced motion"
                : !fine
                  ? "Touch controls"
                  : paused
                  ? "Resume rotation"
                  : "Pause rotation"}
            </button>
            <button
              onClick={() => {
                flight.current?.stop();
                setPaused(true);
                setRotation((v) => v + 20);
              }}
              aria-label="Rotate globe east"
            >
              →
            </button>
          </div>
          <p className="micro-copy">
            Drag horizontally to explore. Location buttons provide a keyboard
            and touch alternative.
          </p>
        </div>
        <div className="globe-copy">
          <div className="place-tabs" aria-label="Career locations">
            {places.map((p, i) => (
              <button
                key={p.name}
                aria-pressed={selected === i}
                onClick={() => choose(i)}
              >
                <span>0{i + 1}</span>
                {p.name}
                <span><LinkArrow /></span>
              </button>
            ))}
          </div>
          <figure className="place-image" key={place.name}>
            <Image
              src={place.image}
              alt={place.caption}
              fill
              sizes="(max-width:600px) 90vw, 40vw"
            />
            <figcaption>{place.caption}</figcaption>
          </figure>
          <div className="place-description" aria-live="polite">
            <p className="eyebrow">{place.tag}</p>
            <h3>{place.name}</h3>
            <p>{place.text}</p>
          </div>
          <p className="micro-copy">
            Geography: Natural Earth, public domain. Connections illustrate
            professional context, not a travel history.
          </p>
        </div>
      </div>
    </section>
  );
}
