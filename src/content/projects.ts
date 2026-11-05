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
};
export const projects: Project[] = [
  {
    slug: "uk-outbound-product",
    title: "From destination to considered product",
    category: "Product development",
    number: "01",
    summary:
      "UK outbound travel product development, from research to package construction.",
    challenge:
      "Travel products need to connect destination appeal, itinerary practicality and commercial considerations for the UK outbound market.",
    approach:
      "Shaun’s current scope includes destination research, supplier relationships, package construction and marketing collaboration. This overview describes that scope without disclosing employer materials.",
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
      "Responsibilities supplied by Shaun. A specific project, deliverable sample and measurable outcome have not yet been verified.",
  },
  {
    slug: "luxury-hospitality",
    title: "The guest experience begins before arrival",
    category: "Hospitality",
    number: "02",
    summary:
      "A luxury hospitality perspective shaped by reservations and guest operations.",
    challenge:
      "A guest’s experience connects pre-arrival communication, reservation details and the welcome on property.",
    approach:
      "Previous experience at Siyam World Maldives provides a practical hospitality perspective. This is an overview of professional exposure, not a documented transformation project.",
    deliverables: [
      "Reservations experience",
      "Guest operations exposure",
      "Guest-centred professional perspective",
    ],
    skills: ["Hospitality", "Reservations", "Communication"],
    outcome:
      "The supplied CV records WOW Agent / Telephone Operator (October 2024–June 2025) and Reservations Agent (June 2025–March 2026). Project-specific outcomes remain unverified.",
  },
  {
    slug: "commercial-package-design",
    title: "Balancing experience with commercial sense",
    category: "Commercial strategy",
    number: "03",
    summary:
      "Commercial pricing analysis and thoughtful travel package design.",
    challenge:
      "A compelling package must consider the traveller experience alongside its commercial structure.",
    approach:
      "Current responsibilities include commercial pricing analysis and margin optimisation. Confidential rates, supplier terms and internal margins are deliberately excluded.",
    deliverables: [
      "Commercial pricing analysis",
      "Package design inputs",
      "Marketing collaboration",
    ],
    skills: ["Pricing analysis", "Package design", "Commercial thinking"],
    outcome:
      "Scope-based practice overview. No revenue, margin uplift or other performance result is claimed.",
  },
  {
    slug: "destination-positioning",
    title: "Finding the story within a destination",
    category: "Destination research",
    number: "04",
    summary:
      "Destination research, market positioning and experience-led campaign collaboration.",
    challenge:
      "Destination information needs to become a clear and relevant proposition for travellers.",
    approach:
      "Connect destination research with product development and marketing collaboration, drawing on the stated scope of the current role.",
    deliverables: [
      "Destination research",
      "Positioning inputs",
      "Experience-led campaign collaboration",
    ],
    skills: ["Research", "Market positioning", "Marketing collaboration"],
    outcome:
      "Practice overview only. Campaign assets, ownership and results require employer-safe verification before inclusion.",
  },
];
