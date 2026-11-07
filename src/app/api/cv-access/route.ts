import {
  endpoint,
  service,
  json,
  cookie,
  COOKIE,
  GRANT_COOKIE,
} from "@/lib/cv/http";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const grant = await service().renew(req.cookies.get(COOKIE)?.value);
  const r = json({ accessGranted: true });
  cookie(r, GRANT_COOKIE, grant, 600);
  return r;
});
