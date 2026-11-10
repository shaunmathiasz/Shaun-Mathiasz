import { NextResponse } from "next/server";
import { socialImage } from "@/config/social";

/** Preserve old shared image URLs without file-based metadata overriding the JPEG. */
export function GET() {
  return NextResponse.redirect(socialImage.url, 308);
}
