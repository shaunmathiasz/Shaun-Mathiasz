import { NextResponse } from "next/server";
import {
  endpoint,
  service,
  COOKIE,
  GRANT_COOKIE,
  privateHeaders,
  cookie,
} from "@/lib/cv/http";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const bytes = await service().download(
    req.cookies.get(COOKIE)?.value,
    req.cookies.get(GRANT_COOKIE)?.value,
  );
  const response = new NextResponse(Buffer.from(bytes), {
    headers: {
      ...privateHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Shaun_Denver_Mathiasz_CV.pdf"',
      "Content-Length": String(bytes.byteLength),
    },
  });
  cookie(response, GRANT_COOKIE, "", 0);
  return response;
});
