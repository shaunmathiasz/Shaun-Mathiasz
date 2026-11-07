# Portrait deduplication & cinematic visual audit

7 November 2026. Local implementation, preserving the midnight identity, established headline, routes, CV, facts, social links and WORLDWIDE. No deployment performed for this task.

## Portrait inventory: 10 → 1 rendered placements

| Component / route                                                                    | Before | After | Decision                                                                                                                                       |
| ------------------------------------------------------------------------------------ | -----: | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Home hero, `src/app/page.tsx`                                                        |      1 |     1 | Retained as the signature authentic portrait. Original pixels, responsive sizes, priority loading and existing cinematic reveal remain.        |
| About, `src/app/about/page.tsx`                                                      |      1 |     0 | Replaced with an original typography-led career folio using verified role titles/periods. No alternative authentic portrait was available.     |
| Instagram/TikTok fallback covers on Home, `SocialPagePreviews`                       |      2 |     0 | Distinct original platform graphics; real embeds remain on demand.                                                                             |
| Instagram/TikTok fallback covers on Contact, `SocialPagePreviews`                    |      2 |     0 | Same curated graphic system, no personal photograph.                                                                                           |
| Expanded LinkedIn, Instagram, TikTok and Facebook cards on Contact, `SocialProfiles` |      4 |     0 | Four distinct platform treatments, retaining real account handles and links. These are explicitly profile-link graphics, not fabricated posts. |
| Experience, Portfolio, Education, Insights, /play, footer and Open Graph image       |      0 |     0 | No portrait usage found. Footer/header contain the supplied signature logo; Open Graph is typography-led.                                      |

Total: Home 3 → 1; Contact 6 → 0; About 1 → 0. Responsive variants of the Home hero use the same image element, not duplicated desktop/mobile images. `site.portrait` is a configuration record, not another placement. The historical downloadable PDF is preserved and is not a webpage image placement. An authorised third-party social embed controls its own profile/post imagery; the site no longer supplies the portrait as a fallback.

There is one portrait file in the site's visual library. SHA-256 comparison of all **34 public raster/SVG assets** found **zero byte-identical duplicate groups**. The problem was repeated component usage, rather than duplicate storage files. No portrait file was deleted or replaced with an artificial person.

## Page-specific art direction

- **Home:** the hero keeps the sole portrait. Lower social covers now use original graphic compositions; the career globe, geography-led chapters, project imagery and education identities remain complementary visual types.
- **About:** original editorial field-notes folio instead of a second portrait. The lower feature changes from the repeated Maldives image to the existing Colombo dusk photograph, supporting the stated professional/academic base. It does not identify a pictured office or imply a visit to a specific building.
- **Experience:** guest operations retains geographic Maldives photography; reservations gets an original pre-arrival process illustration; the current product chapter retains London market context and related employer identities. The two resort roles still belong to the same Siyam World chapter. The Maldives photograph is not labelled as Siyam World.
- **Education:** institution/issuer logos and qualification typography retained; no portraits were present.
- **Portfolio:** the four category covers remain distinct: London / product development, hospitality lobby / hospitality, mountain lake / commercial strategy, Maldives / destination research. Each detail page and its corresponding card share the same category image intentionally. Geography-specific builder selections remain accurate. No unrelated project categories share the same cover.
- **Insights:** existing airport and hospitality covers retained with their original photographer/place attribution. Related material may reuse its matching cover.
- **Contact:** typography-led “Good conversations. New possibilities.” hero with a midnight horizon and a one-pass light accent. Full professional name, email, LinkedIn, CV, mailto and accessible copy-email action retained. The secure form remains conditional on existing provider configuration; no delivery success is simulated.
- **Social:** Instagram frames/perspectives, TikTok motion lines, Facebook connection rings and LinkedIn editorial lines. Original layouts use existing official CC0 interface icons. They do not imitate platform posts, avatars, engagement or live content.

## Central asset library

- `src/content/visual-assets.ts`: typed photography, dimensions, descriptive alt text, purpose, page use, source/licence and intentional reuse notes.
- `src/content/asset-inventory.json`: every local public image's file path, dimensions, format, size, SHA-256, usage, purpose, attribution/licence, alt text and duplicate status. Includes separate records for the new authored HTML/CSS visuals.
- `scripts/visual-asset-inventory.mjs`: reproducible inventory generator, using existing Sharp from the Next.js installation. Run from the project root on Node 24: `node scripts/visual-asset-inventory.mjs`.
- Existing image consumers now reference the same typed photo definitions: site configuration, hero atmosphere, career locations, journey editorial, experience imagery, project covers, article covers and travel builder.

