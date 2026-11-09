import { z } from "zod";
import { after } from "next/server";
import { body, digitalEndpoint, digitalOwner, json } from "@/lib/digital/http";
import { leadDetail, updateLead } from "@/lib/digital/admin";
export const POST = digitalEndpoint(async (req) => {
  const id = z.uuid().parse(new URL(req.url).pathname.split("/").pop()),
    s = await digitalOwner(req),
    input = await body(req);
  if (
    input &&
    typeof input === "object" &&
    "action" in input &&
    input.action === "detail"
  )
    return json(await leadDetail(s, id));
  await updateLead(s, id, input);
  after(async () => {
    try {
      await s.worker(2);
    } catch {}
  });
  return json({ saved: true });
});
