import { LinkArrow } from "@/components/link-arrow";
import type { Metadata } from "next";
import { homepageSocial, socialImage } from "@/config/social";
import { SocialPagePreviews } from "@/components/social-page-previews";
import { BrandPerspective } from "@/components/brand-perspective";
import { DigitalPresence } from "@/components/digital-presence";
import { HomeIntroduction } from "@/components/home-introduction";
import { JourneyEditorial } from "@/components/journey-editorial";
import { BrandShowcase } from "@/components/organisations";
import { CareerGlobeLoader } from "@/components/career-globe-loader";
import { HeroAtmosphere } from "@/components/hero-atmosphere";
import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  Globe2,
  Compass,
  ChartNoAxesCombined,
  Handshake,
} from "lucide-react";
import { SectionTitle, TextLink, ContactCTA } from "@/components/ui";
import { PortfolioGallery } from "@/components/portfolio-gallery";
import { Reveal } from "@/components/reveal";
import { skills, education } from "@/content/profile";
import { site } from "@/config/site";
const homepageMetadata = pageMetadata(
  "Travel, Commerce & Strategy",
  site.description,
  "/",
);
export const metadata: Metadata = {
  ...homepageMetadata,
  title: { absolute: "Shaun Denver Mathiasz | Travel Product Specialist" },
  description: "Official website of Shaun Denver Mathiasz (Shaun Mathiasz), a travel product specialist based in Sri Lanka. Explore his professional experience, portfolio, education and projects.",
  alternates: { canonical: homepageSocial.url },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: homepageSocial.title,
    description: homepageSocial.description,
    url: homepageSocial.url,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageSocial.title,
    description: homepageSocial.description,
    images: [socialImage.url],
  },
};
export default function Home() {
  const icons = [Globe2, ChartNoAxesCombined, Compass, Handshake];
  return (
    <>
      <HomeIntroduction />
      <section className="hero" id="top">
        <HeroAtmosphere />
        <div className="hero-top">
          <p className="eyebrow">
            <span className="tiny-line" />
            TRAVEL · COMMERCE · STRATEGY
          </p>
          <span className="hero-location">
            COLOMBO, SRI LANKA <span className="gold"><LinkArrow /></span>
          </span>
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-identity">
              Shaun Denver Mathiasz
              <span>Travel Product Specialist · UK outbound travel</span>
            </p>
            <h1 className="hero-heading" aria-label="Beyond Destinations. Towards Possibilities.">
              <span className="headline-mask"><span>Beyond</span></span>
              <span className="headline-mask"><span>Destinations.</span></span>
              <em>
                <span className="headline-mask"><span>Towards</span></span>
                <span className="headline-mask"><span>Possibilities.</span></span>
              </em>
            </h1>
            <p>
              I’m Shaun Denver Mathiasz — a travel product and commercial
              professional bridging international hospitality, strategic
              thinking, and business growth.
            </p>
            <div className="hero-actions">
              <Link
                prefetch={false}
                className="button gold-button"
                href="/portfolio"
              >
                Explore my work <ArrowUpRight size={18} />
              </Link>
              <Link
                prefetch={false}
                className="button outline-button"
                href="/about"
              >
                My story <ArrowUpRight size={18} />
              </Link>
            </div>
            <nav className="recruiter-shortcuts" aria-label="Recruiter shortcuts">
              <Link href="/experience" prefetch={false}>Career history</Link>
              <span aria-hidden="true">/</span>
              <Link href={site.cvRequestUrl} prefetch={false}>Request my CV</Link>
            </nav>
          </div>
          <div className="hero-visual">
            <Link
              prefetch={false}
              href="/about"
              className="hero-portrait"
              data-cursor="EXPLORE"
              aria-label="Shaun Denver Mathiasz / A wider perspective — About"
            >
              <Image
                src={site.portrait.src}
                alt={site.portrait.alt}
                width={site.portrait.width}
                height={site.portrait.height}
                sizes="(max-width: 600px) 90vw, 43vw"
                priority
                fetchPriority="high"
              />
              <span className="portrait-label">
                SHAUN DENVER MATHIASZ / A WIDER PERSPECTIVE
              </span>
            </Link>
            <div className="visual-note">
              <span>06.927° N / 79.861° E</span>
              <p>
                Rooted in hospitality.
                <br />
                Looking beyond the horizon.
              </p>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>TRAVEL PRODUCT SPECIALIST</span>
          <a href="#perspective">
            Discover the perspective <ArrowDown size={14} />
          </a>
          <span>HOSPITALITY → COMMERCIAL GROWTH</span>
        </div>
      </section>
      <section id="perspective" className="section positioning" data-cinematic>
        <p className="eyebrow">CHAPTER 01 / THE PERSPECTIVE</p>
        <div>
          <h2>
            Understanding the journey.
            <br />
            <span className="muted">Seeing the bigger picture.</span>
          </h2>
          <p>
            From luxury resort reservations in the Maldives to UK outbound
            travel product development, my experience connects the human side of
            hospitality with the thinking behind a commercially considered
            travel product.
          </p>
          <TextLink href="/about">More about my approach</TextLink>
        </div>
      </section>
      <BrandPerspective />
      <JourneyEditorial />
      <section className="section">
        <SectionTitle
          eyebrow="AREAS OF PRACTICE"
          title="Where experience meets intent."
        />
        <div className="skills-grid">
          {skills.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={s.title}>
                <article className="skill-card">
                  <Icon size={25} strokeWidth={1} />
                  <span className="index">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="SELECTED WORK & PERSPECTIVES"
          title="The thinking behind the journey."
        >
          <TextLink href="/portfolio">Explore all work</TextLink>
        </SectionTitle>
        <p className="section-note">
          Professional practice across hospitality, product development and
          commercial thinking.
        </p>
        <PortfolioGallery limit={2} />
      </section>
      <BrandShowcase />
      <CareerGlobeLoader />
      <section className="section career-preview">
        <SectionTitle
          eyebrow="PROFESSIONAL PROGRESSION"
          title="A foundation. A direction."
        >
          <TextLink href="/experience">View experience</TextLink>
        </SectionTitle>
        <div className="career-row">
          <span className="eyebrow">CURRENT CHAPTER</span>
          <div>
            <h3>Travel Product Specialist</h3>
            <p>Moresand Group / Travel Center UK</p>
          </div>
          <span>Product · Partnerships · Commerce</span>
        </div>
        <div className="career-row">
          <span className="eyebrow">HOSPITALITY FOUNDATION</span>
          <div>
            <h3>Reservations & guest operations</h3>
            <p>Siyam World Maldives</p>
          </div>
          <span>Luxury hospitality · Guest experience</span>
        </div>
      </section>
      <section
        className="section education-snapshot"
        id="development"
        data-cinematic
      >
        <div>
          <p className="eyebrow">CHAPTER 05 / CONTINUING TO GROW</p>
          <h2>
            Experience, supported
            <br />
            by <em>understanding.</em>
          </h2>
          <TextLink href="/education">Education & development</TextLink>
        </div>
        <div>
          {education.slice(0, 2).map((e) => (
            <article key={e.title}>
              <span className="status">{e.status}</span>
              <h3>{e.title}</h3>
              <p>{e.institution}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cv-strip">
        <p>A closer look at my professional background.</p>
        <TextLink href={site.cvRequestUrl}>REQUEST MY CV</TextLink>
      </section>
      <DigitalPresence />
      <SocialPagePreviews />
      <section className="section"><p className="eyebrow">SDM DIGITAL / A NEW CHAPTER</p><h2>Thoughtful websites.<br/><em>For growing businesses.</em></h2><p>Website development for Sri Lankan hospitality, small businesses and professionals.</p><Link prefetch={false} href="/services/web-development" className="button button-secondary">Explore Digital Solutions <LinkArrow /></Link></section>
      <ContactCTA />
    </>
  );
}
