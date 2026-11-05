import Image from "next/image";
import { organisations } from "@/content/organisations";
export function OrganisationLogo({ id }: { id: string }) {
  const org = organisations[id];
  if (!org) return null;
  return (
    <div className={"organisation-logo " + (org.logo ? "" : "identity-text")}>
      {org.logo ? (
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
