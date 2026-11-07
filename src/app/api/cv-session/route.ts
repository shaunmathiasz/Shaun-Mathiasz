import {
  endpoint,
  service,
  json,
  cookie,
  COOKIE,
  GRANT_COOKIE,
} from "@/lib/cv/http";
export const runtime = "nodejs";
export const GET = endpoint(
  async (req) => json(await service().status(req.cookies.get(COOKIE)?.value)),
  false,
);
export const DELETE = endpoint(async (req) => {
  await service().reset(req.cookies.get(COOKIE)?.value);
  const r = json({ stage: "form" });
  cookie(r, COOKIE, "", 0);
  cookie(r, GRANT_COOKIE, "", 0);
  return r;
});
