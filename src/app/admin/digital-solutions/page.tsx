import { ownerPage } from "@/lib/cv/owner-page";
import { DigitalCRM } from "@/components/digital/crm";
import type { Metadata } from "next";
import "./crm.css";
export const metadata: Metadata = {
  title: "SDM Digital — Private lead workspace",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";
export default async function DigitalAdmin() {
  await ownerPage();
  return <DigitalCRM />;
}
