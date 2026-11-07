"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type Entry = {
  id: string;
  full_name: string;
  company: string;
  email: string;
  submitted_at: string;
  verification_status: string;
  notification_status: string;
  grant_count: number;
  ip_country: string | null;
  pdf_served: number;
  requester_type: string;
};
type Data = {
  summary: Record<string, number>;
  rows: Entry[];
  recent: { action: string; created_at: string }[];
};
const date = (v: string) =>
  new Date(v).toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  });
export async function downloadResponse(url: string, name: string) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!r.ok) {
    const d = await r.json();
    throw new Error(d.error || "The file is temporarily unavailable.");
  }
  const blob = await r.blob(),
    href = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
}
export function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [page, setPage] = useState(0),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const load = useCallback(
    async (q: string, s: string, p: number) => {
      setBusy(true);
      setError("");
      try {
        const r = await fetch("/api/admin/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ search: q, status: s, page: p }),
        });
        if (r.status === 401 || r.status === 403) {
          router.replace("/admin/login");
          return;
        }
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      } catch {
        setError("The private records could not be loaded. Please retry.");
      } finally {
        setBusy(false);
      }
    },
    [router],
  );
  useEffect(() => {
    // Synchronise with a remote endpoint after mount; cancel before work starts on unmount.
    const task = window.setTimeout(() => {
      void load("", "all", 0);
    }, 0);
    return () => window.clearTimeout(task);
  }, [load]);
  return (
    <section className="cv-admin">
      <div className="cv-admin-top">
        <p>Private records · Sri Lanka time · retained data only</p>
        <button
          className="button outline-button"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            router.replace("/admin/login");
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
      {error && (
        <p role="alert" className="cv-error">
          {error}
        </p>
      )}
      {data && (
        <div className="cv-stats">
          {Object.entries({
            total: "Total requests",
            today: "Requests today",
            month: "This month",
            pending: "Pending verification",
            verified: "Verified emails",
            grants: "Access grants",
            served: "PDF-serving events",
            failures: "Notification failures",
          }).map(([key, label]) => (
            <article key={key}>
              <strong>{data.summary[key] ?? 0}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      )}
      <form
        method="post"
        className="cv-admin-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          void load(search, status, 0);
        }}
      >
        <label>
          Search name, company or email
          <input
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          Verification status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {["all", "pending", "verified", "locked", "replaced"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className="button gold-button" disabled={busy}>
          Apply filters
        </button>
        <button
          type="button"
          className="button outline-button"
          onClick={async () => {
            try {
              await downloadResponse("/api/admin/export", "cv-requests.csv");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Export CSV
        </button>
      </form>
      {busy && <p role="status">Loading private records…</p>}
      <div className="cv-table-wrap">
        <table>
          <caption>
            CV requests — company identity is not verified. “PDF served” does
            not mean read or saved.
          </caption>
          <thead>
            <tr>
              {[
                "Submitted",
                "Name / organisation",
                "Email / type",
                "Country",
                "Verification",
                "CV access",
                "PDF served",
                "Notification",
              ].map((x) => (
                <th key={x} scope="col">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.rows.map((r) => (
              <tr key={r.id}>
                <td>{date(r.submitted_at)}</td>
                <td>
                  <Link
                    prefetch={false}
                    className="text-link"
                    href={`/admin/cv-requests/${r.id}`}
                  >
                    {r.full_name}
                  </Link>
                  <br />
                  {r.company}
                </td>
                <td>
                  {r.email}
                  <br />
                  {r.requester_type || "Not supplied"}
                </td>
                <td>{r.ip_country || "Unavailable"}</td>
                <td>{r.verification_status}</td>
                <td>{r.grant_count ? "Granted" : "Not granted"}</td>
                <td>{r.pdf_served ? "YES" : "PENDING"}</td>
                <td>{r.notification_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.rows.length === 0 && <p>No requests match these filters.</p>}
      <div className="cv-inline-actions">
        <button
          disabled={busy || page === 0}
          className="button outline-button"
          onClick={() => {
            setPage(page - 1);
            void load(search, status, page - 1);
          }}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button
          disabled={busy || !data || data.rows.length < 25}
          className="button outline-button"
          onClick={() => {
            setPage(page + 1);
            void load(search, status, page + 1);
          }}
        >
          Next
        </button>
      </div>
      <h2>Recent administrative activity</h2>
      <ul>
        {data?.recent.map((r, i) => (
          <li key={i}>
            {r.action} · {date(r.created_at)}
          </li>
        ))}
      </ul>
    </section>
  );
}
export function AdminActions({
  id,
  notification,
}: {
  id: string;
  notification: string;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <div className="cv-admin-actions">
      <div className="cv-inline-actions">
        <button
          disabled={busy || notification !== "failed"}
          className="button outline-button"
          onClick={async () => {
            setBusy(true);
            try {
              const r = await fetch(`/api/admin/requests/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "retry" }),
              });
              const d = await r.json();
              setMessage(
                r.ok
                  ? "Notification retry processed. Check the updated status."
                  : d.error,
              );
              router.refresh();
            } catch {
              setMessage("Retry unavailable. Please try later.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Retry failed notification
        </button>
        <button
          disabled={busy}
          className="button outline-button"
          onClick={async () => {
            if (
              !confirm(
                "Permanently delete this request and its associated verification, location and access records?",
              )
            )
              return;
            setBusy(true);
            try {
              const r = await fetch(`/api/admin/requests/${id}`, {
                method: "DELETE",
              });
              if (!r.ok) throw new Error();
              router.replace("/admin/cv-requests");
              router.refresh();
            } catch {
              setMessage("Deletion could not be confirmed. Please retry.");
              setBusy(false);
            }
          }}
        >
          Delete request
        </button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
