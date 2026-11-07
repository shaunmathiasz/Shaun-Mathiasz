import { photography } from "@/content/visual-assets";
export const projectMedia: Record<string, { src: string; alt: string }> = {
  "01": {
    src: photography.london.src,
    alt: "London skyline, contextual imagery for the UK outbound market",
  },
  "02": {
    src: photography.hospitality.src,
    alt: "Metropol Palace lobby in Belgrade, contextual hospitality photography",
  },
  "03": {
    src: photography.landscape.src,
    alt: "Lakeside mountain destination, illustrative travel concept imagery",
  },
  "04": {
    src: photography.maldives.src,
    alt: "Island coastline illustrating destination research themes",
  },
};
export function readingMinutes(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
