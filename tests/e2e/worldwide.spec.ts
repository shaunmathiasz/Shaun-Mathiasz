import { test, expect } from "@playwright/test";
async function begin(page: import("@playwright/test").Page) {
  await page.goto("/play");
  await page.getByRole("button", { name: "START YOUR EMPIRE" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to next?" }),
  ).toBeVisible();
}
test("WORLDWIDE is accessible from About and mobile navigation preserves contact", async ({
  page,
  isMobile,
}) => {
  await page.goto("/about");
  await page.getByRole("link", { name: "Play Game", exact: true }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(
    page.getByRole("heading", { name: "WORLDWIDE", exact: true }),
  ).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Contact" }),
    ).toBeVisible();
  }
});
test("complete five rounds, reconcile cash, share, save best and restart", async ({
  page,
}) => {
  test.setTimeout(60000);
  await begin(page);
  let capital = 10000;
  for (let round = 1; round <= 5; round++) {
    await page
      .getByRole("button", { name: "London", exact: false })
      .filter({ hasText: "LHR" })
      .first()
      .click();
    await page.getByRole("radio", { name: /Boutique character/ }).check();
    await page.getByRole("radio", { name: /Considered balance/ }).check();
    await page.getByRole("button", { name: "Launch this product" }).click();
    await expect(
      page.getByRole("heading", { name: "Expect the unexpected." }),
    ).toBeFocused();
    await page.locator(".ww-event-options>button").first().click();
    await expect(
      page.getByRole("heading", { name: "The departure, settled." }),
    ).toBeVisible();
    const r = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("shaun-worldwide-v1")!);
      return { turns: s.turns.length, pending: s.pending };
    });
    expect(r.turns).toBe(round);
    expect(r.pending).toBeNull();
    const rows = page.locator(".ww-statement .ww-ledger>div");
    const net = await rows
      .filter({ hasText: "Net profit / cash movement" })
      .locator("dd")
      .innerText();
    capital += Number(net.replace(/[^\d.-]/g, ""));
    const after = await rows
      .filter({ hasText: "Capital after settlement" })
      .locator("dd")
      .innerText();
    expect(Number(after.replace(/[^\d.-]/g, ""))).toBe(capital);
    await page
      .getByRole("button", {
        name: round === 5 ? "See your legacy" : "Plan the next departure",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Your world. Your legacy." }),
  ).toBeVisible();
  await expect(page.locator(".ww-score")).toContainText("/ 1,000");
  await expect
    .poll(() =>
      page.evaluate(() => !!localStorage.getItem("shaun-worldwide-best-v1")),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Copy results" }).click();
  await expect(page.locator(".ww-share-status")).not.toBeEmpty();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download results card" }).click();
  expect((await download).suggestedFilename()).toBe("worldwide-results.png");
  await page.reload();
  await page.getByRole("button", { name: "View saved results" }).click();
  await expect(page.locator(".ww-score")).toBeVisible();
  await page.getByRole("button", { name: "Build another empire" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to next?" }),
  ).toBeVisible();
  await expect(page.locator(".ww-stats")).toContainText("£10,000");
  expect(
    await page.evaluate(
      () => !!localStorage.getItem("shaun-worldwide-best-v1"),
    ),
  ).toBe(true);
});
test("pending event resumes and locked choices remain unchanged", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("radio", { name: /Luxury retreat/ }).check();
  await page.getByRole("button", { name: "Launch this product" }).click();
  const title = await page.locator(".ww-event h2").innerText();
  await page.reload();
  await page.getByRole("button", { name: "Resume round 1" }).click();
  await expect(page.locator(".ww-event h2")).toHaveText(title);
  await page.getByText("Your locked product", { exact: true }).click();
  await expect(page.locator(".ww-event")).toContainText("Luxury retreat");
  await page.locator(".ww-event-options>button").last().click();
  await expect(
    page.getByRole("heading", { name: "The departure, settled." }),
  ).toBeVisible();
});
test("storage errors, keyboard choices, reduced motion and 2D map remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw Error("Storage blocked");
    };
  });
  await page.goto("/play");
  await page.getByRole("button", { name: "Use 2D map" }).click();
  await page.getByRole("button", { name: "Select Tokyo on map" }).click();
  await expect(
    page.getByRole("button", { name: "Select Tokyo on map" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "START YOUR EMPIRE" }).click();
  await page.getByRole("radio", { name: /Accessible value/ }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("radio", { name: /Accessible value/ }),
  ).toBeChecked();
  await expect(page.getByRole("status")).toContainText("could not be saved");
  await page.getByRole("button", { name: "Launch this product" }).click();
  await page.locator(".ww-event-options>button").first().click();
  await expect(
    page.getByRole("heading", { name: "The departure, settled." }),
  ).toBeVisible();
});
test("corrupt saves fail safely and reset is explicit", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("shaun-worldwide-v1", "{broken"),
  );
  await page.goto("/play");
  await expect(
    page.getByRole("status").filter({ hasText: "could not be restored" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "START YOUR EMPIRE" }).click();
  await page.getByRole("button", { name: "Restart journey" }).click();
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to next?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restart journey" }).click();
  await page.getByRole("button", { name: "Yes, start a new empire" }).click();
  await expect(page.locator(".ww-stats")).toContainText("£10,000");
});
test("intro, decisions, event and results fit mobile tablet and desktop", async ({
  page,
}) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto("/play");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "START YOUR EMPIRE" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Launch this product" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".ww-event-options>button").first().click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("unavailable WebGL falls back automatically without blocking play", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/play");
  await expect(page.locator(".ww-earth-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Select London on map" }).click();
  await expect(
    page.getByRole("button", { name: "Select London on map" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "START YOUR EMPIRE" }).click();
  await expect(
    page.getByRole("heading", { name: "Where to next?" }),
  ).toBeVisible();
});
