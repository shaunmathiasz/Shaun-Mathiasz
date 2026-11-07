# Runtime verification — 8 November 2026

Existing project: shaun-mathiasz; Production website confirmed by owner: https://www.shaunmathiasz.com.

## Completed

- Confirmed DATABASE_URL, Turnstile public key and separate Production/Preview secrets exist. Resend key remains a non-readable Secret; never exposed.
- Initial Neon connection: actual authenticated SQL succeeded against the existing service. Original default database had no CV tables. The “Needs Attention” marker is `readable-secret` (a configuration visibility warning), not an observed connection failure.
- Reused the same Neon service, creating separate logical databases `shaun_cv_production` and `shaun_cv_preview`; no duplicate Neon service or integration.
- Created separate runtime roles, neither superuser nor able to create roles/databases. Applied migrations 001 and 002 atomically in each database, including constraints, indexes, immutable environment marker, migration versions and explicit runtime grants. Both request tables were empty after migration.
- Actual Preview-role connection to the Production database is rejected with PostgreSQL 42501. Runtime role cannot update the environment marker (42501).
- Replaced deployed DATABASE_URL with separate environment-specific Secrets. Original owner connection and credential-bearing provider aliases are scoped to Development only. Remaining readable-secret indicators on those Development aliases are deliberate visibility warnings, not runtime failures. Provider re-synchronisation must not replace the app's environment-specific URL; runtime guard fails closed if misrouted.
- Runtime checks trusted environment marker before any application query/transaction. Preview email transport is restricted to the owner's email, preventing accidental mail to live recruiters.
- Updated Production CV_APP_ORIGIN/NEXT_PUBLIC_SITE_URL and email branding to www.shaunmathiasz.com. Inbound email/DNS are untouched.

## In progress

Local checks, isolated Vercel Preview deployment, actual Vercel runtime DB/TLS, Turnstile token exchange and real OTP/owner sign-in workflow. Never bypass CAPTCHA or return/log OTP values. The owner may need to complete the real widget and inbox steps in their browser. Production release remains gated on successful real tests.

## Infrastructure identities

Private CV is the existing Blob object and is shared read-only by the portal; requester records are isolated in separate databases/roles. The same existing Resend account is used. Preview and Production HMAC/encryption/cron secrets remain distinct.
