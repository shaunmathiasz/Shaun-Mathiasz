import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";
import { PageIntro, ContactCTA, TextLink } from "@/components/ui";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return pageMetadata(
    p?.title || "Project not found",
    p?.summary || "Project not found",
    "/portfolio/" + slug,
  );
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <PageIntro
        eyebrow={p.category + " / PRACTICE OVERVIEW"}
        title={p.title}
        description={p.summary}
      />
      <section className="section detail-grid">
        <aside>
          <TextLink href="/portfolio">All practice overviews</TextLink>
          <p className="eyebrow">SKILLS</p>
          <div className="tags">
            {p.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </aside>
        <div className="prose">
          <div className="notice">
            Scope-based overview. Project-specific evidence and outcomes are
            pending review.
          </div>
          <h2>Challenge</h2>
          <p>{p.challenge}</p>
          <h2>Approach</h2>
          <p>{p.approach}</p>
          <h2>Deliverables</h2>
          <ul>
            {p.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <h2>Verified outcome</h2>
          <p>{p.outcome}</p>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
