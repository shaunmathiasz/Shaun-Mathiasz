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
    await expect(page).toHaveTitle(/Shaun Denver Mathiasz/);
  }
});
test("portfolio filters and details", async ({ page }) => {
  await page.goto("/portfolio");
  await page.getByRole("button", { name: "Hospitality", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.locator(".project-card").click();
  await expect(
    page.getByRole("heading", { name: "Professional application" }),
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
test("contact offers real alternatives without a nonfunctional form", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Email Me" }),
  ).toHaveAttribute("href", "mailto:shaun.emirates@gmail.com");
  await expect(
    page.getByRole("button", { name: "Copy Email Address" }),
  ).toBeVisible();
  await expect(page.locator("form")).toHaveCount(0);
});
test("globe keyboard controls and UK context", async ({ page }) => {
  await page.goto("/");
  await page.locator(".borders").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /United Kingdom/ }).click();
  await expect(page.locator(".place-description")).toContainText(
    "not UK residence",
  );
  await page.getByRole("button", { name: "Rotate globe east" }).click();
  await expect(
    page.locator(".place-tabs button[aria-pressed=true]"),
  ).toContainText("United Kingdom");
});
test("builder responds to preferences", async ({ page }) => {
  await page.goto("/portfolio");
  await page
    .getByLabel("Destination", { exact: true })
    .selectOption("Sri Lanka");
  await expect(page.locator(".concept h3")).toContainText("Sri Lanka");
  await page.getByLabel("More destinations", { exact: true }).check();
  await expect(page.locator(".tradeoff")).toContainText("More stops");
});
test("career chapters unlock a stamp", async ({ page }) => {
  await page.goto("/experience");
  for (const detail of await page
    .locator(".journey-card details summary")
    .all())
    await detail.click();
  await expect(page.locator(".passport-reward")).toContainText(
    "JOURNEY EXPLORER",
  );
});
test("published article and 404", async ({ page }) => {
  await page.goto("/insights/a-considered-travel-product");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /^index, follow$/,
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
test("reduced motion hydrates without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".borders").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Reduced motion" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /United Kingdom/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".place-description")).toContainText(
    "not UK residence",
  );
  expect(errors).toEqual([]);
});
test("core headline and CV request link are available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto((baseURL || "http://127.0.0.1:3000") + "/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".nav-cv")).toHaveAttribute(
      "href",
      "/request-cv",
    );
  } finally {
    await context.close();
  }
});
test("education filters retain precise qualification distinctions", async ({
  page,
}) => {
  await page.goto("/education");
  await page
    .getByRole("button", { name: "Executive Education", exact: true })
    .click();
  await expect(page.locator(".credential-card")).toHaveCount(2);
  await expect(
    page.getByText("Leadership Problem-Solving with AI: Think Like a Leader", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Memberships", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Student Affiliate", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Certifications", exact: true })
    .click();
  await expect(page.getByText("WRX283G24BMZ", { exact: false })).toBeAttached();
});
test("full name and organisation showcase are readable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-identity")).toContainText(
    "Shaun Denver Mathiasz",
  );
  await expect(page.locator(".brand-card")).toHaveCount(10);
  await page.locator(".brand-card summary").first().click();
  await expect(page.locator(".brand-card").first()).toContainText(
    "Current employer group",
  );
});

test("motion can be paused and remains paused after navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pause visual effects" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(
    page.getByRole("button", { name: "Visual effects paused" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/portfolio");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.getByRole("button", { name: "Visual effects paused" }).click();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-motion",
    "reduced",
  );
});

test("copy email reports success and honest clipboard fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Copy Email Address" }).click();
  await expect(page.getByRole("status")).toHaveText("Email address copied.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe("shaun.emirates@gmail.com");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  await page.getByRole("button", { name: "Copy Email Address" }).click();
  await expect(page.getByRole("status")).toContainText("Copy unavailable");
});

test("intro is session scoped and absent with reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem("shaun-intro-v4")))
    .toBe("seen");
  await page.reload();
  await expect(page.locator(".identity-intro")).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem("shaun-intro-v4"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".identity-intro")).toHaveCount(0);
  await expect(page.locator("h1")).toBeVisible();
});

