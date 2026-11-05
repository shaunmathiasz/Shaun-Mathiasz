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
test("core headline and CV are available without JavaScript", async ({
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
      "/documents/shaun-mathiasz-cv.pdf",
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
  ).toHaveCount(10);
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
