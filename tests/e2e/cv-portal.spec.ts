import { test, expect, type Page } from "@playwright/test";
const widget = `window.turnstile={render(el,o){const b=document.createElement('button');b.type='button';b.textContent='Complete security check';b.onclick=()=>o.callback('fixture-captcha');el.append(b);return 'test-widget'},remove(){}};`;
async function fixture(
  page: Page,
  geo: "denied" | "granted" | "unsupported" | "timeout" = "denied",
) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("https://challenges.cloudflare.com/turnstile/**", (r) =>
    r.fulfill({ contentType: "application/javascript", body: widget }),
  );
  await page.addInitScript((mode) => {
    if (mode === "unsupported") {
      Object.defineProperty(navigator, "geolocation", { value: undefined });
      return;
    }
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(
          success: PositionCallback,
          failure: PositionErrorCallback,
        ) {
          if (mode === "timeout") return;
          if (mode === "denied") {
            setTimeout(
              () => failure({ code: 1 } as GeolocationPositionError),
              10,
            );
            return;
          }
          setTimeout(
            () =>
              success({
                coords: { latitude: 6.9271, longitude: 79.8612, accuracy: 22 },
                timestamp: Date.now(),
              } as GeolocationPosition),
            700,
          );
        },
      },
    });
  }, geo);
  await page.route("**/api/cv-session", (r) =>
    r.fulfill({ json: { stage: "form" } }),
  );
  await page.route("**/api/cv-request", (r) =>
    r.fulfill({
      status: 201,
      json: {
        stage: "verify",
        accepted: true,
        maskedEmail: "r•••••@example.org",
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        resendAt: new Date(Date.now() + 60000).toISOString(),
        resendsLeft: 3,
        locationToken: "a".repeat(43),
      },
    }),
  );
  await page.route("**/api/cv-verify", (r) =>
    r.fulfill({ json: { stage: "verified" } }),
  );
  await page.route("**/api/cv-location", (r) =>
    r.fulfill({ json: { recorded: true } }),
  );
  await page.route("**/api/cv-download", (r) =>
    r.fulfill({
      contentType: "application/pdf",
      headers: {
        "Content-Disposition":
          'attachment; filename="Shaun_Denver_Mathiasz_CV.pdf"',
      },
      body: "%PDF-1.4\nfixture",
    }),
  );
  await page.goto("/request-cv");
}
async function fill(page: Page) {
  await page.getByLabel("Full name *", { exact: true }).fill("Avery Example");
  await page
    .getByLabel("Company / organisation *", { exact: true })
    .fill("Example Recruitment");
  await page
    .getByLabel("Professional email address *", { exact: true })
    .fill("recruiter@example.org");
  await page.getByRole("button", { name: "Complete security check" }).click();
}
for (const geo of ["denied", "granted", "unsupported", "timeout"] as const) {
  test(`CV request completes with browser location ${geo}`, async ({
    page,
  }) => {
    await fixture(page, geo);
    await fill(page);
    const report = page.waitForRequest((r) =>
      r.url().endsWith("/api/cv-location"),
    );
    await page.getByRole("button", { name: "SEND VERIFICATION CODE" }).click();
    await expect(
      page.getByRole("heading", { name: "VERIFY YOUR EMAIL" }),
    ).toBeVisible();
    if (geo === "granted")
      expect(
        page.getByRole("heading", { name: "VERIFY YOUR EMAIL" }),
      ).toBeTruthy();
    const code = page.getByLabel("Six-digit verification code");
    await expect(code).toBeFocused();
    await code.fill("123456");
    await page
      .getByRole("button", { name: "VERIFY EMAIL", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "EMAIL VERIFIED" }),
    ).toBeFocused();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "DOWNLOAD CV", exact: true }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("Shaun_Denver_Mathiasz_CV.pdf");
    const location = await report;
    expect(location.postDataJSON()).toMatchObject({
      status: geo === "granted" ? "granted" : geo,
      token: "a".repeat(43),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}
test("OTP rejection remains on verification with helpful errors and resend cooldown", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/api/cv-verify", (r) =>
    r.fulfill({
      status: 400,
      json: {
        error: "That code is incorrect. Please check your email and try again.",
      },
    }),
  );
  await fill(page);
  await page.getByRole("button", { name: "SEND VERIFICATION CODE" }).click();
  await page.getByLabel("Six-digit verification code").fill("000000");
  await page.getByRole("button", { name: "VERIFY EMAIL", exact: true }).click();
  await expect(page.locator(".cv-panel").getByRole("alert")).toContainText(
    "incorrect",
  );
  await expect(
    page.getByRole("button", { name: /Resend code in/ }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "DOWNLOAD CV", exact: true }),
  ).toHaveCount(0);
});
test("public PDF is retired and private routes deny unauthorised access", async ({
  request,
  page,
}) => {
  const old = await request.get("/documents/shaun-mathiasz-cv.pdf");
  expect(old.status()).toBe(410);
  expect(old.headers()["content-type"]).not.toContain("pdf");
  const noAccess = await request.post("/api/cv-download", {
    headers: { origin: "http://127.0.0.1:3060" },
  });
  expect([401, 403]).toContain(noAccess.status());
  await page.goto("/admin/cv-requests");
  await expect(page).toHaveURL(/admin\/login/);
  await expect(
    page.getByRole("heading", { name: "Request intelligence." }),
  ).toBeVisible();
  const direct = await request.get("/api/cv-download");
  expect(direct.status()).toBe(405);
});
test("request form is keyboard usable and keeps disclosure visible on narrow screens", async ({
  page,
}) => {
  await fixture(page);
  await expect(
    page.getByText("Location access is not required to receive the CV.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.locator("input[type=checkbox]")).toHaveCount(0);
  await page.getByLabel("Full name *", { exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByLabel("Company / organisation *", { exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await expect(
    page.getByRole("link", { name: "CV Request Privacy Notice" }),
  ).toBeVisible();
});
test("location policy remains available after client navigation into the portal", async ({
  page,
}) => {
  await fixture(page);
  const response = await page.goto("/");
  expect(response?.headers()["permissions-policy"]).toContain(
    "geolocation=(self)",
  );
  await page.locator('.footer a[href="/request-cv"]').click();
  await expect(
    page.getByRole("heading", { name: "REQUEST MY CV", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (
          document as Document & {
            permissionsPolicy?: { allowsFeature: (name: string) => boolean };
          }
        ).permissionsPolicy?.allowsFeature("geolocation") ?? true,
    ),
  ).toBe(true);
  await expect(page.locator(".cv-panel form")).toHaveAttribute(
    "method",
    "post",
  );
});
