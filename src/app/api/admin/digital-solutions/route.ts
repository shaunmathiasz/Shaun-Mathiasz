import { body, digitalEndpoint, digitalOwner, json } from "@/lib/digital/http";
import { leadOverview } from "@/lib/digital/admin";
export const POST = digitalEndpoint(async (req) =>
  json(await leadOverview(await digitalOwner(req), await body(req))),
);
