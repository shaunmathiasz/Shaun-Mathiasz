# Sri Lanka introductory offers update

10 November 2026. Preview only; Production release is not authorised.

The owner confirmed that the previously requested real Preview enquiry, emails and owner CRM check works. This is owner-reported confirmation; no new credentials, integrations or database migrations were needed for this pricing update.

## Presentation and interaction

The pricing section now uses “Big savings. Bigger digital possibilities.”, the Sri Lanka Business Launch Special banner, the requested hospitality/SME subtitle and “All Sri Lankan Businesses Welcome.” Each card displays SPECIAL INTRODUCTORY PRICE and an emerald percentage-off badge. Business Growth retains MOST POPULAR and receives a gold top accent and a stronger background.

Cards enter once when scrolled into view, with a restrained stagger, price reveal and badge highlight. Pointer lighting, hover elevation, comparison controls and button interactions remain. No content is hidden awaiting animation, no timer/scarcity was added and reduced-motion users receive static cards.

The three CTAs are Claim Starter Offer, Claim Business Offer and Claim Premium Offer. They select the matching package, retain entered information, scroll/focus the enquiry form and use the existing package-selection events.

## Exact pricing and honest comparisons

| Package | Launch fee | Proposed reference | Calculated saving | Rounded percentage |
| --- | ---: | ---: | ---: | ---: |
| Starter Presence | LKR 24,900 | LKR 39,900 | LKR 15,000 | 38% |
| Business Growth | LKR 59,900 | LKR 99,900 | LKR 40,000 | 40% |
| Premium Hospitality | LKR 119,900 | LKR 199,900 | LKR 80,000 | 40% |

The owner subsequently requested the explicit 38% / 40% / 40% OFF layout and You save amounts. discountDisplayApproved is therefore true on all three packages for those owner-approved reference-value comparisons. Cards use “Reference value” above a crossed-out benchmark; no previous-selling-price or historical sales claim is made, and no extra public clarification is shown, as requested. The “save up to” banner uses the calculated maximum, not a hardcoded percentage.

The typed configuration contains packageId, regularPrice, launchPrice, calculated savingAmount and discountPercentage, discountDisplayApproved, packageFeatures and ctaLabel. Existing stable ID/feature aliases are derived for compatibility. Savings use subtraction; percentages use Math.round. There are no duplicated payable amounts in components. Forms, backend database snapshots and Service/Offer structured data read launchPrice.

## Files

- src/config/digital.ts
- src/components/digital/experience.tsx
- src/components/digital/enquiry-form.tsx
- src/app/services/web-development/services.css
- src/app/services/web-development/page.tsx
- src/lib/digital/service.ts
- tests/unit/digital.test.ts
- tests/e2e/digital.spec.ts
- SDM Digital operations, plan and report documents

## Validation and Preview

Final comparison-enabled validation passed:

- Production-mode build, including TypeScript: passed.
- Lint: 0 errors, 2 existing generated Workflow warnings.
- Unit tests: 143 passed across 18 files, including actual SQL launch-price snapshots for all three packages.
- Focused desktop/mobile services and SEO browser tests: 16 passed. Covers exact prices, all offer CTAs, preserved form values, selection events, discount/reference rendering, distinct image selection, validation, consent, private-route guards, responsive widths and reduced motion.
- Axe checks at 1440 × 1000, 768 × 1024 and 390 × 844: zero selected WCAG A/AA violations and zero page errors.
- Desktop/mobile pricing and both industry-image screenshots reviewed. Reports are in reports/sdm-offers-*.png.

The existing broader regression results remain documented in SDM-DIGITAL-REPORT.md; a new full-site 152-case run was not claimed for this focused update. Latest local mobile Lighthouse: Performance 80, Accessibility 100, Best Practices 100, SEO 100; LCP 4.2 s, CLS 0, TBT 300 ms. This is a local simulated lab run, not production field data; performance/LCP targets remain unmet. The first benchmark attempt after an execution-context restart could not connect because the local server had stopped; it was restarted and this successful run replaced that invalid attempt. Final cloud Preview checks follow.

No environment-variable changes are required. Existing logos, package scope, payment terms, SEO architecture, consent, CV security, owner authentication and integrations are preserved. No GTM configuration or Production deployment is changed.

## Distinct Sri Lankan concept photography

The shared Maldives photo was replaced only in the Villas and Guesthouses industry concepts. Other existing image placements are preserved. Both new images are local JPEGs served through next/image with responsive sizing and descriptive alt text.

- Villas: Dinuka Lankaloka, private villa pool in Ahangama, Sri Lanka; 1200 × 800, 290,360 bytes. [Official source](https://unsplash.com/photos/white-and-brown-house-near-swimming-pool-during-daytime-HKr5cn6S0q0).
- Guesthouses: Thilina Alagiyawanna, traditional arched entrance and tropical plants in Sri Lanka; 1200 × 800, 196,146 bytes. [Official source](https://unsplash.com/photos/elegant-arched-wooden-door-framed-by-lush-green-plants-je1J85Ow79M). This is contextual architecture, not a claim that the photographed property is an SDM Digital customer or has a verified guesthouse classification.

Both official photo pages identify free use under the [Unsplash License](https://unsplash.com/license). Asset records, dimensions, purpose and attribution are in src/content/visual-assets.ts. No external hotlink is required at runtime.
