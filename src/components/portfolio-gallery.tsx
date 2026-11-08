"use client";
import { LinkArrow } from "@/components/link-arrow";

import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import Image from "next/image";
import { motion } from "motion/react";
import { projectMedia } from "@/content/media";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, categories } from "@/content/projects";
export function PortfolioGallery({ limit }: { limit?: number }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const list = projects
    .filter((p) => filter === "All" || p.category === filter)
    .slice(0, limit);
  return (
    <>
      {!limit && (
        <div className="filters" aria-label="Filter portfolio">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="project-grid" aria-live="polite">
        {list.map((p) => (
          <motion.div
            layout={!reduced}
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            key={p.slug}
          >
            <Link
              prefetch={false}
              data-cursor="VIEW"
              className={"project-card project-" + p.number}
              href={"/portfolio/" + p.slug}
              key={p.slug}
            >
              <div className="project-art">
                <span className="project-number">{p.number}</span>
                <Image
                  src={projectMedia[p.number].src}
                  alt={projectMedia[p.number].alt}
                  fill
                  quality={50}
                  sizes="(max-width:600px) 90vw, 45vw"
                />
                <span className="project-preview">
                  Explore the thinking <span><LinkArrow /></span>
                </span>
                <span className="project-arrow">
                  <ArrowUpRight size={22} />
                </span>
                <span className="art-label">{p.category}</span>
              </div>
              <div className="project-copy">
                <p className="eyebrow">PRACTICE OVERVIEW</p>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}
