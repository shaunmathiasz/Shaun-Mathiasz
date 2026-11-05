import Image from "next/image";
import { organisations } from "@/content/organisations";
export function OrganisationLogo({ id }: { id: string }) {
  const org = organisations[id];
  if (!org) return null;
  const pair = org.logos;
  return (
    <div
      className={
        "organisation-logo logo-" +
        id +
        " " +
        (pair?.length ? "paired-logos" : org.logo ? "" : "identity-text")
      }
    >
      {pair?.length ? (
        pair.map((logo) => (
          <Image
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            width={90}
            height={90}
            sizes="90px"
          />
        ))
      ) : org.logo ? (
        <Image
          src={org.logo}
          alt={org.name + " official logo"}
          width={200}
          height={90}
          sizes="200px"
        />
      ) : (
        <span>{org.name}</span>
      )}
    </div>
  );
}
