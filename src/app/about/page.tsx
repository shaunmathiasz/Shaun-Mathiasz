import { Reveal } from "@/components/reveal";
import Image from "next/image";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA, SectionTitle } from "@/components/ui";
import { skills } from "@/content/profile";
export const metadata = pageMetadata(
  "About",
  "Meet Shaun Mathiasz: a travel product professional with a foundation in international luxury hospitality.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE PERSON BEHIND THE PERSPECTIVE"
        title="Hospitality at heart. A wider horizon in mind."
        description="I’m Shaun Mathiasz, a Colombo-based travel product professional interested in the intersection of international hospitality, global business and commercial growth."
      />
      <section className="section story-grid">
        <figure className="portrait-frame">
          <Image
            src={site.portrait.src}
            alt={site.portrait.alt}
            width={site.portrait.width}
            height={site.portrait.height}
            sizes="(max-width: 600px) 90vw, 40vw"
            className="profile-portrait"
          />
          <figcaption>
            SHAUN MATHIASZ <span>TRAVEL PRODUCT SPECIALIST</span>
          </figcaption>
        </figure>
        <div className="prose">
          <p className="eyebrow">MY STORY</p>
          <h2>From the guest experience to the product behind it.</h2>
          <p>
            My professional experience spans reservations and guest operations
            at Siyam World Maldives and my current role as a Travel Product
            Specialist at Moresand Group / Travel Center UK.
          </p>
          <p>
            In luxury hospitality, the experience is shaped by attention to
            detail. In travel product development, that same attention extends
            to destination research, itinerary construction, supplier
            relationships and commercial pricing.
          </p>
          <p>
            I’m building on this practical foundation through an ongoing BSc
            (Hons) in Global Business Management with Cardiff Metropolitan
            University, via ICBT Colombo.
          </p>
          <blockquote className="editorial-quote">
            The product promise and the traveller’s experience should belong to
            the same conversation.
            <cite>Professional philosophy / Shaun Mathiasz</cite>
          </blockquote>
          <h3>How I approach the work</h3>
          <p>
            I value clear thinking, thoughtful collaboration and a close
            connection between the product promise and the traveller’s
            experience. My ambition is to deepen my commercial understanding and
            grow towards greater responsibility in international travel and
            hospitality.
          </p>
          <h3>A global perspective</h3>
          <p>
            Based in Colombo, with experience connected to the Maldives and the
            UK outbound travel market, I’m interested in how destinations,
            businesses and people connect across borders.
          </p>
        </div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="PROFESSIONAL FOCUS"
          title="Curiosity with a commercial direction."
        />
        <div className="skills-grid">
          {skills.map((s) => (
            <Reveal key={s.title}>
              <article className="skill-card">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="interest-line">
          International hospitality / Luxury travel / Destination development /
          Leadership / Global business
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
