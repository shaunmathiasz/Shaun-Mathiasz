import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { contactConfigured } from "@/lib/contact";
import { site } from "@/config/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Contact",
  "Connect with Shaun Mathiasz about recruitment, travel, hospitality and commercial opportunities.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="LET’S CONNECT"
        title="The next possibility starts with a conversation."
        description="For recruitment opportunities, professional introductions and thoughtful collaborations across travel and hospitality."
      />
      <section className="section contact-grid">
        <aside>
          <p className="eyebrow">BASED IN</p>
          <h2>
            Colombo.
            <br />
            <em>Thinking globally.</em>
          </h2>
          <p>
            Interested in international hospitality, luxury travel, destination
            development and commercial growth.
          </p>
          <div className="contact-detail">
            <span>Professional email</span>
            <a href={`mailto:${site.professionalEmail}`}>
              {site.professionalEmail}
            </a>
          </div>
          <div className="contact-detail social-links">
            <span>Professional links</span>
            {site.socialLinks.length ? (
              site.socialLinks.map((l) => (
                <a
                  href={l.url}
                  key={l.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {l.label} ↗
                </a>
              ))
            ) : (
              <p>Verified professional links will be added when supplied.</p>
            )}
          </div>
          <div className="contact-detail">
            <span>Curriculum vitae</span>
            {site.cvUrl ? (
              <a href={site.cvUrl} download>
                Download CV ↗
              </a>
            ) : (
              <p>CV download available once a current document is supplied.</p>
            )}
          </div>
        </aside>
        <ContactForm configured={contactConfigured()} />
      </section>
    </>
  );
}
