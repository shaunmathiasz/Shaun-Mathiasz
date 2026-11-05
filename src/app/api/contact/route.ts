import { NextRequest, NextResponse } from "next/server";
import { contactSchema, contactConfigured } from "@/lib/contact";
export const runtime = "nodejs";
// A bounded, best-effort warm-instance limiter. Add shared edge protection before high-volume launch.
const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin)
    return NextResponse.json(
      { message: "Request origin is not allowed." },
      { status: 403 },
    );
  if (!req.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ message: "JSON required." }, { status: 415 });
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.reset < now) attempts.delete(key);
  const entry = attempts.get(ip) || { count: 0, reset: now + 600000 };
  if (entry.count >= 5 || attempts.size > 10000)
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  entry.count++;
  attempts.set(ip, entry);
  let body;
  try {
    const text = await req.text();
    if (text.length > 12000)
      return NextResponse.json(
        { message: "Message is too large." },
        { status: 413 },
      );
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const result = contactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      {
        message: "Please check your name, email, message and privacy consent.",
      },
      { status: 400 },
    );
  if (!contactConfigured())
    return NextResponse.json(
      {
        message:
          "Email delivery is not configured. Your message has not been sent or saved.",
      },
      { status: 503 },
    );
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: process.env.CONTACT_FROM,
        to: [process.env.CONTACT_TO],
        reply_to: result.data.email,
        subject: "Portfolio professional enquiry",
        text: `Name: ${result.data.name}\nEmail: ${result.data.email}\n\n${result.data.message}`,
      }),
    });
    if (!res.ok) throw new Error("Transport unavailable");
    return NextResponse.json({
      message:
        "Your message has been accepted for delivery. Thank you for getting in touch.",
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Email delivery could not be confirmed. Please try again later.",
      },
      { status: 502 },
    );
  }
}
