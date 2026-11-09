/** One source of truth. Proposed reference prices stay unpublished unless substantiated. */
export const digital = {
  name: "SDM Digital",
  path: "/services/web-development",
  email: "shaun.emirates@gmail.com",
  publishReferencePrices: false,
  offer: "Special Introductory Launch Price",
  currency: "LKR",
  retentionDays: 365,
  packages: [
    {
      id: "starter",
      name: "Starter Presence",
      price: 24900,
      referencePrice: 39900,
      saving: 15000,
      discount: 38,
      popular: false,
      pages: "1 page · up to 6 sections",
      revisions: 1,
      support: 7,
      delivery: "5–7 working days",
      audience:
        "New businesses, homestays, small villas, freelancers and startups.",
      features: [
        "Responsive mobile and desktop design",
        "WhatsApp enquiry and click-to-call integration",
        "Basic photo gallery, Google Maps and social links",
        "Basic on-page SEO",
        "SSL and deployment configuration",
      ],
    },
    {
      id: "growth",
      name: "Business Growth",
      price: 59900,
      referencePrice: 99900,
      saving: 40000,
      discount: 40,
      popular: true,
      pages: "Up to 5 pages",
      revisions: 2,
      support: 14,
      delivery: "10–15 working days",
      audience:
        "Boutique hotels, villas, travel agencies, tour operators and growing businesses.",
      features: [
        "Brand-tailored responsive design",
        "Room, accommodation, service or tour showcase",
        "Photo galleries, Google Maps and WhatsApp/contact integration",
        "Enquiry form with email notification",
        "Search Console configuration and basic web analytics",
        "On-page SEO",
      ],
    },
    {
      id: "premium",
      name: "Premium Hospitality",
      price: 119900,
      referencePrice: 199900,
      saving: 80000,
      discount: 40,
      popular: false,
      pages: "Up to 10 pages",
      revisions: 3,
      support: 30,
      delivery: "15–25 working days",
      audience:
        "Luxury villas, boutique resorts, established travel brands and growing SMEs.",
      features: [
        "Premium responsive design and subtle animations",
        "Accommodation or package listings",
        "Advanced enquiry forms",
        "Booking requests requiring staff confirmation",
        "Agreed CMS functionality",
        "Enhanced SEO and appropriate structured data",
        "Analytics and conversion tracking",
      ],
    },
  ],
  categories: [
    "Hospitality",
    "Tourism",
    "Retail",
    "Food and beverage",
    "Professional services",
    "Personal brand",
    "Other",
  ],
  statuses: [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL_SENT",
    "NEGOTIATING",
    "WON",
    "LOST",
    "SPAM",
  ],
  process: [
    [
      "Discovery",
      "Your business, audience and priorities. We agree what a useful website needs to achieve.",
    ],
    [
      "Planning",
      "Pages, content, functionality and a written scope, including any third-party costs.",
    ],
    [
      "Design",
      "A brand-tailored direction, responsive layouts and clear paths to enquiry.",
    ],
    [
      "Development",
      "Accessible interfaces, careful implementation and appropriate integrations.",
    ],
    [
      "Review",
      "Your agreed revision rounds, device checks and final content approval.",
    ],
    [
      "Launch",
      "Final balance before launch, deployment, handover and the package bug-fix support period.",
    ],
  ],
  faqs: [
    [
      "Are these one-time development fees?",
      "Yes. These are starting development fees. Domain registration, hosting, subscriptions, payment gateways and custom software are additional where applicable. The final scope and quotation are agreed before work starts.",
    ],
    [
      "Is a live booking engine included?",
      "No. Premium includes booking requests that your team confirms. Full booking engines, OTA synchronisation, live inventory and payment integrations require a separate custom quotation.",
    ],
    [
      "When does the delivery period start?",
      "The estimate starts after all required content and complete project materials are received and the scope and deposit are agreed. Dependencies and custom functionality can affect the schedule.",
    ],
    [
      "How do payments work?",
      "A 50% deposit is required after proposal acceptance. The balance is due after approval and before final launch. This page does not collect payments.",
    ],
    [
      "Who owns the website?",
      "Ownership, licences and handover are governed by the agreed contract. Third-party services have their own terms and renewal costs.",
    ],
    [
      "Do you work outside hospitality?",
      "Absolutely. Restaurants, retailers, salons, consultants, professionals, startups and other Sri Lankan businesses are equally welcome.",
    ],
    [
      "What happens after launch?",
      "Starter, Growth and Premium include 7, 14 and 30 days of post-launch bug-fix support respectively. Ongoing maintenance is optional and quoted against your requirements; it is not an unlimited service.",
    ],
    [
      "Can you guarantee search rankings or bookings?",
      "No. Good foundations support discovery and usability, but rankings, traffic and commercial outcomes depend on many factors and cannot be guaranteed.",
    ],
  ],
} as const;
export type PackageId = (typeof digital.packages)[number]["id"] | "custom";
export type LeadStatus = (typeof digital.statuses)[number];
export const money = (amount: number) =>
  `LKR ${new Intl.NumberFormat("en-LK").format(amount)}`;
export const packageName = (id: string) =>
  digital.packages.find((p) => p.id === id)?.name || "Custom solution";
