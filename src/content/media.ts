export const projectMedia: Record<string, { src: string; alt: string }> = {
  "01": {
    src: "/images/editorial/london.jpg",
    alt: "London skyline, contextual imagery for the UK outbound market",
  },
  "02": {
    src: "/images/editorial/maldives.jpg",
    alt: "Maldives island and ocean, contextual luxury travel imagery",
  },
  "03": {
    src: "/images/editorial/landscape.jpg",
    alt: "Lakeside mountain destination, illustrative travel concept imagery",
  },
  "04": {
    src: "/images/editorial/maldives.jpg",
    alt: "Island coastline illustrating destination research themes",
  },
};
export function readingMinutes(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
