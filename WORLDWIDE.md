# WORLDWIDE — The Travel Tycoon Challenge

A standalone fictional travel strategy game at `/play`, within the existing Next.js site. The global header links to it on every page, including About. Existing routes, the career globe and the destination-pairs game are retained. No deployment is authorised by this task; the implementation remains local for review.

## Architecture

- `src/content/worldwide.ts`: six destinations, accommodation, flights, supplier contracts, pricing and eight events. All commercial values are invented **game data**, not employer information, live quotes or actual supplier rates.
- `src/lib/worldwide.ts`: pure, typed simulation, deterministic random streams, finance, score, achievement and versioned save validation/replay.
- `src/components/worldwide/game.tsx`: introduction, planning, event responses, statements, results, journal, storage, audio and sharing.
- `src/components/worldwide/earth-entrance.tsx`: immediate 2D map, with the 3D module loaded only when at least 65% of its stage is visible or explicitly requested. This avoids shader compilation while the mobile introduction is above the fold.
- `src/components/worldwide/earth.tsx`: dynamically loaded native WebGL sphere, local map texture, great-circle routes, dragging, keyboard rotate/pause controls and 2D fallback. Frame rate capped at approximately 30, DPR capped at 1.5 and render resolution capped at 720px. Rendering pauses offscreen, in hidden tabs and with reduced motion. Resources/listeners are released on unmount. Context loss switches to 2D.
- `src/components/worldwide/destination-map.tsx`: geographically positioned SVG pins and equivalent HTML selection buttons. Smaller screens space nearby controls apart; real pins remain at their geographic coordinates.
- `src/app/play`: server-rendered metadata/page, route loading state and scoped game styles.
- `tests/unit/worldwide.test.ts` and `tests/e2e/worldwide.spec.ts`: financial, event, score, persistence and browser coverage.

No dependencies, environment variables, database, authentication, payments or third-party API keys were added.

## Rules and financial model

Five rounds. Opening capital £10,000, reputation 50/100, satisfaction 50/100, zero completed packages. Each booking represents one traveller on a three-night illustrative package.

1. Choose one of six destinations, three hotel tiers, three flight arrangements, three pricing strategies and two supplier contracts.
2. Unit cost combines destination flight/stay values, selected service multipliers and any supplier discount. Selling price applies the selected **cost markup**. Gross margin is displayed separately.
3. Capacity is floor(80% of non-negative capital / unit cost), limited to 2–12 places.
4. Launch locks choices and reveals a seeded event with two responses. Event and demand use separate reproducible random streams. Seed + round + choices + response determine the result.
5. Demand considers destination, positioning, hotel fit, reputation, satisfaction, event response and a bounded random multiplier. Bookings cannot exceed capacity.
6. Revenue = bookings × selling price. Direct package costs = bookings × unit cost. Gross profit = revenue − direct package costs.
7. Net profit = gross profit − unfilled allotment release charge − £180 launch cost − event cost − finance cost. Supplier contributions are negative event costs and labelled as income.
8. Capital changes by net profit. Booking payments settle before supplier payments in this simplified model. Negative virtual capital is permitted; the following round uses two-place capacity and a £75 finance cost. All five rounds remain playable.
9. Reputation and satisfaction are clamped to 0–100. Statements show the pre-cap changes and explain this distinction.

An allotment discounts unit cost by 12%, but charges 35% of unit cost on up to four unfilled places. Flexible tickets cost more but reduce the cancellation recovery response from £420 to £84. Premium pricing against an essential stay damages demand and satisfaction. These are game mechanics, not commercial advice.

## Scores, saves and sharing

- Score out of 1,000: up to 350 for financial resilience, 300 for reputation, 250 for satisfaction, 100 for five completed rounds. Financial points linearly cover final capital £2,000–£30,000, clamped outside this range.
- Titles: Rookie Explorer (<350), Route Builder (350–499), Destination Strategist (500–649), Travel Industry Titan (650–799), Global Travel Mogul (800+).
- `shaun-worldwide-v1`: version, seed, completed decisions/responses and a pending product. Saved balances are never trusted: validated decisions are replayed through the engine. Malformed, oversized, incompatible and impossible saves fail safely.
- Refreshing resumes at the next unplayed round or at a locked event. Settled rounds remain available in the journal. Completed journeys reopen their results.
- `shaun-worldwide-best-v1`: local personal best. Restart replaces progress and preserves the best. These records are editable browser data, not anti-cheat validated or a public/global leaderboard.
- Storage denial keeps gameplay available and displays an accurate save warning. Clearing browser data removes progress and bests.
- Results copy with an honest text fallback, or download as an original 1200×630 PNG. Cards disclose only score/title, never the event sequence or choices.
- Audio is synthesised through Web Audio after explicit opt-in, muted by default, short and quiet. No audio files, autoplay music or outside services.

