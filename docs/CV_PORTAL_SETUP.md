# V8 CV request portal — configuration and release

## Current status

Implemented in this repository. **Not deployed or verified with real email or a managed database.** At the initial audit the project had only `NEXT_PUBLIC_SITE_URL`; neither connected integration listing returned a Resend configuration. This task has since created and connected private Blob store `shaun-cv-private` (`store_cTNtGcIL6KkRF2Jw`, Mumbai/bom1), uploaded the authentic 112,390-byte CV and verified an authenticated read with identical bytes, and confirmed unauthenticated retrieval is rejected with HTTP 403. Independent Preview/Production OTP-HMAC, metadata-encryption and cron secrets are stored as sensitive variables in Vercel; their values were not printed. `CV_OWNER_EMAIL`, Production `CV_APP_ORIGIN` and `CV_BLOB_PATHNAME` are configured. No existing production-site variables were overwritten; the new CV sender variable was subsequently updated to the owner’s exact approved address. A Resend account alone does not connect it to this application; The owner has now added `RESEND_API_KEY` to all environments as a sensitive secret; its presence is confirmed, but it cannot be read back by these tools. `CV_FROM_EMAIL=verification@shaunmathiasz.com` is now configured for Preview/Production. The owner confirms DKIM and both sending CNAMEs are verified; public DNS resolves the DKIM and sending CNAMEs. Overall partial status is due to optional inbound receiving, which this portal does not need or configure. Managed PostgreSQL, Turnstile and actual outbound delivery testing remain outstanding. No real authenticated Resend request, OTP acceptance or inbox delivery is claimed. A sensitive API key can be used by deployed functions but cannot be read back by these tools.

Keep the current production deployment unchanged until the checks below pass. Its old public CV remains accessible until a completed migration is released. The unchanged source PDF was uploaded privately and moved locally into Git-ignored `private/shaun-mathiasz-cv.pdf`; it is not bundled by Next.js. The old public source path now returns 410 in the new version. Older deployments, Git history, caches and previously downloaded copies remain outside this new access control. Do not rewrite history or delete deployments without a deliberate recovery plan.

## Connect the existing Resend account

1. Sign in to the **existing** account at https://resend.com. Do not create another account or install a duplicate integration.
2. In Domains, choose an existing verified domain. If none is verified, add a domain you control and publish the exact DNS records Resend supplies. Domain ownership and DNS access cannot be inferred from a Gmail address or a `vercel.app` subdomain. Verify the outbound records. An overall `partially_verified` status can still support outbound email; optional inbound MX is not required for this portal.
3. Reuse or create a least-privilege sending API key in that account. Store it **directly** in Vercel → `shaun-mathiasz` → Settings → Environment Variables as `RESEND_API_KEY`. Never paste its value into a conversation, source file, terminal output or PR. Assign appropriate Preview and Production environments. A sending-only key is sufficient for the app; the domain-read preflight may require dashboard verification instead.
4. Set `CV_FROM_EMAIL` to an address on that verified domain, e.g. an actual `cv@your-domain` address. Do not use Gmail as the sender. Set `CV_OWNER_EMAIL=shaun.emirates@gmail.com`.
5. If using the Resend Vercel integration instead, grant it access to this existing project and verify that the key appears on this project. Installation at account level alone is insufficient.
6. Optional delivery reporting: add the Resend webhook URL `/api/cv-webhook` for `email.delivered`, `email.bounced`, `email.failed`. Save its signing secret as `RESEND_WEBHOOK_SECRET`. Until a valid signed event is received, the app says **accepted**, never **delivered**.

The agent connection available during this task has no Resend account-management credential or shared-browser control tool. It cannot sign into your external Resend account on your behalf. Configure secrets in the provider/Vercel UI, not in chat.

## Other required resources

