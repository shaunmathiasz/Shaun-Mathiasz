import { endpoint, service, json, cookie, ADMIN_COOKIE } from "@/lib/cv/http";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  await service().reset(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
  const r = json({ signedOut: true });
  cookie(r, ADMIN_COOKIE, "", 0);
  return r;
});
