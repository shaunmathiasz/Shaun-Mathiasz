import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";
import { experience } from "@/content/profile";
export const metadata = pageMetadata(
  "Experience",
  "Shaun Mathiasz\u2019s professional progression across travel product development and luxury hospitality.",
  "/experience",
);
export default function Experience() {
  return (
    <>
      <PageIntro
        eyebrow="PROFESSIONAL EXPERIENCE"
        title="Every chapter adds perspective."
        description="A progression from the detail of guest operations to the broader commercial lifecycle of travel products."
      />
      <section className="section timeline">
        {experience.map((e, i) => (
          <article className="timeline-item" key={`${e.employer}-${e.role}`}>
            <div className="timeline-label">
              <span className="eyebrow">
                0{i + 1} / {i === 0 ? "CURRENT" : "PREVIOUS"}
              </span>
              <p>{e.period}</p>
            </div>
            <div className="timeline-body">
              <p className="eyebrow">{e.employer}</p>
              <h2>{e.role}</h2>
              <p className="lead">{e.description}</p>
              <h3>Scope & responsibilities</h3>
              <ul>
                {e.responsibilities.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
              <div className="tags">
                {e.tools.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <p className="verification">
                Dates and role details are drawn from the supplied CV. No
                measurable performance outcome is claimed.
              </p>
            </div>
          </article>
        ))}
      </section>
      <ContactCTA />
    </>
  );
}
