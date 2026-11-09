"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_CONSENT_KEY, analyticsReferrerAllowed, analyticsUrlAllowed, isAnalyticsPublicPath, readAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics-policy";
import "./clarity-analytics.css";

type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window { clarity?: Clarity; __sdmClarityStarted?: boolean; __sdmAnalyticsConsent?: string; }
}
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const serverConsent = () => null;
function consentSnapshot() {
  if (window.__sdmAnalyticsConsent !== undefined) return window.__sdmAnalyticsConsent;
  try { return localStorage.getItem(ANALYTICS_CONSENT_KEY); } catch { return null; }
}
function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sdm:analytics-consent", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("sdm:analytics-consent", callback); };
}
const Preferences = createContext<(() => void) | null>(null);
function privacySignal() {
  return navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}
function stopRecording() {
  if (window.__sdmClarityStarted) window.clarity?.("stop");
}
function eraseClarityCookies() {
  for (const name of ["_clck", "_clsk"]) {
    for (const domain of ["", "; domain=www.shaunmathiasz.com", "; domain=shaunmathiasz.com"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; Secure; SameSite=Lax${domain}`;
    }
  }
}

/** A fresh document prevents public recording from following visitors into private workflows. */
export function ClarityAnalytics({ children, production, projectId }: {
  children: React.ReactNode; production: boolean; projectId: string;
}) {
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const rawConsent = useSyncExternalStore(subscribeConsent, consentSnapshot, serverConsent);
  const choice = readAnalyticsConsent(rawConsent);
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const configured = production && /^[a-z0-9]{6,20}$/.test(projectId);
  const publicPath = isAnalyticsPublicPath(pathname);
  const mustReload = typeof window !== "undefined" && !!window.__sdmClarityStarted && !publicPath;
  const eligible = ready && configured && publicPath && analyticsUrlAllowed(new URL(window.location.href)) && analyticsReferrerAllowed(document.referrer);

  useEffect(() => {
    if (ready && choice !== "accepted" && window.__sdmClarityStarted) {
      stopRecording(); eraseClarityCookies(); location.reload();
    }
  }, [ready, choice]);

  useLayoutEffect(() => {
    if (mustReload) { stopRecording(); window.location.reload(); }
  }, [mustReload]);

  useEffect(() => {
    if (!configured) return;
    const boundary = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      const crossing = isAnalyticsPublicPath(location.pathname) !== isAnalyticsPublicPath(url.pathname);
      if (crossing || (window.__sdmClarityStarted && url.search)) {
        event.preventDefault(); event.stopImmediatePropagation(); stopRecording();
        location.assign(url.href);
      }
    };
    document.addEventListener("click", boundary, true);
    return () => document.removeEventListener("click", boundary, true);
  }, [configured]);

  useEffect(() => {
    if (!eligible || choice !== "accepted" || privacySignal() || window.__sdmClarityStarted) return;
    const start = () => {
      if (!analyticsUrlAllowed(new URL(location.href)) || window.__sdmClarityStarted) return;
      if (document.querySelector('script[src^="https://www.clarity.ms/tag/"]') || window.clarity) return;
      // Official queue/bootstrap pattern; no identify, custom tags or form events.
      const clarity: Clarity = (...args) => { (clarity.q ||= []).push(args); };
      window.clarity = clarity;
      clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
      window.__sdmClarityStarted = true;
      const script = document.createElement("script");
      script.id = "microsoft-clarity"; script.async = true; script.referrerPolicy = "no-referrer";
      script.src = `https://www.clarity.ms/tag/${projectId}`;
      document.head.appendChild(script);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 0); return () => clearTimeout(id);
  }, [eligible, choice, projectId]);

  const show = () => { previousFocus.current = document.activeElement as HTMLElement; setOpen(true); };
  const decide = (next: AnalyticsConsent) => {
    const value = JSON.stringify({ version: 1, choice: next, at: Date.now() });
    try { localStorage.setItem(ANALYTICS_CONSENT_KEY, value); } catch { window.__sdmAnalyticsConsent = value; }
    window.dispatchEvent(new Event("sdm:analytics-consent"));
    setOpen(false); previousFocus.current?.focus();
    if (next === "declined") {
      if (window.__sdmClarityStarted) {
        window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
        stopRecording(); eraseClarityCookies(); location.reload();
      } else eraseClarityCookies();
    }
  };
  useEffect(() => { if (open) region.current?.focus(); }, [open]);

  return <Preferences.Provider value={eligible ? show : null}>
    {mustReload ? null : children}
    {eligible && (choice === null || open) && <section ref={region} tabIndex={-1} className="analytics-choice" aria-labelledby="analytics-title" data-clarity-mask="true">
      <div><p className="eyebrow">YOUR PRIVACY / YOUR CHOICE</p><h2 id="analytics-title">Optional analytics.</h2>
        <p>May I use Microsoft Clarity to understand how this public website is used? It records masked page interactions and uses analytics cookies. It stays off the CV portal, admin area and contact page.</p>
        <details><summary>How analytics works</summary><p>Clarity receives public page visits, device information and masked interaction recordings, and may infer an approximate region from network information. Analytics never requests GPS access. No recruiter details, form values, verification codes or precise location are passed to it. Advertising storage stays denied. Your choice is remembered for 180 days and can be withdrawn through Analytics preferences in the footer. Declining does not affect access to the website or CV.</p><a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft privacy statement</a></details>
        {privacySignal() && <p>Your browser privacy signal is enabled. Analytics will stay off.</p>}
      </div>
      <div className="analytics-actions"><button type="button" onClick={() => decide("declined")}>Decline analytics</button><button type="button" disabled={privacySignal()} onClick={() => decide("accepted")}>Allow analytics</button>
        {open && choice !== null && <button type="button" onClick={() => { setOpen(false); previousFocus.current?.focus(); }}>Keep current choice</button>}
      </div>
    </section>}
  </Preferences.Provider>;
}
export function AnalyticsPreferences() {
  const open = useContext(Preferences);
  return open ? <button type="button" className="analytics-preferences" onClick={open}>Analytics preferences</button> : null;
}
