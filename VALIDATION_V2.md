# V2 validation — 5 November 2026

Environment: Node 24.22.1, Next.js 16.4.5 / Webpack, system Chromium, Playwright and Lighthouse 13.6.0. Results below are from this workspace's optimized production build with `NEXT_PUBLIC_SITE_URL=https://shaun-mathiasz.vercel.app`.

## Checks

- `npm run build`: passed; all existing route families and detail routes generated, without the unset-domain warning.
- `npm run lint`: passed, no warnings.
- `npm run typecheck`: passed with strict TypeScript.
- `npm test`: 26 unit tests across five files, covering contact validation/security/failure states, content integrity, V2 palette contrast and rules-based product reasoning.
- Playwright: 22 Chromium cases across desktop and mobile-emulation projects. Covers navigation, page titles/descriptions, portfolio filtering and all details, direct contact alternatives, globe controls/context, builder selections, career stamp, drafts/noindex, 404, five-width overflow, hydration under reduced motion, and core content/CV with JavaScript disabled.
- Extra browser checks exercised actual clipboard feedback and Enter-key globe selection at 390 and 1440 widths. Full-page screenshots were captured for all seven primary pages at those widths. Reviewed compositions include Home at both widths, mobile Portfolio/Experience/Insights/Contact, and desktop About/Education. These screenshots do not substitute for a real-device or screen-reader audit.

## Lighthouse mobile homepage

Latest local simulated mobile run, no competing browser test run:

| Category / metric   | Result |
| ------------------- | ------ |
| Performance         | 99     |
| Accessibility       | 100    |
| Best Practices      | 100    |
| SEO                 | 100    |
| LCP                 | 1.0 s  |
| CLS                 | 0      |
| Total blocking time | 120 ms |
| Speed Index         | 2.3 s  |

HTML/JSON reports are in the local ignored reports/ directory. This is a single local lab measurement, not a guarantee for every device, connection or production region. INP was not field-measured. Total blocking time is not INP. No CrUX field data or full WCAG 2.2 certification is claimed.

The earlier runs measured 69 and then 79 Performance. Their findings drove hero image loading/compression fixes and a simpler mobile atmosphere. The final mobile layout retains gradients and the authentic portrait, omitting the large decorative desktop ocean layer. Compressed local font subsets reduced the used font files from about 1.16 MB to 175 KB.

## Issues found and corrected

- Homepage metadata omitted the public name: the metadata helper now sets an explicit, consistent branded title.
- Builder selects had ambiguous computed labels: each now has an explicit accessible name.
- The inherited global loading boundary left content hidden without JavaScript: removed that boundary so server content renders directly.
- Browser-reduced-motion preferences could cause a text hydration mismatch: a useSyncExternalStore-based hook keeps server and initial client markup consistent, then applies the actual preference. Regression cases check for runtime errors.
- Visible wordmark/accessibility label alignment was corrected.

## Limits

Only Chromium desktop/mobile emulation was exercised. Safari, Firefox, ordinary physical phones, full assistive-technology review, production Lighthouse, real email-provider delivery and field INP remain unverified. The form is intentionally absent without credentials; working mailto and copy-email paths are shown instead. Draft articles remain drafts/noindex. Portfolio entries remain practice overviews, not claimed commercial case studies.

No production secrets or deployment protection settings were changed for V2. Existing canonical-domain configuration is reused. See DEPLOYMENT.md for confirmed deployment identity and status.
