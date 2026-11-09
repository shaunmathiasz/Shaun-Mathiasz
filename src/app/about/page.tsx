import { profileSchema } from "@/lib/structured-data";
import { LinkArrow } from "@/components/link-arrow";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { EditorialImage } from "@/components/editorial-image";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro, ContactCTA, SectionTitle } from "@/components/ui";
import { skills, experience } from "@/content/profile";
export const metadata = pageMetadata(
  "About",
  "Meet Shaun Denver Mathiasz: a travel product professional with a foundation in international luxury hospitality.",
  "/about",
);
export default function About() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema).replace(/</g, "\u003c") }} />
      <PageIntro
        eyebrow="THE PERSON BEHIND THE PERSPECTIVE"
        title="Hospitality at heart. A wider horizon in mind."
        description="I’m Shaun Denver Mathiasz, also known as Shaun Mathiasz, a Colombo-based travel product professional interested in the intersection of international hospitality, global business and commercial growth."
      />
      <section className="section story-grid">
        <aside
          className="story-folio"
          aria-label="Professional journey in perspective"
        >
          <p className="eyebrow">FIELD NOTES / AN EVOLVING PERSPECTIVE</p>
          <h2>
            The detail.
            <br />
            The journey.
            <br />
            <em>The bigger picture.</em>
          </h2>
          <div className="folio-route" aria-hidden="true">
            <span>MLE</span>
            <i />
            <span>CMB</span>
            <i />
            <span>UK MARKET</span>
          </div>
          <ol>
            {[...experience].reverse().map((role, i) => (
              <li key={role.role}>
                <span>0{i + 1}</span>
                <div>
                  <p>{role.role}</p>
                  <small>{role.period}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className="folio-base">
            COLOMBO / SRI LANKA
            <br />
            <span>My professional and academic base.</span>
          </p>
        </aside>
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
            <cite>Professional philosophy / Shaun Denver Mathiasz</cite>
          </blockquote>
          <h3>How I approach the work</h3>
          <p>
            I value clear thinking, thoughtful collaboration and a close
            connection between the product promise and the traveller’s
            experience. My ambition is to deepen my commercial understanding and
            grow towards greater responsibility in international travel and
            hospitality.
          </p>
          <div className="about-paths">
            <Link href="/experience">Explore my experience <LinkArrow /></Link>
            <Link href="/portfolio">View professional work <LinkArrow /></Link>
            <Link href="/education">Education & development <LinkArrow /></Link>
          </div>
          <h3>A global perspective</h3>
          <p>
            Based in Colombo, with experience connected to the Maldives and the
            UK outbound travel market, I’m interested in how destinations,
            businesses and people connect across borders.
          </p>
        </div>
      </section>
      <section className="section about-horizon" data-cinematic>
        <div>
          <p className="eyebrow">HOSPITALITY ↔ COMMERCIAL THINKING</p>
          <h2>
            The experience matters.
            <br />
            <em>So does the thinking behind it.</em>
          </h2>
          <p>
            From the detail of a reservation to the structure of a travel
            product, I value clear information, thoughtful choices and the
            traveller’s perspective.
          </p>
        </div>
        <EditorialImage
          asset="colombo"
          caption="COLOMBO / MY PROFESSIONAL & ACADEMIC BASE · CONTEXTUAL PHOTOGRAPHY"
        />
      </section>
      <section className="section professional-perspectives">
        <SectionTitle eyebrow="THREE CONNECTED CHAPTERS" title="One perspective. Still developing." />
        <div className="perspective-grid">
          {[
            { number: "01", title: "A hospitality foundation.", text: "Guest operations and reservations in the Maldives taught me to consider the detail that sits behind an experience.", href: "/experience", label: "Explore the foundation" },
            { number: "02", title: "A commercial practice.", text: "Today, I connect destination research, supplier evaluation and package construction for the UK outbound travel market, from Colombo.", href: "/portfolio", label: "Explore the practice" },
            { number: "03", title: "A continuing education.", text: "Ongoing global business studies and professional development give me more ways to question, connect and improve the work.", href: "/education", label: "Explore the learning" },
          ].map((chapter) => <Reveal key={chapter.number}><article>
            <span className="eyebrow">{chapter.number} / IN PERSPECTIVE</span>
            <h3>{chapter.title}</h3><p>{chapter.text}</p>
            <Link href={chapter.href} prefetch={false} className="text-link">{chapter.label}<LinkArrow /></Link>
          </article></Reveal>)}
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
