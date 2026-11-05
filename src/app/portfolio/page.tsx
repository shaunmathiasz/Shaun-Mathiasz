import { TravelBuilder } from "@/components/travel-builder";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA } from "@/components/ui";
import { PortfolioGallery } from "@/components/portfolio-gallery";
export const metadata = pageMetadata(
  "Portfolio",
  "Explore practice overviews in travel product development, hospitality operations and commercial package design.",
  "/portfolio",
);
export default function Portfolio() {
  return (
    <>
      <PageIntro
        eyebrow="SELECTED WORK & PRACTICE"
        title="Thoughtful products. Meaningful experiences."
        description="An introduction to the areas I work across — destination research, luxury hospitality and commercially considered travel products."
      />
      <section className="section">
        <div className="notice">
          Explore professional practice and illustrative thinking frameworks
          across travel and hospitality.
        </div>
        <PortfolioGallery />
      </section>
      <TravelBuilder />
      <ContactCTA />
    </>
  );
}
