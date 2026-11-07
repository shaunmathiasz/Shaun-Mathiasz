import { photography } from "@/content/visual-assets";
export type CareerLocation = {
  image: string;
  caption: string;
  name: string;
  lat: number;
  lon: number;
  tag: string;
  text: string;
};
export const careerLocations: CareerLocation[] = [
  {
    image: photography.colombo.src,
    caption: "Colombo skyline / Professional & academic base",
    name: "Colombo, Sri Lanka",
    lat: 6.927,
    lon: 79.861,
    tag: "PERSONAL & PROFESSIONAL BASE",
    text: "Based in Colombo, connecting practical travel product work with ongoing studies in global business.",
  },
  {
    image: photography.maldives.src,
    caption: "Maldives landscape / Hospitality foundation",
    name: "Maldives",
    lat: 5.894,
    lon: 73.322,
    tag: "HOSPITALITY FOUNDATION",
    text: "Reservations and guest operations experience at Siyam World Maldives. The marker represents the resort’s region.",
  },
  {
    image: photography.london.src,
    caption: "London skyline / Market context",
    name: "United Kingdom",
    lat: 51.507,
    lon: -0.128,
    tag: "COMMERCIAL MARKET FOCUS",
    text: "UK outbound travel product development through Moresand Group / Travel Center UK. Market focus, not UK residence or on-site employment.",
  },
];
