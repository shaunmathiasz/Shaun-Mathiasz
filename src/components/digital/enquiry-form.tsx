"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CvTurnstile } from "@/components/cv-turnstile";
import { digital, money, packageName, type PackageId } from "@/config/digital";
import { safeAttribution } from "@/lib/digital/events";
import { digitalEvent } from "./telemetry";
export function EnquiryForm({
  selected,
  siteKey,
}: {
  selected: PackageId;
  siteKey: string;
}) {
  const [token, setToken] = useState(""),
    [reset, setReset] = useState(0),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [pending, setPending] = useState(false),
    [reference, setReference] = useState(""),
    [captchaVisible, setCaptchaVisible] = useState(false);
  const started = useRef(false),
    key = useRef(""),
    busy = useRef(false),
    form = useRef<HTMLFormElement>(null);
  const success = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reference) success.current?.focus();
  }, [reference]);
  useEffect(() => {
    if (!Object.keys(errors).length || errors.form) return;
    form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);
  const onToken = useCallback((v: string) => setToken(v), []);
  const price = digital.packages.find((p) => p.id === selected)?.launchPrice;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;
    digitalEvent("enquiry_form_submit_attempt", { packageId: selected });
    busy.current = true;
    setPending(true);
    const values = new FormData(e.currentTarget);
    // Read only our fields: Turnstile may also insert cf-turnstile-response.
    const data = Object.fromEntries(
      [
        "fullName",
        "businessName",
        "businessCategory",
        "email",
        "phone",
        "existingWebsite",
        "businessLocation",
        "projectDescription",
        "preferredTimeline",
        "estimatedBudget",
        "consent",
        "website",
      ].map((name) => [name, values.get(name) || ""]),
    );
    key.current ||= crypto.randomUUID();
    const raw = {
      ...data,
      selectedPackage: selected,
      consent: data.consent === "on",
      turnstileToken: token,
      submissionKey: key.current,
      attribution: safeAttribution(
        Object.fromEntries(new URLSearchParams(location.search)),
      ),
    };
    const validation = await import("@/lib/digital/schema").catch(() => null);
    if (!validation) {
      busy.current = false;
      setPending(false);
      setErrors({
        form: "The secure form could not load. Please retry or email Shaun.",
      });
      return;
    }
    const parsed = validation.enquirySchema.safeParse(raw);
    if (!parsed.success) {
      busy.current = false;
      setPending(false);
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [
            k,
            v?.[0] || "Check this field.",
          ]),
        ),
      );
      digitalEvent("enquiry_form_validation_error", { packageId: selected });
      return;
    }
    busy.current = true;
    setPending(true);
    setErrors({});
    try {
      const r = await fetch("/api/digital/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const d = await r.json();
      if (!r.ok) {
        setErrors(
          d.fields
            ? Object.fromEntries(
                Object.entries(d.fields as Record<string, string[]>).map(
                  ([k, v]) => [k, v[0]],
                ),
              )
            : { form: d.error || "Please try again." },
        );
        digitalEvent("enquiry_form_error", { packageId: selected });
        return;
      }
      if (typeof d.reference !== "string") throw new Error();
      setReference(d.reference);
      if (d.created) {
        digitalEvent("enquiry_form_success", { packageId: selected });
        digitalEvent("generate_lead", { packageId: selected });
      }
    } catch {
      setErrors({
        form: "Your enquiry could not be confirmed. Please retry; your submission is protected against duplicates.",
      });
      digitalEvent("enquiry_form_error", { packageId: selected });
    } finally {
      busy.current = false;
      setPending(false);
      setToken("");
      setReset((v) => v + 1);
    }
  }
  if (reference)
    return (
      <div
        ref={success}
        className="digital-success"
        role="status"
        tabIndex={-1}
      >
        <span className="digital-success-mark">✓</span>
        <p className="eyebrow">ENQUIRY RECEIVED</p>
        <h3>A good place to begin.</h3>
        <p>
          Your reference is <strong>{reference}</strong>. I’ll review your
          requirements and get in touch to discuss the scope.
        </p>
        <p>
          The enquiry is saved. Email acknowledgement may arrive separately.
        </p>
        <button
          className="button button-secondary"
          onClick={() => {
            key.current = "";
            started.current = false;
            setReference("");
          }}
        >
          Start another enquiry
        </button>
      </div>
    );
  const field = (
    name: string,
    label: string,
    type = "text",
    required = false,
  ) => (
    <label key={name}>
      {label}
      {required ? " *" : ""}
      <input
        id={"digital-" + name}
        name={name}
        type={type}
        required={required}
        maxLength={
          name === "email" ? 254 : name === "existingWebsite" ? 300 : 160
        }
        autoComplete={
          name === "fullName"
            ? "name"
            : name === "email"
              ? "email"
              : name === "phone"
                ? "tel"
                : name === "businessName"
                  ? "organization"
                  : "off"
        }
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `err-${name}` : undefined}
      />
      {errors[name] && (
        <small id={`err-${name}`} className="digital-error">
          {errors[name]}
        </small>
      )}
    </label>
  );
  return (
    <form
      ref={form}
      className="digital-form"
      method="post"
      action="/api/digital/enquiry"
      onSubmit={submit}
      noValidate
      data-clarity-mask="true"
      onFocus={() => {
        setCaptchaVisible(true);
        if (!started.current) {
          started.current = true;
          digitalEvent("enquiry_form_started", { packageId: selected });
        }
      }}
    >
      <noscript>
        <p>
          This secure form needs JavaScript. Please email
          shaun.emirates@gmail.com if it is unavailable.
        </p>
      </noscript>
      <div className="digital-form-summary">
        <span>YOUR STARTING POINT</span>
        <strong>{packageName(selected)}</strong>
        <span>
          {price ? `From ${money(price)}` : "Custom quotation required"}
        </span>
      </div>
      <div className="digital-form-grid">
        {field("fullName", "Full name", "text", true)}
        {field("businessName", "Business name", "text", true)}
        <label>
          Business category *
          <select
            name="businessCategory"
            required
            defaultValue=""
            aria-invalid={!!errors.businessCategory}
          >
            <option value="" disabled>
              Select your business
            </option>
            {digital.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {errors.businessCategory && (
            <small className="digital-error">{errors.businessCategory}</small>
          )}
        </label>
        {field("businessLocation", "Location / district")}
        {field("email", "Email address", "email", true)}
        {field("phone", "WhatsApp / contact number", "tel", true)}
        {field("existingWebsite", "Existing website URL", "url")}
        <label>
          Preferred timeframe
          <select name="preferredTimeline">
            <option value="">Select if known</option>
            {["Flexible", "Within a month", "1–3 months", "3+ months"].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Estimated budget
          <select name="estimatedBudget">
            <option value="">Select if known</option>
            {[
              "Under LKR 30,000",
              "LKR 30,000–75,000",
              "LKR 75,000–150,000",
              "LKR 150,000+",
              "Discuss scope",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="digital-wide">
          Tell me about your project *
          <textarea
            name="projectDescription"
            required
            rows={5}
            minLength={20}
            maxLength={3000}
            placeholder="Your business, the website you have in mind, and what matters most."
            aria-invalid={!!errors.projectDescription}
          />
          {errors.projectDescription && (
            <small className="digital-error">{errors.projectDescription}</small>
          )}
        </label>
      </div>
      <label className="digital-honeypot" aria-hidden="true">
        Leave this empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="digital-consent">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={!!errors.consent}
        />{" "}
        <span>
          I have read the{" "}
          <Link prefetch={false} href="/services/web-development/privacy">
            enquiry privacy notice
          </Link>{" "}
          and agree to be contacted about this project. *
        </span>
      </label>
      {errors.consent && (
        <p className="digital-error">Please acknowledge the privacy notice.</p>
      )}
      {siteKey ? (
        captchaVisible ? (
          <CvTurnstile
            siteKey={siteKey}
            onToken={onToken}
            resetKey={reset}
            action="digital-enquiry"
          />
        ) : (
          <p className="digital-fine">
            The security check loads when you start your enquiry.
          </p>
        )
      ) : (
        <p>
          Online enquiries are being prepared. Please email{" "}
          <a href={`mailto:${digital.email}`}>{digital.email}</a>.
        </p>
      )}
      {errors.turnstileToken && (
        <p role="alert" className="digital-error">
          Please complete the security check.
        </p>
      )}
      {errors.form && (
        <p role="alert" className="digital-error">
          {errors.form}
        </p>
      )}
      <button
        className="button button-primary"
        type="submit"
        disabled={pending || !siteKey}
      >
        {pending ? "Saving your enquiry…" : "Let’s discuss your project"}{" "}
        <span aria-hidden="true">→</span>
      </button>
      <p className="digital-fine">
        No payment is taken here. Your package is a starting point; scope and a
        written quotation come first.
      </p>
    </form>
  );
}
