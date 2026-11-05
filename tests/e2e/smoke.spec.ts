import { test, expect } from "@playwright/test";
test("primary navigation and responsive menu", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Beyond");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "About", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/about/);
  await expect(page).toHaveTitle(/About/);
});
test("all primary pages and metadata", async ({ page }) => {
  for (const route of [
    "/",
    "/about",
    "/experience",
    "/portfolio",
    "/education",
    "/insights",
    "/contact",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page).toHaveTitle(/Shaun Mathiasz/);
  }
});
test("portfolio filters and details", async ({ page }) => {
  await page.goto("/portfolio");
  await page.getByRole("button", { name: "Hospitality", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.locator(".project-card").click();
  await expect(
    page.getByRole("heading", { name: "Verified outcome" }),
  ).toBeVisible();
  for (const slug of [
    "uk-outbound-product",
    "luxury-hospitality",
    "commercial-package-design",
    "destination-positioning",
  ]) {
    await page.goto("/portfolio/" + slug);
    await expect(
      page.getByRole("heading", { name: "Challenge", exact: true }),
    ).toBeVisible();
  }
});
test("contact validates without pretending to send", async ({ page }) => {
  await page.goto("/contact");
  await page
    .getByRole("button", { name: /Check message|Send message/ })
    .click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(
    page.getByText("Please enter a valid email address."),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("review");
});
test("draft article and 404", async ({ page }) => {
  await page.goto("/insights/a-considered-travel-product");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    page.getByRole("heading", { name: "Start with the experience" }),
  ).toBeVisible();
  const res = await page.goto("/not-a-real-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /Return home/ })).toBeVisible();
});
test("responsive layout fits requested widths", async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      "/",
      "/about",
      "/experience",
      "/portfolio",
      "/education",
      "/insights",
      "/contact",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});
