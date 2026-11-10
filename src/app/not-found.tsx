import { LinkArrow } from "@/components/link-arrow";
import Link from "next/link";
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};
export default function NotFound() {
  return (
    <section className="page-intro error-page">
      <p className="eyebrow">404 / A DIFFERENT DIRECTION</p>
      <h1>A little off the itinerary.</h1>
      <p className="lead">
        This page could not be found. Let’s take you back to familiar ground.
      </p>
      <Link href="/" className="button gold-button">
        Return home <LinkArrow />
      </Link>
    </section>
  );
}
