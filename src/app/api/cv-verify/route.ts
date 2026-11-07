import { after } from "next/server";
import {
  endpoint,
  body,
  service,
  json,
  cookie,
  COOKIE,
  GRANT_COOKIE,
} from "@/lib/cv/http";
import { otpSchema } from "@/lib/cv/schema";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const { code } = otpSchema.parse(await body(req));
  const s = service(),
    r = await s.verify(req.cookies.get(COOKIE)?.value, code);
  const response = json({ stage: "verified" });
  cookie(response, COOKIE, r.session);
  cookie(response, GRANT_COOKIE, r.grant!, 600);
  after(async () => {
    try {
      await s.worker(1);
    } catch {
      /* Durable outbox remains available to the scheduled worker. */
    }
  });
  return response;
});
