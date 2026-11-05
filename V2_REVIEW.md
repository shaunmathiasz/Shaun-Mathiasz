# Midnight Executive V2

## Design and architecture

Evolution of the original dark editorial portfolio. The verified profile, original routes, portrait, redacted downloadable CV, self-hosted fonts and employer-safe content remain. Palette now uses midnight #060B16, navy #0B1426, elevated navy #12233B, ivory #F5F2EA, silver #9DAABD, champagne #D2B88A and cyan #75B9D0. No new runtime dependencies, paid services, authentication, database or AI API.

Existing Motion, hover effects, orbital portfolio artwork and reduced-motion styles were inspected first. V2 reuses Motion and next/image. Server pages remain Server Components; interaction is isolated to small client components.

## Components and interactions

- `hero-atmosphere.tsx`: contextual ocean photograph, restrained scroll-depth effect and a drawn route accent. CSS-staggered copy and CTAs remain readable without JavaScript. No blocking intro or route-change intro.
- `reveal.tsx`: one-time IntersectionObserver-triggered Web Animation reveal. SSR content starts visible. Subtle card lift respects reduced motion.
- `career-globe.tsx`: local Natural Earth coastline data, geographic orthographic projection, horizontal pointer drag, idle rotation, pause/resume and west/east controls, keyboard-accessible location buttons and contextual descriptions. Automatic globe rotation pauses offscreen, during dragging, on selection and under reduced motion. UK means market focus, never residence. Location controls are the touch/keyboard alternative to dragging. No WebGL dependency.
- `experience-journey.tsx`: chronological CV-sourced itinerary, scroll-linked progression rail, contextual images, native expandable responsibilities, skill tags and a small stamp after all three chapters are explored. Stamp is session-local; no tracking or storage.
- `portfolio-gallery.tsx`: photographic cards, restrained image zoom, active filter buttons and Motion layout transitions. Content remains explicitly practice overviews. New Destination research filter retains every existing detail URL.
- Portfolio detail pages add destination imagery and an explicitly illustrative four-step process diagram while preserving challenge, approach, deliverables, skills and verification limits.
- `travel-builder.tsx` and `lib/travel-builder.ts`: six preference dimensions; immediate rules-based four-day concept, priorities, logistical/commercial considerations and trade-offs. No live rates, availability or real bookings. Native selects, checkboxes, reset and a polite result announcement.
- About adds portrait-led editorial treatment, a professional philosophy pull quote derived from existing copy, and focus-card reveals. No fabricated personal photographs.
- Education adds expandable credential context, restrained reveals and a visual learning-to-practice constellation. Completed, ongoing/Reading and student membership remain distinct.
- Insights adds local cover photography, computed reading times, reading progress, native share with clipboard fallback and related drafts. Draft status and noindex remain; no publication dates invented.
- Contact conditionally renders the real validated form only when transport credentials exist. Otherwise direct mailto, copy-email feedback, confirmed LinkedIn and CV provide usable alternatives; there is no nonfunctional form. Clipboard errors provide an honest fallback.
- Navigation retains active states and mobile disclosure; persistent CV access, top scroll progress, visible focus and restrained button/link movement support recruiter tasks.

## Assets and licenses

See ASSETS.md for original image URLs, Unsplash licensing, Natural Earth public-domain data, and existing user-supplied assets. Images are local and served through next/image, with responsive sizes and lazy loading except the primary portrait. Photographs are contextual, not evidence of work at a pictured property. Local compressed font subsets total 174,812 bytes versus 1,162,616 bytes of TTF sources.

## Environment and preview

No new environment variables. Existing production `NEXT_PUBLIC_SITE_URL` remains the canonical domain. Email submission still requires `RESEND_API_KEY`, `CONTACT_FROM` and `CONTACT_TO`; credentials have not been invented or changed.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. For editing use `npm run dev`. The browser smoke tests now target a built production server; build first. On a machine with a system Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; otherwise run `npx playwright install chromium`. Set `PLAYWRIGHT_BASE_URL` to use an existing preview.

Deploy by pushing the reviewed source to the GitHub midnight-executive branch and importing/linking that branch in Vercel, or by deploying the exact source directly through Vercel. Keep the current Node 24, Next.js preset, build command and production domain. Vercel’s own GitHub login connection must be configured before automatic Git deployments work.

## Verification and limits

See VALIDATION_V2.md for actual command results and performance findings. Targets are not assumed to have passed. No real email delivery, real-device field Core Web Vitals, full screen-reader certification or cross-engine Safari/Firefox audit is claimed.

The inherited root loading.tsx boundary was removed after no-JavaScript QA showed that the streamed page remained inside a hidden Suspense container. Static/server-rendered content now renders without that global loading gate; interactive components remain progressive enhancements.

Mobile uses gradients and the authentic portrait without the desktop decorative ocean layer. A minimal responsive source candidate avoids downloading the large background image on small screens. This keeps the cinematic composition on desktop and simplifies mobile rendering.

Reduced-motion preferences now use a useSyncExternalStore-based hook so the SSR snapshot and initial hydrated markup agree. CSS provides the reduced-motion rendering behavior before hydration; runtime preferences apply safely after hydration.
