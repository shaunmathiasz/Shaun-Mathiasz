import { dispatchCvJobs } from "@/lib/cv/workflows/dispatch";
import { endpoint, service, json } from "@/lib/cv/http";
import { equal } from "@/lib/cv/crypto";
import { PortalError } from "@/lib/cv/service";
export const runtime = "nodejs";
export const maxDuration = 60;
export const GET = endpoint(async (req) => {
  const s = service();
  if (
    !equal(
      req.headers.get("authorization") || "",
      `Bearer ${s.config.cronSecret}`,
    )
  )
    throw new PortalError(401, "Unauthorised.");
  await s.cleanup();
  await s.worker(4);
  await dispatchCvJobs(s, undefined, 25);
  return json({ processed: true });
}, false);
