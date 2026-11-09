import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { DigitalExperience } from "@/components/digital/experience";
import { digital } from "@/config/digital";
import "./services.css";
const origin = "https://www.shaunmathiasz.com";
export const metadata: Metadata = {
  title: { absolute: "SDM Digital | Affordable Website Development Sri Lanka" },
  description:
    "Affordable website development for Sri Lankan villas, boutique hotels, travel agencies and small businesses. Explore SDM Digital’s introductory website packages.",
  alternates: { canonical: origin + digital.path },
  openGraph: {
    type: "website",
    title: "Your Business Deserves a Brilliant Website. | SDM Digital",
    description:
      "Professional websites. Honest prices. Built for Sri Lankan businesses.",
    url: origin + digital.path,
    images: [
      {
        url: origin + "/social/sdm-digital-services.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "SDM Digital — professional websites for Sri Lankan businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [origin + "/social/sdm-digital-services.jpg"],
  },
};
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": origin + digital.path + "#service",
      name: "SDM Digital website development",
      serviceType: "Website development",
      url: origin + digital.path,
      areaServed: { "@type": "Country", name: "Sri Lanka" },
      provider: { "@id": origin + "/#person" },
      offers: digital.packages.map((p) => ({
        "@type": "Offer",
        name: p.name + " — starting development fee",
        price: p.price,
        priceCurrency: "LKR",
        url: origin + digital.path + "#packages",
        description:
          p.pages +
          ". Scope agreed before work starts. Domain, hosting and third-party costs are additional.",
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Digital Solutions",
          item: origin + digital.path,
        },
      ],
    },
  ],
};
export default function DigitalServices() {
  return (
    <div className="digital-site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="digital-hero">
        <div className="digital-hero-orbit" aria-hidden="true" />
        <div className="digital-hero-content">
          <nav aria-label="Breadcrumb" className="digital-breadcrumb">
            <Link href="/">Shaun Denver Mathiasz</Link>
            <span>/</span>
            <span>Digital Solutions</span>
          </nav>
          <Image
            className="digital-logo"
            src="/branding/sdm-digital/sdm_digital_logo_horizontal.webp"
            width={1200}
            height={271}
            alt="SDM Digital — website development services by Shaun Denver Mathiasz"
            priority
            sizes="(max-width:600px) 80vw, 420px"
          />
          <p className="eyebrow digital-hero-kicker">
            SPECIAL WEBSITE DEVELOPMENT LAUNCH OFFERS
          </p>
          <h1>
            Your Business
            <br />
            Deserves a<br />
            <em>Brilliant Website.</em>
          </h1>
          <p className="digital-hero-subtitle">
            Professional Websites. Honest Prices.
            <br />
            Built for Sri Lankan Businesses.
          </p>
          <p className="digital-hero-description">
            Helping villas, boutique hotels, travel businesses, entrepreneurs
            and growing Sri Lankan companies establish a powerful online
            presence.
          </p>
          <div className="digital-hero-actions">
            <a href="#packages" className="button button-primary">
              Explore Packages <ArrowDown size={16} />
            </a>
            <a href="#enquiry" className="button button-secondary">
              Start Your Project <ArrowUpRight size={16} />
            </a>
          </div>
          <a href="#packages" className="digital-scroll">
            <span />
            SCROLL TO EXPLORE
          </a>
        </div>
        <div
          className="digital-hero-art"
          aria-label="Illustrative hospitality website preview"
        >
          <div className="digital-hero-art-label">
            <span>DESIGN WITH A SENSE OF PLACE.</span>
            <span>01 / WEB STUDIO</span>
          </div>
          <div className="digital-hero-photo">
            <Image
              src="/images/editorial/maldives.jpg"
              alt="Overwater villas and ocean, contextual hospitality photography"
              fill
              priority
              sizes="(max-width:768px) 100vw, 45vw"
            />
            <div>
              <span>
                A DIGITAL PRESENCE,
                <br />
                WITH A PERSONAL TOUCH.
              </span>
              <p>
                Made for
                <br />
                <em>your next chapter.</em>
              </p>
            </div>
          </div>
          <div className="digital-hero-mini">
            <span>RESPONSIVE BY DESIGN</span>
            <p>
              Your business.
              <br />
              Beautifully connected.
            </p>
            <div>
              <span>Mobile</span>
              <span>Desktop</span>
              <span>Everywhere</span>
            </div>
          </div>
        </div>
      </section>
      <div className="digital-trust-strip">
        <span>3 considered packages</span>
        <span>Hospitality-informed perspective</span>
        <span>Clear scope. No hidden promises.</span>
        <span>Open to every business</span>
      </div>
      <DigitalExperience
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
      />
      <section className="digital-section digital-founder">
        <div>
          <Image
            src="/branding/sdm-digital/sdm_digital_monogram.webp"
            width={800}
            height={434}
            alt=""
            sizes="180px"
          />
          <p className="eyebrow">A PERSONAL APPROACH</p>
          <h2>
            Business context.
            <br />
            <em>Not just a build.</em>
          </h2>
        </div>
        <div>
          <p>
            My work in luxury hospitality and travel product development has
            shaped the way I think about customers, clear information and
            commercial decisions. SDM Digital brings that perspective to the way
            your business is presented online.
          </p>
          <p>
            You work directly with Shaun Denver Mathiasz, from the first
            conversation to an agreed handover. Scope, revisions and third-party
            costs are discussed openly.
          </p>
          <Link href="/about" className="digital-text-button">
            Meet the person behind the work <ArrowUpRight size={17} />
          </Link>
          <Link href="/" className="digital-work-link">
            <span>EXISTING WORK</span>
            <strong>This personal website</strong>
            <p>
              Explore the live portfolio, editorial content and interactive
              travel game. A first-party example of the website experience — not
              a client case study.
            </p>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
      <section className="digital-final">
        <Image
          src="/branding/sdm-digital/sdm_digital_logo_horizontal.webp"
          width={1200}
          height={271}
          alt="SDM Digital"
          sizes="280px"
        />
        <p className="eyebrow">
          SUPPORTING SRI LANKAN HOSPITALITY & SMALL BUSINESSES
        </p>
        <h2>
          Let’s build your
          <br />
          <em>digital presence.</em>
        </h2>
        <a className="button button-primary" href="#enquiry">
          Get My Website <ArrowUpRight size={17} />
        </a>
        <p>A digital service by Shaun Denver Mathiasz.</p>
      </section>
    </div>
  );
}
