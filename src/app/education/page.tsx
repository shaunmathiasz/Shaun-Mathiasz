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
      <section className="section education-grid">
        {education.map((e, i) => (
          <article className="education-card" key={e.title}>
            <div className="education-top">
              <span className="eyebrow">0{i + 1}</span>
              <span className="status">{e.status}</span>
            </div>
            <h2>{e.title}</h2>
            <p className="institution">{e.institution}</p>
            <p>{e.detail}</p>
          </article>
        ))}
      </section>
      <ContactCTA />
    </>
  );
}
