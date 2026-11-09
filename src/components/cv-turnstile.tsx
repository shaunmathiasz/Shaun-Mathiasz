"use client";
import { useEffect, useRef, useState } from "react";
type Widget = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Widget;
  }
}
export function CvTurnstile({
  siteKey,
  onToken,
  resetKey = 0,
  action = "cv-request",
}: {
  siteKey: string;
  onToken: (token: string) => void;
  resetKey?: number;
  action?: "cv-request" | "digital-enquiry";
}) {
  const el = useRef<HTMLDivElement>(null),
    [failed, setFailed] = useState(false),
    [errorCode, setErrorCode] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let widget: string | undefined,
      stopped = false;
    function mount() {
      if (!stopped && el.current && window.turnstile) {
        widget = window.turnstile.render(el.current, {
          sitekey: siteKey,
          theme: "dark",
          size: el.current.clientWidth < 300 ? "compact" : "flexible",
          action,
          callback: (token: string) => {
            setFailed(false);
            onToken(token);
          },
          "expired-callback": () => onToken(""),
          "error-callback": (code: string) => {
            setErrorCode(/^\d{6}$/.test(String(code)) ? String(code) : "");
            setFailed(true);
            onToken("");
          },
        });
      }
    }
    let script = document.getElementById(
      "cv-turnstile-script",
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "cv-turnstile-script";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.append(script);
    }
    const error = () => setFailed(true);
    script.addEventListener("load", mount);
    script.addEventListener("error", error);
    if (window.turnstile) mount();
    return () => {
      stopped = true;
      script?.removeEventListener("load", mount);
      script?.removeEventListener("error", error);
      if (widget) window.turnstile?.remove(widget);
    };
  }, [siteKey, onToken, resetKey, attempt, action]);
  return (
    <div className="cv-security">
      <div ref={el} aria-label="Security verification" />
      {failed && (
        <div role="alert">
          <p>
            The security check couldn’t load. Please try again or contact Shaun
            by email.{errorCode && ` Reference: ${errorCode}.`}
          </p>
          <button type="button" className="button button-secondary" onClick={() => {
            setFailed(false);
            setErrorCode("");
            if (!window.turnstile)
              document.getElementById("cv-turnstile-script")?.remove();
            onToken("");
            setAttempt((value) => value + 1);
          }}>Retry security check</button>
        </div>
      )}
    </div>
  );
}
