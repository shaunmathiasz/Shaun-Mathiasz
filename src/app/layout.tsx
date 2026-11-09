import { ClarityAnalytics, AnalyticsPreferences } from "@/components/clarity-analytics";
import { LinkArrow } from "@/components/link-arrow";
import { motionTokens } from "@/lib/motion";
import { PersonalLogo } from "@/components/personal-logo";
import { CinematicSystem, MotionToggle } from "@/components/cinematic-system";
import { ScrollProgress } from "@/components/editorial-tools";
import { identitySchema } from "@/lib/structured-data";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { site } from "@/config/site";
import { homepageSocial, socialImage } from "@/config/social";
import "./globals.css";
import "./motion.css";
import "./experience.css";
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
  manifest: "/icons/sdm-v1/site.webmanifest",
  icons: {
    icon: [
      { url: "/icons/sdm-v1/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      ...[16, 32, 48].map((size) => ({
        url: `/icons/sdm-v1/favicon-${size}x${size}.png`,
        type: "image/png",
        sizes: `${size}x${size}`,
      })),
    ],
    apple: [{ url: "/icons/sdm-v1/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: homepageSocial.title,
    description: homepageSocial.description,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageSocial.title,
    description: homepageSocial.description,
    images: [socialImage.url],
  },
};
export const viewport: Viewport = { themeColor: "#080F1D" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${editorial.variable} ${body.variable}`}>
      <body data-clarity-mask="true" style={{
        "--motion-micro": `${motionTokens.duration.micro * 1000}ms`,
        "--motion-reveal": `${motionTokens.duration.reveal * 1000}ms`,
        "--motion-section": `${motionTokens.duration.section * 1000}ms`,
        "--ease-editorial": motionTokens.easing,
      } as React.CSSProperties}>
        <ClarityAnalytics production={process.env.VERCEL_ENV === "production"} projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ""}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <CinematicSystem />
        <Navigation />
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="footer">
          <Link prefetch={false} href="/" className="footer-name">
            <PersonalLogo />
          </Link>
          <p>
            A personal perspective on travel, hospitality & global business.
          </p>
          <div>
            <span>Colombo, Sri Lanka</span>
            <Link prefetch={false} href="/portfolio#travel-detour">
              Play a little <LinkArrow />
            </Link>
            <Link prefetch={false} href="/contact">
              Contact <LinkArrow />
            </Link>
            <a href={`mailto:${site.professionalEmail}`}>Email Me <LinkArrow /></a>
            <Link prefetch={false} href={site.cvRequestUrl}>
              REQUEST MY CV <LinkArrow />
            </Link>
            <Link prefetch={false} href="/request-cv/privacy">
              CV request privacy <LinkArrow />
            </Link>
          </div>
          <AnalyticsPreferences />
          <MotionToggle />
          <small>© {new Date().getFullYear()} Shaun Denver Mathiasz</small>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(identitySchema).replace(/</g, "\u003c"),
          }}
        />
        </ClarityAnalytics>
      </body>
    </html>
  );
}
