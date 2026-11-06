import { CinematicSystem, MotionToggle } from "@/components/cinematic-system";
import { ScrollProgress } from "@/components/editorial-tools";
import { education } from "@/content/credentials";
import localFont from "next/font/local";
import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { site } from "@/config/site";
import "./globals.css";
import "./motion.css";
const editorial = localFont({
  src: [
    {
      path: "../assets/fonts/cormorant-normal-400.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/cormorant-normal-500.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/cormorant-italic-400.woff",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "../assets/fonts/manrope-normal-400.woff", weight: "400" },
    { path: "../assets/fonts/manrope-normal-500.woff", weight: "500" },
    { path: "../assets/fonts/manrope-normal-600.woff", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: {
    default: "Shaun Denver Mathiasz — Travel, Commerce & Strategy",
    template: "%s | Shaun Denver Mathiasz",
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Shaun Denver Mathiasz — Travel, Commerce & Strategy",
    description: site.description,
    ...(site.url
      ? { images: [{ url: "/opengraph-image", width: 1200, height: 630 }] }
      : {}),
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    ...(site.url ? { url: site.url } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Colombo",
      addressCountry: "LK",
    },
    sameAs: site.socialLinks.map((link) => link.url),
    hasCredential: education
      .filter((e) => e.status === "Completed")
      .map((e) => ({
        "@type": "EducationalOccupationalCredential",
        name: e.title,
        credentialCategory:
          e.category === "Executive Education" ? "Short course" : "Diploma",
        recognizedBy: { "@type": "Organization", name: e.institution },
      })),
    memberOf: {
      "@type": "Organization",
      name: "Royal Aeronautical Society",
      description: "Student Affiliate",
    },
    worksFor: {
      "@type": "Organization",
      name: "Moresand Group / Travel Center UK",
    },
  };
  return (
    <html lang="en" className={`${editorial.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <CinematicSystem />
        <Navigation />
        <main id="main">{children}</main>
        <footer className="footer">
          <Link prefetch={false} href="/" className="footer-name">
            Shaun Denver Mathiasz<span className="gold">.</span>
          </Link>
          <p>
            A personal perspective on travel, hospitality & global business.
          </p>
          <div>
            <span>Colombo, Sri Lanka</span>
            <Link prefetch={false} href="/portfolio#travel-detour">
              Play a little ↗
            </Link>
            <Link prefetch={false} href="/contact">
              Contact ↗
            </Link>
            <a href={`mailto:${site.professionalEmail}`}>Email Me ↗</a>
          </div>
          <MotionToggle />
          <small>© {new Date().getFullYear()} Shaun Denver Mathiasz</small>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\u003c"),
          }}
        />
      </body>
    </html>
  );
}
