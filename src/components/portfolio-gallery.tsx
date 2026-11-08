"use client";
import { LinkArrow } from "@/components/link-arrow";

import { useSafeReducedMotion as useReducedMotion } from "@/lib/use-safe-reduced-motion";
import Image from "next/image";
import { motion } from "motion/react";
import { projectMedia } from "@/content/media";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, categories } from "@/content/projects";
export function PortfolioGallery({ limit }: { limit?: number }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const query = search.trim().toLowerCase();
  const list = projects
    .filter((p) => (filter === "All" || p.category === filter) &&
      (!query || [p.title, p.category, p.summary, p.approach, ...p.skills, ...p.deliverables].join(" ").toLowerCase().includes(query)))
    .slice(0, limit);
  return (
    <>
      {!limit && <div className="portfolio-discovery">
        <label className="portfolio-search">Find an area of practice
          <input ref={searchInput} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try pricing, reservations or research" aria-controls="practice-results" />
        </label>
        <p className="filter-summary" role="status">{list.length} {list.length === 1 ? "practice overview" : "practice overviews"}</p>
      </div>}
      {!limit && (
        <div className="filters" aria-label="Filter portfolio">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}<span aria-hidden="true">{c === "All" ? projects.length : projects.filter((project) => project.category === c).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="project-grid" id={limit ? undefined : "practice-results"}>
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
                <div className="practice-skills" aria-label="Relevant skills">{p.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      {!limit && list.length === 0 && <div className="portfolio-empty">
        <h3>A different starting point?</h3>
        <p>Try another skill or explore all four areas of practice.</p>
        <button className="button outline-button" onClick={() => { setSearch(""); setFilter("All"); searchInput.current?.focus(); }}>Show all practice overviews</button>
      </div>}
    </>
  );
}
