# SDM Digital Preview report

Date: 10 November 2026 (Asia/Colombo).

## Review deployment

- Services: https://cv-preview.shaunmathiasz.com/services/web-development
- Owner login: https://cv-preview.shaunmathiasz.com/admin/login
- Protected CRM: https://cv-preview.shaunmathiasz.com/admin/digital-solutions
- Source branch: feature/sdm-digital.
- App build: 206663f69312185b6cd92c66d1a85f26546deb11.
- Preview deployment: dpl_FSBVdnbEaxiJxEAHHvF4TbpTdHR1, READY.
- Production was not deployed or migrated. The existing Preview alias was reassigned; no DNS or Turnstile integration was duplicated.

## Implemented extension

A dedicated server-rendered services page retains the midnight personal identity and adds the supplied SDM Digital branding. Exact starting fees are LKR 24,900, LKR 59,900 and LKR 119,900. Proposed reference prices/discount claims remain unpublished. Included scope, revisions, delivery windows, support, third-party charges and payment stages are explicit.

Interactions include selectable package cards, a detailed comparison, industry concepts, device-size previews, hospitality demonstration tabs, an interactive process and accessible FAQs. Concepts are labelled illustrative. Package selection preserves form input. Motion uses CSS transforms/opacity with reduced-motion alternatives. No new production animation library or 3D dependency was introduced.

The secure enquiry form validates server-side, verifies Turnstile action/hostname, rate-limits by keyed identifiers, rejects honeypots/cross-origin requests, and uses idempotency to avoid duplicate enquiries. A database transaction commits the enquiry, price snapshot, audit and two notification jobs before reporting success. Notification jobs have leases, bounded retries and stable Resend idempotency keys. Email errors do not erase saved enquiries or falsely report delivery.

The existing owner OTP login protects a separate commercial CRM. Every API reauthorises owner access. Features include date/status/package/search filters, pagination, real database summaries, lead details, status/notes, proposed/accepted/collected amounts, follow-up tasks, notification retry, audited deletion and private CSV export with formula neutralisation. External analytics reports explicitly show Not connected until authorised reporting API access exists.

## Preview migration and isolation

See SDM-DIGITAL-MIGRATION.md for the complete verification. The existing Neon project shaun-cv-portal, branch preview/feature/sdm-digital, database shaun_cv_preview and owner neondb_owner were verified before the additive migration. All seven commercial tables were created. Existing CV requests remained 4 and the public CV schema fingerprint was unchanged. The app role has commercial CRUD/USAGE, without schema/database creation, superuser or role-management permissions.

A dedicated sensitive DIGITAL_DATABASE_URL was configured in Vercel Preview using that limited app role. Existing CV/Production connections were preserved. Cloud Preview commercial access requires the feature/sdm-digital Git ref. Builds never apply database migrations. Production migration remains an explicit, separately approved action.

## Brand assets and sources

The two original owner-supplied PNGs are retained under public/branding/sdm-digital:

- sdm_digital_logo_horizontal.png: 2606 × 588, original transparency/proportions retained.
- sdm_digital_monogram.png: 800 × 434, original transparency/proportions retained.
- Matching optimised WebP derivatives are used for rendering.
- public/social/sdm-digital-services.jpg is a separate 1200 × 630 composition using the supplied logo and native text.

Context photography reuses existing local Unsplash imagery; original sources/licensing references are in src/content/visual-assets.ts. Stock imagery does not imply a client engagement or completed SDM Digital project. No fabricated clients, results or testimonials were added. The personal favicon, homepage OG artwork and personal logo remain intact.

## Analytics and privacy

The owner approved automatic Google contact-data detection and requested tracking scripts on services. GTM and separately managed Clarity are retained after a new, explicit commercial consent, rather than reusing an older public-only consent. Advertising consent stays denied; Clarity masking is preserved. CV, admin, contact and other private routes remain excluded, with fresh-document transitions at consent boundaries.

