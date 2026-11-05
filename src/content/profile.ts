export type Experience = {
  employer: string;
  role: string;
  period: string;
  description: string;
  responsibilities: string[];
  tools: string[];
};
export const experience: Experience[] = [
  {
    employer: "Moresand Group / Travel Center UK",
    role: "Travel Product Specialist",
    period: "April 2026 – Present",
    description:
      "Connecting destination knowledge with the commercial detail behind UK outbound travel products.",
    responsibilities: [
      "Research destinations and develop travel products for the UK outbound market.",
      "Build packages and multi-city itineraries with attention to traveller experience.",
      "Collaborate with suppliers and marketing colleagues throughout the product lifecycle.",
      "Analyse flight and hotel costing, commercial pricing and product optimisation.",
      "Evaluate suppliers, develop multi-centre itineraries and coordinate product information for sales and marketing.",
    ],
    tools: [
      "Destination research",
      "Package construction",
      "Commercial analysis",
      "Supplier relationships",
    ],
  },
  {
    employer: "Siyam World Maldives",
    role: "Reservations Agent",
    period: "June 2025 – March 2026",
    description:
      "Supporting accurate reservations and a seamless pre-arrival experience at Siyam World Maldives.",
    responsibilities: [
      "Managed guest reservations by phone and email, recording details in Opera PMS.",
      "Addressed special requests and preferences, coordinating booking arrangements with internal departments.",
      "Supported revenue goals and the guest’s pre-arrival experience.",
    ],
    tools: ["Oracle Opera PMS", "Reservations", "Pre-arrival coordination"],
  },
  {
    employer: "Siyam World Maldives",
    role: "WOW Agent | Telephone Operator",
    period: "October 2024 – June 2025",
    description:
      "Connecting guests and resort teams through clear communication and attentive follow-up.",
    responsibilities: [
      "Handled guest enquiries and service requests by telephone.",
      "Used Opera PMS and Eleanor to coordinate service delivery with resort departments.",
      "Followed up on requests for VIP and long-stay guests.",
    ],
    tools: ["Oracle Opera PMS", "Eleanor", "Guest communication"],
  },
];
export const skills = [
  {
    title: "Travel product development",
    text: "From destination research to coherent, experience-led packages.",
  },
  {
    title: "Commercial thinking",
    text: "Pricing analysis, package construction and attention to commercial viability.",
  },
  {
    title: "Hospitality operations",
    text: "A guest-centred perspective shaped by luxury resort experience.",
  },
  {
    title: "Partnership & collaboration",
    text: "Working across supplier relationships, marketing and the product lifecycle.",
  },
];

export { education } from "./credentials";
