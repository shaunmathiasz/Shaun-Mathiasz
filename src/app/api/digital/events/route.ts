import {
  body,
  digitalEndpoint,
  digitalService,
  digitalRequestIp,
  json,
} from "@/lib/digital/http";
import { eventSchema } from "@/lib/digital/events";
export const POST = digitalEndpoint(async (req) => {
  const e = eventSchema.parse(await body(req)),
    s = digitalService();
  await s.rate(
    "events:" + (digitalRequestIp(req)),
    120,
    60,
  );
  await s.db.query(
    "INSERT INTO sdm_digital.events(event_id,name,package_id,category) VALUES($1,$2,$3,$4) ON CONFLICT(event_id) DO NOTHING",
    [e.eventId, e.name, e.packageId ?? null, e.category ?? null],
  );
  return json({ recorded: true });
});
