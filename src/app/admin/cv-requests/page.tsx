import { ownerPage } from "@/lib/cv/owner-page";
import { AdminDashboard } from "@/components/cv-admin";
import { PageIntro } from "@/components/ui";
import "../../request-cv/portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private CV requests",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await ownerPage();
  return (
    <>
      <PageIntro
        eyebrow="OWNER ACCESS"
        title="CV request intelligence"
        description="A private view of professional enquiries, verification and document access."
      />
      <AdminDashboard />
    </>
  );
}
