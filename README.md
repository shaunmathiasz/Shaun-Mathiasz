# Shaun Denver Mathiasz — Midnight Executive

Next.js App Router, React, strict TypeScript, Tailwind CSS, Motion, local fonts and images. A professional portfolio preserving the established midnight travel/business identity. No database, authentication or paid AI service is needed.

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

- `src/config/site.ts`: full professional name, email, domain, verified user-supplied LinkedIn/Instagram links and CV path.
- `src/content/profile.ts`, `credentials.ts`, `organisations.ts`, `career-locations.ts`, `projects.ts`, `articles.ts`: typed professional information. Related company brands are one employment chapter; Oxford courses are short courses; IATA is ongoing; RAeS is a student affiliation.
- `src/components`: navigation, hero atmosphere, organisation identities, career globe, journey, credentials, filtered portfolio, rules-based travel builder and editorial/contact controls.
- `src/app/globals.css`: established design tokens/layout. `src/app/motion.css`: V4 choreography and responsive/reduced-motion fallbacks.
- `src/components/cinematic-system.tsx`: optional fine-pointer cursor companion, bounded CTA movement, small card depth and progressive section reveals. Native cursor, links, keyboard and scroll remain intact.
- `src/components/home-introduction.tsx`: non-blocking 1050ms identity ribbon, skippable via button/Escape, once per session; omitted on late hydration/reduced motion.
- `ASSETS.md`, `V3_LOGOS.md`: photographic, geographic and official-brand provenance. No reference-site assets/code are reused.

Draft MDX is repository-owned and visibly labelled/noindex. Never render untrusted MDX or publish drafts automatically. Professional practice overviews and example itineraries must not become claimed commercial results. Do not add confidential employer information.

## Contact and environment

The main public contact experience works without credentials: `mailto:shaun.emirates@gmail.com`, actual clipboard feedback/manual-copy fallback, LinkedIn and CV download. A mailto link opens the visitor's configured email app; website inbox delivery is not claimed.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | HTTPS canonical domain, metadataBase, sitemap and robots |
| `RESEND_API_KEY` | Optional server-only email transport key |
| `CONTACT_FROM` | Optional verified Resend-domain sender |
| `CONTACT_TO` | Optional recipient address |

Only when **all three** mail variables exist does the contact page show its server-validated form. Otherwise the page shows the direct email alternative. The endpoint returns 503 when unconfigured and never simulates success. If enabling it, test provider acceptance and actual inbox delivery with a verified sender before launch. Do not expose secrets through public variables or source control.

The optional form uses Zod, origin checks, honeypot and a bounded in-memory limiter (five attempts per ten minutes per warm instance). Serverless instances do not share limiter state. Add appropriate platform rate limiting if public form traffic warrants it. The form explains email-provider processing; confirm retention/deletion arrangements before enabling collection. No messages are stored in a database or logged by this app.

Optional browser storage contains only interface preferences: `shaun-intro-v4` in session storage and `shaun-motion` in local storage. Storage failures are tolerated. No analytics, trackers or third-party frontend media services are added.

## Public assets and facts

The authentic user-supplied portrait is delivered via Next Image with CSS colour treatment. The downloadable CV at `public/documents/shaun-mathiasz-cv.pdf` is the existing public derivative: precise home address and referees' private details removed. Historical URLs/file names containing the shorter name are preserved. The original attachment is not published.

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
