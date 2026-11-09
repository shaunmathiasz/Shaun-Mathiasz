import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "SDM Digital — Enquiry privacy",
  robots: { index: false, follow: false },
};
export default function DigitalPrivacy() {
  return (
    <article className="section prose">
      <p className="eyebrow">SDM DIGITAL / PRIVACY</p>
      <h1>Your enquiry, handled with care.</h1>
      <p>
        SDM Digital is a digital service by Shaun Denver Mathiasz, Colombo, Sri
        Lanka. Contact:{" "}
        <a href="mailto:shaun.emirates@gmail.com">shaun.emirates@gmail.com</a>.
      </p>
      <h2>What is collected</h2>
      <p>
        Your name, business, contact details, selected package, project
        description and any optional information you provide are used to assess
        and respond to your enquiry. Please do not include identity documents,
        payment-card details, guest records or other sensitive information.
      </p>
      <h2>Storage and service providers</h2>
      <p>
        Enquiries and private follow-up notes are held in an access-controlled
        Neon PostgreSQL database hosted through Vercel infrastructure. Resend
        processes acknowledgement and owner-notification emails. Cloudflare
        Turnstile verifies the security check. These providers may process data
        outside Sri Lanka.
      </p>
      <h2>Security and retention</h2>
      <p>
        Only the authenticated owner can view enquiry records. IP addresses are
        not saved with your enquiry: short-lived keyed hashes are used for abuse
        controls. Enquiries and related notes are scheduled for deletion after
        365 days. Anonymous event records are scheduled for deletion after 90
        days. A separately agreed project may require a different documented
        retention period for contractual or legal records.
      </p>
      <h2>Your choices</h2>
      <p>
        Submitting an enquiry permits contact about this project; it does not
        subscribe you to marketing. You can request access, correction or
        deletion by emailing the address above. Identity may need to be
        confirmed before private information is disclosed or changed.
      </p>
      <h2>Optional analytics</h2>
      <p>
        Only if you allow analytics, fixed interaction events such as package
        selections may be counted. Form values, names, emails, phone numbers,
        project text and enquiry references are not included in these events.
        Google tags and Microsoft Clarity recording are disabled on the services
        form page. No GPS location is requested. Declining analytics does not
        prevent submission.
      </p>
      <h2>No payment or booking</h2>
      <p>
        This is an enquiry, not a contract, booking or payment service. Scope,
        pricing, ownership and handover are set out in an agreed proposal.
      </p>
      <Link prefetch={false} href="/services/web-development#enquiry">
        Return to your enquiry
      </Link>
    </article>
  );
}
