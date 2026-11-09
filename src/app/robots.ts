import type { MetadataRoute } from "next";
import { site } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview")
    return { rules: { userAgent: "*", disallow: "/" } };
  return site.url
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/admin/", "/request-cv", "/documents/", "/services/web-development/privacy"],
        },
        sitemap: site.url + "/sitemap.xml",
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
