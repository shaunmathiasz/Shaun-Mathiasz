import {
  endpoint,
  body,
  service,
  json,
  cookie,
  ADMIN_COOKIE,
} from "@/lib/cv/http";
import { requestMetadata } from "@/lib/cv/metadata";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const raw = (await body(req)) as Record<string, unknown>;
  const s = service(),
    r = await s.create(
      {
        email: raw?.email,
        turnstileToken: raw?.turnstileToken,
        fullName: "Shaun Denver Mathiasz",
        company: "Website owner",
      },
      requestMetadata(req.headers),
      req.cookies.get(ADMIN_COOKIE)?.value,
      "admin",
    );
  const response = json(
    {
      ...(await s.status(r.session, "admin")),
      ...(r.error ? { error: r.error } : {}),
    },
    r.error ? 502 : 201,
  );
  cookie(response, ADMIN_COOKIE, r.session);
  return response;
});
