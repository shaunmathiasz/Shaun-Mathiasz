export type CredentialCategory =
  | "Academic Qualifications"
  | "Executive Education"
  | "Professional Training"
  | "Certifications"
  | "Memberships";
export type Credential = {
  id: string;
  title: string;
  institution: string;
  organisations: string[];
  category: CredentialCategory;
  status: "Ongoing" | "Completed" | "Reading" | "Membership";
  period: string;
  detail: string;
  credentialId?: string;
  verificationUrl?: string;
};
export const education: Credential[] = [
  {
    id: "degree",
    title: "BSc (Hons) Global Business Management — Strategic Management",
    institution:
      "Cardiff Metropolitan University · taught at ICBT Campus, Colombo",
    organisations: ["cardiff", "icbt"],
    category: "Academic Qualifications",
    status: "Ongoing",
    period: "March 2026 – May 2027 (anticipated)",
    detail:
      "Strategic Management specialisation. Student Representative — Batch 11. ICBT Campus is the local teaching institution for this Cardiff Metropolitan University programme.",
  },
  {
    id: "othm",
    title: "OTHM Level 4 Diploma in Business Management",
    institution: "OTHM Qualifications",
    organisations: ["othm"],
    category: "Academic Qualifications",
    status: "Completed",
    period: "Issued March 2026",
    credentialId: "83168954-01-AHM7",
    detail: "Completed Level 4 Diploma in Business Management.",
  },
  {
    id: "othm5",
    title: "OTHM Level 5 Diploma in Business Management",
    institution: "OTHM Qualifications",
    organisations: ["othm"],
    category: "Academic Qualifications",
    status: "Completed",
    period: "Issued March 2026",
    credentialId: "13120034-01-62JU",
    detail: "Completed Level 5 Diploma in Business Management.",
  },
  {
    id: "oxford-ai",
    title: "Leadership Problem-Solving with AI: Think Like a Leader",
    institution: "Saïd Business School, University of Oxford",
    organisations: ["oxford"],
    category: "Executive Education",
    status: "Completed",
    period: "Issued April 2026",
    credentialId: "8EJ4Y1NQ2WZ3",
    detail:
      "Short-course study in leadership problem-solving with AI. This is not a University of Oxford degree or a degree-level programme.",
  },
  {
    id: "oxford-law",
    title: "AI, Justice, and the Rule of Law",
    institution: "Saïd Business School, University of Oxford",
    organisations: ["oxford"],
    category: "Executive Education",
    status: "Completed",
    period: "Issued May 2026",
    credentialId: "19727266",
    detail:
      "Short-course study in AI, justice and the rule of law. This is not a University of Oxford degree.",
  },
  {
    id: "iata",
    title: "Foundation Diploma in Travel & Tourism with Amadeus",
    institution: "IATA",
    organisations: ["iata"],
    category: "Professional Training",
    status: "Reading",
    period: "Ongoing",
    detail: "Continuing professional study in travel and tourism with Amadeus.",
  },
  {
    id: "raes",
    title: "Student Affiliate",
    institution: "Royal Aeronautical Society",
    organisations: ["raes"],
    category: "Memberships",
    status: "Membership",
    period: "June 2026 – Present",
    detail:
      "Student affiliate membership, connecting industry curiosity with professional development in aviation.",
  },
];
const courses = [
  [
    "illinois-innovation",
    "Strategic Innovation: Building and Sustaining Innovative Organizations",
    "University of Illinois Urbana-Champaign",
    "April 2026",
    "WRX283G24BMZ",
  ],
  [
    "london-marketing",
    "Fundamentals of Marketing Strategy",
    "University of London",
    "May 2026",
    "00UKVUG9W7GS",
  ],
  [
    "adobe-ai",
    "Design Fundamentals with AI",
    "Adobe",
    "May 2026",
    "1JRPY02HTQQI",
  ],
  [
    "glasgow",
    "MBA Essentials",
    "University of Glasgow",
    "May 2026",
    "MJAQPQS5BV84",
  ],
  [
    "fia",
    "Effective Sales – An Overview",
    "FIA Business School",
    "May 2026",
    "LLKO9ZQFBC2S",
  ],
  [
    "illinois-teams",
    "Leading Teams: Developing as a Leader",
    "University of Illinois Urbana-Champaign",
    "May 2026",
    "JJUN7O4DJ85D",
  ],
  [
    "london-strategy",
    "Corporate Strategy",
    "University of London",
    "May 2026",
    "FMJ55W932H4I",
  ],
  [
    "macquarie",
    "Leading transformations: Manage change",
    "Macquarie University",
    "May 2026",
    "0D6HL9IKL7LD",
  ],
  [
    "starweaver",
    "Hospitality Luxury Brand Management",
    "Starweaver",
    "May 2026",
    "0N31OQ3BRPUS",
  ],
  [
    "amadeus-reservations",
    "Reservations Essentials (Graphic)",
    "Amadeus",
    "May 2026",
    "",
  ],
  [
    "amadeus-community",
    "Travel Community Expert - Live Travel Community",
    "Amadeus",
    "May 2026",
    "",
  ],
  [
    "amadeus-ticketing",
    "Travel Community Expert - Ticketing",
    "Amadeus",
    "May 2026",
    "",
  ],
  [
    "amadeus-industry",
    "Travel Industry Fundamentals",
    "Amadeus",
    "May 2026",
    "",
  ],
  [
    "ibcces",
    "Autism And Sensory Awareness Training",
    "International Board of Credentialing and Continuing Education Standards (IBCCES)",
    "September 2025 · Expires April 2027",
    "ASA25448597",
  ],
  [
    "essec",
    "The fundamentals of hotel distribution",
    "ESSEC Business School",
    "May 2026",
    "Q0NLB1LMXJEE",
  ],
];
const certificationIssuers: Record<string, string> = {
  "University of Illinois Urbana-Champaign": "illinois",
  "University of London": "london",
  Adobe: "adobe",
  "University of Glasgow": "glasgow",
  "FIA Business School": "fia",
  Starweaver: "starweaver",
  "International Board of Credentialing and Continuing Education Standards (IBCCES)":
    "ibcces",
  "ESSEC Business School": "essec",
};
export const certifications: Credential[] = courses.map(
  ([id, title, institution, period, credentialId]) => ({
    id,
    title,
    institution,
    period: "Issued " + period,
    credentialId,
    organisations: certificationIssuers[institution]
      ? [certificationIssuers[institution]]
      : [],
    category: "Certifications",
    status: "Completed",
    detail:
      title === "MBA Essentials"
        ? "Short-course certification, not an MBA degree."
        : "Short-course certification.",
  }),
);
export const credentialCategories: CredentialCategory[] = [
  "Academic Qualifications",
  "Executive Education",
  "Professional Training",
  "Certifications",
  "Memberships",
];
