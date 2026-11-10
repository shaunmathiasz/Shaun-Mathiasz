import Image from "next/image";
import { projectMedia } from "@/content/media";
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
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return (
    <>
      <PageIntro
        eyebrow={p.category + " / PRACTICE OVERVIEW"}
        title={p.title}
        description={p.summary}
      />
      <figure className="project-hero-image" data-cinematic>
        <Image
          src={projectMedia[p.number].src}
          alt={projectMedia[p.number].alt}
          width={1500}
          height={900}
          sizes="100vw"
        />
        <figcaption>
          CONTEXTUAL DESTINATION IMAGERY / PRACTICE OVERVIEW
        </figcaption>
      </figure>
      <section className="section detail-grid">
        <aside>
          <TextLink href="/portfolio">All practice overviews</TextLink>
          <nav className="practice-sections" aria-label="Practice sections">
            {["Challenge", "Approach", "The decision process", "Deliverables", "Commercial considerations", "Professional application"].map((section) => <a key={section} href={"#" + section.toLowerCase().replaceAll(" ", "-")}>{section}</a>)}
          </nav>
          <p className="eyebrow">SKILLS</p>
          <div className="tags">
            {p.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </aside>
        <div className="prose">
          <div className="notice">
            Professional practice overview with an illustrative process
            framework.
          </div>
          <h2 id="challenge">Challenge</h2>
          <p>{p.challenge}</p>
          <h2 id="approach">Approach</h2>
          <p>{p.approach}</p>
          <h2 id="the-decision-process">The decision process</h2>
          <ol className="process-diagram">
            {[
              "Understand the traveller",
              "Research the destination",
              "Consider the commercial structure",
              "Review the experience",
            ].map((step, i) => (
              <li key={step}>
                <span>0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="micro-copy">
            An illustrative framework for considering the traveller, destination
            and product together.
          </p>
          <h2 id="deliverables">Deliverables</h2>
          <ul>
            {p.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <h2 id="commercial-considerations">Commercial considerations</h2>
          <ul>
            {p.commercialConsiderations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2 id="professional-application">Professional application</h2>
          <p>{p.outcome}</p>
        </div>
      </section>
      <section className="section next-practice" data-cinematic>
        <p className="eyebrow">ANOTHER PERSPECTIVE / {next.number}</p>
        <h2>{next.title}</h2>
        <TextLink href={"/portfolio/" + next.slug}>
          Explore this practice
        </TextLink>
      </section>
      <ContactCTA />
    </>
  );
}
