"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, categories } from "@/content/projects";
export function PortfolioGallery({ limit }: { limit?: number }) {
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
          <Link
            className={"project-card project-" + p.number}
            href={"/portfolio/" + p.slug}
            key={p.slug}
          >
            <div className="project-art">
              <span className="project-number">{p.number}</span>
              <div className="orbital" />
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
        ))}
      </div>
    </>
  );
}
