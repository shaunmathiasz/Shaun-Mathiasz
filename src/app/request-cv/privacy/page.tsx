import { LinkArrow } from "@/components/link-arrow";
import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { getConfig } from "@/lib/cv/config";
import "../portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  ...pageMetadata(
  "CV Request Privacy Notice",
  "How professional CV requests, email verification and optional location information are handled.",
  "/request-cv/privacy",
  ),
  robots: { index: false, follow: false },
};
export default function Page() {
  let retention = {
    pendingHours: 24,
    ipDays: 30,
    gpsDays: 7,
    verifiedDays: 90,
  };
  try {
    retention = getConfig().retention;
  } catch {}
  return (
    <>
      <PageIntro
        eyebrow="YOUR INFORMATION"
        title="CV Request Privacy Notice"
        description="A considered introduction, with clear choices about your information."
      />
      <article className="cv-privacy">
        <p>
          This notice covers requests for Shaun Denver Mathiasz’s CV. Shaun is
          responsible for this request process. Contact{" "}
          <a href="mailto:shaun.emirates@gmail.com">shaun.emirates@gmail.com</a>{" "}
          to ask about your information or exercise your rights.
        </p>
        <h2>Information you provide</h2>
        <p>
          The request form collects your name, organisation and email address.
          You may also supply your job title, requester type, the opportunity
          and its location, a LinkedIn profile and a message. Please do not
          include sensitive personal information. Personal email addresses are
          accepted.
        </p>
        <h2>Verification and document access</h2>
        <p>
          A six-digit code verifies control of your email address. It does not
          verify your employer, professional identity or the opportunity. Codes
          expire after five minutes. Access grants expire after ten minutes and
          are single-use. We record when the backend serves the PDF; this does
          not establish that you saved or read it.
        </p>
        <h2>Request security and technical information</h2>
        <p>
          Where supplied by the hosting platform, the server records your public
          IP address and approximate country, region and city. Browser family,
          operating system, broad device category, referrer origin and request
          times are also recorded. Network location is approximate, and
          unavailable information is not inferred. We use request-scoped session
          cookies to secure verification and downloads, not to follow you around
          the web.
        </p>
        <h2>Your browser’s location choice</h2>
        <p>
          After you submit a valid form, your browser may ask to share your
          current location. You can deny this without affecting email
          verification or CV access. If you allow it, we collect one
          browser-reported position, its accuracy and capture time. This may use
          GPS, Wi-Fi or other positioning sources; the coordinates are not
          independently verified. We do not poll your location or bypass your
          browser’s permission controls.
        </p>
        <p>
          Optional location is used only to review request security and audit
          suspicious requests. It is not used to rank recruitment opportunities.
          Raw IP addresses and precise coordinates are encrypted in the request
          database; precise coordinates are excluded from ordinary email
          notifications and CSV exports.
        </p>
        <h2>Why we use it</h2>
        <p>
          Request details support your requested professional introduction and
          CV access. Verification, limited security metadata and rate limits
          protect against unauthorised retrieval and email abuse. Optional
          precise location is processed only after your affirmative browser
          permission following the disclosure. You can withdraw permission in
          your browser and ask us to delete a previously shared position. Denial
          or withdrawal carries no CV-access penalty.
        </p>
        <h2>Recipients and processors</h2>
        <p>
          Verified requests are visible only in the owner’s authenticated
          dashboard. Shaun receives a notification containing the professional
          request and limited technical metadata. Resend processes transactional
          email; Vercel hosts the website and private CV file; the configured
          PostgreSQL provider stores private request records; Cloudflare
          Turnstile checks for automated abuse. These providers may process
          information internationally under their applicable service terms and
          safeguards. There are no marketing pixels in verification emails, and
          this workflow does not add you to a marketing list.
        </p>
        <h2>Retention</h2>
        <ul>
          <li>
            Unverified requests: deleted after {retention.pendingHours} hours.
          </li>
          <li>Raw IP addresses: removed after {retention.ipDays} days.</li>
          <li>
            Precise browser-reported coordinates: removed after{" "}
            {retention.gpsDays} days.
          </li>
          <li>
            Verified CV request records: deleted after {retention.verifiedDays}{" "}
            days.
          </li>
          <li>
            Administrative audit records: retained for 30 days; temporary
            rate-limit and webhook records are removed when no longer needed.
          </li>
        </ul>
        <p>
          Scheduled cleanup applies these limits; deletion occurs on the next
          scheduled run. Owner notification emails and any exports are separate
          copies: Shaun must manage their deletion under the same
          request-handling policy. Previously downloaded CV copies and older
          public deployments cannot be recalled through this portal.
        </p>
        <h2>Your rights and choices</h2>
        <p>
          You can request access, correction, deletion or restriction of your
          request information by emailing Shaun. Depending on the law that
          applies, you may also object to processing, withdraw consent or
          complain to the relevant data protection authority. We may need
          proportionate information to verify a rights request. No request data
          is used for unrelated marketing, covert tracking or automated hiring
          decisions.
        </p>
        <Link
          className="button outline-button"
          href="/request-cv"
          prefetch={false}
        >
          Back to CV request <LinkArrow />
        </Link>
      </article>
    </>
  );
}
