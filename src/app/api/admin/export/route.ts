import { NextResponse } from "next/server";
import { endpoint, owner, privateHeaders } from "@/lib/cv/http";
import { csvCell } from "@/lib/cv/crypto";
export const runtime = "nodejs";
export const POST = endpoint(async (req) => {
  const s = await owner(req);
  const rows = (
    await s.db.query(
      "SELECT full_name,company,email,submitted_at,verified_at,verification_status,notification_status FROM cv_requests WHERE kind='cv' ORDER BY submitted_at DESC LIMIT 500",
    )
  ).rows;
  await s.db.query(
    "INSERT INTO cv_admin_audit(action) VALUES('Exported up to 500 request records')",
  );
  const csv = [
    [
      "Name",
      "Organisation",
      "Email",
      "Submitted",
      "Verified",
      "Verification status",
      "Owner notification",
    ],
    ...rows.map((r) => [
      r.full_name,
      r.company,
      r.email,
      r.submitted_at?.toISOString(),
      r.verified_at?.toISOString(),
      r.verification_status,
      r.notification_status,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  return new NextResponse("\ufeff" + csv, {
    headers: {
      ...privateHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cv-requests.csv"',
    },
  });
});
