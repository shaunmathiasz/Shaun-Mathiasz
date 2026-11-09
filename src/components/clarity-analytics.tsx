"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_CONSENT_KEY, analyticsReferrerAllowed, analyticsUrlAllowed, isAnalyticsPublicPath, readAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics-policy";
import "./clarity-analytics.css";
import { GoogleTagManager, updateGoogleConsent } from "@/components/google-tag-manager";

type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window { clarity?: Clarity; __sdmClarityStarted?: boolean; __sdmAnalyticsConsent?: Record<string, string>; }
}
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const serverConsent = () => null;
function consentSnapshot(key: string) {
  if (window.__sdmAnalyticsConsent?.[key] !== undefined) return window.__sdmAnalyticsConsent[key];
  try { return localStorage.getItem(key); } catch { return null; }
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
  updateGoogleConsent(false);
}
function eraseClarityCookies() {
  for (const name of ["_clck", "_clsk", "_ga", "_ga_BGFVMTBRVP", "_gid"]) {
    for (const domain of ["", "; domain=www.shaunmathiasz.com", "; domain=shaunmathiasz.com"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; Secure; SameSite=Lax${domain}`;
    }
  }
}

/** A fresh document prevents public recording from following visitors into private workflows. */
export function ClarityAnalytics({ children, production, projectId, gtmId = "", gtmApproved = false }: {
  children: React.ReactNode; production: boolean; projectId: string; gtmId?: string; gtmApproved?: boolean;
}) {
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const googleEnabled = gtmApproved && /^GTM-[A-Z0-9]+$/.test(gtmId);
  const consentKey = googleEnabled ? "sdm-analytics-consent-v2" : ANALYTICS_CONSENT_KEY;
  const rawConsent = useSyncExternalStore(subscribeConsent, () => consentSnapshot(consentKey), serverConsent);
  const choice = readAnalyticsConsent(rawConsent);
  const [open, setOpen] = useState(false);
  const region = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const clarityEnabled = /^[a-z0-9]{6,20}$/.test(projectId);
  const configured = production && (clarityEnabled || googleEnabled);
  const publicPath = isAnalyticsPublicPath(pathname);
  const mustReload = typeof window !== "undefined" && !!(window.__sdmClarityStarted || window.__sdmGtmStarted || window.__sdmGtmScheduled) && !publicPath;
  const publicEligible = ready && configured && publicPath && analyticsUrlAllowed(new URL(window.location.href));
  const eligible = publicEligible && analyticsReferrerAllowed(document.referrer);

  useEffect(() => {
    if (!publicEligible || choice !== "accepted" || privacySignal()) return;
    // Never give a vendor an unsafe document.referrer. Start a clean document
    // instead; consent survives, while private paths/query strings do not.
    const key = "sdm-analytics-referrer-reset";
    try {
      if (analyticsReferrerAllowed(document.referrer)) { sessionStorage.removeItem(key); return; }
      if (sessionStorage.getItem(key) === location.pathname) return; // Fail closed on unsupported browsers.
      sessionStorage.setItem(key, location.pathname);
    } catch { return; } // No persistent loop guard: keep tracking off.
    const link = document.createElement("a");
    link.href = location.href;
    link.referrerPolicy = "no-referrer";
    link.rel = "noreferrer";
    link.click();
  }, [publicEligible, choice]);

  useEffect(() => {
    if (ready && choice !== "accepted" && (window.__sdmClarityStarted || window.__sdmGtmStarted || window.__sdmGtmScheduled)) {
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
      if (window.__sdmGtmStarted && isAnalyticsPublicPath(location.pathname) && isAnalyticsPublicPath(url.pathname) && !url.search) {
        const action = url.pathname === "/about" ? "about" : url.pathname === "/play" ? "play" : url.pathname.startsWith("/portfolio") ? "portfolio" : url.pathname.startsWith("/insights") ? "insights" : null;
        if (action) window.dataLayer?.push({ event: "portfolio_engagement", action, page_path: location.pathname });
      }
      if (crossing || ((window.__sdmClarityStarted || window.__sdmGtmStarted || window.__sdmGtmScheduled) && url.search)) {
        event.preventDefault(); event.stopImmediatePropagation(); stopRecording();
        location.assign(url.href);
      }
    };
    document.addEventListener("click", boundary, true);
    return () => document.removeEventListener("click", boundary, true);
  }, [configured]);

  useEffect(() => {
    if (!clarityEnabled || !eligible || choice !== "accepted" || privacySignal() || window.__sdmClarityStarted) return;
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
  }, [eligible, choice, projectId, clarityEnabled]);

  const show = () => { previousFocus.current = document.activeElement as HTMLElement; setOpen(true); };
  const decide = (next: AnalyticsConsent) => {
    const value = JSON.stringify({ version: 1, choice: next, at: Date.now() });
    try { localStorage.setItem(consentKey, value); } catch { (window.__sdmAnalyticsConsent ||= {})[consentKey] = value; }
    window.dispatchEvent(new Event("sdm:analytics-consent"));
    setOpen(false); previousFocus.current?.focus();
    if (next === "declined") {
      if (window.__sdmClarityStarted || window.__sdmGtmStarted || window.__sdmGtmScheduled) {
        window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
        stopRecording(); eraseClarityCookies(); location.reload();
      } else eraseClarityCookies();
    }
  };
  useEffect(() => { if (open) region.current?.focus(); }, [open]);

  return <Preferences.Provider value={publicEligible ? show : null}>
    {mustReload ? null : children}
    {eligible && choice === "accepted" && !privacySignal() && googleEnabled && <GoogleTagManager id={gtmId} canStart={() => googleEnabled && analyticsUrlAllowed(new URL(location.href)) && analyticsReferrerAllowed(document.referrer) && readAnalyticsConsent(consentSnapshot(consentKey)) === "accepted" && !privacySignal()} />}
    {publicEligible && (choice === null || open) && <section ref={region} tabIndex={-1} className="analytics-choice" aria-labelledby="analytics-title" data-clarity-mask="true">
      <div><p className="eyebrow">YOUR PRIVACY / YOUR CHOICE</p><h2 id="analytics-title">Optional analytics.</h2>
        <p>May I use {googleEnabled ? "Microsoft Clarity and Google Analytics via Google Tag Manager" : "Microsoft Clarity"} to understand how this public website is used? {googleEnabled ? "These services measure public page views and interactions; Clarity records masked page interactions." : "Clarity records masked page interactions."} They use analytics cookies. Analytics stays off the CV portal, admin area and contact page.</p>
        <details><summary>How analytics works</summary><p>{googleEnabled ? "Microsoft and Google receive public page and device information; Clarity receives masked interaction recordings" : "Clarity receives public page visits, device information and masked interaction recordings"}, and may infer an approximate region from network information. Analytics never requests GPS access. No recruiter details, form values, verification codes or precise location are passed to it. Advertising storage stays denied. Your choice is remembered for 180 days and can be withdrawn through Analytics preferences in the footer. Declining does not affect access to the website or CV.</p><a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft privacy statement</a>{googleEnabled && <> · <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google privacy policy</a></>}</details>
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
