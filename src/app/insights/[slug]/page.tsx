import Image from "next/image";
import { ArticleTools } from "@/components/editorial-tools";
import { readingMinutes } from "@/content/media";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { articles } from "@/content/articles";
import { PageIntro, TextLink } from "@/components/ui";
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return {
    ...pageMetadata(
      a?.title || "Article not found",
      a?.summary || "Article not found",
      "/insights/" + slug,
    ),
    robots: { index: a?.status === "Published", follow: true },
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: a.title,
            datePublished: a.publishedAt,
            author: { "@type": "Person", name: "Shaun Denver Mathiasz" },
            description: a.summary,
          }).replace(/</g, "\u003c"),
        }}
      />
      <PageIntro
        eyebrow={a.category + " / FIELD NOTES"}
        title={a.title}
        description={a.summary}
      />
      <figure className="journal-hero" data-cinematic>
        <Image
          src={a.cover}
          alt={a.coverAlt}
          width={1500}
          height={650}
          sizes="100vw"
        />
        <figcaption>FIELD NOTES / SHAUN DENVER MATHIASZ</figcaption>
      </figure>
      <section className="section article-detail">
        <p className="article-byline">
          By Shaun Denver Mathiasz ·{" "}
          <time dateTime={a.publishedAt}>6 November 2026</time>
        </p>
        <ArticleTools />
        <p className="micro-copy">
          {readingMinutes(a.body)} minute estimated read
        </p>
        <article className="prose">
          <MDXRemote source={a.body} />
        </article>
        <div className="related">
          <p className="eyebrow">CONTINUE READING</p>
          {articles
            .filter((b) => b.slug !== slug)
            .map((b) => (
              <TextLink key={b.slug} href={"/insights/" + b.slug}>
                {b.title}
              </TextLink>
            ))}
        </div>
      </section>
    </>
  );
}
