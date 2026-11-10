import { LinkArrow } from "@/components/link-arrow";
import { organisations } from "@/content/organisations";
import { OrganisationLogo } from "./organisation-logo";
import { Reveal } from "./reveal";
export function EmployerCard({
  ids,
  title,
  period,
  children,
}: {
  ids: string[];
  title: string;
  period: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="employer-card">
      <div className="organisation-pair">
        {ids.map((id) => (
          <div key={id}>
            <OrganisationLogo id={id} />
            <p>{organisations[id].name}</p>
          </div>
        ))}
      </div>
      <p className="eyebrow">{period}</p>
      <h3>{title}</h3>
      {children}
    </article>
  );
}
export function BrandShowcase() {
  return (
    <section className="section brand-showcase">
      <p className="eyebrow">THE ORGANISATIONS BEHIND MY JOURNEY</p>
      <h2>Every chapter adds perspective.</h2>
      <p className="brand-intro">
        From luxury hospitality to global business, every chapter has shaped the
        way I think, work and create opportunities.
      </p>
      {(
        [
          "Professional Experience",
          "Academic & Professional Development",
        ] as const
      ).map((group) => (
        <div key={group} className="brand-group">
          <h3>{group}</h3>
          <div className="brand-grid">
            {Object.entries(organisations)
              .filter(([, o]) => o.kind === group && o.showcase !== false)
              .map(([id, org]) => (
                <Reveal key={id}>
                  <details className="brand-card">
                    <summary>
                      <OrganisationLogo id={id} />
                      <span>{org.name}</span>
                      <span className="brand-toggle">Explore +</span>
                    </summary>
                    <p>{org.context}</p>
                    {org.url && (
                      <a
                        href={org.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Official website <LinkArrow />
                      </a>
                    )}
                  </details>
                </Reveal>
              ))}
          </div>
        </div>
      ))}
      <p className="micro-copy">
        Organisation identities describe employment, study and membership
        relationships; they do not imply endorsement.
      </p>
    </section>
  );
}
