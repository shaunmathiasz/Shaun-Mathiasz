import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, service } from "./http";
export async function ownerPage() {
  try {
    const s = service(),
      token = (await cookies()).get(ADMIN_COOKIE)?.value;
    const r = await s.require(token, "admin");
    if (r.email === s.config.ownerEmail && r.verification_status === "verified")
      return s;
  } catch {}
  redirect("/admin/login");
}
