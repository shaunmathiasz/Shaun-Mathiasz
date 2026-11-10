import {
  endpoint,
  body,
  service,
  json,
  cookie,
  ADMIN_COOKIE,
} from "@/lib/cv/http";
import { otpSchema } from "@/lib/cv/schema";
import { requestMetadata } from "@/lib/cv/metadata";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const { code } = otpSchema.parse(await body(req));
  const result = await service().verify(
    req.cookies.get(ADMIN_COOKIE)?.value,
    code,
    "admin",
  );
  const response = json({ verified: true });
  cookie(response, ADMIN_COOKIE, result.session, 28800);
  return response;
});
export const PUT = endpoint(async (req) =>
  json(
    await service().resend(
      req.cookies.get(ADMIN_COOKIE)?.value,
      requestMetadata(req.headers),
      "admin",
    ),
  ),
);
