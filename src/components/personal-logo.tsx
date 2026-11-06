import Image from "next/image";

/** The original silver signature supplied by Shaun; no recolouring or distortion. */
export function PersonalLogo({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      className="personal-logo"
      src="/logos/shaun-denver-signature.png"
      alt="Shaun Denver Mathiasz"
      width={2172}
      height={724}
      sizes="(max-width: 600px) 164px, 210px"
      priority={priority}
    />
  );
}
