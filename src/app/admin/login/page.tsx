import { OwnerLogin } from "@/components/cv-owner-login";
import { configProblems } from "@/lib/cv/config";
import "../../request-cv/portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Owner sign-in",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <OwnerLogin
      configured={configProblems().length === 0}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
    />
  );
}
