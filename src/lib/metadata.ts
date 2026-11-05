import type { Metadata } from "next";
import { site } from "@/config/site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: { absolute: `${title} | ${site.name}` },
    description,
    alternates: site.url
      ? { canonical: new URL(path, site.url).toString() }
      : undefined,
    openGraph: {
      title: title + " | " + site.name,
      description,
      ...(site.url
        ? {
            url: new URL(path, site.url).toString(),
            images: [
              {
                url: new URL("/opengraph-image", site.url).toString(),
                width: 1200,
                height: 630,
              },
            ],
          }
        : {}),
    },
  };
}
