import { endpoint, body, service, json, COOKIE } from "@/lib/cv/http";
import { locationSchema } from "@/lib/cv/schema";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  await service().location(
    req.cookies.get(COOKIE)?.value,
    locationSchema.parse(await body(req)),
  );
  return json({ recorded: true });
});
