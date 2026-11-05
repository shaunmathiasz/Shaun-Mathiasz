import type { MetadataRoute } from "next";
import { site, navigation } from "@/config/site";
import { projects } from "@/content/projects";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  return [
    ...navigation.map((n) => n.href),
    "/contact",
    ...projects.map((p) => "/portfolio/" + p.slug),
  ].map((p) => ({ url: site.url + p }));
}
