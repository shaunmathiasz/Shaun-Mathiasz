export type SocialPagePreview = {
  platform: "Instagram" | "TikTok";
  handle: string;
  url: string;
  embedUrl: string;
  icon: string;
  accent: string;
};
export const socialPagePreviews: SocialPagePreview[] = [
  {
    platform: "Instagram",
    handle: "@shaun.mathiasz",
    url: "https://www.instagram.com/shaun.mathiasz/",
    embedUrl: "https://www.instagram.com/shaun.mathiasz/embed/?cr=1&v=14",
    icon: "instagram",
    accent: "#E1306C",
  },
  {
    platform: "TikTok",
    handle: "@shaunmathiasz",
    url: "https://www.tiktok.com/@shaunmathiasz",
    embedUrl: "https://www.tiktok.com/embed/@shaunmathiasz",
    icon: "tiktok",
    accent: "#69C9D0",
  },
];
