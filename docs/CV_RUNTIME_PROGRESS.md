# Runtime verification — 8 November 2026

Existing project: shaun-mathiasz; Production website confirmed by owner: https://www.shaunmathiasz.com.

## Completed

- Confirmed DATABASE_URL, Turnstile public key and separate Production/Preview secrets exist. Resend key remains a non-readable Secret; never exposed.
- Initial Neon connection: actual authenticated SQL succeeded against the existing service. Original default database had no CV tables. The “Needs Attention” marker is `readable-secret` (a configuration visibility warning), not an observed connection failure.
- Reused the same Neon service, creating separate logical databases `shaun_cv_production` and `shaun_cv_preview`; no duplicate Neon service or integration.
- Created separate runtime roles, neither superuser nor able to create roles/databases. Applied migrations 001 and 002 atomically in each database, including constraints, indexes, immutable environment marker, migration versions and explicit runtime grants. Both request tables were empty after migration.
- Actual Preview-role connection to the Production database is rejected with PostgreSQL 42501. Runtime role cannot update the environment marker (42501).
- Replaced deployed DATABASE_URL with separate environment-specific Secrets. Original owner connection and credential-bearing provider aliases are scoped to Development only. All credential-bearing aliases and the Blob credential were converted to Secrets; a fresh metadata read shows no remaining Neon security warnings. Provider re-synchronisation must not replace the app's environment-specific URL; runtime guard fails closed if misrouted.
- Runtime checks trusted environment marker before any application query/transaction. Preview email transport is restricted to the owner's email, preventing accidental mail to live recruiters.
- Updated Production CV_APP_ORIGIN/NEXT_PUBLIC_SITE_URL and email branding to www.shaunmathiasz.com. Inbound email/DNS are untouched.

## In progress

Local checks, isolated Vercel Preview deployment, actual Vercel runtime DB/TLS, Turnstile token exchange and real OTP/owner sign-in workflow. Never bypass CAPTCHA or return/log OTP values. The owner may need to complete the real widget and inbox steps in their browser. Production release remains gated on successful real tests.

## Infrastructure identities

Private CV is the existing Blob object and is shared read-only by the portal; requester records are isolated in separate databases/roles. The same existing Resend account is used. Preview and Production HMAC/encryption/cron secrets remain distinct.

## Hobby plan compatibility

The first Preview deployment (dpl_55byRTRiQDEZQzN1xsLHakW3uovb) was rejected by Vercel because Hobby does not permit five-minute cron. Replaced frequent cron with Vercel Workflow 5.4 durable notification retries and request-scoped retention deadlines, preserving the transactional SQL outbox. A daily 02:30 Asia/Colombo cron is a recovery backstop. Migration 003 for durable job registration applied in both databases. No paid plan upgrade or additional account was created. Only opaque IDs/environment/deadlines enter workflow state, not OTPs, requester details, IPs or coordinates. Completed workflow payloads are requested to expire immediately.

Automatic approval review initially rejected autoExposeSystemEnvs. The owner explicitly approved the setting in chat; the subsequent update succeeded. It is needed for trusted platform environment checks and native Workflow OIDC. Values remain server/build-only; no secret uses a NEXT_PUBLIC prefix.

Workflow dependency audit found outdated transitive Zod/Undici/Minimatch packages. Targeted patched overrides now produce zero production advisories; unit tests (102), typecheck, lint and the Workflow-aware production build pass. Genuine Vercel runtime tests are still pending.

## Preview runtime investigation

The owner reported the security widget failed. The owner added `cv-preview.shaunmathiasz.com` to the existing Turnstile hostname list; no replacement widget or keys were created. Added accessible widget retry and a numeric provider reference on failure.

Actual deployed negative API probes initially returned HTTP 503 with PostgreSQL 42P01 (undefined relation), despite successful isolated Neon HTTP queries. Added a deployed database/role identity assertion and explicit public-schema marker lookup, and re-applied the known limited Preview connection. Fixed-code diagnostics are Preview-only; logs never include SQL, connection strings, OTPs or requester details. Investigation and positive inbox tests remain pending; this is not a successful end-to-end result.

Local diagnostics regression suite: 104 tests pass. Production remains unchanged.

The follow-up deployed identity guard confirmed the generic DATABASE_URL reached the wrong target. Configured dedicated environment-scoped CV_DATABASE_URL Secrets using the previously verified limited roles and databases; no extra services. Deployment dpl_F1B4mE8AyiLQu39SuwtHjJx5VzJ6 is READY. Real deployed API security probes now pass: expired OTP, unverified/expired/unauthenticated private access, resend cooldown, five-attempt lock, persisted attempts, cross-origin denial, admin protection, POST-only download, old PDF retirement, invalid Turnstile tokens and per-email rate limiting. Only explicitly labelled synthetic Preview fixtures were inserted, then removed. Genuine successful widget/inbox/owner flow is awaiting the owner’s browser retest.

Browser regression of the themed widget failure/retry interaction passed at 360, 768 and 1440 px with no horizontal overflow. This test used a stub widget through a certificate-validating GET relay; it does not prove genuine Turnstile acceptance. Reports: reports/v9-widget-retry.json and reports/v9-widget-*.png. The owner has been asked to repeat the real browser/inbox/download/admin workflow on the repaired Preview.

