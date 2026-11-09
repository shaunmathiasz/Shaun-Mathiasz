import { after } from "next/server";
import {
  body,
  digitalEndpoint,
  digitalService,
  digitalRequestIp,
  json,
} from "@/lib/digital/http";
export const runtime = "nodejs";
export const POST = digitalEndpoint(async (req) => {
  const s = digitalService();
  const result = await s.submit(
    await body(req),
    digitalRequestIp(req),
  );
  after(async () => {
    try {
      await s.worker(2);
    } catch {
      console.warn("DIGITAL_OUTBOX_RETRY_PENDING");
    }
  });
  return json(result, result.created ? 201 : 200);
});
