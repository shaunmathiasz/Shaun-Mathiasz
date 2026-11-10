import { ArrowUpRight } from "lucide-react";

/** SVG arrow keeps link styling consistent across mobile emoji fonts. */
export function LinkArrow({ size = 17 }: { size?: number | string }) {
  return <ArrowUpRight className="link-arrow" size={size} aria-hidden="true" focusable="false" />;
}