A subsequent owner retry reached the old Preview deployment: direct file-based Preview builds did not automatically move the branch domain. Corrected the alias explicitly, then assigned the final committed build dpl_EZkc3CwfWF1tqLVh3BrnJiJV3op1 (GitHub e8e16fdab998d00dfe1ceafb9c6a67a3f03dbd0b; tree 284644a1a40ebacdfa4d638f03bbbdc7b97e704e). Verified the alias resolves to that deployment and an actual expired-OTP fixture on https://cv-preview.shaunmathiasz.com returns HTTP 410 using the isolated database. Future native file-based Preview deployments must explicitly assign and verify this alias before inviting human testing. The owner has been asked to retry the exact corrected address. Final remote build is READY; production has not been released.

## Confirmed real OTP and CV access — 8 November 2026

The owner confirmed: “Code arrived and CV downloaded.” An aggregate-only read of the isolated Preview database confirms one verified CV request, one PDF Served event, owner notification status `accepted`, and two registered native background workflows. This is actual provider/browser evidence, not a local fixture. Outbound OTP delivery and authorised private CV access are confirmed. Resend acceptance of the owner notification is confirmed; its inbox receipt is not yet confirmed.

The real request recorded location permission `granted`, so a successful permission-denied browser flow is not yet demonstrated. No coordinates or requester identifiers were read or logged during this check. Asked the owner to test a new request in a private window with location denied, and to confirm notification receipt and successful protected owner sign-in. Production remains unchanged until these checks are complete.

## Location-denied flow confirmed; notification receipt under investigation

The owner confirmed a CV download with location denied. Aggregate SQL now confirms two verified CV requests, each with one PDF Served event: one with GPS permission granted, and one denied with no GPS ciphertext stored. Both owner notifications were accepted by Resend on their first attempt, with provider IDs and no outbox error. The owner reports the notification is missing from the inbox, so inbox receipt is explicitly unconfirmed. Requested the latest notification’s Resend delivery status and a Gmail Spam/All Mail check before any retry; the connected tools do not expose Resend delivery logs and existing server-only credentials remain private. Protected owner sign-in is also still awaiting a genuine browser check. Production remains unchanged.

The owner supplied the actual Resend notification log: sender verification@shaunmathiasz.com, recipient shaun.emirates@gmail.com, and sent/delivered events. Provider-side delivery is therefore confirmed; the owner still cannot find it in Gmail. Sender and recipient project settings were independently checked and match the intended addresses. No duplicate email was sent. Suggested Gmail's `in:anywhere` sender/subject search and account filters check. Inbox placement is not established by a provider delivered event.

Resend flagged missing DMARC. Public DNS and the authoritative Vercel zone both confirmed no existing record. Added exactly one TXT record at _dmarc.shaunmathiasz.com: `v=DMARC1; p=none; adkim=r; aspf=r`, TTL 300 (record rec_bdf2172980c8e01c94265919). This is non-enforcing, does not configure receiving, and does not create a report mailbox or integration. Existing records were preserved. Initial public-resolver checks had not propagated the record yet; don't claim inbox placement or resolved reporting warnings until observed. Owner dashboard sign-in remains the final browser-authentication check requested from the owner.

Follow-up public DNS: Cloudflare's DNS-over-HTTPS resolver now returns the exact DMARC TXT record. Google's resolver still returns the earlier empty answer. Zone re-read confirms all eight pre-existing records are unchanged and there is exactly one new DMARC record. No application code changed in this follow-up, so build/unit suites were not rerun; the previous 104-test and READY build evidence remains the last executed result.

## Protected owner access confirmed and consented Maps link

The owner confirmed the private dashboard opens and both test requests appear. Aggregate SQL independently confirms a verified owner session and an “Owner signed in” administrative audit entry. Core real OTP, private download, permission-denied download, provider notification delivery and protected owner-authentication checks now have actual evidence. Gmail folder placement remains unconfirmed; no claim of inbox receipt is made.

At the owner's request, added a Google Maps link in the private request-detail page for valid coordinates supplied with browser location permission granted. The link preserves coordinate precision, displays reported accuracy, opens a new tab without a referrer, and loads no third-party map until clicked. Denied/missing coordinates get an explicit fallback; approximate IP geolocation never manufactures a precise pin. Coordinates remain behind owner authentication and are not added to email notifications or public pages.

Maps enhancement verification: 107 tests across 12 files pass; typecheck passes; lint has no errors and the same two generated Workflow warnings. Vercel build dpl_2LWgG9hsgmn5DmeVaYyFspfJXTqf is READY (source a716d292109da01600b93688de25adc30f2148d0). Explicitly assigned cv-preview.shaunmathiasz.com and verified the alias target. Exact-address smoke checks confirm the public form renders, an unauthenticated private-record request redirects to owner login, and no map coordinates are exposed in either public response. Google Maps URL/consent/range checks are covered by unit tests; a real owner click on the new Maps link is not claimed. Production remains unchanged.
