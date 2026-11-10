# SDM Digital implementation plan

Updated 10 November 2026 (Asia/Colombo). The three supplied briefs form one extension of the existing personal website. The owner subsequently authorised Production deployment, completed at https://www.shaunmathiasz.com/services/web-development; see SDM-DIGITAL-PRODUCTION-RELEASE.md. Earlier Preview checkpoints below are historical.

## Completed

1. Audited the existing Next.js app, verified exact pricing/content, preserved CV/analytics/private-route controls, created feature/sdm-digital.
2. Integrated the two supplied original logos and optimised derivatives without replacing personal branding or favicon.
3. Implemented the services page, exact starting prices, package comparison/selection, industry/device concepts, hospitality demo, process, FAQ, founder links and responsive motion.
4. Implemented validated enquiry persistence, Turnstile, anti-spam/rates, idempotency, transactional notification outbox, owner-only CRM, audit, tasks, exports and real database reporting.
5. Added commercial consent, fixed-enum events, approved campaign configuration, privacy notice, services SEO and social artwork.
6. Verified existing Neon project shaun-cv-portal, branch preview/feature/sdm-digital (br-soft-shape-bcmjt13i), database shaun_cv_preview and neondb_owner. Applied and verified the guarded additive migration. Seven commercial tables; unchanged existing CV count/schema. App role has CRUD/USAGE, no schema/database CREATE or role administration. See SDM-DIGITAL-MIGRATION.md.
7. Added sensitive DIGITAL_DATABASE_URL for Preview only using the existing limited app role. Existing CV and Production connections remain unchanged. Feature-ref guard prevents other Preview branches sharing commercial leads. Removed automatic build-time DDL.
8. Created READY Preview dpl_FSBVdnbEaxiJxEAHHvF4TbpTdHR1 from app commit 206663f69312185b6cd92c66d1a85f26546deb11; reassigned the existing cv-preview.shaunmathiasz.com alias. No new DNS/widget/provider service.
9. Verified remote routes, private API denial, Origin validation, schema readiness, Preview noindex/robots, and social image. Local desktop/tablet/mobile Axe: no selected violations/page errors.

## Final QA results

Build and typecheck passed; lint has 0 errors and 2 existing generated warnings. All 140 unit tests passed. Full browser regression: 151 passed, one transient fixture GET reset; that exact test passed after a GET-only retry correction. All 152 scenarios are covered across the full run plus focused recheck, rather than claiming a fresh all-green single run. Detailed evidence is in SDM-DIGITAL-REPORT.md. A local SQL test needed a longer explicit startup timeout under concurrent browser load; a GET-only fixture retry handles transient local asset connection resets without retrying writes. Neither adjustment changes production behaviour or security assertions.

Latest local mobile Lighthouse: Performance 72, Accessibility/Best Practices/SEO 100; LCP 3.8 s, CLS 0, TBT 670 ms. Performance target remains unmet. Do not claim production field measurements.

Real Cloudflare automation did not obtain a token and did not submit a lead. Owner was asked to complete the real Preview enquiry using the owner inbox and confirm acknowledgement/notification plus authenticated CRM. No security bypass, fake delivery or public release is authorised.

## Remaining release gates

- Owner has now confirmed that the requested real Preview form/email/CRM flow works. No repeat provider setup is needed.
- Optional GTM GA4 custom-event mapping and external reporting API connections; show Not connected until verified.
- Public business phone/WhatsApp number, if those direct CTAs are wanted; no number invented.
- Owner review of commercial terms/privacy and explicit approval before Production migration/deployment.

Production remains dpl_7UG6F52jRyeTzNy4uNwQgApBQ5c4, commit b72714885d1a55f9fde6025a2537ed2ea025c523. Preserve the additive schema on any website rollback. Do not promote a Preview environment snapshot into Production.

## Introductory pricing update
Owner requested the Sri Lanka Business Launch Special presentation and new Claim Offer CTAs. The typed config now has packageId, regularPrice, launchPrice, calculated savingAmount/discountPercentage, discountDisplayApproved, packageFeatures and ctaLabel. Existing IDs are preserved. All commercial reads use launchPrice. The owner subsequently requested the explicit discount layout: per-package discountDisplayApproved flags are true for the Reference value comparisons; no historical selling-price verification is claimed. Focused pricing/SEO browser checks, all unit tests, accessibility checks and a new Preview follow; see SDM-DIGITAL-OFFERS.md.

Final offers Preview: READY dpl_EJ6zpxUfkcTCXt1n8XKdhYKPiMtx, application commit 0823acda140d83ae7b61b8cbda9702dcaed99692, available at the existing cv-preview.shaunmathiasz.com alias. Validation: 143 unit tests, 16 focused desktop/mobile browser tests, build/types/lint, three-viewport Axe and live Preview browser/security/asset checks passed. Lighthouse mobile lab: Performance 80, Accessibility/Best Practices/SEO 100, LCP 4.2 s, CLS 0, TBT 300 ms; performance/LCP targets remain unmet. New Sri Lankan villa/guesthouse context imagery and owner-requested reference-value discount layout included. No Production release. See SDM-DIGITAL-OFFERS.md.

## Production release complete
Owner authorised deployment to www.shaunmathiasz.com/services/web-development. Guarded additive production schema migration verified on existing main/shaun_cv_production, with unchanged CV data/schema. Production build c2a1c7b5cbb05cdb1c8e42b49ca140327c24424a staged, checked and promoted as dpl_HoWxXpMD1vu2hi7h4ZfgsQKAovHM. Live desktop/mobile, pricing, image, protected-route, CV guard, consent and SEO checks passed. No new secrets/services or test enquiries. Full release proof: SDM-DIGITAL-PRODUCTION-RELEASE.md.