- **Managed PostgreSQL**: Prefer an existing database, otherwise provision a small managed PostgreSQL instance through Vercel Marketplace. Use separate Preview and Production databases/branches. Store the runtime URL as `DATABASE_URL`; never use an admin/superuser for normal requests. External connections validate TLS certificates. A separate `CV_MIGRATION_DATABASE_URL` can be used only when applying the migration.
- **Private Vercel Blob**: Already prepared in this project by this task; do not create a duplicate or re-upload the existing pathname. For another environment, connect a private store to the project. Prefer `BLOB_STORE_ID` with deployed OIDC access, or a server-only `BLOB_READ_WRITE_TOKEN` if required. Set one fixed `CV_BLOB_PATHNAME`, e.g. a private `cv/...pdf` pathname. The server never accepts file paths from visitors. Public stores are rejected by the private read API.
- **Cloudflare Turnstile**: Create a widget allowing the intended production and preview hostnames. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The backend validates the provider result, expected hostname and `cv-request` action. Do not use testing keys for a public release.
- **Secrets**: Already generated and configured separately for Preview/Production by this task. For a new environment only, generate independent cryptographically random values for `CV_OTP_HMAC_SECRET` (at least 32 characters), `CV_DATA_ENCRYPTION_KEY` (32 random bytes encoded as base64), and `CRON_SECRET` (at least 32 characters). Store them directly in the environment manager. Keep the encryption key stable while encrypted records are retained; loss means private metadata cannot be decrypted. Rotate keys only with a migration/retention plan.
- **Origins**: `CV_APP_ORIGIN` is an exact origin without a trailing slash. Production is `https://shaun-mathiasz.vercel.app`. On a Vercel Preview deployment, the code derives its origin from trusted `VERCEL_URL` when no explicit `CV_APP_ORIGIN` is supplied. Production still requires its explicit canonical origin. An approved stable preview domain can be configured explicitly. `VERCEL_URL` is also accepted as a same-deployment origin; Turnstile must allow that hostname.
- **Scheduled worker**: `vercel.json` schedules `/api/cv-maintenance` every five minutes. Vercel sends `Authorization: Bearer CRON_SECRET`. This schedule requires a plan supporting that frequency (for example Pro). On a plan with daily-only cron, configure a compatible external authenticated scheduler or change infrastructure deliberately before release. Do not silently downgrade reliability. The database outbox survives failed invocations, leases abandoned jobs, retries six times with backoff and exposes failures privately. `after()` runs an awaited immediate attempt; it is not the sole delivery mechanism.

## Prepare without exposing secrets

Use the repository's environment template. Obtain development credentials via the provider UI or a properly authenticated `vercel env pull .env.local`; do not print the file.

```sh
npm ci
npm run cv:migrate
npm run cv:upload # only for a new private object; the current object is already uploaded
npm run cv:check
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`cv:migrate` applies `migrations/001_cv_portal.sql`; it does not create a database. `cv:upload` reads the local ignored authentic PDF and writes it **privately**, without overwriting an existing object. Keep its byte hash identical to the original. The current object is already uploaded; skip upload when using the prepared store. The application has no public/local PDF fallback. `cv:check` only confirms available infrastructure, not actual delivery.

Example least-privilege grants after migration (replace `cv_runtime` with your real runtime role; provision its credential securely):

```sql
GRANT USAGE ON SCHEMA public TO cv_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON cv_requests,cv_verification_challenges,
 cv_access_tokens,cv_request_metadata,cv_access_events,cv_rate_limits,
 cv_notification_outbox,cv_admin_audit,cv_webhook_receipts TO cv_runtime;
