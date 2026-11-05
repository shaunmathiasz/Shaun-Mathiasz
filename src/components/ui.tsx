import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </section>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link prefetch={false} className="text-link" href={href}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function ContactCTA() {
  return (
    <section className="contact-cta">
      <p className="eyebrow">THE NEXT CHAPTER</p>
      <h2>
        Good conversations.
        <br />
        <em>New possibilities.</em>
      </h2>
      <div>
        <p>
          For opportunities across travel, hospitality and commercial growth,
          let’s start a conversation.
        </p>
        <Link prefetch={false} className="button gold-button" href="/contact">
          Get in touch <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function Landscape({ variant = "main" }: { variant?: string }) {
  return (
    <div
      className={"landscape " + variant}
      role="img"
      aria-label="Abstract editorial landscape inspired by island destinations; not a photograph of a workplace"
    >
      <div className="landscape-sun" />
      <div className="landscape-island" />
      <div className="landscape-island second" />
      <div className="landscape-lines" />
      <span className="art-caption">
        A WORLD OF POSSIBILITY <span>07° N / 80° E</span>
      </span>
    </div>
  );
}
