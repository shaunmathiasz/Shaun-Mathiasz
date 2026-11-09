# Shaun Denver Mathiasz — Midnight Executive

Next.js App Router, React, strict TypeScript, Tailwind CSS, Motion, local fonts and images. A professional portfolio preserving the established midnight travel/business identity. The public brand pages and games need no backend credentials. The V8 secure CV portal adds PostgreSQL, private Blob storage, existing-account Resend email and owner-only authentication; it stays unavailable until configured and verified.

## Local setup

Use Node.js 24 and npm:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set `NEXT_PUBLIC_SITE_URL=https://shaun-mathiasz.vercel.app` for production metadata. The existing domain stays unchanged.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
npx playwright install chromium
npm run test:e2e
```

`PLAYWRIGHT_BASE_URL` can target an existing production-build server or preview. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select system Chromium. The build explicitly uses Next's supported Webpack option. Current measured results are in V4_REVIEW.md; historical reports retain their original scope.

## Content and components

- `src/config/site.ts`: full professional name, email, domain, verified user-supplied social links and the secure CV request route.
- `src/content/profile.ts`, `credentials.ts`, `organisations.ts`, `career-locations.ts`, `projects.ts`, `articles.ts`: typed professional information. Related company brands are one employment chapter; Oxford courses are short courses; IATA is ongoing; RAeS is a student affiliation.
- `src/components`: navigation, hero atmosphere, organisation identities, career globe, journey, credentials, filtered portfolio, rules-based travel builder and editorial/contact controls.
- `src/app/globals.css`: established design tokens/layout. `src/app/motion.css`: V4 choreography and responsive/reduced-motion fallbacks.
- `src/components/cinematic-system.tsx`: optional fine-pointer cursor companion, bounded CTA movement, small card depth and progressive section reveals. Native cursor, links, keyboard and scroll remain intact.
- `src/components/home-introduction.tsx`: non-blocking 1050ms identity ribbon, skippable via button/Escape, once per session; omitted on late hydration/reduced motion.
- `ASSETS.md`, `V3_LOGOS.md`: photographic, geographic and official-brand provenance. No reference-site assets/code are reused.

Draft MDX is repository-owned and visibly labelled/noindex. Never render untrusted MDX or publish drafts automatically. Professional practice overviews and example itineraries must not become claimed commercial results. Do not add confidential employer information.

## Contact and environment

The main public contact experience works without credentials: `mailto:shaun.emirates@gmail.com`, actual clipboard feedback/manual-copy fallback, LinkedIn and the CV request link. A mailto link opens the visitor's configured email app; website inbox delivery is not claimed.

| Variable               | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | HTTPS canonical domain, metadataBase, sitemap and robots |
| `RESEND_API_KEY`       | Optional server-only email transport key                 |
| `CONTACT_FROM`         | Optional verified Resend-domain sender                   |
| `CONTACT_TO`           | Optional recipient address                               |

Only when **all three** mail variables exist does the contact page show its server-validated form. Otherwise the page shows the direct email alternative. The endpoint returns 503 when unconfigured and never simulates success. If enabling it, test provider acceptance and actual inbox delivery with a verified sender before launch. Do not expose secrets through public variables or source control.

The optional form uses Zod, origin checks, honeypot and a bounded in-memory limiter (five attempts per ten minutes per warm instance). Serverless instances do not share limiter state. Add appropriate platform rate limiting if public form traffic warrants it. The form explains email-provider processing; confirm retention/deletion arrangements before enabling collection. The general contact endpoint does not persist messages. The separate CV request process stores private records under its disclosed retention policy.

Optional browser storage contains only interface preferences: `shaun-intro-v4` in session storage and `shaun-motion` in local storage. Storage failures are tolerated. No analytics, trackers or third-party frontend media services are added.

## Public assets and facts

The authentic user-supplied portrait is delivered via Next Image with CSS colour treatment. The authentic CV derivative has been moved from the public directory to ignored local staging at `private/shaun-mathiasz-cv.pdf`, unchanged. The new portal requires private Blob storage and verified temporary access; the old static URL returns 410 in this version. Older deployments and downloaded copies are not revoked by a source change. The original attachment is not published.

The professional name is Shaun Denver Mathiasz. Professional email is shaun.emirates@gmail.com. LinkedIn is https://www.linkedin.com/in/shaun-denver/ and Instagram is https://www.instagram.com/shaun.mathiasz/. These destinations were supplied/confirmed by Shaun; no account-ownership authentication is claimed.

## GitHub and Vercel

Existing source repository: https://github.com/shaunmathiasz/Shaun-Mathiasz, branch `midnight-executive`. Existing Vercel project: `shaun-mathiasz`; production domain: https://shaun-mathiasz.vercel.app/. Preserve the existing project and domain.

Deploy a preview of the tested commit first. Validate routes, mobile/keyboard interactions, images, CV, contact actions and 404. Preview without a configured canonical domain intentionally blocks indexing and emits an empty sitemap. Production has `NEXT_PUBLIC_SITE_URL` configured. Once preview QA passes, promote/redeploy those exact source files into the existing project and check the production alias and metadata. Do not change production secrets or domain settings for a visual upgrade.

Native connected GitHub/Vercel tools can publish source and deployments without copying account credentials into the workspace. CLI is an alternative when authenticated locally (`vercel` for preview, then promotion/production deployment only after preview review). If Git-based automatic deployment is desired, verify the Vercel project's Git provider connection and selected production branch; a GitHub repository alone does not establish automatic deployment.

## Verification scope

Vitest covers content invariants, contact/security validation, contrast tokens and builder reasoning. Playwright covers the seven main routes, portfolio details/filters, mobile navigation, globe selection, builder/reset, passport, contact clipboard success/failure, session intro, motion preference persistence, descendant active navigation, draft noindex, 404, reduced motion/no runtime errors, no-JavaScript access and overflow at 360/390/768/1024/1440px. Browser results are Chromium desktop and iPhone-emulated Chromium, not physical-device or Safari/Firefox certification.

Lighthouse lab results are measurements of a local production build with mobile throttling. They are not field Core Web Vitals, real-user INP or a full WCAG conformance claim. Current release evidence, limits, reference findings and motion system are documented in V4_REVIEW.md.

## Personal brand, journal and Digital Presence

The user approved full publication of the two existing essays on 6 November 2026. They now include substantive editorial content, references, author/date/schema metadata, indexable pages and sitemap entries. Future drafts still require explicit approval before publication. Keep illustrative examples clearly distinguishable from professional case-study outcomes.

`src/content/influence.ts` centrally defines the four platforms, approved November 2026 metrics, handles, profile links, approximation markers and combined audience caption. Preserve rounded values and the non-unique-audience caveat; never imply that the rounded sum is an exact or deduplicated count. No live social API, reach, impressions or engagement data is invented. Rolling digits run once on entry, with static final figures for reduced-motion/paused-effects users and screen readers.

Social profile cards on Contact expand into curated profile-link previews using Shaun's portrait and supplied links. They are not embedded feeds or scraped posts. TikTok/Facebook join the existing Instagram/LinkedIn links. The optional destination-pairs game is linked from the footer and available at `/portfolio#travel-detour`; it uses only local session state and supports keyboard play, reset and Escape dismissal. `src/app/template.tsx` adds a short route-entry treatment without delaying navigation or native scrolling. No new dependencies, accounts or secrets are needed.

