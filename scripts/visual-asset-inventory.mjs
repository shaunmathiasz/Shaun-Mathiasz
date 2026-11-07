/** Node 24, no added dependencies. Regenerate after changing any public visual asset. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { photography } from "../src/content/visual-assets.ts";
import { organisations } from "../src/content/organisations.ts";
const root = process.cwd();
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
const paths = walk(path.join(root, "public"))
  .filter((p) => /\.(svg|png|jpg|jpeg|webp|avif)$/i.test(p))
  .sort();
const records = [];
for (const file of paths) {
  const url =
    "/" +
    path.relative(path.join(root, "public"), file).replaceAll(path.sep, "/");
  const data = fs.readFileSync(file);
  const meta = await sharp(data).metadata();
  const photo = Object.values(photography).find((p) => p.src === url);
  const org = Object.values(organisations).find(
    (o) => o.logo === url || o.logos?.some((l) => l.src === url),
  );
  let attribution =
    photo?.attribution || org?.name || "Original website artwork";
  let source =
    photo?.source ||
    org?.url ||
    "Original website artwork; existing asset provenance in ASSETS.md";
  let licence =
    photo?.licence ||
    "Trademark identification only; no general reuse licence asserted. See V3_LOGOS.md and CERTIFICATION_LOGOS.md.";
  let alt =
    photo?.alt ||
    org?.logos?.find((l) => l.src === url)?.alt ||
    (org ? `${org.name} official logo` : "");
  let pages =
    photo?.pages ||
    (org
      ? org.showcase === false
        ? ["/education"]
        : org.kind === "Professional Experience"
          ? ["/", "/experience"]
          : ["/", "/education"]
      : ["Shared shell / all routes"]);
  let purpose =
    photo?.purpose ||
    (org
      ? "Identify an employer, institution, credential issuer or group affiliation."
      : "Website identity or interface graphic.");
  if (url.includes("/social-")) {
    const platform = url.split("social-")[1].replace(".svg", "");
    attribution = `Simple Icons v12.4.0 / ${platform} brand mark`;
    source = `https://github.com/simple-icons/simple-icons/blob/12.4.0/icons/${platform}.svg`;
    licence =
      "CC0 interface icon; brand/trademark rights remain with the owner. No endorsement.";
    alt = "Decorative platform icon; accessible platform name is adjacent.";
    pages = ["/", "/contact"];
    purpose =
      "Platform-specific profile graphics, social metrics and on-demand embed controls.";
  }
  if (url.endsWith("shaun-denver-signature.png")) {
    attribution = "User-supplied personal signature artwork";
    source = "https://chatgpt.com/s/m_6aedb8140a5081919c5698b9ee30f7d5";
    licence =
      "Supplied by Shaun for this site; AI-generated artwork, not an institutional mark. No independent IP clearance asserted.";
    alt = "Shaun Denver Mathiasz";
    purpose = "Personal signature in the global header and footer.";
  }
  if (url.endsWith("career-globe-preview.svg")) {
    attribution = "Original website rendering / Natural Earth";
    source = "https://www.naturalearthdata.com/about/terms-of-use/";
    licence = "Natural Earth public-domain geography; original SVG rendering.";
    alt =
      "Static career globe showing the Maldives, Colombo and the UK market connection";
    pages = ["/"];
    purpose =
      "No-JavaScript and loading fallback for the interactive career globe.";
  }
  records.push({
    path: path.relative(root, file).replaceAll(path.sep, "/"),
    url,
    width: meta.width ?? null,
    height: meta.height ?? null,
    format: meta.format,
    bytes: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
    pages,
    purpose,
    attribution,
    source,
    licence,
    alt,
    reuse:
      photo?.reuse ||
      "Reuse only for the same identity/context; not presented as personal photography.",
    duplicateStatus: "unique bytes",
    byteDuplicateOf: [],
  });
}
for (const r of records) {
  r.byteDuplicateOf = records
    .filter((v) => v !== r && v.sha256 === r.sha256)
    .map((v) => v.path);
  if (r.byteDuplicateOf.length) r.duplicateStatus = "byte-identical duplicate";
}
const inventory = {
  schemaVersion: 1,
  scope:
    "Public raster/SVG images. Fonts and historical PDF are documented separately, not image placements.",
  portraitPolicy:
    "One authentic portrait, one rendered placement in the Home hero. Third-party provider embeds control their own media.",
  photos: Object.keys(photography).length,
  assetCount: records.length,
  byteDuplicateGroups: [
    ...new Set(
      records.filter((r) => r.byteDuplicateOf.length).map((r) => r.sha256),
    ),
  ].length,
  authoredVisuals: [
    {
      path: "src/components/platform-artwork.tsx",
      pages: ["/", "/contact"],
      purpose:
        "Four distinct profile-link graphics, never represented as real posts",
      format: "HTML/CSS + existing platform SVG",
      dimensions: "Responsive; full and compact variants",
      licence:
        "Original website graphics; existing Simple Icons are CC0 with retained trademark restrictions",
      alt: "Visible platform, profile handle and descriptive text; icon is decorative",
      duplicateStatus:
        "Intentional component reuse with four platform treatments",
    },
    {
      path: "src/app/about/page.tsx",
      pages: ["/about"],
      purpose:
        "Original field-notes career folio in place of the repeated portrait",
      format: "Semantic HTML/CSS",
      dimensions: "Responsive",
      licence: "Original website artwork",
      alt: "Native ordered career list with verified titles and periods",
      duplicateStatus: "Unique authored composition",
    },
    {
      path: "src/components/experience-journey.tsx",
      pages: ["/experience"],
      purpose:
        "Reservations process illustration, not internal operational data",
      format: "Semantic HTML/CSS",
      dimensions: "Responsive",
      licence: "Original website artwork",
      alt: "Clear reservation details, thoughtful communication, guest confidence",
      duplicateStatus: "Unique reservations chapter composition",
    },
    {
      path: "src/app/motion.css",
      pages: ["/contact"],
      purpose: "Decorative midnight horizon and one-pass light accent",
      format: "CSS",
      dimensions: "Responsive",
      licence: "Original website artwork",
      alt: "Decorative, hidden from assistive technology",
      duplicateStatus: "Unique authored composition",
    },
  ],
  assets: records,
};
fs.writeFileSync(
  path.join(root, "src/content/asset-inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);
console.log(
  `Inventoried ${records.length} visual assets; ${inventory.byteDuplicateGroups} byte-duplicate groups.`,
);