test("globe panels and builder imagery match selected geography", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".borders").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Maldives/ }).click();
  await expect(page.locator(".place-image img")).toHaveAttribute(
    "alt",
    /Maldives/,
  );
  await page.getByRole("button", { name: /United Kingdom/ }).click();
  await expect(page.locator(".place-image img")).toHaveAttribute(
    "alt",
    /Market context/,
  );
  await page.goto("/portfolio");
  await page
    .getByLabel("Destination", { exact: true })
    .selectOption("Sri Lanka");
  await expect(page.locator(".concept-image img")).toHaveAttribute(
    "alt",
    /Sri Lanka/,
  );
  await page.getByRole("button", { name: "Reset the brief" }).click();
  await expect(page.getByLabel("Destination", { exact: true })).toHaveValue(
    "Maldives",
  );
});

test("descendant navigation and mobile Escape focus remain usable", async ({
  page,
  isMobile,
}) => {
  await page.goto("/portfolio/luxury-hospitality");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator(".mobile-nav a[aria-current=page]")).toHaveText(
      /Portfolio/,
    );
    await page.locator(".mobile-nav a").first().focus();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.locator(".mobile-nav")).toHaveCount(0);
  } else {
    await expect(page.locator(".desktop-nav a[aria-current=page]")).toHaveText(
      "Portfolio",
    );
  }
});

test("article copy action reports the actual link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.goto("/insights/a-considered-travel-product");
  await page.getByRole("button", { name: "Share / copy link" }).click();
  await expect(page.getByRole("status")).toHaveText("Article link copied.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(page.url());
});

test("cursor stays optional and clears its context when scrolling", async ({
  page,
  isMobile,
}) => {
  await page.goto("/portfolio");
  if (isMobile) {
    await expect(page.locator(".cursor-companion")).toBeHidden();
  } else {
    await page.locator(".project-card").first().hover();
    await expect(page.locator(".cursor-companion")).toHaveText("VIEW");
    await page.mouse.wheel(0, 600);
    await expect(page.locator(".cursor-companion")).toHaveAttribute(
      "data-visible",
      "false",
    );
    await page.mouse.move(1279, 450);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("certification gallery uses issuer logos and filters without changing records", async ({
  page,
}) => {
  await page.goto("/education");
  await page
    .getByRole("button", { name: "Certifications", exact: true })
    .click();
  await expect(
    page.locator(".certification-gallery .credential-card"),
  ).toHaveCount(15);
  await expect(
    page.locator(".certification-gallery .organisation-logo img"),
  ).toHaveCount(15);
  await page
    .getByLabel("Explore by institution")
    .selectOption("University of London");
  await expect(
    page.locator(".certification-gallery .credential-card"),
  ).toHaveCount(2);
  await expect(
    page.locator(".certification-gallery img").first(),
  ).toHaveAttribute("alt", "University of London official logo");
  await page.getByLabel("Explore by institution").selectOption("Amadeus");
  await expect(
    page.locator(".certification-gallery .credential-card"),
  ).toHaveCount(4);
});

test("travel game supports matching, reset and keyboard dismissal", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/portfolio");
  await page.getByRole("button", { name: "Play destination pairs" }).click();
  const cards = page.locator(".destination-card");
  await expect(cards).toHaveCount(12);
  const locations = new Map<string, number[]>();
  for (let i = 0; i < 12; i += 2) {
    for (const j of [i, i + 1]) {
      await cards.nth(j).click();
      const city = await cards.nth(j).locator("strong").innerText();
      locations.set(city, [...(locations.get(city) || []), j]);
    }
    await page.clock.runFor(900);
  }
  for (const indexes of locations.values()) {
    if (
      !(await cards.nth(indexes[0]).getAttribute("aria-label"))?.includes(
        "matched",
      )
    ) {
      await cards.nth(indexes[0]).click();
      await cards.nth(indexes[1]).click();
      await page.clock.runFor(900);
    }
  }
  await expect(page.locator(".game-message")).toContainText(
    "All six destinations connected",
  );
  await page.getByRole("button", { name: "New journey" }).click();
  await expect(page.locator(".pair-found")).toHaveCount(0);
  await cards.first().focus();
  await page.keyboard.press("Escape");
  await expect(cards).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Play destination pairs" }),
  ).toBeFocused();
});

test("social profiles link to real supplied accounts", async ({ page }) => {
  await page.goto("/contact");
  for (const [name, url] of [
    ["Instagram", "https://www.instagram.com/shaun.mathiasz/"],
    ["TikTok", "https://www.tiktok.com/@shaunmathiasz"],
    ["Facebook", "https://www.facebook.com/ShaunMathiasz/"],
    ["LinkedIn", "https://www.linkedin.com/in/shaun-denver/"],
  ]) {
    const card = page.locator(".social-profile").filter({ hasText: name });
    await card.locator("summary").click();
    await expect(
      card.getByRole("link", { name: "Open on " + name }),
    ).toHaveAttribute("href", url);
  }
});

test("digital presence preserves approved figures and rolls once into view", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator(".digital-presence");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".digital-platform-card")).toHaveCount(4);
  for (const value of [
    "3,521",
    "7,161",
    "Approximately 120K",
    "Approximately 2.7K",
    "Approximately 8.5K",
    "Approximately 2K",
    "500+",
    "Approximately 15.4K",
  ])
    await expect(
      section.locator(".sr-only").filter({ hasText: value }),
    ).toBeAttached();
  await expect(section).toContainText(
    "Combined platform followers, not unique individuals. Figures as of November 2026.",
  );
  const digit = section.locator(".rolling-strip").first();
  await expect
    .poll(
      async () => await digit.evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe("none");
  await page.waitForTimeout(2700);
  const settled = await digit.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.wheel(0, -1500);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  expect(await digit.evaluate((el) => getComputedStyle(el).transform)).toBe(
    settled,
  );
  for (const name of ["TikTok", "Instagram", "Facebook", "LinkedIn"])
    await expect(
      section.getByRole("link", { name: "Visit " + name }),
    ).toHaveAttribute("href", /^https:/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".rolling-static").first()).toBeVisible();
  await expect(section.locator(".rolling-static").first()).toHaveText("3,521");
  await expect(section.locator(".rolling-number").first()).toBeHidden();
});

