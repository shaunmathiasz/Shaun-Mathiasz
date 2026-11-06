# Personal-brand update

User-authorised scope: add the supplied Amadeus/Macquarie logos; optional travel game and page transitions; shift emphasis from portfolio to personal brand; complete and publish articles; remove public draft/development wording; add relevant imagery; add supplied TikTok/Facebook and interactive social profile previews; animate verified influence metrics.

Implemented original personal-brand introduction and journal highlights, full-length original sourced essays published 6 November 2026 with author/date/BlogPosting metadata and sitemap inclusion, contextual locally hosted Unsplash photography (ASSETS.md), all ten issuer logos, optional destination-pairs game, restrained route entry, and expandable profile cards linking to all four supplied accounts. Profile cards are curated link previews, not fabricated feeds. No unsupported third-party embeds, invented posts, follower counts or professional outcomes.

The user explicitly approved publication, superseding the previous draft-only state. Articles contain editorial judgement and clearly identified illustrative examples, with references to UN Tourism, European Travel Commission and VisitBritain. No publication date was backdated, and no employer project results or confidential material were added.

Digital Presence now uses Shaun's explicitly supplied November 2026 snapshots in `src/content/influence.ts`: exact TikTok/Instagram figures, approximate Facebook/LinkedIn figures, rounded TikTok likes, and 500+ connections. Rolling digit columns preserve punctuation/suffixes and animate once in view with reduced-motion/static SSR equivalents. The Motion counter island loads near the viewport; lightweight server-rendered final figures remain visible without JavaScript or when animation is disabled. The combined display is ~15.4K with a non-unique audience caption; no precise 15,382 total, reach, impressions, engagement or video views are claimed.

Native scrolling, keyboard controls, existing page routes, professional facts, CV, contact email and midnight identity are preserved. No new runtime dependencies or secrets. Reduced-motion support and optional pause controls remain available. See the release handoff for actual test/deployment outcomes; previous Lighthouse measurements are historical, not measurements of this update.

## Instagram and TikTok page previews

Following the user's clarification, added page previews from the two supplied profile URLs rather than selecting individual posts. Instagram profile iframe URL follows the permalink-to-embed construction in Instagram's public embed SDK; TikTok creator iframe URL follows its public creator SDK's generateEmbedUrl implementation and official creator-profile documentation (https://developers.tiktok.com/docs/en/embed-creator-profiles). No SDK code is copied into the website. Frames load on explicit request, stay cross-origin/sandboxed, and retain direct profile links and close controls. Actual provider content remains subject to public-account/embed settings and browser/provider restrictions. Interface-contract tests mock provider documents; they do not establish live feed availability. No posts or thumbnails are fabricated.

## Original personal signature

The silver signature from Shaun's second public ChatGPT share is installed locally, unchanged, in the global navigation and footer. A shared `PersonalLogo` component uses Next Image with native dimensions, responsive sizes and the full professional name as alt text. The homepage name, metadata and structured data retain the full name. The black alternative is not used against a dark surface.
