import { test, expect } from "@playwright/test";
const intro = ".identity-intro";
test("first visit has a complete 3.2-second welcome, then stays dismissed", async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { start: 0, end: 0, phases: [] as string[] };
    Reflect.set(window, "__welcomeProbe", probe);
    new MutationObserver(() => {
      const panel = document.querySelector(".identity-intro");
      if (panel) {
        if (!probe.start) probe.start = performance.now();
        const phase = panel.getAttribute("data-phase") || "";
        if (probe.phases.at(-1) !== phase) probe.phases.push(phase);
      } else if (probe.start && !probe.end) probe.end = performance.now();
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-phase"] });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(intro)).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await expect(page.locator(intro)).toHaveCount(0, { timeout: 6000 });
  const probe = await page.evaluate(() => Reflect.get(window, "__welcomeProbe"));
  expect(probe.phases).toEqual(["reveal", "hold", "exit"]);
  expect(probe.end - probe.start).toBeGreaterThan(3050);
  expect(probe.end - probe.start).toBeLessThan(4200);
  await page.reload();
  await expect(page.locator("h1")).toContainText("Beyond");
  await page.waitForTimeout(300);
  await expect(page.locator(intro)).toHaveCount(0);
});
test("Skip and Escape are immediate, and page navigation never replays it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(intro)).toHaveCount(0);
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("link", { name: "My story", exact: true }).click();
  await expect(page).toHaveURL(/about/);
  await page.locator(".wordmark").click();
  await expect(page.locator("h1")).toContainText("Beyond");
  await expect(page.locator(intro)).toHaveCount(0);
});
test("Escape skips the first welcome", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(intro)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(intro)).toHaveCount(0);
});
test("reduced motion bypasses the welcome without hiding the hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(intro)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeVisible();
});
test("a slow first hydration still receives the welcome", async ({ page }) => {
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2100));
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(intro)).toBeVisible({ timeout: 15000 });
  expect(await page.evaluate(() => performance.now())).toBeGreaterThan(1800);
  await page.keyboard.press("Escape");
});
test("unavailable session storage does not freeze or replay the welcome on navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { value: {
      getItem() { throw new Error("Storage blocked"); },
      setItem() { throw new Error("Storage blocked"); },
    } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  await page.getByRole("link", { name: "My story", exact: true }).click();
  await page.locator(".wordmark").click();
  await expect(page.locator("h1")).toContainText("Beyond");
  await expect(page.locator(intro)).toHaveCount(0);
});
test("practice search gives meaningful results, an empty state and a keyboard-friendly reset", async ({ page }) => {
  await page.goto("/portfolio");
  const search = page.getByRole("searchbox", { name: "Find an area of practice" });
  await search.fill("reservations");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Commercial strategy", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Show all practice overviews" }).click();
  await expect(page.locator(".project-card")).toHaveCount(4);
  await expect(search).toBeFocused();
});
test("career chapter links keep the verified chronology easy to reach", async ({ page }) => {
  await page.goto("/experience");
  await page.getByRole("navigation", { name: "Career chapters" }).getByRole("link").first().click();
  await expect(page).toHaveURL(/#career-chapter-1$/);
  await expect(page.locator("#career-chapter-1")).toContainText("WOW Agent");
});
