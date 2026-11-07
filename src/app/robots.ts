import type { MetadataRoute } from "next";
import { site } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
  return site.url
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/admin/", "/request-cv", "/documents/"],
        },
        sitemap: site.url + "/sitemap.xml",
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
