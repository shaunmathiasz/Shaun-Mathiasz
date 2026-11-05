# Shaun Denver Mathiasz — V3 review

## Implemented

- Full public name across navigation, hero, portraits/accessible labels, page copy, footer, metadata, Open Graph image, Person JSON-LD and the public CV's LinkedIn label/metadata. Domain, social URLs and resource paths unchanged. CV privacy redactions retained; original uploaded historical document untouched.
- Explicit profession and UK outbound specialisation in the first screen, responsive name treatment and the original headline/photographic composition retained.
- Reusable OrganisationLogo, BrandShowcase, EmployerCard, CredentialCard and EducationCredentials components; official logo images loaded lazily in neutral containers without altering proportions/colours. Employer summary cards describe two employment chapters, with group/brand relationships and internal resort progression clearly identified.
- Homepage organisation showcase with native expandable cards and existing reduced-motion-safe reveals. Oxford appears as short-course study, with text identity rather than an unauthorised crest.
- Cardiff degree specialisation, dates, anticipated completion and Batch 11 student representation reflect the user-provided brief. ICBT remains the teaching institution for the same degree. Exact OTHM diploma titles, March 2026 issue dates and IDs come from the additional supplied record. IATA remains Reading. RAeS remains a Student Affiliate membership.
- Two Oxford short courses use exact titles/issue dates/IDs from the supplied LinkedIn extract. They explicitly do not represent Oxford degrees. Fifteen relevant short-course certifications are in a separate expandable section, including Illinois, London, Amadeus and IBCCES. No invented verification URLs. Other uploaded low-priority courses are not promoted as badges.
- Education filters distinguish academic qualifications, executive/short-course study, professional training, certifications and memberships. Expandable details retain IDs and status. JSON-LD uses short-course versus diploma categories and does not claim alumni status for an ongoing degree.
- Contact uses Email Me, verified-user-provided LinkedIn, working CV and Copy Email Address with actual clipboard confirmation/failure fallback. Footer mailto uses the same recipient. No unconfigured form or simulated submission success.
- Existing globe, builder, portfolio filtering, reading progress/share tools and motion retained. Passport reward now says “Every journey begins with curiosity” and can be dismissed. About links directly to experience, portfolio and education.
- Removed public development-review wording, repeated metric-verification caveats and CV-source narration. Practice overviews and unpublished drafts retain concise, honest labels. No performance achievements or university degrees invented.

## Assets and open items

See V3_LOGOS.md for the seven official asset URLs and trademark/reuse status. Text fallbacks remain for Moresand, Siyam World, Oxford and additional course issuers. Explicit reuse permission is not established; no endorsement or general logo licence is claimed. The distinct Moresand/Siyam World marks and Oxford crest can be added later from appropriate approved assets.

Credential titles/statuses/IDs are based on the user's supplied LinkedIn text and brief, not independently authenticated certificates. Public credential-verification URLs were not supplied, so no fabricated Verify links are shown. The public CV is a historical supplied CV with identity/privacy updates, not a newly certified record of every recent credential.

Existing photographs/font/data provenance remains in ASSETS.md. No new runtime dependencies or production secrets. Optional form delivery still requires RESEND_API_KEY, CONTACT_FROM and CONTACT_TO. Current direct-contact paths need none.

## Verification

Production build, lint, strict typecheck and 26 unit tests passed. The initial 26-case desktop/mobile browser run had 24 passes and two test-selector ambiguities because the valid footer and primary mailto links shared the same label. Both corrected targeted cases passed. Education filters, organisation expansion, globe, builder, career stamp, reduced-motion hydration, no-JS content, metadata/404 and overflow at 360, 390, 768, 1024 and 1440 were exercised. Clipboard feedback was separately tested at 360 and 1440. Logo images were scrolled into view and checked for successful decoding.

Local mobile Lighthouse 13.6.0: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.0 s, CLS 0, TBT 140 ms. These are local lab measurements, not field INP, cross-engine certification or production guarantees. Safari/Firefox and physical devices remain untested.

## Preview and release

Build locally with NEXT_PUBLIC_SITE_URL=https://shaun-mathiasz.vercel.app npm run build, then npm start. Run npm run lint, npm run typecheck, npm test and npm run test:e2e. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if using a system browser. Preview builds intentionally remain non-indexable when no canonical domain is configured. A Vercel preview is built and checked before the production deployment. No production protection, canonical-domain environment variable or mail secrets need changing.
