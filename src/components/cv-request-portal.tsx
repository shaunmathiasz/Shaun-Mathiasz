"use client";
import { LinkArrow } from "@/components/link-arrow";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Check, LockKeyhole, ArrowRight, Mail } from "lucide-react";
import {
  applicantSchema,
  requesterTypes,
  type LocationReport,
} from "@/lib/cv/schema";
import { CvTurnstile } from "./cv-turnstile";
type State = {
  stage: "form" | "verify" | "verified";
  maskedEmail?: string;
  expiresAt?: string;
  resendAt?: string;
  resendsLeft?: number;
  accepted?: boolean;
  locked?: boolean;
  grantsRemaining?: number;
};
async function request(url: string, body: unknown = {}, method = "POST") {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(method !== "GET" ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  const data = await r.json();
  return { ok: r.ok, status: r.status, data };
}
function position(): Promise<Omit<LocationReport, "token">> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ status: "unsupported" });
      return;
    }
    let done = false;
    const finish = (v: Omit<LocationReport, "token">) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(v);
      }
    };
    const timer = setTimeout(() => finish({ status: "timeout" }), 7000);
    try {
      navigator.geolocation.getCurrentPosition(
        (p) =>
          finish({
            status: "granted",
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            accuracy: p.coords.accuracy,
            timestamp: p.timestamp,
          }),
        (e) =>
          finish({
            status:
              e.code === 1
                ? "denied"
                : e.code === 3
                  ? "timeout"
                  : "unavailable",
          }),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 6500 },
      );
    } catch {
      finish({ status: "unavailable" });
    }
  });
}
export function CVRequestPortal({
  configured,
  siteKey,
}: {
  configured: boolean;
  siteKey: string;
}) {
  const [state, setState] = useState<State>({ stage: "form" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [fields, setFields] = useState<Record<string, string[]>>({}),
    [code, setCode] = useState(""),
    [captcha, setCaptcha] = useState(""),
    [resetKey, setResetKey] = useState(0),
    [now, setNow] = useState(() => Date.now()),
    [served, setServed] = useState(false),
    [needsRenew, setNeedsRenew] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null),
    otp = useRef<HTMLInputElement>(null),
    flow = useRef(0),
    denied = useRef(false);
  const onToken = useCallback((v: string) => setCaptcha(v), []);
  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    request("/api/cv-session", {}, "GET")
      .then((r) => {
        if (!cancelled && r.ok) setState(r.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [configured]);
  useEffect(() => {
    if (state.stage === "verify") {
      otp.current?.focus();
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }
    if (state.stage === "verified") heading.current?.focus();
  }, [state.stage]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !configured) return;
    const raw = {
      ...Object.fromEntries(new FormData(e.currentTarget)),
      turnstileToken: captcha,
    };
    const parsed = applicantSchema.safeParse(raw);
    if (!parsed.success) {
      setFields(parsed.error.flatten().fieldErrors);
      setError("Please check the highlighted fields.");
      return;
    }
    setFields({});
    setError("");
    setBusy(true);
    const current = ++flow.current;
    const location = denied.current
      ? Promise.resolve({ status: "denied" as const })
      : position();
    try {
      const r = await request("/api/cv-request", parsed.data);
      if (r.data.stage) {
        setState(r.data);
        setNow(Date.now());
      }
      if (r.data.locationToken) {
        void location.then(async (report) => {
          if (report.status === "denied") denied.current = true;
          if (flow.current !== current) return;
          try {
            await request("/api/cv-location", {
              ...report,
              token: r.data.locationToken,
            });
          } catch {
            /* Optional location does not affect verification. */
          }
        });
      }
      if (!r.ok) {
        setError(r.data.error);
        setFields(r.data.fields || {});
      }
      setCaptcha("");
      setResetKey((v) => v + 1);
    } catch {
      setError(
        "The request could not be confirmed. Please try again or contact Shaun by email.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/cv-verify", { code });
      if (!r.ok) {
        setError(r.data.error);
        if (r.data.fields?.code) setError("Enter the six-digit code.");
      } else {
        setState({ stage: "verified", grantsRemaining: 2 });
        setNeedsRenew(false);
      }
    } catch {
      setError("Verification is temporarily unavailable. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/cv-resend-code");
      if (r.ok) {
        setState(r.data);
        setNow(Date.now());
        setCode("");
        otp.current?.focus();
      } else setError(r.data.error);
    } catch {
      setError("The code could not be requested. Please retry later.");
    } finally {
      setBusy(false);
    }
  }
  async function change() {
    setBusy(true);
    try {
      const r = await request("/api/cv-session", {}, "DELETE");
      if (!r.ok) {
        setError(r.data.error);
        return;
      }
      flow.current++;
      setState({ stage: "form" });
      setCode("");
      setError("");
      setCaptcha("");
      setResetKey((v) => v + 1);
    } catch {
      setError("Please retry changing your email.");
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/cv-download", { method: "POST" });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error);
        if (r.status === 410 || r.status === 403) setNeedsRenew(true);
        return;
      }
      const blob = await r.blob(),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "Shaun_Denver_Mathiasz_CV.pdf";
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setServed(true);
      setNeedsRenew(true);
    } catch {
      setError("The download could not be confirmed. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  async function renew() {
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/cv-access");
      if (r.ok) {
        setNeedsRenew(false);
        setServed(false);
        setState((s) => ({
          ...s,
          grantsRemaining: Math.max(0, (s.grantsRemaining ?? 2) - 1),
        }));
      } else setError(r.data.error);
    } catch {
      setError("Access could not be renewed. Please try later.");
    } finally {
      setBusy(false);
    }
  }
  const field = (
    name: string,
    label: string,
    required = false,
    type = "text",
    maxLength = 140,
  ) => (
    <label className="cv-field" key={name}>
      <span>
        {label}
        {required ? " *" : " (optional)"}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        autoComplete={
          name === "fullName"
            ? "name"
            : name === "company"
              ? "organization"
              : name === "email"
                ? "email"
                : name === "jobTitle"
                  ? "organization-title"
                  : "off"
        }
        aria-invalid={!!fields[name]}
        aria-describedby={fields[name] ? `error-${name}` : undefined}
      />
      {fields[name] && (
        <small className="cv-field-error" id={`error-${name}`}>
          {fields[name][0]}
        </small>
      )}
    </label>
  );
  const expired = state.expiresAt
      ? Math.max(
          0,
          Math.ceil((new Date(state.expiresAt).getTime() - now) / 1000),
        )
      : 0,
    cooldown = state.resendAt
      ? Math.max(
          0,
          Math.ceil((new Date(state.resendAt).getTime() - now) / 1000),
        )
      : 0;
  return (
    <section className="cv-portal-shell">
      <aside className="cv-portal-aside">
        <p className="eyebrow">A PROFESSIONAL INTRODUCTION</p>
        <h2>
          The next chapter
          <br />
          starts with
          <br />
          <em>a conversation.</em>
        </h2>
        <p>
          Luxury hospitality. Travel product development. Commercial thinking.
        </p>
        <ol className="cv-steps">
          <li data-active={state.stage === "form"}>
            <span>01</span>Introduce yourself
          </li>
          <li data-active={state.stage === "verify"}>
            <span>02</span>Verify your email
          </li>
          <li data-active={state.stage === "verified"}>
            <span>03</span>Access my CV
          </li>
        </ol>
        <div className="cv-trust">
          <LockKeyhole size={19} aria-hidden="true" />
          <p>
            No registration or manual approval. Location permission is optional.
          </p>
        </div>
        <Link href="/contact" className="text-link" prefetch={false}>
          Prefer a conversation? Get in touch <LinkArrow />
        </Link>
      </aside>
      <div className="cv-panel" aria-busy={busy}>
        {!configured ? (
          <div className="cv-unavailable">
            <Mail aria-hidden="true" />
            <p className="eyebrow">A DIRECT INTRODUCTION</p>
            <h2>
              Let’s connect
              <br />
              <em>by email.</em>
            </h2>
            <p>
              CV access is temporarily unavailable. Please contact{" "}
              <a href="mailto:shaun.emirates@gmail.com">
                shaun.emirates@gmail.com
              </a>
              .
            </p>
            <a
              className="button gold-button"
              href="mailto:shaun.emirates@gmail.com?subject=Professional%20CV%20request"
            >
              Email Shaun <LinkArrow />
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div className="cv-error" role="alert">
                {error}
              </div>
            )}
            {state.stage === "form" && (
              <form method="post" onSubmit={submit}>
                <p className="eyebrow">01 / INTRODUCE YOURSELF</p>
                <h2>Your professional details</h2>
                <p className="cv-help">
                  Required fields are marked *. Personal email addresses are
                  welcome.
                </p>
                <div className="cv-fields">
                  {field("fullName", "Full name", true, "text", 100)}
                  {field("company", "Company / organisation", true)}
                  {field(
                    "email",
                    "Professional email address",
                    true,
                    "email",
                    254,
                  )}
                  {field(
                    "jobTitle",
                    "Job title / designation",
                    false,
                    "text",
                    120,
                  )}
                  <label className="cv-field">
                    <span>Requester type (optional)</span>
                    <select name="requesterType">
                      <option value="">Select an option</option>
                      {requesterTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  {field(
                    "opportunity",
                    "Opportunity / position being considered",
                    false,
                    "text",
                    180,
                  )}
                  {field("opportunityLocation", "Opportunity location")}
                  {field(
                    "linkedinUrl",
                    "LinkedIn profile URL",
                    false,
                    "url",
                    300,
                  )}
                  <label className="cv-field cv-wide">
                    <span>Additional message (optional)</span>
                    <textarea name="message" rows={4} maxLength={2000} />
                  </label>
                  <div hidden aria-hidden="true">
                    <label>
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                </div>
                {fields.linkedinUrl && (
                  <p role="alert" className="cv-field-error">
                    {fields.linkedinUrl[0]}
                  </p>
                )}
                <CvTurnstile
                  siteKey={siteKey}
                  onToken={onToken}
                  resetKey={resetKey}
                />
                {fields.turnstileToken && (
                  <p className="cv-field-error">{fields.turnstileToken[0]}</p>
                )}
                <p className="cv-disclosure" id="location-disclosure">
                  Submitting this request may prompt your browser to share your
                  current location for request security and auditing. Location
                  access is not required to receive the CV.{" "}
                  <Link href="/request-cv/privacy" prefetch={false}>
                    CV Request Privacy Notice <LinkArrow />
                  </Link>
                </p>
                <button
                  className="button gold-button cv-main-action"
                  disabled={busy}
                  aria-describedby="location-disclosure"
                >
                  {busy ? "Requesting your code…" : "SEND VERIFICATION CODE"}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>
            )}
            {state.stage === "verify" && (
              <form method="post" className="cv-verification" onSubmit={verify}>
                <p className="eyebrow">02 / A SECURE CONNECTION</p>
                <h2>VERIFY YOUR EMAIL</h2>
                <p>
                  {state.accepted ? (
                    <>
                      We’ve sent a six-digit verification code to{" "}
                      <strong>{state.maskedEmail}</strong>. Enter it below to
                      continue.
                    </>
                  ) : (
                    <>
                      Your email has not yet been accepted for delivery. Please
                      wait for the resend cooldown, then request a new code.
                    </>
                  )}
                </p>
                <label className="cv-field">
                  <span>Six-digit verification code</span>
                  <input
                    ref={otp}
                    className="cv-otp"
                    name="code"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    aria-describedby="code-expiry"
                  />
                </label>
                <p id="code-expiry" className="cv-help" aria-live="off">
                  {expired
                    ? `Code expires in ${Math.floor(expired / 60)}:${String(expired % 60).padStart(2, "0")}`
                    : "This code has expired. Request a new code below."}
                </p>
                <button
                  className="button gold-button cv-main-action"
                  disabled={busy || !expired || !state.accepted || state.locked}
                >
                  {busy ? "Please wait…" : "VERIFY EMAIL"}{" "}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <div className="cv-inline-actions">
                  <button
                    type="button"
                    className="text-link"
                    onClick={resend}
                    disabled={
                      busy ||
                      cooldown > 0 ||
                      state.resendsLeft === 0 ||
                      state.locked
                    }
                  >
                    {cooldown ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    onClick={change}
                    disabled={busy}
                  >
                    Change email / start again
                  </button>
                </div>
                <p className="cv-help">
                  Up to five attempts per code. Up to three resends per request.
                  Your location choice has no effect on verification.
                </p>
              </form>
            )}
            {state.stage === "verified" && (
              <div className="cv-success">
                <span className="cv-success-mark">
                  <Check aria-hidden="true" />
                </span>
                <p className="eyebrow">03 / YOUR NEXT CHAPTER</p>
                <h2 ref={heading} tabIndex={-1}>
                  EMAIL VERIFIED
                </h2>
                <p>
                  Thank you for your interest. Your email has been verified, and
                  you can now download my professional CV.
                </p>
                {!needsRenew ? (
                  <button
                    onClick={download}
                    disabled={busy}
                    className="button gold-button cv-main-action"
                  >
                    {busy ? "Preparing your CV…" : "DOWNLOAD CV"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <p role="status">
                      {served
                        ? "The CV was served to your browser."
                        : "Your previous access is unavailable."}
                    </p>
                    <button
                      onClick={renew}
                      disabled={busy || state.grantsRemaining === 0}
                      className="button outline-button"
                    >
                      Renew secure download access
                    </button>
                  </>
                )}
                <p className="cv-help">
                  Access expires after ten minutes and can be used once. A
                  limited number of renewals is available during this verified
                  session.
                </p>
                <Link className="text-link" href="/contact" prefetch={false}>
                  Continue the conversation <LinkArrow />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
