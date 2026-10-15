"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listInquiries,
  updateInquiryStatus,
  type InquiryRow,
} from "@/lib/admin-data";
import { Inbox, RefreshCw, Mail, Check } from "lucide-react";

const STATUSES = ["new", "read", "replied", "archived"] as const;

export default function InquiriesPanel() {
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await listInquiries());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    const res = await updateInquiryStatus(id, status);
    setBusyId("");
    if (res.ok) {
      setToast(`Marked ${status}`);
      load();
    } else {
      setToast(res.error || "Update failed");
    }
  }

  const newCount = items.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-xl border border-wisdom-cyan/40 bg-wisdom-cyan/10 px-4 py-3 text-sm text-wisdom-cyan break-words">
          {toast}
        </div>
      )}

      <div className="space-y-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 shrink-0 text-wisdom-cyan" />
            Contact inquiries
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            {newCount} new · {items.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold text-white/80 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && items.length === 0 ? (
        <p className="py-10 text-center text-wisdom-muted">Loading inquiries…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-wisdom-muted">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/80 mb-1">Inbox empty</p>
          <p className="text-sm break-words">
            Messages from the Contact page land in the{" "}
            <code className="text-cyan-300">inquiries</code> table.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-white break-words">{q.name}</p>
                  <p className="text-sm text-wisdom-muted flex items-start gap-1 break-all">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                    {q.email}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold uppercase text-wisdom-muted">
                  {q.status}
                </span>
              </div>
              {q.service && (
                <p className="text-xs text-cyan-300/90 mb-2 break-words">Interest: {q.service}</p>
              )}
              <p className="text-sm text-white/85 whitespace-pre-wrap break-words leading-relaxed mb-3">
                {q.message}
              </p>
              <p className="text-xs text-wisdom-muted mb-3">
                {new Date(q.created_at).toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={busyId === q.id || q.status === st}
                    onClick={() => setStatus(q.id, st)}
                    className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold border disabled:opacity-40 ${
                      q.status === st
                        ? "border-wisdom-cyan/40 bg-wisdom-cyan/15 text-wisdom-cyan"
                        : "border-white/10 text-wisdom-muted"
                    }`}
                  >
                    {q.status === st && <Check className="w-4 h-4" />}
                    {st}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
