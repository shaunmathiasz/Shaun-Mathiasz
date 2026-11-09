import { expect, test } from "@playwright/test";
import { ANALYTICS_CONSENT_KEY } from "../../src/lib/analytics-policy";

// Production-origin browser fixture backed by the local production build.
// The Microsoft script is a stub: these tests prove isolation, not Microsoft ingestion.
async function productionFixture(page: import("@playwright/test").Page, request: import("@playwright/test").APIRequestContext) {
  let tags = 0;
  await page.route("https://www.shaunmathiasz.com/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await request.fetch(`${process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3060"}${url.pathname}${url.search}`, { method: route.request().method(), headers: route.request().headers(), data: route.request().postDataBuffer() || undefined, maxRetries: route.request().method() === "GET" ? 2 : 0 });
    const contentType = response.headers()["content-type"] || "";
    const body = /text\/html|text\/x-component/.test(contentType) ? (await response.text()).replace(/gtmApproved.{0,8}true/g, (value) => value.replace(/true$/, "false")) : undefined;
    await route.fulfill({ response, ...(body === undefined ? {} : { body }) }).catch((error: Error) => { if (!error.message.includes("Route is already handled")) throw error; });
  });
  await page.route("https://www.clarity.ms/tag/**", async (route) => {
    tags++;
    await route.fulfill({ contentType: "application/javascript", body: "window.__clarityTestCommands = window.clarity.q || []; window.clarity = (...args) => window.__clarityTestCommands.push(args);" });
  });
  return () => tags;
}
test.afterEach(async ({ page }) => { await page.unrouteAll({ behavior: "ignoreErrors" }); });

async function accepted(page: import("@playwright/test").Page) {
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ version: 1, choice: "accepted", at: Date.now() })), { key: ANALYTICS_CONSENT_KEY });
}

test("consent gates the single bootstrap and private navigation creates a clean document", async ({ page, request }) => {
  const tags = await productionFixture(page, request);
  await page.goto("https://www.shaunmathiasz.com/");
  await expect(page.getByRole("heading", { name: "Optional analytics." })).toBeVisible();
  expect(tags()).toBe(0);
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(tags).toBe(1);
  expect(await page.evaluate(() => (window as Window & { __clarityTestCommands?: unknown[][] }).__clarityTestCommands?.[0])).toEqual(["consentv2", { ad_Storage: "denied", analytics_Storage: "granted" }]);
  await expect(page.locator("body")).toHaveAttribute("data-clarity-mask", "true");
  await page.evaluate(() => { (window as Window & { publicDocument?: boolean }).publicDocument = true; });
  await page.locator('.hero a[href="/about"]').first().click();
  await expect(page).toHaveURL(/\/about$/);
  expect(tags()).toBe(1);
  expect(await page.evaluate(() => (window as Window & { publicDocument?: boolean }).publicDocument)).toBe(true);
  await page.locator('footer a[href="/request-cv"]').click();
  await expect(page).toHaveURL(/\/request-cv$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "REQUEST MY CV", exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { publicDocument?: boolean }).publicDocument)).toBeUndefined();
  expect(tags()).toBe(1);
  expect(await page.locator("#microsoft-clarity").count()).toBe(0);
});

test("decline persists without loading Clarity; an existing grant can be withdrawn", async ({ page, request }) => {
  const tags = await productionFixture(page, request);
  await page.goto("https://www.shaunmathiasz.com/");
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await page.reload(); expect(tags()).toBe(0);
  await page.getByRole("button", { name: "Analytics preferences", exact: true }).click();
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(tags).toBe(1);
  await page.getByRole("button", { name: "Analytics preferences", exact: true }).click();
  await page.getByRole("button", { name: "Decline analytics", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__sdmClarityStarted || false)).toBe(false);
  expect(tags()).toBe(1);
});

test("private routes, contact, query strings and browser privacy signals never load the tag", async ({ page, request }) => {
  const tags = await productionFixture(page, request);
  await accepted(page);
  for (const path of ["/request-cv", "/request-cv/privacy", "/admin/login", "/contact", "/?email=never-record@example.test"]) {
    await page.goto(`https://www.shaunmathiasz.com${path}`);
    await expect(page.locator("#microsoft-clarity")).toHaveCount(0);
    expect(tags()).toBe(0);
  }
  await page.addInitScript(() => Object.defineProperty(navigator, "globalPrivacyControl", { value: true }));
  await page.goto("https://www.shaunmathiasz.com/");
  await expect(page.getByRole("button", { name: "Analytics preferences", exact: true })).toBeVisible();
  expect(tags()).toBe(0);
});
