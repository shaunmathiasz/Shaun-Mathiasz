"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Smartphone,
  Gauge,
  Search,
  MessageCircle,
  ShieldCheck,
  Palette,
  Handshake,
  Globe2,
} from "lucide-react";
import { digital, money, type PackageId } from "@/config/digital";
import { EnquiryForm } from "./enquiry-form";
import { DigitalTelemetry, digitalEvent } from "./telemetry";
const industries = [
  {
    name: "Villas",
    title: "A stay worth discovering.",
    features: [
      "Room and villa storytelling",
      "Direct accommodation enquiries",
      "Location and useful guest information",
    ],
    package: "growth",
    image: "/images/editorial/sri-lanka-villa.jpg",
    alt: "Pool and tropical garden beside a villa in Ahangama, Sri Lanka — illustrative website concept",
  },
  {
    name: "Boutique Hotels",
    title: "Distinctive stays. Thoughtful details.",
    features: [
      "Room categories and galleries",
      "Staff-confirmed booking requests",
      "A clear sense of place",
    ],
    package: "premium",
    image: "/images/editorial/hospitality.jpg",
  },
  {
    name: "Guesthouses",
    title: "A warmer welcome, online.",
    features: [
      "A clear one-page introduction",
      "Easy WhatsApp and call links",
      "Simple photo gallery",
    ],
    package: "starter",
    image: "/images/editorial/sri-lanka-guesthouse.jpg",
    alt: "Arched wooden entrance and tropical plants in Sri Lanka — illustrative guesthouse website concept",
  },
  {
    name: "Travel Agencies",
    title: "Bring the journey into focus.",
    features: [
      "Destination and package showcases",
      "Itinerary enquiry journeys",
      "Clear information for travellers",
    ],
    package: "growth",
    image: "/images/editorial/london.jpg",
  },
  {
    name: "Tour Operators",
    title: "Make the experience tangible.",
    features: [
      "Tour highlights and itineraries",
      "Experience-led photography",
      "Enquiries routed to your team",
    ],
    package: "growth",
    image: "/images/editorial/landscape.jpg",
  },
  {
    name: "Restaurants",
    title: "A table starts with a good impression.",
    features: [
      "Menu and atmosphere",
      "Opening information and directions",
      "Direct contact and table requests",
    ],
    package: "growth",
    image: "/images/editorial/hospitality.jpg",
  },
  {
    name: "Other Businesses",
    title: "Your ambition. A considered presence.",
    features: [
      "Services that are easy to understand",
      "Your identity, presented professionally",
      "A clear path to contact",
    ],
    package: "starter",
    image: "/images/editorial/colombo.jpg",
  },
] as const;
const benefits = [
  [
    "Mobile-first design",
    "Considered on a phone, tablet and desktop.",
    Smartphone,
  ],
  ["Fast performance", "Responsive imagery and a lean implementation.", Gauge],
  [
    "Search engine readiness",
    "Useful content, clear metadata and sensible structure.",
    Search,
  ],
  [
    "Direct customer enquiries",
    "A straightforward path from interest to conversation.",
    MessageCircle,
  ],
  [
    "Professional branding",
    "A visual direction built around your business.",
    Palette,
  ],
  [
    "Secure infrastructure",
    "Appropriate validation and access controls.",
    ShieldCheck,
  ],
  [
    "Simple communication",
    "Contact channels that suit how your team works.",
    Globe2,
  ],
  [
    "Ongoing support",
    "Defined bug-fix periods, with optional maintenance.",
    Handshake,
  ],
] as const;
function Tabs({
  values,
  value,
  onChange,
  label,
}: {
  values: readonly string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="digital-tabs" role="group" aria-label={label}>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
export function DigitalExperience({ siteKey }: { siteKey: string }) {
  const [selected, setSelected] = useState<PackageId>("growth"),
    [full, setFull] = useState(false),
    [industry, setIndustry] = useState(0),
    [device, setDevice] = useState("Desktop"),
    [stage, setStage] = useState(0),
    [demo, setDemo] = useState("Overview");
  const enquiry = useRef<HTMLElement>(null),
    item = industries[industry];
  const pricing = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pricing.current || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("offer-entered");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    pricing.current.querySelectorAll(".digital-price-card").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);
  function choose(id: PackageId) {
    setSelected(id);
    digitalEvent("package_selected", { packageId: id });
    digitalEvent(
      id === "custom" ? "custom_solution_cta_click" : "package_cta_click",
      { packageId: id },
    );
    enquiry.current?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    requestAnimationFrame(() =>
      document
        .getElementById("digital-fullName")
        ?.focus({ preventScroll: true }),
    );
  }
  return (
    <>
      <DigitalTelemetry />
      <section id="packages" className="digital-section">
        <div className="digital-section-heading">
          <p className="eyebrow">01 / BUILT FOR YOUR NEXT CHAPTER</p>
          <div className="digital-launch-banner"><span aria-hidden="true">🇱🇰</span> SRI LANKA BUSINESS LAUNCH SPECIAL</div>
          <h2>Big savings.<br /><em>Bigger digital possibilities.</em></h2>
          <p>Exclusive Website Development Launch Offers for Sri Lankan Villas, Hotels, Travel Businesses &amp; SMEs.</p>
          <p className="digital-welcome">All Sri Lankan Businesses Welcome.</p>
          {digital.packages.every((p) => p.discountDisplayApproved) && (
            <p className="digital-approved-saving">SAVE UP TO {Math.max(...digital.packages.map((p) => p.discountPercentage))}% ON WEBSITE DEVELOPMENT</p>
          )}
        </div>
        <div className="digital-pricing" ref={pricing}>
          {digital.packages.map((p) => (
            <article
              key={p.id}
              className={`digital-price-card ${selected === p.id ? "is-selected" : ""} ${p.popular ? "is-popular" : ""}`}
              data-digital-view="package_card_view"
              data-package={p.id}
              onPointerMove={(e) => {
                if (
                  e.pointerType !== "mouse" ||
                  matchMedia("(prefers-reduced-motion: reduce)").matches
                )
                  return;
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--pointer-x",
                  `${((e.clientX - r.left) / r.width) * 100}%`,
                );
                e.currentTarget.style.setProperty(
                  "--pointer-y",
                  `${((e.clientY - r.top) / r.height) * 100}%`,
                );
              }}
            >
              <div className="digital-card-top">
                <span>
                  {p.popular ? "MOST POPULAR" : "BUILT AROUND YOUR BUSINESS"}
                </span>
                <span>0{digital.packages.indexOf(p) + 1}</span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.audience}</p>
              <div className="digital-offer-heading">
                <span className="digital-offer">{digital.offer}</span>
                <span className="digital-discount-badge">{p.discountDisplayApproved ? `${p.discountPercentage}% OFF` : "LAUNCH OFFER"}</span>
              </div>
              {p.discountDisplayApproved ? (
                <div className="digital-reference-price">Reference value <s>{money(p.regularPrice)}</s></div>
              ) : digital.showProposedReferencePrices ? (
                <div className="digital-reference-price digital-proposed-reference">Reference value <span>{money(p.regularPrice)}</span></div>
              ) : null}
              <div className="digital-price">
                <small>{p.discountDisplayApproved ? "Now from" : "Launch price · from"}</small>
                <strong>{money(p.launchPrice)}</strong>
                <span className="digital-price-note">One-time development fee</span>
              </div>
              {p.discountDisplayApproved && (
                <div className="digital-saving">You save {money(p.savingAmount)}</div>
              )}
              <p className="digital-package-pages">{p.pages}</p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={15} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <details>
                <summary>Delivery & support</summary>
                <p>
                  {p.delivery} after complete materials. {p.revisions} revision
                  round{p.revisions > 1 ? "s" : ""}. {p.support}-day post-launch
                  bug-fix support.
                </p>
              </details>
              <button
                type="button"
                className={`button ${p.popular ? "button-primary" : "button-secondary"}`}
                onClick={() => choose(p.id)}
              >
                {p.ctaLabel} <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
        <p className="digital-disclosure">
          Starting development fees. Domain registration, hosting,
          subscriptions, ongoing maintenance, payment gateways and custom
          software are additional where applicable. No live booking engine, OTA
          synchronisation or automated inventory is included.
        </p>
        <div className="digital-compare-heading">
          <h3>A closer look.</h3>
          <button
            className="digital-text-button"
            aria-expanded={full}
            aria-controls="digital-comparison"
            onClick={() => {
              setFull(!full);
              if (!full) digitalEvent("comparison_table_view");
            }}
          >
            {full ? "Essential Features" : "Full Comparison"}{" "}
            <span aria-hidden="true">{full ? "−" : "+"}</span>
          </button>
        </div>
        <div
          className="digital-table-scroll"
          id="digital-comparison"
          tabIndex={0}
          role="region"
          aria-label="Website package comparison"
        >
          <table>
            <caption className="sr-only">Included features by package</caption>
            <thead>
              <tr>
                <th scope="col">Included</th>
                {digital.packages.map((p) => (
                  <th key={p.id} scope="col">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Pages / sections</th>
                {digital.packages.map((p) => (
                  <td key={p.id}>{p.pages}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Revision rounds</th>
                {digital.packages.map((p) => (
                  <td key={p.id}>{p.revisions}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Post-launch bug fixes</th>
                {digital.packages.map((p) => (
                  <td key={p.id}>{p.support} days</td>
                ))}
              </tr>
              {full && (
                <>
                  <tr>
                    <th scope="row">Email enquiry form</th>
                    <td>—</td>
                    <td>Included</td>
                    <td>Advanced forms</td>
                  </tr>
                  <tr>
                    <th scope="row">Booking requests</th>
                    <td>—</td>
                    <td>—</td>
                    <td>Staff confirmation required</td>
                  </tr>
                  <tr>
                    <th scope="row">CMS</th>
                    <td>—</td>
                    <td>—</td>
                    <td>Agreed functionality</td>
                  </tr>
                  <tr>
                    <th scope="row">SEO</th>
                    <td>Basic on-page</td>
                    <td>On-page + Search Console</td>
                    <td>Enhanced + structured data</td>
                  </tr>
                  <tr>
                    <th scope="row">Analytics</th>
                    <td>—</td>
                    <td>Basic web analytics</td>
                    <td>Analytics + conversions</td>
                  </tr>
                  <tr>
                    <th scope="row">Estimated delivery</th>
                    {digital.packages.map((p) => (
                      <td key={p.id}>{p.delivery}</td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="digital-section digital-showcase" id="industries">
        <div className="digital-section-heading">
          <p className="eyebrow">02 / YOUR WORLD, ONLINE</p>
          <h2>
            Built for hospitality.
            <br />
            <em>Open to every business.</em>
          </h2>
          <p>
            From a coastal villa to an independent consultant. The right website
            starts with understanding your business.
          </p>
        </div>
        <Tabs
          values={industries.map((i) => i.name)}
          value={item.name}
          onChange={(v) => {
            setIndustry(industries.findIndex((i) => i.name === v));
            digitalEvent("industry_selected", {
              category: v as typeof item.name,
            });
          }}
          label="Industry examples"
        />
        <div className="digital-industry-panel">
          <div className="digital-industry-image">
            <Image
              src={item.image}
              alt={"alt" in item ? item.alt : `${item.name} — contextual photography for an illustrative website concept`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <span>CONCEPT PREVIEW / {item.name.toUpperCase()}</span>
          </div>
          <div>
            <span className="eyebrow">A WEBSITE WITH PURPOSE</span>
            <h3>{item.title}</h3>
            <ul>
              {item.features.map((f) => (
                <li key={f}>
                  <Check size={16} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <p>
              Suggested starting point:{" "}
              <strong>
                {digital.packages.find((p) => p.id === item.package)?.name}
              </strong>
            </p>
            <button
              className="digital-text-button"
              onClick={() => choose(item.package)}
            >
              Discuss your {item.name.toLowerCase()} website{" "}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="digital-section digital-preview-section">
        <div className="digital-section-heading">
          <p className="eyebrow">03 / SMALL DETAILS. BIG IMPRESSIONS.</p>
          <h2>
            Imagine your
            <br />
            <em>business online.</em>
          </h2>
          <p>
            A responsive concept, not a completed client project. Switch the
            view to see how the same story adapts.
          </p>
        </div>
        <Tabs
          values={["Desktop", "Tablet", "Mobile"]}
          value={device}
          onChange={(v) => {
            setDevice(v);
            digitalEvent("demo_interaction");
          }}
          label="Responsive concept viewport"
        />
        <div
          className={`digital-device digital-device-${device.toLowerCase()}`}
        >
          <div className="digital-browser-bar">
            <span>● ● ●</span>
            <span>Concept Preview · illustrative villa website</span>
            <Globe2 size={13} />
          </div>
          <div className="digital-device-content">
            <Image
              src="/images/editorial/maldives.jpg"
              alt="Maldives overwater villas, illustrative hospitality website concept"
              fill
              sizes="(max-width:768px) 100vw, 900px"
            />
            <div>
              <span>THE ISLAND HOUSE / FICTIONAL CONCEPT</span>
              <h3>
                Some places
                <br />
                stay with you.
              </h3>
              <p>
                A slower rhythm. An open horizon.
                <br />A thoughtful welcome.
              </p>
              <span className="digital-demo-button">
                Discover the stay <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
          <div className="digital-preview-foot">
            <span>Considered spaces</span>
            <span>Local experiences</span>
            <span>A personal welcome</span>
          </div>
        </div>
      </section>
      <section className="digital-section">
        <div className="digital-section-heading">
          <p className="eyebrow">04 / THE FOUNDATIONS MATTER</p>
          <h2>
            Built to make your
            <br />
            <em>business stand out.</em>
          </h2>
        </div>
        <div className="digital-benefits">
          {benefits.map(([title, text, Icon]) => (
            <article key={title}>
              <Icon size={25} strokeWidth={1.25} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="digital-section digital-custom" id="custom">
        <div>
          <p className="eyebrow">05 / BEYOND THE BROCHURE</p>
          <h2>
            Need more
            <br />
            <em>than a website?</em>
          </h2>
          <p>Beyond Websites — Smart Hospitality Solutions</p>
          <p>
            Villa booking management, reservation calendars, guest records,
            payment-status tracking, staff administration, notifications and
            hospitality reporting can be scoped around your operation.
          </p>
          <p className="digital-tag">Custom Quotation Required</p>
          <button
            className="button button-secondary"
            onClick={() => choose("custom")}
          >
            Request a Custom Consultation <ArrowUpRight size={17} />
          </button>
          <p className="digital-fine">
            Illustrative possibilities, not an existing off-the-shelf booking
            system. Payments, OTA connections and live inventory require
            separate scope and integration.
          </p>
        </div>
        <div className="digital-demo-dashboard">
          <div className="digital-dashboard-top">
            <span>HOSPITALITY WORKSPACE</span>
            <span>FICTIONAL DEMO</span>
          </div>
          <Tabs
            values={["Overview", "Bookings", "Availability", "Enquiries"]}
            value={demo}
            onChange={(v) => {
              setDemo(v);
              digitalEvent("demo_interaction");
            }}
            label="Illustrative hospitality software views"
          />
          <div className="digital-dashboard-body">
            <span className="digital-status-dot" />
            <h3>
              {demo === "Overview"
                ? "A clearer picture of your operation."
                : demo === "Bookings"
                  ? "Every request, in one place."
                  : demo === "Availability"
                    ? "Plan with a shared calendar."
                    : "From interest to a conversation."}
            </h3>
            <p>
              {demo === "Overview"
                ? "A proposed workspace for your team’s daily decisions."
                : demo === "Bookings"
                  ? "Track requested, confirmed and cancelled stays. Your team remains in control."
                  : demo === "Availability"
                    ? "See room allocations and dates. Live inventory synchronisation would be separately scoped."
                    : "Organise accommodation questions, add notes and follow up."}
            </p>
            <div className="digital-demo-rows">
              {(demo === "Overview"
                ? [
                    "Booking enquiries",
                    "Guest administration",
                    "Business reporting",
                  ]
                : demo === "Bookings"
                  ? [
                      "Request received",
                      "Team confirmation",
                      "Guest notification",
                    ]
                  : demo === "Availability"
                    ? [
                        "Room allocation",
                        "Date selection",
                        "Availability review",
                      ]
                    : ["New enquiry", "Team follow-up", "Guest response"]
              ).map((x, i) => (
                <div key={x}>
                  <span>0{i + 1}</span>
                  <strong>{x}</strong>
                  <span>Illustrative</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="digital-section">
        <div className="digital-section-heading">
          <p className="eyebrow">06 / A CLEAR PATH TO LAUNCH</p>
          <h2>
            Thoughtfully planned.
            <br />
            <em>Carefully delivered.</em>
          </h2>
        </div>
        <div
          className="digital-process"
          role="group"
          aria-label="Development process"
        >
          {digital.process.map(([name], i) => (
            <button
              key={name}
              aria-pressed={stage === i}
              onClick={() => setStage(i)}
            >
              <span>0{i + 1}</span>
              {name}
            </button>
          ))}
        </div>
        <div className="digital-process-detail" aria-live="polite">
          <span>
            0{stage + 1} / {digital.process[stage][0]}
          </span>
          <p>{digital.process[stage][1]}</p>
        </div>
        <div className="digital-terms">
          <div>
            <strong>50%</strong>
            <p>Deposit after proposal acceptance.</p>
          </div>
          <div>
            <strong>Clear scope</strong>
            <p>
              Ownership, handover and licences set out in the agreed contract.
            </p>
          </div>
          <div>
            <strong>Your approval</strong>
            <p>Final balance after approval and before launch.</p>
          </div>
        </div>
      </section>
      <section className="digital-section digital-faq">
        <div className="digital-section-heading">
          <p className="eyebrow">07 / GOOD QUESTIONS</p>
          <h2>
            A little clarity,
            <br />
            <em>before we begin.</em>
          </h2>
        </div>
        <div>
          {digital.faqs.map(([q, a]) => (
            <details
              key={q}
              onToggle={(e) => {
                if (e.currentTarget.open) digitalEvent("faq_interaction");
              }}
            >
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section
        className="digital-section digital-enquiry"
        id="enquiry"
        ref={enquiry}
      >
        <div>
          <p className="eyebrow">08 / LET’S START A CONVERSATION</p>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <p>
            Tell me what you’re building. We’ll work out the right scope, a
            realistic approach and a clear quotation.
          </p>
          <label className="digital-package-select">
            Preferred package
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value as PackageId);
                digitalEvent("package_selected", {
                  packageId: e.target.value as PackageId,
                });
              }}
            >
              {digital.packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="custom">Custom solution</option>
            </select>
          </label>
          <a
            className="digital-text-button"
            href={`mailto:${digital.email}`}
            onClick={() => digitalEvent("email_cta_click")}
          >
            {digital.email} <ArrowUpRight size={16} />
          </a>
          <p className="digital-fine">
            Prefer a conversation first? Request a free initial consultation
            through this form. No payment is required to enquire.
          </p>
        </div>
        <EnquiryForm selected={selected} siteKey={siteKey} />
      </section>
    </>
  );
}
