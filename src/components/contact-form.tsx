"use client";
import { useState } from "react";
import { contactSchema } from "@/lib/contact";
export function ContactForm({ configured }: { configured: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website"),
      consent: data.get("consent") === "on",
    };
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
        ),
      );
      setStatus("Please review the highlighted fields.");
      return;
    }
    setErrors({});
    if (!configured) {
      setStatus(
        "Email delivery is not configured. Your message has not been sent or saved.",
      );
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      setStatus(result.message);
      if (res.ok) form.reset();
    } catch {
      setStatus(
        "Connection failed. Your message was not confirmed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} noValidate className="contact-form">
      {!configured && (
        <div className="notice">
          Contact setup in progress. Email delivery is currently unavailable;
          messages will not be sent or saved.
        </div>
      )}
      {(["name", "email"] as const).map((field) => (
        <div key={field}>
          <label htmlFor={field}>
            {field === "name" ? "Your name" : "Email address"}
          </label>
          <input
            id={field}
            name={field}
            type={field === "email" ? "email" : "text"}
            autoComplete={field}
            required
            aria-invalid={Boolean(errors[field])}
            aria-describedby={errors[field] ? field + "-error" : undefined}
          />
          {errors[field] && (
            <p id={field + "-error"} className="error">
              {errors[field]}
            </p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="message">What would you like to discuss?</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={20}
          maxLength={4000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input
          type="checkbox"
          name="consent"
          aria-describedby="privacy consent-error"
        />{" "}
        <span id="privacy">
          I agree that my name, email and message may be used to respond to this
          enquiry. If delivery is enabled, the message is processed by Resend
          and the recipient’s email provider. Please do not include sensitive
          information.
        </span>
      </label>
      {errors.consent && (
        <p id="consent-error" className="error">
          {errors.consent}
        </p>
      )}
      <button className="button gold-button" disabled={busy}>
        {busy
          ? "Sending…"
          : configured
            ? "Send message ↗"
            : "Check message · delivery unavailable"}
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
    </form>
  );
}