All fifteen short-course entries now have local issuer marks, including user-supplied Amadeus and Macquarie assets. See CERTIFICATION_LOGOS.md and ASSETS.md for provenance, licences and trademark limitations.

### WORLDWIDE strategy game

`/play` contains **WORLDWIDE — The Travel Tycoon Challenge**: five rounds, fictional travel-product decisions, event responses, financial statements, local saves/bests and share-card export. It adds no services, API keys or dependencies. Start the local app and visit `/play`. See [WORLDWIDE.md](WORLDWIDE.md) for the financial model, state format, accessibility, tests and asset provenance. This feature has not been deployed as part of its implementation task.

### Curated photography and portrait policy

The authentic portrait is reserved for the Home hero. Photo metadata and page-specific reuse live in `src/content/visual-assets.ts`; `src/content/asset-inventory.json` records all public image dimensions, licences and duplicate status. Regenerate from the repository root with `node scripts/visual-asset-inventory.mjs` (Node 24). See [PORTRAIT_VISUAL_AUDIT.md](PORTRAIT_VISUAL_AUDIT.md) for the visual strategy and before/after placement inventory.

## V8 — Secure CV request and owner dashboard

Start with [CV portal setup](docs/CV_PORTAL_SETUP.md) and the [pre-release privacy assessment](docs/CV_PORTAL_PRIVACY_REVIEW.md). The current implementation has **not** been deployed or verified with real cloud email/storage. Do not replace the live site until the release checklist passes.

Routes: `/request-cv`, `/request-cv/privacy`, `/admin/login`, `/admin/cv-requests`. Schema: `migrations/001_cv_portal.sql`. Server logic: `src/lib/cv`. Full environment names and preparation commands are in `.env.example` and the setup guide. No secrets belong in client code or Git.