Custom events contain fixed non-personal enums only. Approved campaign codes are centrally configurable. Unknown/PII-bearing or duplicate query parameters block services analytics; other public query restrictions remain. First-party reports are event counts, not unique visitors. Website dataLayer events still require a reviewed GA4 Event tag mapping in the existing GTM container before their GA4 ingestion can be claimed. No GTM configuration was published here, and no duplicate Google/Clarity installation was added. Vendor scripts remain disabled on Preview; production-origin browser fixtures test consent and isolation with stubbed SDKs, not live vendor ingestion or Tag Assistant acceptance.

## Validation

- Production-mode build and TypeScript validation passed.
- `npm run lint`: passed with 0 errors and 2 existing generated Workflow warnings.
- `npm run typecheck`: passed.
- `npm test -- --maxWorkers=1`: 140/140 tests passed across 18 files. This includes 19 PostgreSQL-compatible integration tests. An earlier concurrent run timed out starting the extra PGlite instance; its explicit timeout was increased to 30 seconds, with assertions unchanged.
- `npm run build` through the local fixture configuration: passed; cloud Preview build: READY. Builds do not run DDL.
- Full desktop/mobile Playwright run: 151 passed, 1 failed (7.6 minutes). The failure was a transient local font-asset GET connection reset in the Clarity fixture. Added GET-only retry, then reran that exact desktop test: 1 passed (5.1 seconds). All 152 scenarios have therefore passed across the full run plus focused recheck; a new all-green 152-test single run was not claimed. All 12 new services browser cases passed in the full run.
- Axe checks at 1440 × 1000, 768 × 1024 and 390 × 844 found zero selected WCAG A/AA violations and zero page errors. This is automated checking, not accessibility certification.
- Latest local Lighthouse mobile lab run: Performance 72, Accessibility 100, Best Practices 100, SEO 100; LCP 3.8 s, CLS 0, TBT 670 ms. The performance/LCP targets are not met. These are local simulated results, not production field Core Web Vitals or measured INP.
- Live Preview: services/privacy and preserved about/play/CV pages return 200; unauthorised CRM/export return 401; protected dashboard redirects to owner login; wrong-Origin enquiry returns 403; invalid fields/security challenge return 400 rather than the former database 503.
- Preview is noindex, robots disallow all and its public sitemap is empty. Production's existing 14 URLs are preserved; the services page would become the fifteenth only after an approved release.
- The new services social JPEG returns 200 and is 1200 × 630.
- Automated real Cloudflare testing did not obtain a challenge token. It did not submit an enquiry, bypass Turnstile, or prove real email delivery. Human Preview verification has been requested. SQL/provider fixtures validate business rules but are not proof of inbox delivery or authenticated live CRM operation.

Reports and screenshots are in reports/sdm-digital-*.json and reports/sdm-digital-{desktop,tablet,mobile}.png.

## Key source groups

- src/config/digital.ts: typed commercial content, prices and package scope.
- src/app/services/web-development/: page, styles and privacy disclosure.
- src/components/digital/: interactive concepts, pricing, enquiry, telemetry and CRM.
- src/lib/digital/: strict schemas, services, SQL reports, event vocabulary and HTTP guards.
- src/app/api/digital/ and src/app/api/admin/digital-solutions/: public/private endpoints.
- migrations/004_sdm_digital*.sql and scripts/digital-*.mjs: guarded migrations and read-only build wrapper.
- src/components/clarity-analytics.tsx, src/lib/analytics-policy.ts and src/lib/gtm-bootstrap.ts: consent/event integration.
- src/components/editorial-tools.tsx: passive/rAF native progress bar, preserving the existing appearance while removing its eager Motion dependency.
- Existing navigation, homepage, robots and maintenance endpoint: additive integration.

## Local commands and release procedure

Use npm ci, npm run dev, npm run lint, npm run typecheck, npm test, npm run build and npm run test:e2e. Copy .env.example to local ignored configuration only when needed; never commit credentials. Browser provider fixtures require the documented local test environment, not production credentials.

Before public launch: complete real Preview enquiry/email/owner CRM verification, approve commercial privacy/terms and any public business phone number, configure and test GA4 event mapping if wanted, and separately approve Production migration/deployment. Reuse the existing Production database and provider setup with explicit environment checks; do not promote a Preview environment snapshot. Verify service form, CV portal, icons, SEO and tracking again on the resulting Production build. A website rollback must not drop the additive commercial tables or erase leads.
