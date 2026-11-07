import Image from "next/image";
export const platformStyles = {
  Instagram: {
    icon: "instagram",
    handle: "@shaun.mathiasz",
    label: "FRAMES & PERSPECTIVES",
    line: "Life, through a different lens.",
    accent: "#ef87ac",
  },
  TikTok: {
    icon: "tiktok",
    handle: "@shaunmathiasz",
    label: "MOMENTS IN MOTION",
    line: "A little curiosity. A different rhythm.",
    accent: "#79d9dc",
  },
  Facebook: {
    icon: "facebook",
    handle: "ShaunMathiasz",
    label: "PEOPLE & CONNECTIONS",
    line: "Staying connected, across borders.",
    accent: "#8fbcff",
  },
  LinkedIn: {
    icon: "linkedin",
    handle: "shaun-denver",
    label: "IDEAS & PROFESSIONAL LIFE",
    line: "Where experience meets conversation.",
    accent: "#95c7e4",
  },
} as const;
export type SocialPlatform = keyof typeof platformStyles;
/** Original graphic cover, explicitly a profile link rather than an imitation of a post. */
export function PlatformArtwork({
  platform,
  compact = false,
}: {
  platform: SocialPlatform;
  compact?: boolean;
}) {
  const p = platformStyles[platform];
  return (
    <div
      className={`platform-artwork platform-artwork-${p.icon}${compact ? " compact" : ""}`}
    >
      <div className="platform-symbol" aria-hidden="true">
        <Image
          src={`/logos/social-${p.icon}.svg`}
          alt=""
          width={48}
          height={48}
        />
      </div>
      <span className="platform-art-index" aria-hidden="true">
        {p.label}
      </span>
      <p className="platform-art-line">{p.line}</p>
      <span className="platform-art-caption">
        {platform} profile · {p.handle}
      </span>
    </div>
  );
}