GRANT USAGE,SELECT ON SEQUENCE cv_access_events_id_seq,cv_admin_audit_id_seq TO cv_runtime;
```

The runtime role must not create roles or administer the schema. Private-store access should cover only the intended store. Redact request bodies, cookies and authorization headers in any extra observability/drain product; the app never logs codes, bearer credentials or requester records.

## Browser review without cloud credentials

The explicit **local-only** helper configures synthetic credentials. It must never be deployed. The browser suite mocks Turnstile and HTTP API responses; SQL/service tests use PostgreSQL compiled to WebAssembly (PGlite) and stub transport. This is meaningful local verification, not a real email/cloud integration test.

```sh
node scripts/cv-local-test-env.mjs build
node scripts/cv-local-test-env.mjs start
# Separate terminal:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3060 npm run test:e2e
```

Without configuration the real page displays a polished, truthful email alternative and disabled owner sign-in. It never fakes verification or exposes a public CV fallback.

## Privacy and release gates

Before enabling production, review `CV_PORTAL_PRIVACY_REVIEW.md`, processor terms, data residency and a lawful basis for the optional precise-location security use. Browser permission is a technical control, not a legal certification. GPS is not needed to obtain the CV and must not become an opportunity-screening signal.

Use a preview after connecting separate test infrastructure. Complete all of these with real services:

1. Submit genuine professional details with GPS denied; confirm Resend accepts the OTP, receive it in the intended inbox, enter it, download the actual unchanged PDF, verify the new filename and a single backend serving event.
2. Repeat with GPS allowed, unavailable and an expired code. Verify late location updates bind only to their original authorised request.
3. Verify owner notification acceptance and receipt separately; validate the signed delivered webhook if enabled. Simulate a notification failure, then observe an actual scheduled retry. Downloads must remain available independently.
4. Sign in as the owner using the separately scoped email code. Check unauthorised public requests cannot list, export, inspect or delete records. Test filters, safe CSV, deletion and retention on synthetic aged test records.
5. Test simultaneous code and download redemptions against the actual managed PostgreSQL instance (not only the local single-connection test engine).
6. Confirm `/documents/shaun-mathiasz-cv.pdf` returns 410, GET `/api/cv-download` returns 405, all alternative static copies are gone and the CV is absent from public build output/sitemap. Disable or retire old deployment access under a separate deliberate plan.
7. Review mobile and desktop layouts, cookies, cache headers, same-origin controls and geolocation after client-side navigation. Test Safari/Firefox separately before claiming cross-browser support.
8. Only then rebuild with Production credentials, release and repeat a genuine OTP → private-download check. No current deployment is claimed by this change.

## Endpoints and authentication

Public mutation endpoints require exact allowed Origin, same-site context and bounded payloads. OTP and download secrets never appear in URLs. Visitor/admin sessions are separate random, hashed, HttpOnly/Secure/SameSite=Strict cookies; authentication rotates sessions. Admin codes are sent only to `CV_OWNER_EMAIL` and grant no visitor CV access. The owner session lasts eight hours; visitor verified sessions last 90 minutes.

- `POST /api/cv-request`: validated form, bot/rate limits, pending record, real OTP send.
- `POST /api/cv-verify`: five-minute, five-attempt challenge; atomic consumption, ten-minute single-use grant and outbox.
- `POST /api/cv-resend-code`: 60-second cooldown, three resends maximum; old challenge invalidated.
- `GET/DELETE /api/cv-session`: scoped status/start again; no arbitrary request ID access.
- `POST /api/cv-location`: short-lived request-scoped secret **and** the corresponding visitor session, one report only; no GPS obligation.
- `POST /api/cv-download`: authenticated, verified session plus unconsumed grant, fixed private PDF, no-store attachment. Fetching the file happens before grant consumption; a failed storage read does not burn access. A successful server response is recorded as “PDF Served”, not “read/saved”. GET/prefetch cannot consume it.
- `POST /api/cv-access`: up to three total grants in a valid verified session; prior grants invalidated.
- `POST /api/admin/login`, `POST/PUT /api/admin/verify`, `POST /api/admin/logout`: owner-only OTP authentication, resend and logout.
- `POST /api/admin/requests`, `POST/DELETE /api/admin/requests/[id]`, `POST /api/admin/export`: authenticated owner; search is in the body, not a PII-bearing URL. CSV caps at 500 retained records and excludes raw IP/GPS.
- `GET /api/cv-maintenance`: cron-secret-only cleanup/notification processing.
- `POST /api/cv-webhook`: signed provider events, timestamp window and receipt deduplication.

Notification emails are transactional and pixel-free. Persisted immutable, encrypted payloads and provider idempotency keys make retries stable. As with any external side effect, a long interruption beyond the provider's idempotency window can produce a duplicate; this is not an exactly-once email guarantee.

## Retention

Defaults: unverified requests 24 hours; raw IP 30 days; precise coordinates seven days; verified requests 90 days; limited administrative audit 30 days; webhook deduplication seven days. Expired limits/grants and expired OTP hashes are cleaned. Deletions cascade through challenges, grants, metadata, events and the outbox. Retention can be shortened in `.env.example` variables. Owner emails, database backups and exported CSVs need their own retention handling; deleting an app record cannot erase a delivered email or someone else's CV copy.

### Approved sender and DNS (latest owner confirmation)

Use `verification@shaunmathiasz.com` with display name `Shaun Denver Mathiasz | CV Verification`. Owner recipient remains `shaun.emirates@gmail.com`. Public DNS checks found `resend._domainkey.shaunmathiasz.com`, `send.shaunmathiasz.com → send.forge.rmta.net` and `rsend.shaunmathiasz.com → rsend-apne1.forge.rmta.net`. DNS is managed by Vercel; no DNS record or inbound configuration was changed. Do not add duplicate sending records or a second Resend integration. `cv:check` evaluates sending capability plus DKIM/SPF records and does not require the optional receiving MX to verify. Current Resend documentation: https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying and https://resend.com/docs/api-reference/domains/get-domain.
