import { test, expect } from "@playwright/test";
const portrait = 'img[src*="shaun-mathiasz.jpg"]';
test("the authentic portrait is reserved for the homepage hero", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(portrait)).toHaveCount(1);
  await expect(page.locator(".hero-portrait").locator(portrait)).toHaveCount(1);
  for (const route of [
    "/about",
    "/experience",
    "/portfolio",
    "/education",
    "/insights",
    "/contact",
    "/play",
  ]) {
    await page.goto(route);
    await expect(page.locator(portrait)).toHaveCount(0);
  }
  await page.goto("/contact");
  for (const card of await page.locator(".social-profile").all()) {
    await card.locator("summary").click();
    await expect(card.locator(portrait)).toHaveCount(0);
    await expect(card.locator(".platform-artwork")).toBeVisible();
  }
});
test("curated About photo and experience chapters load without repeating the portrait", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.locator(".story-folio")).toContainText(
    "Travel Product Specialist",
  );
  const photo = page.locator(".curated-photo img");
  await photo.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      photo.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
    )
    .toBe(true);
  await expect(photo).toHaveAttribute("alt", /Colombo/);
  await page.goto("/experience");
  await expect(page.locator(".journey-card > img")).toHaveCount(2);
  await expect(page.locator(".reservation-visual")).toContainText(
    "Thoughtful communication",
  );
  const sources = await page
    .locator(".journey-card > img")
    .evaluateAll((images) => images.map((i) => (i as HTMLImageElement).src));
  expect(new Set(sources).size).toBe(2);
});
test("portrait-free contact keeps the full name, email, copy action and CV", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(page).toHaveTitle(/Shaun Denver Mathiasz/);
  await expect(page.locator(".contact-horizon-intro h1")).toHaveText(
    /Good conversations.\s*New possibilities./,
  );
  await expect(page.locator(".contact-horizon-intro a")).toHaveAttribute(
    "href",
    "mailto:shaun.emirates@gmail.com",
  );
  await expect(
    page.getByRole("button", { name: "Copy Email Address" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute(
    "href",
    "/documents/shaun-mathiasz-cv.pdf",
  );
  await expect(
    page.locator(".page-preview-cover .platform-artwork"),
  ).toHaveCount(2);
  await expect(page.locator(".page-preview-cover")).toContainText([
    "Instagram profile",
    "TikTok profile",
  ]);
});
