import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";
import { education } from "@/content/profile";
export const metadata = pageMetadata(
  "Education & Development",
  "Verified education statuses, ongoing business studies, training and memberships for Shaun Mathiasz.",
  "/education",
);
export default function Education() {
  return (
    <>
      <PageIntro
        eyebrow="EDUCATION & DEVELOPMENT"
        title="Learning with the next chapter in mind."
        description="A business education alongside practical industry experience — and a continuing interest in how the travel sector evolves."
      />
      <section className="section education-grid learning-journey">
        {education.map((e, i) => (
          <Reveal key={e.title}>
            <article className="education-card">
              <div className="education-top">
                <span className="eyebrow">0{i + 1}</span>
                <span className="status">{e.status}</span>
              </div>
              <h2>{e.title}</h2>
              <p className="institution">{e.institution}</p>
              <details>
                <summary>Learning & professional context</summary>
                <p>{e.detail}</p>
                <p>
                  Connections to practice:{" "}
                  {i === 0 || i === 1
                    ? "Global business, commercial thinking and organisational context."
                    : i === 2
                      ? "Travel product knowledge and the travel sector."
                      : "Industry curiosity and a wider aviation perspective. These are interests, not an awarded accreditation."}
                </p>
              </details>
            </article>
          </Reveal>
        ))}
      </section>
      <section className="section constellation">
        <p className="eyebrow">LEARNING ↔ PRACTICE</p>
        <h2>A connected foundation.</h2>
        <div>
          {[
            "Global business",
            "Travel products",
            "Hospitality operations",
            "Commercial thinking",
            "Industry curiosity",
          ].map((s, i) => (
            <span key={s}>
              <small>0{i + 1}</small>
              {s}
            </span>
          ))}
        </div>
        <p>
          Areas of interest and practice connected to ongoing learning. This map
          does not imply additional qualifications.
        </p>
      </section>
      <ContactCTA />
    </>
  );
}
