"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listOrdersFromDb,
  verifyOrder,
  rejectOrder,
  statusLabel,
  type ManualOrder,
} from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import { Check, X, RefreshCw, Phone, Mail, CreditCard, ExternalLink } from "lucide-react";

type Filter = "pending_verification" | "all" | "verified" | "rejected";

export default function PaymentsPanel({ adminEmail }: { adminEmail: string }) {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<Filter>("pending_verification");

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listOrdersFromDb();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const pendingCount = orders.filter((o) => o.status === "pending_verification").length;

  async function onVerify(id: string) {
    setBusyId(id);
    const res = await verifyOrder(id, adminEmail);
    setBusyId("");
    if (res.ok) {
      setToast("Verified — student enrolled");
      load();
    } else {
      setToast(res.error || "Verify failed");
    }
  }

  async function onReject(id: string) {
    if (!window.confirm("Reject this payment?")) return;
    setBusyId(id);
    const res = await rejectOrder(id, adminEmail);
    setBusyId("");
    if (res.ok) {
      setToast("Rejected");
      load();
    } else {
      setToast(res.error || "Reject failed");
    }
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-xl border border-wisdom-cyan/40 bg-wisdom-cyan/10 px-4 py-3 text-sm text-wisdom-cyan">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Manual payments
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            {pendingCount} pending verification
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending_verification", "Pending"],
            ["verified", "Verified"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
              filter === id
                ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                : "border-white/10 text-wisdom-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <p className="py-12 text-center text-wisdom-muted">Loading payments…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-wisdom-muted">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/80 mb-1">No orders here</p>
          <p className="text-sm">
            When a student submits checkout, it appears under Pending. If this stays empty, check
            Supabase → Table Editor → <code className="text-cyan-300">orders</code> table exists.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-white">{o.id}</p>
                  <p className="text-lg font-semibold text-white mt-0.5">{o.packageName}</p>
                  <p className="text-amber-300 font-bold">{formatEtb(o.amountEtb)}</p>
                </div>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase text-wisdom-muted">
                  {statusLabel(o.status)}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm text-wisdom-muted mb-4">
                <p>
                  <span className="text-white/80">{o.studentName}</span>
                </p>
                <p className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {o.phone}
                </p>
                {o.email && (
                  <p className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {o.email}
                  </p>
                )}
                <p>
                  Method: <span className="text-white/80">{o.paymentMethod}</span>
                </p>
                <p className="sm:col-span-2">
                  Tx ref:{" "}
                  <span className="font-mono text-cyan-300">{o.transactionRef}</span>
                </p>
                {o.receiptUrl && (
                  <p className="sm:col-span-2">
                    <a
                      href={o.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View receipt (photo / PDF)
                    </a>
                  </p>
                )}
                {o.note && <p className="sm:col-span-2">Note: {o.note}</p>}
                <p className="text-xs">{new Date(o.createdAt).toLocaleString()}</p>
              </div>

              {o.status === "pending_verification" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => onVerify(o.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve & unlock
                  </button>
                  <button
                    type="button"
                    disabled={busyId === o.id}
                    onClick={() => onReject(o.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
