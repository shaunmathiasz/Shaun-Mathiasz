"use client";
import { LinkArrow } from "@/components/link-arrow";

import Image from "next/image";
import { careerLocations } from "@/content/career-locations";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";

/** Keep the existing globe; defer its projection data and controls until near view. */
export function CareerGlobeLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [Globe, setGlobe] = useState<ComponentType | null>(null);
  useEffect(() => {
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        import("./career-globe")
          .then((module) => {
            if (active) setGlobe(() => module.CareerGlobe);
          })
          .catch(() => {
            /* The geographical fallback and career link stay usable. */
          });
      },
      { rootMargin: "500px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={ref}>
      {Globe ? (
        <Globe />
      ) : (
        <section className="section borders globe-fallback">
          <div className="section-title">
            <div>
              <p className="eyebrow">CONNECTED BY EXPERIENCE / 03</p>
              <h2>A Career Without Borders.</h2>
            </div>
            <p className="micro-copy">
              Three connections. Different perspectives.
            </p>
          </div>
          <div className="globe-layout">
            <div className="globe-stage">
              <Image
                src="/images/career-globe-preview.svg"
                width={500}
                height={500}
                className="career-globe"
                alt="Geographic overview connecting Colombo, the Maldives and the UK market"
              />
              <div className="globe-controls static-controls">
                <Link href="/experience">Explore my experience <LinkArrow /></Link>
              </div>
              <p className="micro-copy">
                Static geographic overview. Colombo · Maldives · UK market
                focus.
              </p>
            </div>
            <div className="globe-copy">
              <div className="place-tabs static-places">
                {careerLocations.map((place, i) => (
                  <div className="static-place" key={place.name}>
                    <span>0{i + 1}</span>
                    {place.name}
                    <span><LinkArrow /></span>
                  </div>
                ))}
              </div>
              <figure className="place-image">
                <Image
                  src={careerLocations[0].image}
                  alt={careerLocations[0].caption}
                  fill
                  sizes="(max-width:600px) 90vw,40vw"
                />
                <figcaption>{careerLocations[0].caption}</figcaption>
              </figure>
              <div className="place-description">
                <p className="eyebrow">{careerLocations[0].tag}</p>
                <h3>{careerLocations[0].name}</h3>
                <p>{careerLocations[0].text}</p>
              </div>
              <p className="micro-copy">
                Geography: Natural Earth, public domain. Connections describe
                professional context, not residence or a travel history.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
