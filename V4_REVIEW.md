# Portfolio V4 — cinematic editorial upgrade

## Inspection and direction

Inspected the repository, dependency/configuration files, all seven route implementations, existing animations, source content, local assets and browser tests. Existing Motion, SVG globe, native-disclosure career chapters, credentials filters, practice gallery, rules-based travel builder, mailto/copy actions and MDX drafts are retained. No new animation or 3D runtime is required.

Rendered inspection: Dinel Walpola and the existing live portfolio in Chromium at 1440×1000 and the reference at 390×844. External requests were fulfilled through a local TLS-validating relay because the browser does not trust the environment's outbound proxy CA. Screenshots and observations are in ignored reports/. This is visual inspection, not a production-speed measurement.

| Area | Observed reference | Adaptation for Shaun |
| --- | --- | --- |
| Entrance | Percentage loader, portrait first, delayed large name reveal | Immediate professional content; a short, skippable identity ribbon, once per session |
| Hero | Large portrait against dark atmospheric purple imagery | Retain real portrait, midnight/gold identity, ocean context and refined masked editorial type |
| Typography | Condensed Bebas Neue headlines; Outfit/Inter body | Preserve Cormorant/Manrope; adapt large scale and deliberate hierarchy |
| Navigation | Small uppercase links, hover/active underline, compact mobile Menu control | Animated gold underline, current descendant route state, clear mobile disclosure |
| Pointer/hover | Native cursor remained visible; navigation underline observed | Original optional contextual cursor companion and restrained magnetic CTAs; no claim these copy a reference effect |
| Playfulness | Dinel Run game control and invitation popup; separate Kunatu control | Optional, dismissible travel passport; no popup invitation or sound |
| Imagery | Strong portrait crop, dark blended edges; an About media frame did not populate in this inspection | Local optimised imagery, descriptive context, reliable fallbacks |
| Timing | Entrance and ambient pulses observed; smooth CSS scrolling declared | Short transform/opacity motion with native scrolling; no forced wait |
| Navigation transition | About route opened with the same navigation and editorial split layout | Gentle content arrival; no blocking route overlay |
| Mobile | Portrait crop and compact controls; mobile menu inspected separately | Readable professional identity before imagery, touch controls and simplified motion |

Reference screenshots are inspection evidence only. No third-party source, photographs, branding or exact compositions are incorporated. No reference video, custom cursor or magnetic-button behaviour was verified. Full cross-browser reference behaviour and exact animation durations were not measured.

## Implementation progress

- [x] Repository and rendered reference/current-site audit.
- [x] Motion system, hero and navigation.
- [x] Journey storytelling, globe and passport.
- [x] Portfolio, builder and editorial refinements.
- [x] Desktop/mobile, keyboard/reduced-motion/no-JS QA, build and tests.
- [ ] Tested Vercel preview and release instructions.

## Motion language

Microinteractions: 180–240 ms. Component reveals: 500–650 ms. Hero/section choreography: 700–950 ms. Intro: 1050 ms, non-blocking, skippable and session-scoped. Ambient effects pause offscreen/when hidden where applicable. Prefer transforms and opacity; image masks used sparingly. Native scroll, focus and cursor remain available. Touch and reduced-motion users receive static equivalents; a visitor control pauses decorative effects.

Additional reference observation: after several wheel gestures, browser scrollY reached 3000 while the portrait/name composition remained in view and its name/CTAs progressively appeared. This verifies a long, scroll-linked hero presentation in the inspected session. V4 borrows progressive composition while keeping Shaun's native scrolling and immediately useful professional content. The mobile Menu button opened a vertical navigation list with a Close control. No games were played and no messages were sent.


## Delivered components and behaviour

