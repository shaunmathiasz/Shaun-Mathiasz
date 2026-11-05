"use client";
import { useState } from "react";
import {
  education,
  certifications,
  credentialCategories,
  type Credential,
} from "@/content/credentials";
import { OrganisationLogo } from "./organisation-logo";
import { Reveal } from "./reveal";
export function CredentialCard({ item }: { item: Credential }) {
  return (
    <article className="education-card credential-card">
      <div className="credential-logos">
        {item.organisations.length ? (
          item.organisations.map((id) => <OrganisationLogo id={id} key={id} />)
        ) : (
          <span className="credential-institution">{item.institution}</span>
        )}
      </div>
      <div>
        <div className="education-top">
          <span className="eyebrow">{item.category}</span>
          <span className="status">{item.status}</span>
        </div>
        <h2>{item.title}</h2>
        <p className="institution">{item.institution}</p>
        <p className="credential-period">{item.period}</p>
        <details>
          <summary>Explore programme details</summary>
          <p>{item.detail}</p>
          {item.credentialId && (
            <p className="credential-id">Credential ID: {item.credentialId}</p>
          )}
          {item.verificationUrl && (
            <a
              href={item.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify credential ↗
            </a>
          )}
        </details>
      </div>
    </article>
  );
}
export function EducationCredentials() {
  const [filter, setFilter] = useState("All");
  const main = education.filter(
    (e) => filter === "All" || e.category === filter,
  );
  return (
    <section className="section credential-section">
      <div className="filters" aria-label="Filter education">
        <button
          aria-pressed={filter === "All"}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        {credentialCategories.map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="credentials-list" aria-live="polite">
        {main.map((e) => (
          <Reveal key={e.id}>
            <CredentialCard item={e} />
          </Reveal>
        ))}
        {filter === "Executive Education" && (
          <p className="credential-empty">
            No executive education entries are currently listed.
          </p>
        )}
      </div>
      {(filter === "All" || filter === "Certifications") && (
        <details
          className="certifications-section"
          open={filter === "Certifications"}
        >
          <summary>
            Short courses & certifications{" "}
            <span>{certifications.length} credentials</span>
          </summary>
          <div className="credentials-list">
            {certifications.map((e) => (
              <CredentialCard key={e.id} item={e} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
