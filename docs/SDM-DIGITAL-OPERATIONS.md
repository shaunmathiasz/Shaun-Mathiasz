# SDM Digital operations

## Scope and release gate
SDM Digital extends the existing site at `/services/web-development`. Use feature branch `feature/sdm-digital`. Preview is authorised; Production deployment and Production database migration require the owner's explicit approval. Do not merge, promote or change production secrets as part of the Preview review.

## Reused configuration
The application reuses existing CV_DATABASE_URL (or DATABASE_URL) for CV authentication. Commercial Preview data uses the separate sensitive DIGITAL_DATABASE_URL bound to the verified feature branch, with the existing limited app role. The rest of the infrastructure reuses environment-separated Neon roles/databases, CV_APP_ORIGIN, RESEND_API_KEY, CV_FROM_EMAIL, CV_OWNER_EMAIL, CV_OTP_HMAC_SECRET, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY and CRON_SECRET. Vercel Preview commercial API access is restricted to Git ref feature/sdm-digital to prevent other previews sharing its leads. Existing private owner OTP authentication requires the existing CV configuration and Blob settings. No new authentication service, sending domain, analytics ID or provider integration is needed. Never copy Production credentials into Preview.

Existing sender `verification@shaunmathiasz.com` is reused with display name `SDM Digital | Shaun Denver Mathiasz`. A new sender address is not invented. A dedicated sender on the same verified domain can be agreed later. Preview sends only to the existing owner address, protecting arbitrary recipients from test emails.

## Database and migrations
`migrations/004_sdm_digital.sql` creates only the `sdm_digital` schema and its enquiries, activity, tasks, outbox, rate_limits, events and migration marker tables. It does not alter CV tables or existing records. Queries continue to use the CV database's environment identity guard.

Run `npm run digital:migrate` with the selected environment and a connection authorised to create the new schema. The script checks the exact `shaun_cv_preview`/`shaun_cv_production` database and its environment marker, uses a transaction/advisory lock, and grants only the matching existing app role access to the service schema. A privileged migration connection can be set as CV_MIGRATION_DATABASE_URL in the local environment; do not paste it in chat or commit it.

Builds in every environment are database-read-only. The Preview migration was applied through the connected Neon owner integration after exact branch/database/role verification; see SDM-DIGITAL-MIGRATION.md. No automatic migration is run during a build. Explicit Production migration additionally requires DIGITAL_ALLOW_PRODUCTION_MIGRATION=approved.

## Outbox and mail operations
The enquiry transaction inserts the record, initial audit and two notification outbox rows atomically. The UI shows success only after that transaction commits. Email delivery is separate. Next after() drains initial jobs; the existing authenticated daily `/api/cv-maintenance` cron also drains the commercial outbox without changing the CV job schedule. Jobs use atomic leases, bounded retries/backoff, and stable Resend idempotency keys. Owner details offer retry for unsent jobs. Sent state means provider acceptance, not proof of inbox delivery. Inspect Resend for delivered/bounce status. Monitor failed rows; provider idempotency has a finite window, so reconcile ambiguous accepted-but-unrecorded sends before a manual retry.

## Privacy and access
Business contact data remains behind the existing verified owner cookie. Every admin API reauthorises server-side and checks Origin for writes and exports. Reports/CSV are private/no-store/noindex. CSV exports are capped at 5,000 records, formula-neutralised and audited. Client-supplied prices are not accepted. Notes/status/value changes and deletion are audited. Delete removes linked personal data; a non-personal audit remains.

Default retention: enquiries and linked notes/tasks/outbox 365 days; first-party events 90 days; abuse buckets expire and are removed. The existing daily maintenance applies deletion. Agree a separate documented policy for signed contracts, invoices or other legally required records. Use Neon backups/PITR according to the existing plan, verify restore permissions and test restore into an isolated environment before relying on recovery. Rollback the website independently; retain additive tables rather than dropping data.

Review the privacy notice, cross-border provider processing, retention, rights handling, controller contact and contractual records with a Sri Lankan data-protection adviser before public commercial launch. This repository does not assert legal compliance certification.

## Analytics and consent
The owner expressly approved automatic email, phone and address detection and requested GTM/Clarity on the services page. Both use a separate commercial consent key (`sdm-digital-analytics-consent-v1`) with an explicit disclosure. Existing public-only consent is not reused for the expanded form-page collection. Public/commercial transitions use fresh documents; CV/contact/admin/private pages remain untracked. Existing Clarity content/input masking and denied advertising-consent defaults remain.

Custom events use a fixed vocabulary in src/lib/digital/events.ts; only fixed package/category values are sent, never names, contact details, free text, reference numbers, full URLs or lead IDs. First-party events are consented, anonymous event counts and cannot be treated as unique people. UTMs are restricted to approved non-personal codes; unknown values are discarded from attribution. On the services page, an unknown, duplicate or personal-data-bearing query parameter blocks vendor analytics rather than sending the raw URL. Add reviewed campaign codes centrally when needed.

Google scripts alone do not forward every custom dataLayer event automatically. In the existing GTM container, map the fixed SDM event list to one GA4 Event tag for G-BGFVMTBRVP after Preview verification. Use the event name and optional package_id/industry only. Include generate_lead only after server-confirmed created=true; do not map package price to value or revenue. Do not duplicate the existing Google tag or Clarity installation. This change is not published by the website deployment.

GA4 and Vercel reporting APIs are not connected to the CRM without account/API access; display Not connected, not fabricated numbers. First-party counts and database records have different populations. The dashboard reports current-status ratios within an enquiry creation cohort; it does not assert unique-user visitor-to-sale conversion or automatic offline attribution. Vercel custom analytics is not added without confirming plan support.

## Prices and terms
The typed source is src/config/digital.ts. Exact launch starting fees: LKR 24,900 / 59,900 / 119,900. Proposed reference prices, savings and discounts remain unpublished while publishReferencePrices=false. Enable reference-price claims only after owner approval and substantiation. Domain/hosting/subscriptions/custom software are separate; a 50% deposit follows proposal acceptance, balance after approval and before launch. No online payment collection or full PMS/OTA engine is built.

## Brand and image sources
The owner-supplied ZIP contained sdm_digital_logo_horizontal.png (2606×588 RGBA) and sdm_digital_monogram.png (800×434 RGBA), despite different suggested filenames in the brief. These exact files are retained unchanged under public/branding/sdm-digital. WebP derivatives retain aspect ratios and transparency; no recolouring or redesign. Main logo is used in hero/final section, monogram in founder/owner CRM. Global personal branding and SDM favicon remain intact. The 1200×630 service social JPEG composes the supplied horizontal logo with native text and midnight colours; it is separate from the homepage OG image.

Context photographs are existing local Unsplash assets documented in src/content/visual-assets.ts. Concepts are explicitly illustrative; no fictitious client project or testimonial is claimed. The portfolio example is the owner's actual personal website. No WhatsApp/phone CTA is invented without a supplied public business number.
