"use client";
import { useEffect, useRef, useState } from "react";
import { digital, money } from "@/config/digital";
import { crmRequest, colomboTime } from "./crm";
type Detail = {
  lead: Record<string, string | number>;
  tasks: {
    id: string;
    title: string;
    due_at: string;
    completed_at: string | null;
  }[];
  activity: {
    action_type: string;
    note: string;
    previous_status: string | null;
    new_status: string | null;
    created_at: string;
  }[];
  notifications: {
    kind: string;
    state: string;
    attempts: number;
    sent_at: string | null;
  }[];
};
export function LeadActions({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<Detail | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    previous = useRef<HTMLElement | null>(null);
  async function load() {
    setData(
      await crmRequest("/api/admin/digital-solutions/" + id, {
        action: "detail",
      }),
    );
  }
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    void crmRequest("/api/admin/digital-solutions/" + id, { action: "detail" })
      .then(setData)
      .catch(() => setError("Enquiry could not be loaded."));
    return () => previous.current?.focus();
  }, [id]);
  async function update(input: unknown) {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      await crmRequest("/api/admin/digital-solutions/" + id, input);
      if ((input as { action: string }).action === "delete") {
        onClose();
        return true;
      }
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Change could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog ref={dialog} className="digital-crm-dialog" onCancel={onClose}>
      <button className="digital-crm-close" onClick={onClose}>
        Close enquiry
      </button>
      {error && (
        <p role="alert" className="digital-error">
          {error}
        </p>
      )}
      {!data ? (
        <p>Loading…</p>
      ) : (
        <>
          <p className="eyebrow">
            PRIVATE ENQUIRY / {String(data.lead.reference)}
          </p>
          <h2>{String(data.lead.business_name)}</h2>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  String(data.lead.reference),
                );
                setCopied(true);
              } catch {
                setError(
                  "Copy unavailable. Select the reference above to copy it.",
                );
              }
            }}
          >
            {copied ? "Reference copied" : "Copy reference"}
          </button>
          <dl>
            {[
              "full_name",
              "business_category",
              "email",
              "phone",
              "selected_package",
              "business_location",
              "existing_website",
              "estimated_budget",
              "preferred_timeline",
              "project_description",
            ].map((k) => (
              <div key={k}>
                <dt>{k.replaceAll("_", " ")}</dt>
                <dd>{String(data.lead[k] || "—")}</dd>
              </div>
            ))}
          </dl>
          <p>
            Starting package estimate:{" "}
            {data.lead.quoted_package_price == null
              ? "Custom quotation"
              : money(Number(data.lead.quoted_package_price))}
            . This is not a proposal or earned revenue.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void update({
                action: "status",
                status: new FormData(e.currentTarget).get("status"),
              });
            }}
          >
            <label>
              Lead status
              <select
                key={String(data.lead.status)}
                name="status"
                defaultValue={String(data.lead.status)}
              >
                {digital.statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button disabled={busy}>Save status</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void update({
                action: "values",
                proposalAmount: Number(f.get("proposal")),
                acceptedAmount: Number(f.get("accepted")),
                collectedAmount: Number(f.get("collected")),
              });
            }}
          >
            <h3>Commercial amounts · LKR</h3>
            {[
              ["proposal", "proposal_amount", "Quoted proposal"],
              ["accepted", "accepted_amount", "Accepted contract"],
              ["collected", "collected_amount", "Payments collected"],
            ].map(([name, key, label]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type="number"
                  min={0}
                  max={1000000000}
                  step={1}
                  required
                  defaultValue={data.lead[key]}
                />
              </label>
            ))}
            <button disabled={busy}>Save amounts</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                note = new FormData(f).get("note");
              void update({ action: "note", note }).then((saved) => {
                if (saved) f.reset();
              });
            }}
          >
            <label>
              Private note
              <textarea name="note" required maxLength={2000} rows={3} />
            </label>
            <button disabled={busy}>Add note</button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                values = new FormData(f);
              void update({
                action: "task",
                title: values.get("title"),
                dueAt: new Date(
                  String(values.get("due")) + ":00+05:30",
                ).toISOString(),
              }).then((saved) => {
                if (saved) f.reset();
              });
            }}
          >
            <h3>Follow-up</h3>
            <label>
              Task
              <input name="title" required maxLength={200} />
            </label>
            <label>
              Due · Asia/Colombo
              <input type="datetime-local" name="due" required />
            </label>
            <button disabled={busy}>Add follow-up</button>
          </form>
          {data.tasks.map((t) => (
            <div className="digital-crm-task" key={t.id}>
              <strong>{t.title}</strong>
              <span>{colomboTime(t.due_at)}</span>
              {t.completed_at ? (
                <span>Completed</span>
              ) : (
                <button
                  disabled={busy}
                  onClick={() =>
                    void update({ action: "complete_task", taskId: t.id })
                  }
                >
                  Mark completed
                </button>
              )}
            </div>
          ))}
          <h3>Notifications</h3>
          <ul>
            {data.notifications.map((n) => (
              <li key={n.kind}>
                {n.kind}: {n.state} · {n.attempts} attempt(s)
                {n.sent_at
                  ? " · accepted by email provider " + colomboTime(n.sent_at)
                  : ""}
              </li>
            ))}
          </ul>
          <p>Email-provider acceptance is not proof of inbox delivery.</p>
          <button
            disabled={busy}
            onClick={() => void update({ action: "retry_notifications" })}
          >
            Retry unsent notifications
          </button>
          <h3>Activity</h3>
          <ol>
            {data.activity.map((a, i) => (
              <li key={i}>
                <time>{colomboTime(a.created_at)}</time> · {a.action_type}
                {a.new_status
                  ? ` · ${a.previous_status} → ${a.new_status}`
                  : ""}
                {a.note && <p>{a.note}</p>}
              </li>
            ))}
          </ol>
          <details>
            <summary>Delete personal data</summary>
            <p>
              This permanently removes the enquiry, notes, tasks and linked
              notifications. A non-personal deletion audit remains.
            </p>
            <button
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Permanently delete this enquiry and related personal data?",
                  )
                )
                  void update({ action: "delete", confirmation: "DELETE" });
              }}
            >
              Delete enquiry permanently
            </button>
          </details>
        </>
      )}
    </dialog>
  );
}