## Motion and accessibility

Existing Motion handles a 400ms phase reveal and a 700ms balance transition. CSS adds restrained card/button response, intro entrances and six slow ambient points. Globe and ambient motion pause offscreen/when hidden. The site-wide pause preference and OS reduced motion are honoured. The briefing and every game action work through native buttons, radio groups, details and visible focus states. Phase changes focus their heading; live notices report save/share failures honestly. Monetary counters expose a static final value to screen readers.

## Assets and licensing

No new stock media, logo or audio downloads. Geographic outlines reuse `src/content/land.json` (Natural Earth, public domain, already documented in `ASSETS.md`). All globe textures, atmospheric graphics and share cards are generated locally from this data/original code. Icons use the existing Lucide dependency. Site fonts and Shaun's existing signature retain their existing provenance.

## Preview and verification

```bash
npm install
npm run dev
# Open http://localhost:3000/play
npm run lint
npm run typecheck
npm test
npm run build
npm start
npm run test:e2e
```

For this workspace's system Chromium:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3048 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
npm run test:e2e -- --workers=2 --timeout=120000 --output=reports/worldwide-final-browser
```

A future release should use the established Vercel preview workflow, test that preview, then release only with separate deployment authorisation.

## Validation — 6 November 2026

- `npm run lint`: passed.
- `npm run typecheck`: passed (strict TypeScript).
- `npm test`: 41 tests passed across six files, including 14 new finance, events, scoring and persistence tests. Financial reconciliation exercises 64 seeds over five rounds with varied product choices.
- `npm run build`: passed; `/play` is generated as a static route. The existing local configuration warns about missing metadataBase/public domain; no production settings were changed.
- Full browser suite: **64 passed** on the final production build (3.0 minutes). Includes the existing site regression suite plus complete five-round play, cash reconciliation, pending-event recovery, saved completed results, best preservation, PNG download, copy fallback, denied/corrupt storage, keyboard radios, 2D controls, unavailable WebGL and route access from About. Responsive checks cover 360, 390, 768, 1024 and 1440 pixels.
- Automated Axe checks: five game phases at 1440, 768 and 390 pixels. **15 scans passed with zero detected violations and no horizontal overflow.** This is not a full WCAG certification.
- Actual WebGL rendering was observed in desktop/tablet/mobile emulation with Chromium SwiftShader. Separate checks confirmed automatic rotation, pause, keyboard rotate and pointer dragging, plus audio opt-in/mute state. Audio quality and physical mobile GPUs were not independently audited.
- Local mobile Lighthouse (default simulated throttling, system Chromium, production build): **Performance 95, Accessibility 100, Best Practices 100, SEO 66**. LCP **1.1s**, CLS **0**, TBT **250ms**. Report: `reports/worldwide-lighthouse-final.report.html` and `.json`. Initial performance was 66; deferring below-fold WebGL, preserving its layout geometry and keeping the headline immediately paintable improved the result. These are local lab measurements; field INP is not measured and TBT is not INP.
- SEO 66 is attributable to the intentionally non-indexable local build without `NEXT_PUBLIC_SITE_URL`. Set the existing public site URL configuration to `https://shaun-mathiasz.vercel.app` for a later production build; do not remove the development noindex safeguard. Production SEO was not re-audited or changed by this task.
- No external API keys, secrets or new runtime dependencies.
- No deployment or remote push performed. The existing live website is unchanged by this game task.

## Remaining practical limits

Local saves/bests are browser-specific, can be edited/cleared and are not a ranked public leaderboard. The commercial model is deliberately simplified and fictional. Unsupported WebGL falls back to a working map; 3D can be requested explicitly on mobile. Browser testing uses Chromium desktop/mobile emulation, not physical devices or Safari/Firefox. A later authorised release should recheck the hosted preview and its environment configuration.
