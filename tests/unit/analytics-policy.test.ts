import { describe, expect, it } from "vitest";
import { analyticsReferrerAllowed, analyticsUrlAllowed, isAnalyticsPublicPath, readAnalyticsConsent } from "@/lib/analytics-policy";
import { articles } from "@/content/articles";
import { projects } from "@/content/projects";

describe("Clarity privacy policy", () => {
  it("allows known public pages but fails closed for private, contact, API and unknown routes", () => {
    for (const path of ["/", "/about", ...projects.map((project) => `/portfolio/${project.slug}`), ...articles.filter((article) => article.status === "Published").map((article) => `/insights/${article.slug}`)]) expect(isAnalyticsPublicPath(path)).toBe(true);
    for (const path of ["/request-cv", "/request-cv/privacy", "/admin", "/admin/login", "/api/cv-verify", "/api/cv-download", "/documents/cv.pdf", "/contact", "/unknown"]) expect(isAnalyticsPublicPath(path)).toBe(false);
  });
  it("rejects Preview hosts, alternative origins, query strings and sensitive referrers", () => {
    expect(analyticsUrlAllowed(new URL("https://www.shaunmathiasz.com/"))).toBe(true);
    expect(analyticsUrlAllowed(new URL("https://www.shaunmathiasz.com/?gtm_debug=1794230000000"))).toBe(true);
    expect(analyticsUrlAllowed(new URL("https://www.shaunmathiasz.com/?gtm_debug=1&email=private@example.org"))).toBe(false);
    for (const url of ["https://cv-preview.shaunmathiasz.com/", "https://test.vercel.app/", "http://www.shaunmathiasz.com/", "https://www.shaunmathiasz.com/?email=private@example.org"]) expect(analyticsUrlAllowed(new URL(url))).toBe(false);
    expect(analyticsReferrerAllowed("https://www.shaunmathiasz.com/admin/login")).toBe(false);
    expect(analyticsReferrerAllowed("https://example.org/?email=private@example.org")).toBe(false);
    expect(analyticsReferrerAllowed("")).toBe(true);
  });
  it("treats malformed, expired and future-dated consent as no consent", () => {
    const at = Date.now();
    const raw = (choice: string, time = at) => JSON.stringify({ version: 1, choice, at: time });
    expect(readAnalyticsConsent(raw("accepted"), at)).toBe("accepted");
    expect(readAnalyticsConsent(raw("declined"), at)).toBe("declined");
    for (const value of [null, "invalid", raw("other"), raw("accepted", at + 1), raw("accepted", at - 180 * 86400000)]) expect(readAnalyticsConsent(value, at)).toBeNull();
  });
});
