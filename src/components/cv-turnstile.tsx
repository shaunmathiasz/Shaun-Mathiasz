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
}: {
  siteKey: string;
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  const el = useRef<HTMLDivElement>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let widget: string | undefined,
      stopped = false;
    function mount() {
      if (!stopped && el.current && window.turnstile) {
        widget = window.turnstile.render(el.current, {
          sitekey: siteKey,
          theme: "dark",
          size: el.current.clientWidth < 300 ? "compact" : "flexible",
          action: "cv-request",
          callback: (token: string) => {
            setFailed(false);
            onToken(token);
          },
          "expired-callback": () => onToken(""),
          "error-callback": () => {
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
  }, [siteKey, onToken, resetKey]);
  return (
    <div className="cv-security">
      <div ref={el} aria-label="Security verification" />
      {failed && (
        <p role="alert">
          The security check is unavailable. Please refresh or contact Shaun by
          email.
        </p>
      )}
    </div>
  );
}
