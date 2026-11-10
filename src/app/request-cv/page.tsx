import { PageIntro } from "@/components/ui";
import { CVRequestPortal } from "@/components/cv-request-portal";
import { configProblems } from "@/lib/cv/config";
import { pageMetadata } from "@/lib/metadata";
import "./portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  ...pageMetadata(
    "Request my CV",
    "Introduce yourself, verify your email and receive secure access to Shaun Denver Mathiasz’s professional CV.",
    "/request-cv",
  ),
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="PROFESSIONAL OPPORTUNITIES"
        title="REQUEST MY CV"
        description="Interested in exploring a professional opportunity together? Introduce yourself and your organisation to receive secure access to my CV."
      />
      <noscript>
        <p className="cv-privacy">
          Secure email verification requires JavaScript. Please email{" "}
          <a href="mailto:shaun.emirates@gmail.com">shaun.emirates@gmail.com</a>{" "}
          for a professional introduction.
        </p>
      </noscript>
      <CVRequestPortal
        configured={configProblems().length === 0}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
      />
    </>
  );
}
