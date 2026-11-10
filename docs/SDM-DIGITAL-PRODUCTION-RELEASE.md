# Approved SDM Digital Production release — 10 November 2026

The owner explicitly authorised deployment at https://www.shaunmathiasz.com/services/web-development. The tested application is unchanged from Preview app commit 0823acda140d83ae7b61b8cbda9702dcaed99692; subsequent commits record documentation and the guarded Production migration.

## Verified additive migration

Existing Neon project shaun-cv-portal (ancient-field-98524672), primary branch main (br-gentle-fire-bc3x3ypb), database shaun_cv_production, verified owner/execution role neondb_owner. Environment marker: production.

Applied migrations/004_sdm_digital_production_owner.sql in one transaction through the connected Neon owner integration. The transaction checks the exact database and environment, obtains the migration advisory lock, creates only the sdm_digital schema/tables/indexes and grants the existing limited app role scoped CRUD/USAGE. No owner connection was exported and no new service, database or role was created.

Verification: migration marker 004_sdm_digital, seven commercial tables, zero initial commercial enquiries. Public CV schema fingerprint d7abe615a5b96fdca3cd70cad2a58ceb before and after; CV requests 4 before and after. shaun_cv_production_app has table CRUD and schema USAGE, without schema/database CREATE or role administration. Existing CV tables/data were not modified.

Production reuses its existing CV_DATABASE_URL and provider credentials. DIGITAL_DATABASE_URL remains Preview-only; no Preview database credential is copied to Production.

## Release procedure

Custom-domain automatic assignment is temporarily disabled for the production build so the existing public release remains available during staged checks. Build with target production using existing Production settings, verify the staged deployment, then explicitly promote the tested production build and restore normal automatic domain assignment. Do not promote a Preview environment snapshot.

Before release, the approved source passed build/types/lint, 143 unit tests, 16 focused desktop/mobile services/SEO tests, three-viewport Axe checks and live Preview UI/security checks. Owner confirmed the real Preview enquiry, emails and CRM flow works. This release does not claim a new real inbox/OTP test without evidence. No new secret or integration is required.

Build ID, final deployment state and post-release checks will be recorded after completion. Prior working production deployment: dpl_7UG6F52jRyeTzNy4uNwQgApBQ5c4. Retain the additive commercial schema on website rollback rather than deleting enquiries.
