import { test, expect } from "@playwright/test";

test("social crawlers receive one server-rendered homepage preview", async ({ request }) => {
  const response = await request.get("/", {
    headers: { "User-Agent": "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)" },
  });
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html.match(/property="og:image"\s/g)).toHaveLength(1);
  expect(html).toContain('property="og:type" content="website"');
  expect(html).toContain('property="og:title" content="Shaun Denver Mathiasz | Beyond Destinations. Towards Possibilities."');
  expect(html).toContain('property="og:description" content="Travel Product Specialist | Travel, Commerce &amp; Strategy. Explore my professional journey in international travel, hospitality and commercial strategy."');
  expect(html).toContain('property="og:image" content="https://www.shaunmathiasz.com/social/shaun-homepage-og-v3.jpg"');
  expect(html).toContain('property="og:image:width" content="1200"');
  expect(html).toContain('property="og:image:height" content="630"');
  expect(html).toContain('property="og:image:type" content="image/jpeg"');
  expect(html).toContain('name="twitter:card" content="summary_large_image"');
  expect(html).toContain('name="twitter:image" content="https://www.shaunmathiasz.com/social/shaun-homepage-og-v3.jpg"');
  expect(html).toContain('rel="canonical" href="https://www.shaunmathiasz.com"');
});

test("the supplied social JPEG is public and really measures 1200 by 630", async ({ page, request }) => {
  const asset = await request.get("/social/shaun-homepage-og-v3.jpg");
  expect(asset.status()).toBe(200);
  expect(asset.headers()["content-type"]).toContain("image/jpeg");
  expect(asset.headers()["x-robots-tag"] || "").not.toContain("noimageindex");
  await page.goto("/");
  const dimensions = await page.evaluate(async () => {
    const image = new Image();
    image.src = "/social/shaun-homepage-og-v3.jpg";
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});
