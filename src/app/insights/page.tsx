import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { readingMinutes } from "@/content/media";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { articles } from "@/content/articles";
export const metadata = pageMetadata(
  "Insights",
  "Perspectives by Shaun Denver Mathiasz on travel products, guest experience and commercial thinking.",
  "/insights",
);
export default function Insights() {
  return (
    <>
      <PageIntro
        eyebrow="NOTES & PERSPECTIVES"
        title="The Shaun Denver perspective."
        description="Personal essays on the questions that connect travel, hospitality and business."
      />
      <section className="section article-list">
        {articles.map((a, i) => (
          <Link
            href={"/insights/" + a.slug}
            key={a.slug}
            data-cinematic
            data-cursor="READ"
          >
            <div className="journal-cover">
              <Image
                src={a.cover}
                alt={a.coverAlt}
                width={800}
                height={600}
                sizes="(max-width:600px) 90vw, 30vw"
              />
              <span>FIELD NOTES / 0{i + 1}</span>
            </div>
            <div>
              <p className="eyebrow">
                {a.category} · {a.status} · {readingMinutes(a.body)} min read
              </p>
              <h2>{a.title}</h2>
              <p>{a.summary}</p>
              <div className="tags">
                {a.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <ArrowUpRight />
          </Link>
        ))}
      </section>
    </>
  );
}
