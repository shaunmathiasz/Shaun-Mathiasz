import { test, expect, type Page } from "@playwright/test";
import { PREVIEW_TIMEOUT_MS } from "../../src/lib/social-embed";
const url = "https://www.tiktok.com/**";
const good = `<html><body style="margin:0">Working profile<script>parent.postMessage(JSON.stringify({signalSource:window.name,height:1040}),'*');</script></body></html>`;
async function card(page: Page) {
  await page.goto("/contact");
  return page.locator(".social-page-card").filter({
    has: page.getByRole("heading", { name: "TikTok", exact: true }),
  });
}
test("a protected HTTP-200 preview stays hidden, then shows themed recovery and can retry", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  let attempts = 0;
  await page.route(url, (route) =>
    route.fulfill({
      contentType: "text/html",
      body:
        ++attempts === 1
          ? "<html><body>Overload protected</body></html>"
          : good,
    }),
  );
  const panel = await card(page);
  await panel.getByRole("button", { name: "Load TikTok preview" }).click();
  await expect(panel.locator("iframe")).toHaveAttribute("aria-hidden", "true");
  await expect(panel.locator("iframe")).not.toBeVisible();
  await expect(
    panel.frameLocator("iframe").getByText("Overload protected"),
  ).toHaveCount(1);
  await page.clock.runFor(PREVIEW_TIMEOUT_MS + 100);
  await expect(
    panel.getByRole("heading", { name: "A short pause in the journey." }),
  ).toBeVisible();
  await expect(panel.locator("iframe")).toHaveCount(0);
  await expect(
    panel.getByRole("link", { name: "Open TikTok", exact: false }).first(),
  ).toHaveAttribute("href", "https://www.tiktok.com/@shaunmathiasz");
  await panel.getByRole("button", { name: "Try TikTok again" }).click();
  await expect(panel.locator("iframe")).toHaveAttribute("data-ready", "true");
  await expect(panel.locator("iframe")).toBeVisible();
  expect(attempts).toBe(2);
});
test("messages from the wrong origin or frame cannot reveal a failed preview", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(url, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><body>Unavailable</body></html>",
    }),
  );
  const panel = await card(page);
  await panel.getByRole("button", { name: "Load TikTok preview" }).click();
  await panel.locator("iframe").evaluate((frame: HTMLIFrameElement) => {
    const data = JSON.stringify({ signalSource: frame.name, height: 800 });
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.tiktok.com",
        source: window,
        data,
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://not-tiktok.example",
        source: frame.contentWindow,
        data,
      }),
    );
  });
  await expect(panel.locator("iframe")).toHaveAttribute("data-ready", "false");
  await expect(panel.locator("iframe")).not.toBeVisible();
  await panel.getByRole("button", { name: "Preview not working?" }).click();
  await expect(
    panel.getByRole("button", { name: "Try TikTok again" }),
  ).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "A short pause in the journey." }),
  ).toBeFocused();
});
test("working previews resize after load and offer manual recovery for later provider errors", async ({
  page,
}) => {
  await page.route(url, (route) =>
    route.fulfill({ contentType: "text/html", body: good }),
  );
  const panel = await card(page);
  await panel.getByRole("button", { name: "Load TikTok preview" }).click();
  await expect(panel.locator("iframe")).toHaveAttribute("data-ready", "true");
  const frame = panel.locator("iframe");
  await frame.evaluate((el: HTMLIFrameElement) =>
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.tiktok.com",
        source: el.contentWindow,
        data: JSON.stringify({ signalSource: el.name, height: 1380 }),
      }),
    ),
  );
  await expect
    .poll(() =>
      panel
        .locator(".provider-shell")
        .evaluate((el) => el.getBoundingClientRect().height),
    )
    .toBeGreaterThan(1200);
  await page.setViewportSize({ width: 360, height: 900 });
  await expect
    .poll(() =>
      panel
        .locator(".provider-shell")
        .evaluate(
          (el) =>
            el.querySelector("iframe")!.getBoundingClientRect().width -
            el.getBoundingClientRect().width,
        ),
    )
    .toBeLessThanOrEqual(1);
  await panel.getByRole("button", { name: "Preview not working?" }).click();
  await expect(panel.locator("iframe")).toHaveCount(0);
  await expect(
    panel.getByRole("heading", { name: "A short pause in the journey." }),
  ).toBeVisible();
  await panel.getByRole("button", { name: "Close preview" }).click();
  await expect(
    panel.getByRole("button", { name: "Load TikTok preview" }),
  ).toBeVisible();
});
