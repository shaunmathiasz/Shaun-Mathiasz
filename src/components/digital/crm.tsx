"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { digital, money, packageName } from "@/config/digital";
import { LeadActions } from "./lead-actions";
type Row = {
  id: string;
  reference: string;
  full_name: string;
  business_name: string;
  selected_package: string;
  status: string;
  created_at: string;
  proposal_amount: string;
};
type Overview = {
  summary: Record<string, string | number>;
  rows: Row[];
  groups: {
    selected_package: string;
    business_category: string;
    status: string;
    channel: string;
    campaign: string;
    count: number;
  }[];
  trend: { month: string; count: number }[];
  pendingFollowups: number;
  events: { name: string; count: number }[];
  analyticsConnection: string;
};
export const colomboTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  });
export async function crmRequest(path: string, body: unknown) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "The request could not be completed.");
  return d;
}
export function DigitalCRM() {
  const [data, setData] = useState<Overview | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [detail, setDetail] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    package: "all",
    from: "",
    to: "",
    sort: "newest",
    page: 0,
  });
  const requestGeneration = useRef(0);
  const query = useCallback(
    () => ({
      ...filters,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [filters],
  );
  const load = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setLoading(true);
    setError("");
    try {
      const result = await crmRequest("/api/admin/digital-solutions", query());
      if (generation === requestGeneration.current) setData(result);
    } catch (e) {
      if (generation === requestGeneration.current)
        setError(e instanceof Error ? e.message : "Dashboard unavailable.");
    } finally {
      if (generation === requestGeneration.current) setLoading(false);
    }
  }, [query]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);
  const patch = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  function range(days: number) {
    const to = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Colombo",
      }),
      date = new Date(to + "T00:00:00+05:30");
    date.setUTCDate(date.getUTCDate() - (days - 1));
    setFilters((f) => ({
      ...f,
      to,
      from: date.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }),
      page: 0,
    }));
  }
  const [exporting, setExporting] = useState(false);
  async function exportCsv() {
    setExporting(true);
    try {
      const r = await fetch("/api/admin/digital-solutions/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query()),
      });
      if (!r.ok) throw new Error("Export failed.");
      const url = URL.createObjectURL(await r.blob()),
        a = document.createElement("a");
      a.href = url;
      a.download = "sdm-digital-enquiries.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  const aggregate = (
    key:
      | "selected_package"
      | "business_category"
      | "channel"
      | "campaign"
      | "status",
  ) => {
    const counts: Record<string, number> = {};
    for (const g of data?.groups || [])
      counts[g[key]] = (counts[g[key]] || 0) + g.count;
    return Object.entries(counts);
  };
  const chart = (title: string, items: [string, number][]) => (
    <section className="digital-crm-chart">
      <h2>{title}</h2>
      {items.length ? (
        items.map(([label, n]) => (
          <div key={label}>
            <span>{label}</span>
            <meter
              min={0}
              max={Math.max(...items.map((x) => x[1]), 1)}
              value={n}
              aria-label={label}
            />
            <strong>{n}</strong>
          </div>
        ))
      ) : (
        <p>No records in this period.</p>
      )}
    </section>
  );
  return (
    <div className="digital-crm">
      <header>
        <Image
          src="/branding/sdm-digital/sdm_digital_monogram.webp"
          width={800}
          height={434}
          alt="SDM Digital"
        />
        <div>
          <p className="eyebrow">PRIVATE / OWNER WORKSPACE</p>
          <h1>Conversations into possibilities.</h1>
          <p>
            Enquiries, follow-ups and commercial records. All times
            Asia/Colombo.
          </p>
        </div>
        <Link prefetch={false} href="/admin/cv-requests">
          CV dashboard
        </Link>
      </header>
      <div className="digital-crm-filters">
        <label>
          Search
          <input
            value={filters.search}
            onChange={(e) => patch("search", e.target.value)}
            placeholder="Name, business, email or reference"
            maxLength={100}
          />
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(e) => patch("status", e.target.value)}
          >
            <option value="all">All statuses</option>
            {digital.statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Package
          <select
            value={filters.package}
            onChange={(e) => patch("package", e.target.value)}
          >
            <option value="all">All packages</option>
            {digital.packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={filters.from}
            onChange={(e) => patch("from", e.target.value)}
          />
        </label>
        <label>
          Through
          <input
            type="date"
            value={filters.to}
            onChange={(e) => patch("to", e.target.value)}
          />
        </label>
        <label>
          Sort
          <select
            value={filters.sort}
            onChange={(e) => patch("sort", e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="value">Proposal value</option>
          </select>
        </label>
      </div>
      <div className="digital-crm-toolbar">
        <div>
          {[7, 30, 90].map((n) => (
            <button key={n} onClick={() => range(n)}>
              {n} days
            </button>
          ))}
          <button
            onClick={() =>
              setFilters((f) => ({ ...f, from: "", to: "", page: 0 }))
            }
          >
            All dates
          </button>
        </div>
        <button onClick={exportCsv} disabled={exporting}>
          Export filtered CSV (up to 5,000)
        </button>
        <button onClick={load}>Refresh</button>
      </div>
      {error && (
        <p role="alert" className="digital-error">
          {error} No sample data is displayed.
        </p>
      )}
      {loading && <p role="status">Loading secure workspace…</p>}
      {data && (
        <>
          <div className="digital-crm-stats">
            {[
              ["Enquiries", data.summary.total],
              ["New", data.summary.new],
              ["Qualified — current status", data.summary.qualified],
              ["Follow-ups due", data.pendingFollowups],
              ["Won projects", data.summary.won],
              ["Lost opportunities", data.summary.lost],
              ["Quoted proposals", money(Number(data.summary.quoted))],
              ["Accepted value — won", money(Number(data.summary.accepted))],
              ["Payments recorded", money(Number(data.summary.collected))],
              ["Open quoted pipeline", money(Number(data.summary.pipeline))],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="digital-crm-note">
            Amounts are owner-recorded in LKR. Enquiries and package selections
            are not sales. Accepted contract value is not collected revenue.
            Current-status counts do not represent all historical transitions.
            Filters apply to the enquiry creation period; follow-ups due use
            this period across all statuses.
          </p>
          <div className="digital-crm-table">
            <table>
              <caption>Commercial enquiries</caption>
              <thead>
                <tr>
                  {[
                    "Reference",
                    "Business / contact",
                    "Package",
                    "Status",
                    "Created",
                    "Review",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.reference}</td>
                    <td>
                      <strong>{r.business_name}</strong>
                      <br />
                      {r.full_name}
                    </td>
                    <td>{packageName(r.selected_package)}</td>
                    <td>{r.status}</td>
                    <td>{colomboTime(r.created_at)}</td>
                    <td>
                      <button onClick={() => setDetail(r.id)}>
                        Open enquiry
                      </button>
                    </td>
                  </tr>
                ))}
                {!data.rows.length && (
                  <tr>
                    <td colSpan={6}>No enquiries match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="digital-crm-toolbar">
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Previous
            </button>
            <span>Page {filters.page + 1}</span>
            <button
              disabled={data.rows.length < 25}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </button>
          </div>
          <div className="digital-crm-charts">
            {chart("Enquiries by package", aggregate("selected_package"))}
            {chart("Business categories", aggregate("business_category"))}
            {chart("Current status distribution", aggregate("status"))}
            {chart("Attributed enquiry sources", aggregate("channel"))}
            {chart("Approved campaigns", aggregate("campaign"))}
            {chart(
              "Monthly enquiry trend",
              data.trend.map((t) => [t.month, t.count]),
            )}
            {chart(
              "Consented interaction counts",
              data.events.map((t) => [t.name, t.count]),
            )}
          </div>
          <section className="digital-crm-chart">
            <h2>Reporting definitions</h2>
            <p>{data.analyticsConnection}</p>
            <p>
              Interaction counts describe opted-in events, not unique people.
              Enquiries come from saved database records and may include
              visitors who declined analytics. They cannot be joined into a
              unique-user conversion funnel.
            </p>
            <p>
              Won / all saved enquiries in this creation cohort:{" "}
              {Number(data.summary.total)
                ? (
                    (Number(data.summary.won) / Number(data.summary.total)) *
                    100
                  ).toFixed(1) + "%"
                : "Not enough data"}
              . This is a current CRM status ratio, not a visitor conversion
              rate. Traffic-to-lead conversion: not available without a
              compatible, consented traffic population.
            </p>
            <p>
              Campaign attribution stores only approved non-personal UTM codes.
              Unrecognised values are discarded; absence means “Not attributed”,
              not necessarily direct traffic. GA4/Vercel API reporting: Not
              connected.
            </p>
          </section>
        </>
      )}
      {detail && (
        <LeadActions
          id={detail}
          onClose={() => {
            setDetail("");
            void load();
          }}
        />
      )}
    </div>
  );
}
