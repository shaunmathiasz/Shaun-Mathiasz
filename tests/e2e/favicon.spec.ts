import { expect, test } from "@playwright/test";

test("versioned SDM icons and manifest are consistent and public", async ({ page, request }) => {
  await page.goto("/");
  const iconLinks = page.locator('link[rel="icon"]');
  expect(await iconLinks.count()).toBe(4);
  const paths = await iconLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(paths).size).toBe(4);
  expect(paths.every((path) => path?.startsWith("/icons/sdm-v1/"))).toBe(true);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icons/sdm-v1/apple-touch-icon.png");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#080F1D");
  const manifestPath = await page.locator('link[rel="manifest"]').getAttribute("href");
  const response = await request.get(manifestPath!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = await response.json();
  expect(manifest.name).toBe("Shaun Denver Mathiasz");
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(["192x192", "512x512"]);
  const images = [
    ...[16, 32, 48].map((size) => ({ src: `/icons/sdm-v1/favicon-${size}x${size}.png`, size })),
    { src: "/icons/sdm-v1/apple-touch-icon.png", size: 180 },
    ...manifest.icons.map((icon: { src: string; sizes: string }) => ({ src: icon.src, size: Number(icon.sizes.split("x")[0]) })),
  ];
  for (const image of images) {
    const asset = await request.get(image.src);
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/png");
    const size = await page.evaluate(async (src) => {
      const image = new Image(); image.src = src; await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, image.src);
    expect(size).toEqual([image.size, image.size]);
  }
  for (const path of ["/favicon.ico", "/icons/sdm-v1/favicon.ico"]) {
    const icon = await request.get(path);
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toMatch(/image\/(x-icon|vnd.microsoft.icon)/);
  }
});
