import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";
import { ExperienceJourney } from "@/components/experience-journey";
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
        title="The Journey So Far."
        description="A progression from the detail of guest operations to the broader commercial lifecycle of travel products."
      />
      <ExperienceJourney />
      <ContactCTA />
    </>
  );
}
