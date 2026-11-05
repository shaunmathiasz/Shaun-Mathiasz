import { EmployerCard } from "@/components/organisations";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";
import { ExperienceJourney } from "@/components/experience-journey";
export const metadata = pageMetadata(
  "Experience",
  "Shaun Denver Mathiasz\u2019s professional progression across travel product development and luxury hospitality.",
  "/experience",
);
export default function Experience() {
  return (
    <>
      <PageIntro
        eyebrow="PROFESSIONAL EXPERIENCE"
        title="The Journey So Far."
        description="A progression from the detail of guest operations to the broader commercial lifecycle of travel products."
      />
      <section className="section employer-chapters">
        <EmployerCard
          ids={["moresand", "travelcenter"]}
          title="Travel Product Specialist"
          period="April 2026 – Present"
        >
          <p>
            One professional chapter: Moresand Group and its Travel Center UK
            brand. Based in Colombo, serving the UK outbound travel market.
          </p>
          <div className="tags">
            <span>Product development</span>
            <span>Commercial pricing</span>
            <span>Multi-centre itineraries</span>
          </div>
        </EmployerCard>
        <EmployerCard
          ids={["siyam", "sunsiyam"]}
          title="Guest operations → Reservations"
          period="October 2024 – March 2026"
        >
          <p>
            One resort chapter within Sun Siyam Resorts: WOW Agent / Telephone
            Operator, followed by Reservations Agent at Siyam World Maldives.
          </p>
          <div className="tags">
            <span>Guest experience</span>
            <span>Opera PMS</span>
            <span>Reservations</span>
          </div>
        </EmployerCard>
      </section>
      <ExperienceJourney />
      <ContactCTA />
    </>
  );
}
