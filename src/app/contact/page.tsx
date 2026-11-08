import { LinkArrow } from "@/components/link-arrow";
import Link from "next/link";
import { SocialPagePreviews } from "@/components/social-page-previews";
import { SocialProfiles } from "@/components/social-profiles";
import { CopyEmail } from "@/components/editorial-tools";
import { pageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/contact-form";
import { contactConfigured } from "@/lib/contact";
import { site } from "@/config/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Contact",
  "Connect with Shaun Denver Mathiasz about recruitment, travel, hospitality and commercial opportunities.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <section className="page-intro contact-horizon-intro">
        <div className="contact-night-horizon" aria-hidden="true">
          <span />
          <i />
        </div>
        <p className="eyebrow">LET’S CONNECT / SHAUN DENVER MATHIASZ</p>
        <h1>
          Good conversations.
          <br />
          <em>New possibilities.</em>
        </h1>
        <p className="lead">
          For recruitment opportunities, professional introductions and
          thoughtful collaborations across travel and hospitality.
        </p>
        <a
          className="contact-intro-email text-link"
          href={`mailto:${site.professionalEmail}`}
        >
          {site.professionalEmail} <LinkArrow />
        </a>
      </section>
      <section className="section contact-grid">
        <aside>
          <p className="eyebrow">SHAUN DENVER MATHIASZ / COLOMBO</p>
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
                  {l.label} <LinkArrow />
                </a>
              ))
            ) : (
              <p>Connect by email.</p>
            )}
          </div>
          <div className="contact-detail">
            <span>Curriculum vitae</span>
            <Link href={site.cvRequestUrl} prefetch={false}>
              REQUEST MY CV <LinkArrow />
            </Link>
          </div>
        </aside>
        {contactConfigured() ? (
          <ContactForm configured />
        ) : (
          <div className="contact-alternative">
            <p className="eyebrow">A DIRECT CONNECTION</p>
            <h2>
              Let’s start with
              <br />
              <em>a conversation.</em>
            </h2>
            <p>
              Email is the most direct way to discuss a role, collaboration or
              introduction.
            </p>
            <a
              className="button gold-button"
              href={`mailto:${site.professionalEmail}`}
            >
              Email Me <LinkArrow />
            </a>
            <CopyEmail />
            <p className="micro-copy">
              Opens your email app. No message is collected or stored on this
              website.
            </p>
          </div>
        )}
      </section>
      <SocialPagePreviews />
      <SocialProfiles />
    </>
  );
}
