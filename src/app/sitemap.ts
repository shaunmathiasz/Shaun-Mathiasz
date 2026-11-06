import type { MetadataRoute } from "next";
import { site, navigation } from "@/config/site";
import { articles } from "@/content/articles";
import { projects } from "@/content/projects";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  return [
    ...navigation.map((n) => n.href),
    "/contact",
    "/play",
    ...articles
      .filter((a) => a.status === "Published")
      .map((a) => "/insights/" + a.slug),
    ...projects.map((p) => "/portfolio/" + p.slug),
  ].map((p) => ({ url: site.url + p }));
}
