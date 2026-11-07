/** Curated photography. Context images never document Shaun's workplace or a personal visit. */
export type Photograph = {
  src: string;
  width: number;
  height: number;
  alt: string;
  purpose: string;
  pages: string[];
  attribution: string;
  source: string;
  licence: string;
  reuse: string;
};
const unsplash = "Unsplash License — https://unsplash.com/license";
export const photography = {
  portrait: {
    src: "/images/shaun-mathiasz.jpg",
    width: 1254,
    height: 1254,
    alt: "Shaun Denver Mathiasz wearing a dark suit and tie against a blue travel-themed background",
    purpose:
      "Signature authentic personal photograph; retained only in the Home hero.",
    pages: ["/"],
    attribution: "Shaun Denver Mathiasz — user-supplied authentic photograph",
    source: "User-provided original photograph",
    licence:
      "Supplied by the subject for this website; no general reuse licence asserted.",
    reuse:
      "One rendered placement: Home hero. No desktop/mobile duplicate elements.",
  },
  maldives: {
    src: "/images/editorial/maldives.jpg",
    width: 1500,
    height: 1875,
    alt: "Overwater villas and turquoise water in the Maldives, contextual destination photography",
    purpose:
      "Geographic context for the hospitality foundation and Maldives travel concepts.",
    pages: [
      "/",
      "/experience",
      "/portfolio",
      "/portfolio/destination-positioning",
    ],
    attribution: "Unsplash",
    source: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    licence: unsplash,
    reuse:
      "Intentional location-specific reuse: hero atmosphere, Maldives chapter/map, destination research and illustrative Maldives brief. Never presented as Siyam World photography.",
  },
  london: {
    src: "/images/editorial/london.jpg",
    width: 1200,
    height: 800,
    alt: "London skyline illustrating the UK outbound travel market, not a UK employment location",
    purpose: "UK market focus, distinct from physical employment location.",
    pages: ["/", "/experience", "/portfolio", "/portfolio/uk-outbound-product"],
    attribution: "Unsplash",
    source: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
    licence: unsplash,
    reuse:
      "Intentional UK-market context across the career map, commercial chapter and relevant travel-product overview.",
  },
  landscape: {
    src: "/images/editorial/landscape.jpg",
    width: 1200,
    height: 800,
    alt: "Lake and mountain landscape illustrating the experience within a travel package",
    purpose:
      "Experience and itinerary composition for the commercial strategy overview.",
    pages: ["/", "/portfolio", "/portfolio/commercial-package-design"],
    attribution: "Unsplash",
    source: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    licence: unsplash,
    reuse:
      "One portfolio category cover, reused for its matching detail page and selected-work card.",
  },
  colombo: {
    src: "/images/editorial/colombo.jpg",
    width: 1600,
    height: 1067,
    alt: "Colombo coastal skyline at dusk, contextual photography of Shaun’s professional and academic base",
    purpose: "Professional base and international perspective.",
    pages: ["/", "/about", "/portfolio"],
    attribution: "Dmitriy Sarychev / Unsplash",
    source:
      "https://unsplash.com/photos/city-skyline-with-ocean-view-at-dusk-QsyDe3_7OV0",
    licence: unsplash,
    reuse:
      "Intentional geographic reuse: base marker, professional transition, Sri Lanka example and About city feature.",
  },
  airport: {
    src: "/images/editorial/airport.jpg",
    width: 1400,
    height: 932,
    alt: "Beijing International Airport concourse photographed by Eric Prouzet, contextual travel imagery",
    purpose: "Travel-product journal cover, without implying a personal visit.",
    pages: ["/", "/insights", "/insights/a-considered-travel-product"],
    attribution: "Eric Prouzet / Unsplash",
    source: "https://unsplash.com/photos/empty-airport-concierge-RYWC1OPWt9Q",
    licence: unsplash,
    reuse: "Article cover and its matching index/related/home article cards.",
  },
  hospitality: {
    src: "/images/editorial/hospitality.jpg",
    width: 1400,
    height: 1616,
    alt: "Metropol Palace hotel lobby in Belgrade photographed by Lazar Gugleta, contextual hospitality imagery",
    purpose:
      "Hospitality editorial/practice illustration; not a photograph of Shaun’s employer.",
    pages: [
      "/",
      "/portfolio",
      "/portfolio/luxury-hospitality",
      "/insights",
      "/insights/hospitality-and-commercial-thinking",
    ],
    attribution: "Lazar Gugleta / Unsplash",
    source:
      "https://unsplash.com/photos/a-hotel-lobby-with-chandelier-and-seating-area-BgOvvTRLfCA",
    licence: unsplash,
    reuse:
      "Related hospitality practice and journal material only; not a cover for unrelated project categories.",
  },
} satisfies Record<string, Photograph>;
