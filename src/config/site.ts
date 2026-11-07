import { photography } from "@/content/visual-assets";
export const site = {
  name: "Shaun Denver Mathiasz",
  role: "Travel Product Specialist",
  location: "Colombo, Sri Lanka",
  description:
    "Travel product development, international hospitality and commercial thinking. The personal website of Shaun Denver Mathiasz: ideas, experience and a wider perspective.",
  url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  socialLinks: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/shaun-denver/",
    },
    { label: "Instagram", url: "https://www.instagram.com/shaun.mathiasz/" },
    { label: "TikTok", url: "https://www.tiktok.com/@shaunmathiasz" },
    { label: "Facebook", url: "https://www.facebook.com/ShaunMathiasz/" },
  ] as { label: string; url: string }[],
  cvRequestUrl: "/request-cv",
  portrait: {
    src: photography.portrait.src,
    width: photography.portrait.width,
    height: photography.portrait.height,
    alt: photography.portrait.alt,
  },
  professionalEmail: "shaun.emirates@gmail.com",
};
export const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/education", label: "Education" },
  { href: "/insights", label: "Insights" },
];
