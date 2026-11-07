import {
  endpoint,
  body,
  service,
  json,
  cookie,
  COOKIE,
  GRANT_COOKIE,
} from "@/lib/cv/http";
import { requestMetadata } from "@/lib/cv/metadata";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const s = service(),
    result = await s.create(
      await body(req),
      requestMetadata(req.headers),
      req.cookies.get(COOKIE)?.value,
    );
  const state = await s.status(result.session);
  const response = json(
    {
      ...state,
      locationToken: result.locationToken,
      ...(result.error ? { error: result.error } : {}),
    },
    result.error ? 502 : 201,
  );
  cookie(response, COOKIE, result.session);
  cookie(response, GRANT_COOKIE, "", 0);
  return response;
});
