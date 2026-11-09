# SDM Digital unified implementation plan

Status: implementation in progress. Production changes are not authorised.

## Audit and decisions
Existing Next.js App Router, React, strict TypeScript, Motion, Lucide, Zod, pg, Vercel Workflow and local fonts remain. No new animation/chart library. Existing CV owner OTP/cookie auth is reused. Existing Neon environment guard, verified Resend sender and Turnstile widget are reused without changing CV behaviour. New commercial data lives only in the sdm_digital schema. Preview uses the existing isolated preview database, never production records. Existing personal icons, social preview and all public routes remain.

## Architecture
- src/config/digital.ts: exact launch pricing, terms, comparison and substantiation flag.
- src/app/services/web-development: server-rendered landing page and privacy notice.
- src/components/digital: scoped visual system, official logos, accessible interactive showcases, pricing, enquiry and owner CRM.
- src/lib/digital: shared validation/events, parameterised repository, form/notification service, consented aggregate telemetry, owner queries.
- migrations/004_sdm_digital.sql: additive isolated tables, outbox, rate limits, activity, tasks and events.
- API routes reuse origin/body/auth/private response helpers. No form contents or identifiers reach third-party analytics. Owner explicitly approved automatic contact detection and requested both scripts on services. The services page uses a separate consent key and explicit disclosure; existing public-page consent is not treated as permission for the expanded commercial collection. Custom event payloads remain restricted to fixed enums. Private/CV/admin routes remain excluded. No SDK added.
- Transactional outbox plus existing daily cron retries; Resend idempotency keys, private owner retry controls, Preview recipient restriction.
- Owner-only CRM at /admin/digital-solutions, CSV formula protection, audit, truthful reporting and deletion controls.

## Milestones
1. Audit + branch + asset inspection.
2. Pricing, brand assets, server landing page and responsive interactions.
3. Separate migration, enquiry API, notifications and CRM.
4. Privacy, SEO, event integration and documentation.
5. Unit/integration/browser/regression/build checks; preview only.

## Release gates
Real database migration and provider delivery must be tested on Preview; privileged migration access may be required. Turnstile must allow the chosen preview hostname. No production deployment without the owner's explicit approval. No invented contact phone/WhatsApp number; use the real enquiry/email CTAs until supplied.
