import { pageMetadata } from "@/lib/metadata";
import WorldwideGame from "@/components/worldwide/game";
import "./worldwide.css";
export const metadata = pageMetadata(
  "WORLDWIDE — The Travel Tycoon Challenge",
  "Build your travel empire in five rounds. A fictional travel strategy game with routes, pricing, unexpected events and a world of decisions.",
  "/play",
);
export default function PlayPage() {
  return <WorldwideGame />;
}
