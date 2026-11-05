# Shaun Mathiasz — Midnight Executive V2

A Next.js App Router portfolio with TypeScript strict mode, Tailwind CSS v4, locally hosted Cormorant Garamond / Manrope, Motion, Lucide, MDX and Zod. Designed for executive hospitality and travel recruitment. No database or authentication.

## Local setup

Node.js 22.9+ (Node 24 recommended).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. For an optimized local build: `npm run build` then `npm start`.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers navigation, mobile menu, page metadata, portfolio filters/details, contact validation, draft articles, 404 and overflow at 360, 390, 768, 1024 and 1440 pixels. Set `PLAYWRIGHT_BASE_URL` to an existing test server to avoid launching one. Browser binaries require a supported local environment. See VALIDATION_V2.md for current execution results (VALIDATION.md records the earlier V1 work); test files alone do not establish a passing browser review.

## Configuration

- `NEXT_PUBLIC_SITE_URL`: final HTTPS domain, with no trailing slash. Drives metadataBase, canonical resolution, sitemap and robots. Without it, robots blocks indexing and sitemap is empty; no invented domain is emitted.
- `RESEND_API_KEY`: server-only Resend API key.
- `CONTACT_FROM`: sender on a verified Resend domain, e.g. `Portfolio <portfolio@your-domain>`.
- `CONTACT_TO`: actual recipient address, server-only.

Email is enabled only when all three mail variables exist. There is no simulated success. Missing configuration shows an explicit unavailable state and API 503. Resend acceptance is reported as acceptance, not confirmed inbox delivery. Test with your verified sender and recipient before launch.

## Content & assets

- `src/config/site.ts`: identity, navigation, domain, CV asset and verified professional links.
- `src/content/profile.ts`: experience, education and competencies.
- `src/content/projects.ts`: employer-safe practice overviews, with no invented metrics.
- `src/content/articles.ts`: typed article metadata and trusted, repository-owned MDX strings. Never render user-supplied MDX. Drafts have no publication date and are noindex. Add verified publication metadata only after approval.
- `src/assets/fonts`: self-hosted fonts and SIL Open Font License notices.
- `src/app/globals.css`: design tokens and responsive editorial layouts.
- `src/app/api/contact/route.ts`: server validation, honeypot, origin check, bounded in-memory throttling and email transport.

The supplied CV is available at `public/documents/shaun-mathiasz-cv.pdf`; all download links are enabled. This public copy permanently removes the precise home address and referees’ details, uses city-level location, and marks IATA as “2026 - Reading” as confirmed by Shaun. The original attachment is untouched and is not included in source control. Employment dates and the two Siyam World positions were transcribed from the supplied CV; no project performance claims were added.

The supplied portrait is used unchanged on Home and About via `next/image`. LinkedIn is set to `https://www.linkedin.com/in/shaun-denver/` per Shaun’s explicit confirmation (overriding the older link embedded in the original CV); Instagram is `https://www.instagram.com/shaun.mathiasz/`. These are user-supplied destinations, not independently authenticated accounts. Professional email is taken from the CV and offered as a mailto link; backend email delivery still requires credentials.

## Security & privacy

The form collects name, email, message and consent only. It does not persist messages in the application or log message bodies. Configured mail is processed by Resend and the recipient’s email provider. The visible form explains this. Confirm a retention/deletion policy and privacy contact before a public launch. Keep secrets out of Git and all `NEXT_PUBLIC_*` keys.

The in-memory limiter permits five attempts per ten minutes per forwarded IP on a warm instance. It is best effort: serverless instances do not share state. Before high-volume public launch, configure Vercel Firewall/WAF rate limits for `/api/contact`; confirm trusted proxy headers, sender domain, recipient and delivery. The honeypot and validation remain active. No distributed rate limiting is claimed.

## GitHub source control

This workspace has a separate project directory so existing workspace files remain untouched. If no local Git repository exists:

```sh
git init -b main
git add .
git commit -m "Build Midnight Executive portfolio"
```

Create an empty repository in your GitHub account, then:

```sh
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Never commit `.env.local` or private employer material.

## Vercel deployment

1. Import the GitHub repository in Vercel; select the Next.js preset, project root, Node 24, and standard build/output settings.
2. Add the four environment variables above for the desired environment. Keep preview deployments non-indexable unless a final domain is intentionally configured.
3. Deploy the pushed commit. Attach the final domain and redeploy with `NEXT_PUBLIC_SITE_URL` set to it.
4. Verify all routes, canonical URLs, generated `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, mobile navigation and real email delivery.
5. Enable Vercel Firewall protection and resolve the content/privacy launch gates below before sharing publicly.

No GitHub push or Vercel deployment was performed. GitHub and Vercel integrations were discovered and offered for connection; neither connection was confirmed during implementation. The project has an initialized local Git repository.

## Before public launch

Supply the final domain and configure the real recipient address. CV, portrait and social links have been supplied; employment dates and role titles are now documented from the CV. IATA DTTF is Reading as explicitly confirmed by Shaun. Confirm Amadeus training details, any additional education dates desired, permission to use specific projects and evidence of outcomes. Review/approve or remove all draft articles. Do not turn practice overviews into claimed case studies without evidence. Confirm privacy retention and deletion details, review keyboard/screen-reader behavior, run browser smoke tests and test actual email delivery.

## V2 guide

See V2_REVIEW.md for the complete component/interaction inventory, ASSETS.md for image and geographic-data provenance, and VALIDATION_V2.md for measured results. No new runtime dependencies or environment variables were added. No-JavaScript content and hydration-safe reduced-motion support are included.
