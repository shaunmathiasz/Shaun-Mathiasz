# Validation record

Implementation checked in this workspace on 2026-11-04, Node 24.22.1.

| Command | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings after configuration cleanup. |
| `npm run typecheck` | Passed. Strict TypeScript enabled. |
| `npm test` | Passed: 22 tests in 4 files. |
| `npm run build` | Passed with Next.js 16.4.5 using Webpack; all page families and static detail routes generated. |
| `npm run test:e2e -- --list` | Passed discovery: 12 cases across desktop and mobile projects. This did not execute browser tests. |
| `npm run test:e2e` | Not executed: the supported managed browser-control tool was unavailable. No substitute preview server or browser path was launched. |

Unit coverage includes form validation, honeypot rejection, server-side origin/validation checks, unavailable transport, mocked provider failure, warm-instance throttling, content integrity and six core normal-text contrast combinations (AA ratio >= 4.5). This is not a full accessibility audit.

The first production build failed because npm initialization set CommonJS; the package was corrected to ESM. The default Turbopack compile subsequently stalled in this sandbox and was terminated. The supported Webpack build path then exposed sandbox EPERM restrictions on Node child processes. Running the final build with additional sandbox permissions succeeded. The portable build script now uses `next build --webpack`; there is no ignored type-check or build-error flag.

Build warning: no production metadataBase/domain was supplied. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain and rebuild before launch. Until configured, robots disallows crawling and sitemap returns no invented URLs. Next.js may generate localhost social-image references in this local build; the configured production domain resolves them on deployment.

Not confirmed: browser rendering at the requested viewport widths, keyboard/screen-reader review, complete WCAG 2.2 AA conformance, performance scores, real email delivery, GitHub push or Vercel deployment. Responsive styles and browser tests are provided, but their existence is not evidence of a completed visual audit.

## Supplied asset update

CV and portrait are now integrated. Employment dates and role titles were transcribed from the supplied CV. LinkedIn uses the user-confirmed `/in/shaun-denver/` path; Instagram uses the supplied handle. IATA is explicitly “Reading”, as confirmed by Shaun, and is not claimed as completed.

After this update, lint, strict typecheck, all 22 unit tests and the production Webpack build passed again. The domain warning remains until a real domain is configured. Public PDF was rendered and visually inspected; extracted-text checks confirmed removal of the precise home address and referee details, presence of “2026 - Reading”, and the updated LinkedIn hyperlink. Original PDF and portrait attachments remain unchanged. The public PDF is a separately redacted derivative.

Browser execution and website visual review remain unperformed. No new deployment or live email delivery was attempted. Project outcome evidence, final domain and production mail configuration remain outstanding.