test("Instagram and TikTok page previews load on request, size to content and retain profile links", async ({
  page,
}) => {
  await page.route("https://www.instagram.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<html><body style="margin:0">Instagram preview<script>parent.postMessage(JSON.stringify({type:'MOUNTED',details:{height:920}}),'*');</script></body></html>`,
    }),
  );
  await page.route("https://www.tiktok.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<html><body style="margin:0">TikTok preview<script>parent.postMessage(JSON.stringify({signalSource:window.name,height:880}),'*');</script></body></html>`,
    }),
  );
  await page.goto("/contact");
  const section = page.locator(".social-page-previews");
  await expect(section.locator("iframe")).toHaveCount(0);
  for (const [platform, url, height] of [
    [
      "Instagram",
      "https://www.instagram.com/shaun.mathiasz/embed/?cr=1&v=14",
      920,
    ],
    ["TikTok", "https://www.tiktok.com/embed/@shaunmathiasz", 880],
  ] as const) {
    const card = section.locator(".social-page-card").filter({
      has: page.getByRole("heading", { name: platform, exact: true }),
    });
    await card
      .getByRole("button", { name: "Load " + platform + " preview" })
      .click();
    const frame = card.getByTitle(platform + " page preview", { exact: false });
    await expect(frame).toHaveAttribute("src", url);
    await expect(frame).toHaveAttribute("data-ready", "true");
    await expect(frame).toBeVisible();
    const measurements = await card
      .locator(".provider-shell")
      .evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        width: el.clientWidth,
        frameWidth: el.querySelector("iframe")!.getBoundingClientRect().width,
      }));
    expect(measurements.frameWidth).toBeLessThanOrEqual(measurements.width + 1);
    expect(measurements.height).toBeLessThanOrEqual(height + 1);
    expect(measurements.height).toBeGreaterThan(700);
    await expect(
      card.getByRole("link", { name: "Open " + platform + " page" }),
    ).toHaveAttribute("href", /^https:/);
    await card.getByRole("button", { name: "Close preview" }).click();
  }
  await expect(section.locator("iframe")).toHaveCount(0);
});
