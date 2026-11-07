import { endpoint, body, owner, json } from "@/lib/cv/http";
import { overview } from "@/lib/cv/admin";
export const runtime = "nodejs";
export const POST = endpoint(async (req) =>
  json(await overview(await owner(req), await body(req))),
);
