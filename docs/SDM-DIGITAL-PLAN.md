# SDM Digital unified implementation plan

Status: implementation and final QA in progress. Exact Neon feature migration is now verified; Production changes are not authorised.

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

## Checkpoint — 10 November 2026, awaiting direct Neon authorisation

Owner instructed us to handle the migration ourselves and stop if appropriately privileged access is unavailable. Do not ask the owner to execute SQL or manage roles. New exact target: existing project shaun-cv-portal, branch preview/feature/sdm-digital, database shaun_cv_preview. The precise branch and owner role have NOT yet been verified through Neon. The existing Vercel Neon installation reports MCP read-only capability. No Neon credentials, authenticated CLI session or migration connection is provisioned in this execution environment. A direct Neon plugin was discovered and suggested for secure account connection; this does not provision another service.

No migration completed. Previous Preview app attempts failed with SQLSTATE 42501 and rolled back. No CV tables or Production data were changed. Do not retry automatic migration or deploy another Preview until the exact Neon branch is verified. Review/disable the automatic Preview migration build hook before further deployments; migration should run through the authorised owner connection once branch identity is confirmed.

Feature branch: feature/sdm-digital. Latest committed Preview source: 14cca0497eb4b195539cb2e39e04ea12b5231234. Ready Preview: https://shaun-mathiasz-h3dqudp7e-shaun-cd95.vercel.app/services/web-development (dpl_2oqgAM2JSCBNyvAtzjP6Z59VRy56). Production remains dpl_7UG6F52jRyeTzNy4uNwQgApBQ5c4.

Implemented: full branded page, exact launch pricing, industry/device/process demos, enquiry API and validation, isolated schema migration, transactional outbox, owner-only CRM/reporting/export, services-specific consent for approved GTM/Clarity collection, first-party aggregate events, privacy/SEO/assets, documentation. Privileged migration, real provider delivery and authenticated CRM end-to-end are blocked. The Preview enquiry readiness probe correctly returns 503 while commercial schema is unavailable. Read-only CV environment/database guard succeeds; unauthorised CRM endpoints return 401; wrong-Origin enquiries return 403; invalid enquiry fields return 400. Preview noindex/robots protections and 1200×630 service social image verified.

QA completed on the current production-mode build: 139 unit tests, lint (0 errors/2 existing generated warnings), typecheck and build. Axe at desktop/tablet/mobile: 0 selected WCAG A/AA violations and 0 page errors. Initial two browser failures were ambiguous alert selectors; corrected selectors passed. Later full-suite run is in /tmp/digital-full-e2e.log. Screenshots under reports/sdm-digital-*.png. Local mobile Lighthouse improved 71→76 with deferred Zod and no unnecessary photo preload: Accessibility/Best Practices/SEO 100, LCP 4.2 s, CLS 0, TBT 390 ms. These are local lab numbers, not field metrics; performance target remains unmet.

Pending local optimisation (not yet committed/built): src/components/editorial-tools.tsx replaces globally loaded Motion-based ScrollProgress with equivalent native passive/rAF progress bar; tests/e2e/digital.spec.ts adds a progress test. Types/lint passed for these edits, but the running production-mode build still contains the old Motion bar. Do not claim native-bar performance or browser verification until rebuilding and retesting. These edits are preserved in the workspace for continuation.

After direct Neon connection: read provider skill/tools, verify project/branch/database/owner without exposing secrets; review and apply only the guarded additive migration; verify tables/constraints/app CRUD and isolation; remove automatic Preview DDL; finish native-bar build/benchmark/regressions, add the new schema/event files in subsequent GitHub commits, create a final Preview (no Production), verify actual Turnstile and outbox flows, and complete the final report. Existing cv-preview hostname may be reused after verification to avoid another Turnstile hostname; it has not yet been reassigned. GA4 custom event forwarding still requires an appropriately tested event-tag mapping in the existing container; no GTM settings were changed.

Latest broad regression result before this authorisation pause: 147 passed, 3 failed (7.9 minutes). Outstanding failures are both desktop/mobile invalid-form focus assertions after deferring Zod, and one desktop commercial-consent test. Inspect /tmp/digital-full-e2e.log and test-results traces. In particular, error focus should run after committed validation-error DOM, rather than racing requestAnimationFrame from an async validation callback. Do not report the full suite as passing until resolved and rerun. No additional feature work was performed after the owner requested stopping at an unavailable privileged connection.


## Resume checkpoint — Neon connected and migration verified
Direct Neon write connection became available. Verified project ancient-field-98524672, exact existing feature branch br-soft-shape-bcmjt13i, database shaun_cv_preview, owner/execution role neondb_owner, Preview environment marker. Applied the guarded owner migration through Neon run_sql_transaction with explicit IDs. All seven commercial tables/migration marker verified; CV count remains 4 and schema fingerprint unchanged. Limited app role has schema USAGE and table CRUD but no schema/database CREATE, superuser or role management. See SDM-DIGITAL-MIGRATION.md.

The existing Vercel CV connection did not reach the feature schema (readiness stayed 503). Branch-scoped variable overrides were rejected because the project is not formally Git-linked. They did not apply. Instead created only DIGITAL_DATABASE_URL as a sensitive Preview variable using the existing limited app role on the exact feature branch. No owner credential stored and no Production/CV connection modified. Business service now uses this connection and requires VERCEL_GIT_COMMIT_REF=feature/sdm-digital on cloud Preview. Automatic Preview DDL removed from scripts/digital-build.mjs.

Local validation focus repaired using a post-commit errors effect; removed rAF race. Native progress bar optimisation and Preview OG asset-origin fix still need rebuilding/testing/committing along with dedicated DB connection changes. Latest cloud Preview remains commit 14cca0497eb4b195539cb2e39e04ea12b5231234; create a fresh one after checks to receive DIGITAL_DATABASE_URL. Never deploy Production until separately approved.
