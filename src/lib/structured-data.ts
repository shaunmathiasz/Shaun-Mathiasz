import { site } from "@/config/site";
import { education } from "@/content/credentials";

const origin = (site.url || "https://www.shaunmathiasz.com").replace(/\/$/, "");
export const entityIds = {
  person: `${origin}/#person`,
  website: `${origin}/#website`,
  profile: `${origin}/about#profilepage`,
};

export const personSchema = {
  "@type": "Person",
  "@id": entityIds.person,
  name: site.name,
  alternateName: ["Shaun Mathiasz", "Shaun Denver"],
  url: `${origin}/`,
  jobTitle: site.role,
  description: "Colombo-based travel product specialist serving the UK outbound travel market, with a foundation in reservations and guest operations at Siyam World Maldives and ongoing global business management studies.",
  image: new URL(site.portrait.src, origin).toString(),
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
  sameAs: site.socialLinks.map((link) => link.url),
  worksFor: { "@type": "Organization", name: "Moresand Group / Travel Center UK" },
  memberOf: { "@type": "Organization", name: "Royal Aeronautical Society", description: "Student Affiliate" },
  hasCredential: education.filter((credential) => credential.status === "Completed").map((credential) => ({
    "@type": "EducationalOccupationalCredential",
    name: credential.title,
    credentialCategory: credential.category === "Executive Education" ? "Short course" : "Diploma",
    recognizedBy: { "@type": "Organization", name: credential.institution },
  })),
};
export const identitySchema = {
  "@context": "https://schema.org",
  "@graph": [personSchema, {
    "@type": "WebSite",
    "@id": entityIds.website,
    url: `${origin}/`,
    name: site.name,
    alternateName: "Shaun Mathiasz",
    description: site.description,
    inLanguage: "en-GB",
    publisher: { "@id": entityIds.person },
  }],
};
export const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": entityIds.profile,
  url: `${origin}/about`,
  name: `About ${site.name}`,
  mainEntity: { "@id": entityIds.person },
  isPartOf: { "@id": entityIds.website },
};
