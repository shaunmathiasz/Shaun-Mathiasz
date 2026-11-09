import { expect, test } from "@playwright/test";

test("all 15 public sitemap pages expose unique, indexable mobile-readable content", async ({ page, request }) => {
  test.setTimeout(150_000);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls).toHaveLength(15);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const url of urls) {
    const path = new URL(url).pathname;
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    expect(response?.headers()["x-robots-tag"] || "").not.toContain("noindex");
    await expect(page.locator("h1"), path).toHaveCount(1);
    expect((await page.locator("h1").innerText()).trim().length, path).toBeGreaterThan(5);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", path === "/" ? url.replace(/\/$/, "") : url);
    const title = await page.title();
    expect(titles.has(title), path).toBe(false); titles.add(title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length, path).toBeGreaterThan(30);
    expect(descriptions.has(description!), path).toBe(false); descriptions.add(description!);
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count(), path).toBe(0);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const data = schemas.map((text) => JSON.parse(text)).find((schema) => schema["@graph"]?.some((entity: { "@type": string }) => entity["@type"] === "Person"));
    expect(data["@graph"][0]).toMatchObject({ "@type": "Person", "@id": "https://www.shaunmathiasz.com/#person", alternateName: ["Shaun Mathiasz", "Shaun Denver"] });
    expect(data["@graph"][1]["@type"]).toBe("WebSite");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true);
    expect(await page.locator("main img:not([alt])").count(), path).toBe(0);
  }
});

test("profile and private-route index directives are explicit", async ({ page, request }) => {
  await page.goto("/about");
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.map((text) => JSON.parse(text)).find((schema) => schema["@type"] === "ProfilePage")).toMatchObject({ mainEntity: { "@id": "https://www.shaunmathiasz.com/#person" } });
  for (const path of ["/request-cv", "/request-cv/privacy", "/admin/login"]) {
    const response = await request.get(path);
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    expect(await response.text()).toMatch(/name="robots" content="noindex/);
  }
});
