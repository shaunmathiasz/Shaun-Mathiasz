import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { articles } from "@/content/articles";
export const metadata = pageMetadata(
  "Insights",
  "Draft perspectives on travel products, guest experience and commercial thinking, prepared for review.",
  "/insights",
);
export default function Insights() {
  return (
    <>
      <PageIntro
        eyebrow="NOTES & PERSPECTIVES"
        title="A space for considered thinking."
        description="Exploring the questions that connect travel, hospitality and business. The pieces below are editorial drafts awaiting Shaun’s review."
      />
      <section className="section article-list">
        {articles.map((a, i) => (
          <Link href={"/insights/" + a.slug} key={a.slug}>
            <span className="article-index">0{i + 1}</span>
            <div>
              <p className="eyebrow">
                {a.category} · {a.status}
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
