import { endpoint, service, json, COOKIE } from "@/lib/cv/http";
import { requestMetadata } from "@/lib/cv/metadata";
export const runtime = "nodejs";
export const POST = endpoint(async (req) =>
  json(
    await service().resend(
      req.cookies.get(COOKIE)?.value,
      requestMetadata(req.headers),
    ),
  ),
);
