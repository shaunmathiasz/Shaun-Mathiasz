import { LinkArrow } from "@/components/link-arrow";
import { photography } from "@/content/visual-assets";
import Image from "next/image";
import Link from "next/link";

const chapters = [
  {
    number: "02",
    title: "The foundation.",
    subtitle: "Maldives / Luxury hospitality",
    image: photography.maldives.src,
    alt: "Island and ocean landscape providing context for the Maldives hospitality chapter",
    text: "Guest operations and reservations at Siyam World Maldives. Learning to see the experience through the guest’s eyes.",
    href: "/experience",
    link: "The hospitality chapter",
  },
  {
    number: "03",
    title: "The transition.",
    subtitle: "Colombo / Travel product development",
    image: photography.colombo.src,
    alt: "Colombo city skyline, contextual imagery of Shaun’s professional and academic base",
    text: "Bringing that attention to detail into destination research, package construction and considered itineraries.",
    href: "/portfolio",
    link: "The thinking behind the product",
  },
  {
    number: "04",
    title: "The wider market.",
    subtitle: "United Kingdom / Market focus",
    image: photography.london.src,
    alt: "London skyline representing the UK outbound travel market, not a UK employment location",
    text: "Working from Colombo with Moresand Group / Travel Center UK, connecting destination appeal with the needs of the UK outbound market.",
    href: "/experience",
    link: "The current commercial chapter",
  },
];
export function JourneyEditorial() {
  return (
    <section
      className="section journey-editorial"
      aria-label="Chapters of a professional journey"
    >
      <div className="chapter-heading">
        <p className="eyebrow">A JOURNEY IN PERSPECTIVE</p>
        <span>HOSPITALITY → PRODUCT → COMMERCE</span>
      </div>
      <div className="chapter-grid">
        {chapters.map((c) => (
          <article className="editorial-chapter" key={c.number} data-cinematic>
            <Link
              prefetch={false}
              href={c.href}
              className="chapter-photo"
              data-cursor="EXPLORE"
              aria-label={`${c.number} / ${c.link}`}
            >
              <Image
                src={c.image}
                alt={c.alt}
                fill
                quality={50}
                sizes="(max-width:600px) 90vw, 30vw"
              />
              <span className="chapter-number">{c.number}</span>
              <span className="chapter-photo-link" aria-hidden="true">
                <LinkArrow />
              </span>
            </Link>
            <p className="eyebrow">{c.subtitle}</p>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
            <Link prefetch={false} className="text-link" href={c.href}>
              {c.link} <LinkArrow />
            </Link>
          </article>
        ))}
      </div>
      <p className="micro-copy">
        Destination photography provides geographical context.
      </p>
    </section>
  );
}
