"use client";
import { LinkArrow } from "@/components/link-arrow";

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
              Verify credential <LinkArrow />
            </a>
          )}
        </details>
      </div>
    </article>
  );
}
export function EducationCredentials() {
  const [filter, setFilter] = useState("All");
  const [issuer, setIssuer] = useState("All issuers");
  const issuerNames = [...new Set(certifications.map((c) => c.institution))];
  const visibleCertifications = certifications.filter(
    (c) => issuer === "All issuers" || c.institution === issuer,
  );
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
      <p className="filter-summary" role="status">{filter === "Certifications" ? visibleCertifications.length : main.length} {filter === "Certifications" ? "short-course credentials" : "education and development entries"}</p>
      <div className="credentials-list">
        {main.map((e) => (
          <Reveal key={e.id}>
            <CredentialCard item={e} />
          </Reveal>
        ))}
        {filter !== "All" &&
          filter !== "Certifications" &&
          main.length === 0 && (
            <p className="credential-empty">
              No programmes in this category are currently listed.
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
          <div className="certification-toolbar">
            <p className="eyebrow">
              CONTINUING CURIOSITY / {visibleCertifications.length} SHORT
              COURSES
            </p>
            <label>
              Explore by institution
              <select
                value={issuer}
                onChange={(event) => setIssuer(event.target.value)}
              >
                <option>All issuers</option>
                {issuerNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          <div
            className="credentials-list certification-gallery"
            aria-live="polite"
          >
            {visibleCertifications.map((e) => (
              <Reveal key={e.id}>
                <CredentialCard item={e} />
              </Reveal>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
