"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CvTurnstile } from "./cv-turnstile";
export function OwnerLogin({
  configured,
  siteKey,
}: {
  configured: boolean;
  siteKey: string;
}) {
  const [stage, setStage] = useState<"email" | "code">("email"),
    [token, setToken] = useState(""),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reset, setReset] = useState(0),
    [resendAt, setResendAt] = useState(0),
    [now, setNow] = useState(() => Date.now());
  const input = useRef<HTMLInputElement>(null),
    router = useRouter();
  const onToken = useCallback((v: string) => setToken(v), []);
  useEffect(() => {
    if (stage !== "code") return;
    input.current?.focus();
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [stage]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch(
        stage === "email" ? "/api/admin/login" : "/api/admin/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            stage === "email"
              ? { email: form.email, turnstileToken: token }
              : { code },
          ),
        },
      );
      const d = await r.json();
      if (stage === "email" && d.stage) {
        setStage("code");
        setResendAt(new Date(d.resendAt).getTime());
      }
      if (!r.ok) {
        setError(d.error);
        setToken("");
        setReset((v) => v + 1);
      } else if (stage === "code") {
        router.replace("/admin/cv-requests");
        router.refresh();
      }
    } catch {
      setError("Sign-in is temporarily unavailable. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cv-owner-panel">
      <p className="eyebrow">PRIVATE OWNER ACCESS</p>
      <h1>Request intelligence.</h1>
      <p>
        Sign in with an email verification code. Access is restricted to the
        website owner.
      </p>
      {!configured ? (
        <p role="status">Owner sign-in is temporarily unavailable.</p>
      ) : (
        <form method="post" onSubmit={submit}>
          {error && (
            <p className="cv-error" role="alert">
              {error}
            </p>
          )}
          {stage === "email" ? (
            <>
              <label className="cv-field">
                <span>Owner email</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </label>
              <CvTurnstile
                siteKey={siteKey}
                onToken={onToken}
                resetKey={reset}
              />
            </>
          ) : (
            <>
              <label className="cv-field">
                <span>Six-digit code</span>
                <input
                  ref={input}
                  className="cv-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                />
              </label>
              <p className="cv-help">
                Codes expire after five minutes. Up to five attempts and three
                resends.
              </p>
            </>
          )}
          <button disabled={busy} className="button gold-button">
            {busy
              ? "Please wait…"
              : stage === "email"
                ? "Send owner sign-in code"
                : "Sign in securely"}
          </button>
          {stage === "code" && (
            <div className="cv-inline-actions">
              <button
                type="button"
                disabled={busy || now < resendAt}
                className="text-link"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await fetch("/api/admin/verify", {
                        method: "PUT",
                      }),
                      d = await r.json();
                    if (!r.ok) setError(d.error);
                    else {
                      setResendAt(new Date(d.resendAt).getTime());
                      setCode("");
                      setError("");
                      input.current?.focus();
                    }
                  } catch {
                    setError("The code could not be resent.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {now < resendAt
                  ? `Resend in ${Math.ceil((resendAt - now) / 1000)}s`
                  : "Resend code"}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setStage("email");
                  setToken("");
                  setReset((v) => v + 1);
                  setError("");
                }}
              >
                Start again
              </button>
            </div>
          )}
        </form>
      )}
    </section>
  );
}
