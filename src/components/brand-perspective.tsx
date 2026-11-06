import Image from "next/image";
import Link from "next/link";
import { articles } from "@/content/articles";
export function BrandPerspective() {
  return (
    <>
      <section className="section brand-perspective" data-cinematic>
        <p className="eyebrow">SHAUN DENVER / A PERSONAL PERSPECTIVE</p>
        <div>
          <h2>
            Hospitality in the detail.
            <br />
            Commerce in the thinking.
            <br />
            <em>Curiosity in what comes next.</em>
          </h2>
          <p>
            I’m building a professional life around the places, people and
            decisions that shape travel. My story connects a foundation in
            Maldives hospitality, product development for the UK outbound market
            and continuing study in global business.
          </p>
          <p>
            This is where I share the work, the learning and the questions that
            keep my perspective moving.
          </p>
          <Link href="/about" prefetch={false} className="text-link">
            Meet the person behind the perspective ↗
          </Link>
        </div>
      </section>
      <section className="section brand-journal">
        <div className="section-title">
          <div>
            <p className="eyebrow">FIELD NOTES BY SHAUN DENVER MATHIASZ</p>
            <h2>A few things worth thinking about.</h2>
          </div>
          <Link href="/insights" prefetch={false} className="text-link">
            Read the journal ↗
          </Link>
        </div>
        <div className="brand-journal-grid">
          {articles
            .filter((a) => a.status === "Published")
            .map((a) => (
              <Link
                key={a.slug}
                href={"/insights/" + a.slug}
                prefetch={false}
                className="brand-journal-card"
                data-cursor="READ"
                data-cinematic
              >
                <Image
                  src={a.cover}
                  alt={a.coverAlt}
                  width={900}
                  height={500}
                  sizes="(max-width:600px) 90vw,45vw"
                />
                <p className="eyebrow">{a.category}</p>
                <h3>{a.title}</h3>
                <p>{a.summary}</p>
                <span className="text-link">Read the perspective ↗</span>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
