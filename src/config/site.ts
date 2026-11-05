export const site = {
  name: "Shaun Denver Mathiasz",
  role: "Travel Product Specialist",
  location: "Colombo, Sri Lanka",
  description:
    "Travel product development, international hospitality and commercial thinking. Explore the professional portfolio of Shaun Denver Mathiasz.",
  url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  socialLinks: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/shaun-denver/",
    },
    { label: "Instagram", url: "https://www.instagram.com/shaun.mathiasz/" },
  ] as { label: string; url: string }[],
  cvUrl: "/documents/shaun-mathiasz-cv.pdf" as string | null,
  portrait: {
    src: "/images/shaun-mathiasz.jpg",
    width: 1254,
    height: 1254,
    alt: "Shaun Denver Mathiasz wearing a dark suit and tie against a blue travel-themed background",
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
