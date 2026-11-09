import { expect, test, type Page, type APIRequestContext } from "@playwright/test";

// This controlled fixture exercises the adapter after hypothetical approval.
// The production review guard stays OFF and the real published container is NEVER loaded.
async function fixture(page: Page, request: APIRequestContext, simulateReviewed: boolean) {
  const counts = { google: 0, clarity: 0 };
  await page.route("https://www.shaunmathiasz.com/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await request.fetch(`${process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3060"}${url.pathname}${url.search}`, { method: route.request().method(), headers: route.request().headers(), data: route.request().postDataBuffer() || undefined });
    if (simulateReviewed && /text\/html|text\/x-component/.test(response.headers()["content-type"] || "")) {
      const body = (await response.text()).replace(/gtmApproved.{0,8}false/g, (value) => value.replace(/false$/, "true"));
      await route.fulfill({ response, body }).catch((error: Error) => { if (!error.message.includes("Route is already handled")) throw error; });
    } else await route.fulfill({ response }).catch((error: Error) => { if (!error.message.includes("Route is already handled")) throw error; });
  });
  await page.route("https://www.googletagmanager.com/gtm.js**", async (route) => { counts.google++; await route.fulfill({ contentType: "application/javascript", body: "window.__mockGtm = true;" }); });
  await page.route("https://www.clarity.ms/tag/**", async (route) => { counts.clarity++; await route.fulfill({ contentType: "application/javascript", body: "window.clarity = (...args) => {};" }); });
  return counts;
}
test.afterEach(async ({ page }) => page.unrouteAll({ behavior: "ignoreErrors" }));

test("one consent gates both vendors and private navigation unloads both", async ({ page, request }) => {
  const counts = await fixture(page, request, true);
  await page.goto("https://www.shaunmathiasz.com/?gtm_debug=1");
  await expect(page.getByRole("heading", { name: "Optional analytics." })).toBeVisible();
  expect(counts).toEqual({ google: 0, clarity: 0 });
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(() => counts.google).toBe(1);
  await expect.poll(() => counts.clarity).toBe(1);
  const commands = await page.evaluate(() => window.dataLayer?.filter((entry) => (entry as ArrayLike<unknown>)[0] === "consent").map((entry) => Array.from(entry as ArrayLike<unknown>)));
  expect(commands?.[0]).toMatchObject(["consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }]);
  await page.locator('.hero a[href="/about"]').first().click();
  await expect(page).toHaveURL(/\/about$/);
  const events = await page.evaluate(() => window.dataLayer?.filter((entry) => (entry as { event?: string }).event === "portfolio_page_view"));
  expect(events).toHaveLength(2);
  expect(counts.google).toBe(1);
  await page.locator('footer a[href="/request-cv"]').click();
  await expect(page.getByRole("heading", { name: "REQUEST MY CV", exact: true })).toBeVisible();
  expect(await page.evaluate(() => !!window.__sdmGtmStarted || !!window.clarity)).toBe(false);
  expect(counts).toEqual({ google: 1, clarity: 1 });
});

test("old Clarity-only consent does not grant Google consent; withdrawal reloads untracked", async ({ page, request }) => {
  const counts = await fixture(page, request, true);
  await page.addInitScript(() => localStorage.setItem("sdm-analytics-consent-v1", JSON.stringify({ version: 1, choice: "accepted", at: Date.now() })));
  await page.goto("https://www.shaunmathiasz.com/");
  await expect(page.getByRole("heading", { name: "Optional analytics." })).toBeVisible();
  expect(counts.google).toBe(0);
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(() => counts.google).toBe(1);
  await page.getByRole("button", { name: "Analytics preferences", exact: true }).click();
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect.poll(() => page.evaluate(() => !!window.__sdmGtmStarted)).toBe(false);
  expect(counts.google).toBe(1);
});

test("actual unreviewed configuration cannot bootstrap GTM after consent", async ({ page, request }) => {
  const counts = await fixture(page, request, false);
  await page.goto("https://www.shaunmathiasz.com/");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(() => counts.clarity).toBe(1);
  expect(counts.google).toBe(0);
  expect(await page.evaluate(() => !!window.dataLayer)).toBe(false);
});

test("a pending idle bootstrap cannot follow an imperative transition into private content", async ({ page, request }) => {
  const counts = await fixture(page, request, true);
  await page.addInitScript(() => {
    window.requestIdleCallback = () => 1;
    window.cancelIdleCallback = () => {};
  });
  await page.goto("https://www.shaunmathiasz.com/");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await page.waitForFunction(() => window.__sdmGtmScheduled === true);
  expect(counts).toEqual({ google: 0, clarity: 0 });
  await page.evaluate(() => {
    (window as Window & { safetyMarker?: boolean }).safetyMarker = true;
    history.pushState({}, "", "/request-cv");
  });
  await expect(page.getByRole("heading", { name: "REQUEST MY CV", exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { safetyMarker?: boolean }).safetyMarker)).toBeUndefined();
  expect(counts).toEqual({ google: 0, clarity: 0 });
});
