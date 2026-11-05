export type Organisation = {
  name: string;
  showcase?: boolean;
  kind: "Professional Experience" | "Academic & Professional Development";
  context: string;
  url?: string;
  logo?: string;
  logos?: { src: string; alt: string }[];
};
export const organisations: Record<string, Organisation> = {
  moresand: {
    name: "Moresand Group",
    logo: "/logos/moresand.png",
    url: "https://www.moresand.co.uk/",
    kind: "Professional Experience",
    context:
      "Current employer group · Travel Product Specialist · April 2026–Present. UK outbound travel product development.",
  },
  travelcenter: {
    name: "Travel Center UK",
    kind: "Professional Experience",
    context:
      "Travel brand within the Moresand professional chapter. UK market focus; professional base in Colombo.",
    url: "https://www.travelcenter.uk",
    logo: "/logos/travelcenter.svg",
  },
  siyam: {
    name: "Siyam World Maldives",
    logo: "/logos/siyam-world.png",
    kind: "Professional Experience",
    context:
      "Luxury hospitality · October 2024–March 2026. WOW Agent / Telephone Operator, followed by Reservations Agent.",
    url: "https://www.sunsiyam.com/siyam-world/",
  },
  sunsiyam: {
    name: "Sun Siyam Resorts",
    kind: "Professional Experience",
    context:
      "Hospitality group associated with Siyam World Maldives; part of the same resort chapter.",
    url: "https://www.sunsiyam.com",
    logo: "/logos/sunsiyam.svg",
  },
  cardiff: {
    name: "Cardiff Metropolitan University",
    kind: "Academic & Professional Development",
    context:
      "Ongoing BSc (Hons) Global Business Management — Strategic Management. Anticipated completion May 2027.",
    url: "https://www.cardiffmet.ac.uk",
    logo: "/logos/cardiff.svg",
  },
  icbt: {
    name: "ICBT Campus",
    kind: "Academic & Professional Development",
    context:
      "Local teaching institution in Colombo for the Cardiff Metropolitan University programme.",
    url: "https://www.icbt.lk",
    logo: "/logos/icbt.png",
  },
  oxford: {
    name: "Saïd Business School, University of Oxford",
    logos: [
      {
        src: "/logos/oxford-university.svg",
        alt: "University of Oxford official logo",
      },
      {
        src: "/logos/oxford-said.svg",
        alt: "Saïd Business School official logo",
      },
    ],
    kind: "Academic & Professional Development",
    context:
      "Completed short courses in leadership problem-solving with AI and AI, justice and the rule of law. Not an Oxford degree.",
    url: "https://www.ox.ac.uk",
  },
  othm: {
    name: "OTHM Qualifications",
    kind: "Academic & Professional Development",
    context: "Completed Business Management qualifications at Levels 4 and 5.",
    url: "https://othm.org.uk",
    logo: "/logos/othm.svg",
  },
  iata: {
    name: "IATA",
    kind: "Academic & Professional Development",
    context: "Foundation Diploma in Travel & Tourism with Amadeus — ongoing.",
    url: "https://www.iata.org",
    logo: "/logos/iata.svg",
  },
  raes: {
    name: "Royal Aeronautical Society",
    kind: "Academic & Professional Development",
    context:
      "Student Affiliate · June 2026–Present. Professional membership, not chartership.",
    url: "https://www.aerosociety.com",
    logo: "/logos/raes.svg",
  },
  illinois: {
    name: "University of Illinois Urbana-Champaign",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/illinois.svg",
  },
  london: {
    name: "University of London",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/london.svg",
  },
  adobe: {
    name: "Adobe",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/adobe.svg",
  },
  glasgow: {
    name: "University of Glasgow",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/glasgow.svg",
  },
  fia: {
    name: "FIA Business School",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/fia.png",
  },
  starweaver: {
    name: "Starweaver",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/starweaver.png",
  },
  ibcces: {
    name: "International Board of Credentialing and Continuing Education Standards (IBCCES)",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/ibcces.png",
  },
  essec: {
    name: "ESSEC Business School",
    showcase: false,
    kind: "Academic & Professional Development",
    context: "Short-course certification issuer.",
    logo: "/logos/essec.svg",
  },
};
