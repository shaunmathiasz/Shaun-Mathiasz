import { expect, it } from "vitest";
import { homepageSocial, socialImage } from "@/config/social";
import { pageMetadata } from "@/lib/metadata";
import { GET } from "@/app/opengraph-image/route";

it("uses the requested absolute, versioned JPEG metadata", () => {
  expect(homepageSocial.url).toBe("https://www.shaunmathiasz.com");
  expect(socialImage).toMatchObject({
    url: "https://www.shaunmathiasz.com/social/shaun-homepage-og-v3.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
  });
  const metadata = pageMetadata("About", "Professional story", "/about");
  expect(metadata.openGraph?.images).toEqual([socialImage]);
  expect(metadata.twitter).toMatchObject({
    card: "summary_large_image",
    images: [socialImage.url],
  });
});

it("redirects old image requests instead of advertising a generic generated image", () => {
  const response = GET();
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe(socialImage.url);
});