The portal uses mandatory six-digit email OTP, atomic verification and file-serving claims, five-minute expiry/five attempts, three controlled resends, database rate limits, Turnstile, separate owner sessions, no-store downloads, one-time optional browser geolocation, encrypted private metadata, durable owner-notification retries, safe CSV export and scheduled retention. There is no automatic claim of real delivery: provider acceptance and signed delivered events are separate states.

`npm run cv:migrate`, `npm run cv:upload` and `npm run cv:check` require real service configuration. The local-only fixture helper and PGlite/browser mocks verify application behaviour without contacting recipients; they are not production credentials or end-to-end cloud verification.

### Optional Microsoft Clarity analytics

Set `NEXT_PUBLIC_CLARITY_PROJECT_ID` on Vercel Production (currently `zaylxflzbc`). Clarity runs only on `https://www.shaunmathiasz.com`, after an explicit analytics opt-in. Preview/localhost, Contact, CV/admin/API routes, unknown paths and query-string URLs are excluded. No third-party analytics request occurs before opt-in. Browser DNT/GPC signals keep recording disabled. Consent is remembered for 180 days; the footer's Analytics preferences control supports withdrawal.

All page text is masked. No identify API, form values, visitor GPS, recruiter data or custom user tags are sent by this integration. Private/public navigation uses a new document so a recorder cannot follow into the CV workflow. Public-to-public navigation remains client-side. In Microsoft Clarity, enable Require cookie consent and Strict masking, and avoid unmask overrides; these dashboard settings cannot be managed from this repository. Microsoft may infer coarse geography from network information, but the integration never requests precise location.

See `tests/unit/analytics-policy.test.ts` and `tests/e2e/clarity.spec.ts`. The browser privacy tests use a production-origin fixture and a stub Microsoft script, so they do not prove Microsoft dashboard ingestion. For those tests, build locally with `VERCEL_ENV=production`, the public project ID and the existing local-only CV fixture helper; never use fixture credentials on Vercel.

### Google Tag Manager — reviewed empty container

The owner-confirmed container is `GTM-M6TWZV24`; `NEXT_PUBLIC_GTM_ID` must match it. Published Version 1 was inspected as empty (zero tags and triggers). The previous ID GTM-NL6G25PJ was not the owner's confirmed container and must not be used. Clarity stays directly managed by the website, never duplicated inside GTM.

The adapter uses built-in `next/script`, loaded on page-load/idle after analytics consent, with a final current-route/consent check at execution. It adds no independent GA4 or gtag.js installation. Public/private routes always cross a fresh-document boundary, including when a deferred bootstrap is pending. Production origin and known public pages are required; Preview, CV/admin/API/Contact and query strings other than constrained Tag Assistant debugging remain excluded.

Google requires fresh consent under `sdm-analytics-consent-v2`; previous Clarity-only consent cannot authorise the additional vendor. Consent Mode starts denied and grants analytics only after opt-in; advertising storage, ad user data and ad personalisation stay denied. No unconditional GTM noscript iframe bypasses these controls.

The data layer offers `portfolio_page_view` (canonical public path/location) and `portfolio_engagement` (fixed public-navigation action/path). It contains no form values, link text, private URLs, user identifiers or query data. Custom event forwarding needs separately reviewed GTM tags; avoid duplicating GA4's automatic page_view or adding another Google Tag.

The reviewed container is empty: installing it does not activate GA4. Measurement ID `G-BGFVMTBRVP` still advertised automatic user-provided-data capability in its separate published Google-tag configuration. Before adding/publishing a Google Tag, ensure user-provided-data capabilities and form collection are disabled, test the draft in GTM Preview/Tag Assistant, and verify the published container again. Future container publications need the same privacy/duplication review.

## SDM Digital extension

The feature branch `feature/sdm-digital` adds `/services/web-development` and the protected `/admin/digital-solutions` workspace. Exact launch prices live in `src/config/digital.ts`; proposed reference-price claims remain disabled. Global personal branding and favicon remain unchanged.

Read [SDM Digital operations](docs/SDM-DIGITAL-OPERATIONS.md) before deployment. Builds never mutate a database. The isolated SDM Preview schema is migrated explicitly using the verified Neon owner connection; see docs/SDM-DIGITAL-MIGRATION.md. Use `npm run digital:migrate` with an authorised migration connection for controlled setup. Production migration and deployment both require explicit owner approval.

`npm test` includes actual PostgreSQL-compatible SQL integration tests using the development-only PGlite engine. `npm run test:e2e -- tests/e2e/digital.spec.ts` covers pricing, responsive layouts, enquiry states, privacy and unauthorised access with clearly identified provider fixtures. Fixture success is not evidence of real Resend delivery or Neon setup.