## Sources and licensing

**No new stock image, video, personal portrait or logo was downloaded.** The existing licensed library was sufficient for this content; graphic illustrations create variety without decorative stock filler. Raw image files and the supplied personal signature are unchanged.

The About feature reuses Dmitriy Sarychev's Colombo image: https://unsplash.com/photos/city-skyline-with-ocean-view-at-dusk-QsyDe3_7OV0 under the Unsplash License, https://unsplash.com/license. All six existing editorial photo sources are preserved in `ASSETS.md` and the inventory. Existing official marks retain the restrictions documented in `V3_LOGOS.md` and `CERTIFICATION_LOGOS.md`; identification is not a blanket trademark licence. Social symbols reuse Simple Icons v12.4.0 (CC0), with brand rights retained. Folio, reservations process, social patterns and horizon are original HTML/CSS artwork.

## Motion and performance

- Retained the Home portrait's existing masked arrival, restrained hover treatment and lighting. No extra portrait downloads or new heavyweight library.
- New reusable `EditorialImage` adds an 800ms once-only mask reveal, ±9px scroll-linked depth and a small hover zoom. The image has a reserved aspect ratio, responsive Next Image sizes and lazy loading. Content remains visible if animation fails.
- Contact's horizon accent runs once for 1.2 seconds; no video, particles, WebGL or continuous atmospheric loop was added.
- Graphic social borders respond to hover and keyboard focus. New effects honour OS reduced motion and the site's visual-effects pause preference.
- Rendered portrait placements fall 90% (10 → 1). **This is not a claim of a 90% network saving**: browsers could cache/deduplicate equal image URLs in the old version. About/Contact now request no local portrait at all, including expanded cards. Home keeps its original hero priority. There are zero new photo bytes in the repository; the Colombo file was already local.

## Name consistency

Source audit found no remaining public-facing literal `Shaun Mathiasz` in `src`. Full name remains **Shaun Denver Mathiasz** in branding alt text, navigation, footer, page metadata, Open Graph and Person data. Domain, external handles/URLs and the historical CV filename are intentionally preserved. The new Contact hero explicitly displays the full name; the portrait alt also uses it.

## Validation

- `npm run lint`: passed.
- `npm run typecheck`: passed (strict TypeScript).
- `npm test`: **41 passed**, six files.
- `npm run build`: passed. Existing warning about absent metadataBase in the domain-unconfigured local environment remains; production settings were not changed.
- Browser regression: **70 passed** (3.4 minutes), desktop and mobile Chromium, including six new portrait-policy/contact/image-loading cases plus the existing 64 site/game cases. Existing responsive coverage includes 360, 390, 768, 1024 and 1440px.
- Visual/Axe review of Home, About, Contact and Experience at 1440, 768 and 390px: **12 scans**, zero detected WCAG A/AA violations, zero broken images, zero horizontal overflow and no page errors. All four social cards were expanded for Contact review. This is not a complete WCAG audit or a Safari/Firefox/device certification.
- Local mobile Lighthouse on Contact (production build, default simulated throttling): **Performance 94 / Accessibility 100 / Best Practices 100**. LCP **0.9s**, CLS **0**, TBT **300ms**; **zero local portrait requests** in the recorded resource log. Reports: `reports/curated-contact-lighthouse.report.html` / `.json`. SEO was not included in this run; the existing domain-based metadata system remains. TBT is not field INP and these figures are not production field measurements.
- No new runtime dependency, environment variable, external media hotlink, photo download or generated personal image.
- Implementation remains local and reviewable; no deployment or remote push performed for this task.

Browser regression includes rules reserving the portrait for the Home hero and preserving contact actions and authentic image loading. Provider iframe tests mock the provider response and verify the controls/URLs; live feed availability remains controlled by the platform.

## Local preview

Run `npm run dev` and open http://localhost:3000 . The production test server used for this review is available in the execution workspace on port 3049. Screenshots and scan logs are in `reports/curated-*` (generated QA artefacts, ignored by Git).
