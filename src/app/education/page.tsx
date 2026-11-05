import { EducationCredentials } from "@/components/education-credentials";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";

export const metadata = pageMetadata(
  "Education & Development",
  "Education, ongoing business studies, training and memberships for Shaun Denver Mathiasz.",
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
      <EducationCredentials />
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
