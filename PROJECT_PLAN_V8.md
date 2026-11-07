# V8 — Secure CV request portal

Scope: preserve existing site, replace public CV with session-bound email verification, private storage and owner administration.

Audit: Next.js App Router, no existing database/auth/portal. Public PDF moved to private source staging. Resend API key absent from project environment; no integration installation returned in team or personal scope. No credentials are printed. Existing live site must not be updated until end-to-end delivery and private access pass.

Architecture: PostgreSQL with atomic transactions/row locks, Resend HTTP API, Vercel Private Blob, Turnstile, separate owner-only email OTP authentication, durable transactional notification outbox with scheduled worker, private no-store endpoints. No signup. Browser geolocation is optional, initiated after valid form submit and does not delay verification.

Milestones:

1. Audit/configuration — completed; private Blob and security secrets provisioned; PostgreSQL, Turnstile still require configuration; preview origin derives from the trusted Vercel deployment hostname. Approved outbound sender verification@shaunmathiasz.com is configured; owner confirms sending DNS verified, optional inbound MX is not required. The owner added RESEND_API_KEY as a sensitive variable; presence is confirmed, validity/delivery not yet verified.
2. Backend/schema/security — implemented and local SQL/API tests passing.
3. Recruiter and owner interfaces — implemented; responsive parent-page Axe checks show no violations at 360/768/1440px.
4. Privacy/retention and setup docs implemented; 92 desktop/mobile browser cases passed; local build/lint/typecheck and 98 fixture/unit/integration checks passed.
5. Remaining: connect PostgreSQL and Turnstile, apply migration/permissions, verify real email and private-download flow on Preview. Resend sender/key, private Blob and security secrets are already configured. Production release is blocked until this passes.

Precise location assessment: a browser permission prompt does not establish necessity or a legal basis. The request notice explains optional coordinates, no access penalty, seven-day retention. Collect only once after disclosure, never poll; encrypt at rest. Owner must assess lawful basis/proportionality and processor terms before enabling production. No legal compliance certification is claimed.

Prepared infrastructure: private store store_cTNtGcIL6KkRF2Jw in bom1; authenticated upload/read byte comparison passed (112390 bytes). Separate Preview/Production CV_OTP_HMAC_SECRET, CV_DATA_ENCRYPTION_KEY, CRON_SECRET configured; CV_OWNER_EMAIL and CV_BLOB_PATHNAME configured for both; CV_APP_ORIGIN configured for Production. No service secrets were exposed or existing values overwritten. No deployment performed.

Real private-Blob access test: unauthenticated fetch rejected with HTTP 403. Local final results: production build, lint, typecheck, 98 unit/SQL/API fixture tests and 92 desktop/mobile browser cases passed. New form Axe checks: zero reported violations at 360/768/1440px, not a complete compliance audit.
