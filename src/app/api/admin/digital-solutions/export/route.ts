import { NextResponse } from "next/server";
import {
  body,
  digitalEndpoint,
  digitalOwner,
  privateHeaders,
} from "@/lib/digital/http";
import { filterSchema } from "@/lib/digital/schema";
import { csvCell } from "@/lib/digital/service";
export const POST = digitalEndpoint(async (req) => {
  const s = await digitalOwner(req),
    f = filterSchema.parse(await body(req));
  const rows = (
    await s.db.query(
      `SELECT reference,full_name,business_name,email,phone,selected_package,status,proposal_amount,accepted_amount,collected_amount,created_at FROM sdm_digital.enquiries WHERE ($1='all' OR status=$1) AND ($2='all' OR selected_package=$2) AND ($3::date IS NULL OR created_at>=($3::date::timestamp AT TIME ZONE 'Asia/Colombo')) AND ($4::date IS NULL OR created_at<(($4::date+1)::timestamp AT TIME ZONE 'Asia/Colombo')) AND ($5='' OR full_name ILIKE '%'||$5||'%' OR business_name ILIKE '%'||$5||'%' OR email ILIKE '%'||$5||'%' OR reference ILIKE '%'||$5||'%') ORDER BY created_at DESC LIMIT 5000`,
      [f.status, f.package, f.from ?? null, f.to ?? null, f.search],
    )
  ).rows;
  await s.db.query(
    "INSERT INTO sdm_digital.activity(action_type,note) VALUES('csv_export',$1)",
    [`${rows.length} authorised records exported`],
  );
  const keys = [
    "reference",
    "full_name",
    "business_name",
    "email",
    "phone",
    "selected_package",
    "status",
    "proposal_amount",
    "accepted_amount",
    "collected_amount",
    "created_at",
  ];
  return new NextResponse(
    [
      keys.join(","),
      ...rows.map((row) => keys.map((k) => csvCell(row[k])).join(",")),
    ].join("\r\n"),
    {
      headers: {
        ...privateHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sdm-digital-enquiries.csv"',
      },
    },
  );
});
