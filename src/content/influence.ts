export type PlatformMetric = { label: string; display: string };
export type DigitalPlatform = {
  name: string;
  handle: string;
  url: string;
  icon: string;
  accent: string;
  metrics: PlatformMetric[];
};
// Account snapshots supplied and approved for public display by Shaun, November 2026.
export const digitalPlatforms: DigitalPlatform[] = [
  {
    name: "TikTok",
    handle: "@shaunmathiasz",
    url: "https://www.tiktok.com/@shaunmathiasz",
    icon: "tiktok",
    accent: "#69C9D0",
    metrics: [
      { label: "Followers", display: "3,521" },
      { label: "Profile likes", display: "~120K" },
      { label: "Following", display: "5,406" },
    ],
  },
  {
    name: "Instagram",
    handle: "@shaun.mathiasz",
    url: "https://www.instagram.com/shaun.mathiasz/",
    icon: "instagram",
    accent: "#E1306C",
    metrics: [
      { label: "Followers", display: "7,161" },
      { label: "Posts", display: "99" },
      { label: "Following", display: "6,997" },
    ],
  },
  {
    name: "Facebook",
    handle: "ShaunMathiasz",
    url: "https://www.facebook.com/ShaunMathiasz/",
    icon: "facebook",
    accent: "#1877F2",
    metrics: [
      { label: "Followers", display: "~2.7K" },
      { label: "Following", display: "~8.5K" },
    ],
  },
  {
    name: "LinkedIn",
    handle: "shaun-denver",
    url: "https://www.linkedin.com/in/shaun-denver/",
    icon: "linkedin",
    accent: "#0A66C2",
    metrics: [
      { label: "Followers", display: "~2K" },
      { label: "Connections", display: "500+" },
    ],
  },
];
export const combinedAudience = {
  display: "~15.4K",
  label: "Combined Platform Followers",
  caption:
    "Combined platform followers, not unique individuals. Figures as of November 2026.",
};
