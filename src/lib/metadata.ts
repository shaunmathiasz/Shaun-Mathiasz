import type { Metadata } from "next";
import { site } from "@/config/site";
import { socialImage } from "@/config/social";
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
      type: "website",
      siteName: site.name,
      title: title + " | " + site.name,
      description,
      images: [socialImage],
      ...(site.url
        ? {
            url: new URL(path, site.url).toString(),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title + " | " + site.name,
      description,
      images: [socialImage.url],
    },
  };
}
