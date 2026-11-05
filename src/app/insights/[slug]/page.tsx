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
    robots: { index: false, follow: true },
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
      <PageIntro
        eyebrow={a.category + " / UNPUBLISHED DRAFT"}
        title={a.title}
        description={a.summary}
      />
      <section className="section article-detail">
        <div className="notice">
          Unpublished editorial draft · no publication date assigned · awaiting
          Shaun’s review.
        </div>
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
