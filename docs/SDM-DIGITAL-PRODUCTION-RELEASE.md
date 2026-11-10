# Approved SDM Digital Production release — 10 November 2026

The owner explicitly authorised deployment at https://www.shaunmathiasz.com/services/web-development. The tested application is unchanged from Preview app commit 0823acda140d83ae7b61b8cbda9702dcaed99692; subsequent commits record documentation and the guarded Production migration.

## Verified additive migration

Existing Neon project shaun-cv-portal (ancient-field-98524672), primary branch main (br-gentle-fire-bc3x3ypb), database shaun_cv_production, verified owner/execution role neondb_owner. Environment marker: production.

Applied migrations/004_sdm_digital_production_owner.sql in one transaction through the connected Neon owner integration. The transaction checks the exact database and environment, obtains the migration advisory lock, creates only the sdm_digital schema/tables/indexes and grants the existing limited app role scoped CRUD/USAGE. No owner connection was exported and no new service, database or role was created.

Verification: migration marker 004_sdm_digital, seven commercial tables, zero initial commercial enquiries. Public CV schema fingerprint d7abe615a5b96fdca3cd70cad2a58ceb before and after; CV requests 4 before and after. shaun_cv_production_app has table CRUD and schema USAGE, without schema/database CREATE or role administration. Existing CV tables/data were not modified.

Production reuses its existing CV_DATABASE_URL and provider credentials. DIGITAL_DATABASE_URL remains Preview-only; no Preview database credential is copied to Production.

## Release procedure

Custom-domain automatic assignment was temporarily disabled for staging. The prior public release remained active while the new target-production build was tested. The tested production build was then explicitly promoted; automatic domain assignment was restored. No Preview environment snapshot was promoted.

Before release, the approved source passed build/types/lint, 143 unit tests, 16 focused desktop/mobile services/SEO tests, three-viewport Axe checks and live Preview UI/security checks. Owner confirmed the real Preview enquiry, emails and CRM flow works. This release does not claim a new real inbox/OTP test without evidence. No new secret or integration is required.

## Final deployment and checks

- Live URL: https://www.shaunmathiasz.com/services/web-development
- Target: Production. State: READY.
- Deployment: dpl_HoWxXpMD1vu2hi7h4ZfgsQKAovHM.
- Release commit: c2a1c7b5cbb05cdb1c8e42b49ca140327c24424a.
- Framework: Next.js 16.4.5. Cloud build duration: 79 seconds.
- Primary www domain resolves to this exact deployment after promotion.
- Desktop 1440 × 1000 and mobile 390 × 844 live-browser checks passed: all offer CTAs select the correct launch price, preserve existing form input and load both distinct Sri Lankan images. No page error or horizontal overflow. No GTM/Clarity script request before analytics consent.
- Live HTTP checks passed: exact pricing/reference/savings content, new photo assets, canonical service URL, public indexability and 15-URL sitemap. Privacy/CV/admin pages retain noindex metadata. Protected CRM/export deny unauthorised access, bad Origin returns 403, invalid fields/security return 400. Production commercial schema readiness and CV database guard passed.
- Favicon, Apple icon and the original homepage social JPEG return 200 with appropriate MIME types. Existing about/play/CV pages return 200.
- Post-deploy error/fatal runtime-log query for this deployment over the latest 15 minutes returned no groups. This is a scoped observation, not a guarantee about future errors.
- After the checks, CV request count remains 4; commercial enquiries and mail jobs remain 0. Layout checks did not submit a lead or send an email. No fresh real inbox/OTP delivery is claimed; owner previously confirmed the real Preview enquiry/email/CRM workflow.

Reports: reports/sdm-digital-production-{staged,live}-probe.json and reports/sdm-offers-production-{staged,live}-browser.json. Screenshots use the matching production prefixes. The last Lighthouse results remain local lab metrics documented in SDM-DIGITAL-OFFERS.md, not new production field measurements.

Prior working deployment: dpl_7UG6F52jRyeTzNy4uNwQgApBQ5c4. Retain the additive schema on website rollback rather than deleting enquiries. Future Production changes require normal owner authorisation. Subsequent documentation-only commits do not change this tested release.