- `cinematic-system.tsx`, `home-introduction.tsx`, `motion.css`: session-only skippable 1050ms identity ribbon, masked editorial heading on desktop, restrained native-cursor companion (VIEW / DRAG / EXPLORE / READ), bounded magnetic CTAs and card depth. Cursor context clears on scroll, keyboard input, window blur and visibility change. Reduced-motion/touch equivalents, late-hydration intro bypass and persistent visitor pause control. No new runtime dependency.
- `journey-editorial.tsx`, Home and About: original asymmetrical photographic chapter composition, contextual Maldives/Colombo/UK-market storytelling, portrait depth and a second editorial About composition. Mobile prioritises readable identity and actions; portrait/headline reveal motion is simplified to a static presentation.
- `career-globe.tsx`, `career-globe-loader.tsx`, `career-locations.ts`: preserve the existing SVG projection/drag/keyboard controls, add smoother selected-location rotation, refined shading and photographic panels. Projection data and controls load near the viewport. A static Natural Earth preview and career link remain without JavaScript or after a failed chunk request. Idle rotation pauses offscreen/hidden/reduced-motion; dragging does not snap back to the selected marker.
- `experience-journey.tsx`: retain the exact three-role chronology and employer relationships; add three optional passport stamps (Maldives hospitality, Colombo professional base, UK market product strategy), with a dismissible curiosity message. UK market involvement is never presented as UK residence.
- `portfolio-gallery.tsx`, project detail route, `projects.ts`: restrained photo previews and filters; commercially focused, employer-safe discussion; next-practice navigation. All remain professional practice overviews with illustrative frameworks, not evidenced outcome case studies.
- `travel-builder.tsx`: retain the existing rules-based product reasoning and six choice dimensions; add matching destination imagery and a clear concept brief. No API, booking claims, live pricing or supplier data.
- Education: visual learning rail, credential reveals and native expandable details. Fixed an erroneous empty-state message beside existing Oxford courses. All qualifications/statuses and related-institution relationships remain intact.
- Insights: editorial cover treatments, article hero images, existing reading progress/share/copy and draft/noindex safeguards.
- Contact/navigation/footer: accurate full name/contact, polished closing text, active parent route indicators and mobile Escape focus restoration. Actual email/copy and CV remain available without an email provider. Optional contact transport configuration is unchanged.
- Initial route prefetching is disabled on shared/home links to avoid loading every destination route before interaction. All links retain normal Next.js routing and back/forward behaviour.

## Assets and factual safeguards

Added only an appropriately licensed Colombo photograph (Dmitriy Sarychev / Unsplash) and an original static globe rendering from existing public-domain Natural Earth data. ASSETS.md records exact source and licence. All existing employer/institution logos remain local, including the Oxford/Saïd pair. Existing trademark-use limits in V3_LOGOS.md still apply; no general redistribution licence or endorsement is asserted. No reference-site asset or source was copied. Portrait and public CV are preserved.

No employment dates, achievements, awards, completed qualifications, publication dates or confidential commercial data were invented. Professional name/email/domain are unchanged from the approved V3 profile. Draft articles remain drafts. Public credential-verification URLs have not been invented where only user-provided records/IDs are available.

## Local validation — final implementation

- `npm run lint`: passed, no errors/warnings.
- `npm run typecheck`: passed.
- `npm test`: 26 tests across five files passed.
- `NEXT_PUBLIC_SITE_URL=https://shaun-mathiasz.vercel.app npm run build`: passed; all seven main routes, four practice detail pages and two draft article pages compile/prerender as appropriate.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3014 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2 --timeout=120000`: 40 passed. Includes 360/390/768/1024/1440px overflow checks, desktop/mobile navigation, details/filters, map, builder, passport, contact success/failure, draft/404 metadata, motion persistence, no-JS/reduced-motion, article copy and cursor context.
- Axe-core 4.14.0: zero violations in 18 scans (nine routes at 1440px and 390px; WCAG 2 A/AA, 2.1 A/AA and 2.2 AA rules; reduced-motion preference). Automated checks do not establish complete WCAG conformance.
- Additional actual-browser checks: real Clipboard API write/read returned the professional email; CV returned HTTP 200/application-pdf with a PDF signature; globe drag changed the projection and remained at the dragged position; intro Skip and Escape worked under controlled browser time; static globe fallback rendered without JS; no runtime errors in that flow.
- Inspected final desktop 1440×1000 and mobile 390×844 screenshots, plus chapters, map, portfolio, builder and contact compositions.

### Measured performance

Lighthouse 13.6.0, local production server, Chromium, default simulated mobile throttling (4× CPU, 150ms RTT, 1.6Mbps), no competing browser audit. Final: **Performance 99 / Accessibility 100 / Best Practices 100 / SEO 100**; **LCP 1.0s**, **CLS 0**, **TBT 110ms**. Raw report: ignored `reports/lighthouse-v4-optimised.report.json`/HTML.

Initial V4 run: 59 performance / LCP 5.2s; intermediate run: 73 / LCP 4.7s. The final implementation removes mobile reveal delay, preserves the headline as one readable text block, prioritises the portrait, defers the interactive map and avoids speculative route-loading work. Tests were rerun after these changes. Reports are local lab measurements, not field Core Web Vitals or real-user INP. Safari/Firefox and physical-device testing were not performed.

## Configuration and limitations

No new environment variables or paid services. Production keeps `NEXT_PUBLIC_SITE_URL=https://shaun-mathiasz.vercel.app`. Resend mail variables remain optional/unconfigured; mailto opens the visitor's email app and the website does not claim sent messages or inbox delivery. No publication of draft articles or private employer evidence is included. Credential issuer/ID information comes from the approved records; independent public verification links remain absent where not supplied.

## Preview/release workflow

Create a Vercel preview from the exact source snapshot, run hosted browser checks, then release the same tested source to the existing production project/domain. No domain/secret changes. Preview without a canonical-domain setting intentionally blocks indexing. Release deployment identifiers and links are recorded in the final handoff outside the repository to avoid modifying the tested source after deployment.
