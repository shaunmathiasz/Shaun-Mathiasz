import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { gtmBootstrap } from "@/lib/gtm-bootstrap";
import { REVIEWED_GTM_CONTAINER_ID } from "@/config/analytics";

describe("GTM privacy bootstrap", () => {
  it("keeps the currently unreviewed container disabled", () => {
    expect(REVIEWED_GTM_CONTAINER_ID).toBe("");
  });
  it("sets denied defaults before allowing analytics, never advertising", () => {
    const scripts: { src?: string }[] = [];
    const w: { dataLayer?: unknown[]; __sdmGtmStarted?: boolean; __sdmCanStartGtm: () => boolean; location: { origin: string; pathname: string } } = { __sdmCanStartGtm: () => true, location: { origin: "https://www.shaunmathiasz.com", pathname: "/" } };
    const d = { querySelector: () => null, createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: (script: { src: string }) => scripts.push(script) } }] };
    runInNewContext(gtmBootstrap("GTM-NL6G25PJ"), { window: w, document: d });
    const queue = w.dataLayer as Array<ArrayLike<unknown>>;
    const defaults = Array.from(queue[0]);
    expect(defaults.slice(0, 2)).toEqual(["consent", "default"]);
    expect(defaults[2]).toMatchObject({ analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    expect(Array.from(queue[3])[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    expect(scripts.map((script) => script.src)).toEqual(["https://www.googletagmanager.com/gtm.js?id=GTM-NL6G25PJ"]);
    runInNewContext(gtmBootstrap("GTM-NL6G25PJ"), { window: w, document: d });
    expect(scripts).toHaveLength(1);
  });
  it("cannot execute a deferred bootstrap after consent or route permission is gone", () => {
    const w = { __sdmCanStartGtm: () => false };
    runInNewContext(gtmBootstrap("GTM-NL6G25PJ"), { window: w, document: {} });
    expect("dataLayer" in w).toBe(false);
    expect("__sdmGtmStarted" in w).toBe(false);
  });
  it("rejects script injection and invalid IDs", () => {
    expect(() => gtmBootstrap('GTM-</script>')).toThrow();
    expect(() => gtmBootstrap("")).toThrow();
  });
});
