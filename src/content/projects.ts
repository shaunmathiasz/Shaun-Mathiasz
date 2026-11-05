export const categories = [
  "All",
  "Product development",
  "Hospitality",
  "Commercial strategy",
  "Destination research",
] as const;
export type Project = {
  slug: string;
  title: string;
  category: (typeof categories)[number];
  number: string;
  summary: string;
  challenge: string;
  approach: string;
  deliverables: string[];
  skills: string[];
  outcome: string;
  commercialConsiderations: string[];
};
export const projects: Project[] = [
  {
    slug: "uk-outbound-product",
    commercialConsiderations: [
      "Balance the pace of multi-centre itineraries with transfer practicality.",
      "Align product information with the intended traveller and sales channel.",
      "Review seasonality and inclusion clarity before positioning a package.",
    ],
    title: "From destination to considered product",
    category: "Product development",
    number: "01",
    summary:
      "UK outbound travel product development, from research to package construction.",
    challenge:
      "Travel products need to connect destination appeal, itinerary practicality and commercial considerations for the UK outbound market.",
    approach:
      "Shaun’s current scope includes destination research, supplier relationships, package construction and marketing collaboration. The focus is on connecting research with a clear and practical traveller proposition.",
    deliverables: [
      "Destination research inputs",
      "Package and multi-city itinerary construction",
      "Product lifecycle collaboration",
    ],
    skills: [
      "Destination research",
      "Supplier relationships",
      "Product development",
    ],
    outcome:
      "Practice focus: connecting destination research, supplier evaluation and product construction for the UK outbound market.",
  },
  {
    slug: "luxury-hospitality",
    commercialConsiderations: [
      "Keep reservation information clear across pre-arrival touchpoints.",
      "Consider how the product promise shapes guest expectations.",
      "Protect guest information throughout operational communication.",
    ],
    title: "The guest experience begins before arrival",
    category: "Hospitality",
    number: "02",
    summary:
      "A luxury hospitality perspective shaped by reservations and guest operations.",
    challenge:
      "A guest’s experience connects pre-arrival communication, reservation details and the welcome on property.",
    approach:
      "Previous experience at Siyam World Maldives provides a practical hospitality perspective. Attention to reservations and guest communication informs this perspective.",
    deliverables: [
      "Reservations experience",
      "Guest operations exposure",
      "Guest-centred professional perspective",
    ],
    skills: ["Hospitality", "Reservations", "Communication"],
    outcome:
      "Professional foundation: guest communication, reservations accuracy and pre-arrival coordination at Siyam World Maldives.",
  },
  {
    slug: "commercial-package-design",
    commercialConsiderations: [
      "Compare inclusion quality alongside the overall value proposition.",
      "Consider transfer choices, seasonality and itinerary complexity.",
      "Keep internal costings and supplier terms confidential.",
    ],
    title: "Balancing experience with commercial sense",
    category: "Commercial strategy",
    number: "03",
    summary:
      "Commercial pricing analysis and thoughtful travel package design.",
    challenge:
      "A compelling package must consider the traveller experience alongside its commercial structure.",
    approach:
      "Current responsibilities include commercial pricing analysis and margin optimisation. The emphasis is on how package inclusions, traveller expectations and commercial viability relate.",
    deliverables: [
      "Commercial pricing analysis",
      "Package design inputs",
      "Marketing collaboration",
    ],
    skills: ["Pricing analysis", "Package design", "Commercial thinking"],
    outcome:
      "Practice focus: balancing traveller expectations, package inclusions and commercial viability.",
  },
  {
    slug: "destination-positioning",
    commercialConsiderations: [
      "Choose a proposition relevant to the intended market.",
      "Test whether experience-led messaging reflects the actual itinerary.",
      "Consider seasonality and transport connections alongside destination appeal.",
    ],
    title: "Finding the story within a destination",
    category: "Destination research",
    number: "04",
    summary:
      "Destination research, market positioning and experience-led campaign collaboration.",
    challenge:
      "Destination information needs to become a clear and relevant proposition for travellers.",
    approach:
      "Connect destination research with product development and marketing collaboration, within the current product development role.",
    deliverables: [
      "Destination research",
      "Positioning inputs",
      "Experience-led campaign collaboration",
    ],
    skills: ["Research", "Market positioning", "Marketing collaboration"],
    outcome:
      "Practice focus: translating destination research into a coherent proposition and clear marketing information.",
  },
];
