"use client";
import { photography } from "@/content/visual-assets";
import Image from "next/image";
import { useState } from "react";
import {
  buildConcept,
  defaults,
  type BuilderInput,
} from "@/lib/travel-builder";
const fields: {
  key: keyof Omit<BuilderInput, "priorities">;
  label: string;
  options: string[];
}[] = [
  {
    key: "destination",
    label: "Destination",
    options: ["Maldives", "Sri Lanka", "United Kingdom"],
  },
  {
    key: "theme",
    label: "Travel theme",
    options: ["Rest & renewal", "Culture & discovery", "Celebration"],
  },
  {
    key: "traveller",
    label: "Traveller profile",
    options: ["Couple", "Solo traveller", "Family"],
  },
  {
    key: "budget",
    label: "Budget approach",
    options: ["Considered", "Premium"],
  },
  {
    key: "stay",
    label: "Accommodation preference",
    options: ["Boutique", "Resort", "City hotel"],
  },
];
export function TravelBuilder() {
  const [input, setInput] = useState(defaults);
  const result = buildConcept(input);
  return (
    <section className="section builder" id="behind-the-journey">
      <div className="section-title">
        <div>
          <p className="eyebrow">INTERACTIVE FIELD NOTES / 04</p>
          <h2>Behind the Journey.</h2>
        </div>
        <span className="status">Illustrative travel concept</span>
      </div>
      <p className="builder-intro">
        A considered product starts with a few good questions. Explore how
        different choices shape the journey.
      </p>
      <div className="builder-grid">
        <form onSubmit={(e) => e.preventDefault()} className="builder-controls">
          {fields.map((f) => (
            <label key={f.key} htmlFor={"builder-" + f.key}>
              {f.label}
              <select
                aria-label={f.label}
                id={"builder-" + f.key}
                value={input[f.key]}
                onChange={(e) =>
                  setInput({ ...input, [f.key]: e.target.value })
                }
              >
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <fieldset>
            <legend>Experience priorities</legend>
            {["Unhurried pace", "Local culture", "More destinations"].map(
              (p) => (
                <label className="check-choice" key={p}>
                  <input
                    type="checkbox"
                    checked={input.priorities.includes(p)}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        priorities: e.target.checked
                          ? [...input.priorities, p]
                          : input.priorities.filter((x) => x !== p),
                      })
                    }
                  />
                  {p}
                </label>
              ),
            )}
          </fieldset>
          <button
            type="button"
            className="text-link"
            onClick={() => setInput(defaults)}
          >
            Reset the brief ↺
          </button>
        </form>
        <div className="concept" aria-live="polite" aria-atomic="true">
          <figure className="concept-image" key={input.destination}>
            <Image
              src={
                input.destination === "Maldives"
                  ? photography.maldives.src
                  : input.destination === "Sri Lanka"
                    ? photography.colombo.src
                    : photography.london.src
              }
              alt={`${input.destination} destination context for an illustrative travel concept`}
              fill
              sizes="(max-width:600px) 90vw, 45vw"
            />
            <figcaption>
              {input.destination} / An illustrative journey
            </figcaption>
          </figure>
          <div className="concept-brief">
            <p className="eyebrow">YOUR EXPLORATION / FOUR-DAY SKETCH</p>
            <p className="concept-positioning">
              {input.traveller} · {input.theme} · {input.budget} · {input.stay}
            </p>
            <h3>{result.title}</h3>
            <ol>
              {result.days.map((d, i) => (
                <li key={i}>
                  <span>0{i + 1}</span>
                  {d}
                </li>
              ))}
            </ol>
            <details open>
              <summary>Experience priorities</summary>
              <ul>
                {result.priorities.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Commercial considerations</summary>
              <ul>
                {result.commercial.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </details>
            <p className="tradeoff">
              <strong>The trade-off</strong>
              {result.tradeoff}
            </p>
            <p className="micro-copy">
              An illustrative travel concept, not a bookable itinerary.
              Experiences and arrangements would need confirmation with the
              relevant providers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
