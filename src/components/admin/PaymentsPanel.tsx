"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listOrdersFromDb,
  verifyOrder,
  rejectOrder,
  statusLabel,
  type ManualOrder,
} from "@/lib/orders";
import { notifyApproval, notifyRejection, formatNotifyToast } from "@/lib/notify";
import { formatEtb } from "@/data/packages";
import { downloadCsv } from "@/lib/admin-data";
import BrandLoader from "@/components/BrandLoader";
import {
  Check,
  X,
  RefreshCw,
  Phone,
  Mail,
  CreditCard,
  Search,
  Download,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
} from "lucide-react";

/**
 * Admin Payments tab.
 *
 * 2026-10-15 (Admin mobile redesign, slice A8): LAYOUT ONLY. Audit hits before the change: `backdrop-blur-md` and
 * `backdrop-blur-sm` (receipt and reject overlays), `animate-spin` (Refresh icon), `animate-fade-in` (toast and 2
 * modals), `shadow-2xl`, `shadow-lg`, `shadow-md`, `min-w-[240px]` (search box), a 4-button segmented status row,
 * and many buttons under 44 px. Now: two 44 px pills in a 2-column grid, a 2-column stat strip, search full width,
 * status filter as a 2x2 grid of pills (no scrolling row), one-column order cards with the money and the buttons
 * stacked, both windows are solid bottom sheets (no blur, no animation, bounded height with `overscroll-contain`),
 * toast sits between the screen edges. Logic, state, database calls, approve / reject flow, notifications and CSV
 * export are unchanged. Unused icon imports (Filter, ShieldCheck, Clock, AlertCircle, ExternalLink) were dropped.
 */

type FilterStatus = "pending_verification" | "all" | "verified" | "rejected";

const FIELD_CLASS =
  "w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-sm text-white placeholder-wisdom-muted focus:outline-none focus:border-amber-400";

const SHEET_OVERLAY_CLASS = "fixed inset-0 z-50 flex items-end justify-center bg-black/80";

export default function PaymentsPanel({ adminEmail }: { adminEmail: string }) {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending_verification");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Receipt Modal State
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Reject Modal State
  const [rejectOrderModal, setRejectOrderModal] = useState<ManualOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listOrdersFromDb();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Derived filtered orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Status match
      if (filterStatus !== "all" && o.status !== filterStatus) return false;

      // Bank match
      if (bankFilter !== "all") {
        const method = (o.paymentMethod || "").toLowerCase();
        if (bankFilter === "telebirr" && !method.includes("telebirr")) return false;
        if (bankFilter === "cbe" && !method.includes("cbe")) return false;
        if (bankFilter === "abyssinia" && !method.includes("abyssinia")) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.email || "").toLowerCase().includes(q) ||
          o.transactionRef.toLowerCase().includes(q) ||
          o.packageName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [orders, filterStatus, bankFilter, searchQuery]);

  const pendingOrders = orders.filter((o) => o.status === "pending_verification");
  const verifiedOrders = orders.filter((o) => o.status === "verified");
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.amountEtb || 0), 0);
  const verifiedAmount = verifiedOrders.reduce((sum, o) => sum + (o.amountEtb || 0), 0);

  async function onVerify(id: string) {
    setBusyId(id);
    const res = await verifyOrder(id, adminEmail);
    if (!res.ok) {
      setBusyId("");
      setToast(res.error || "Verify failed");
      return;
    }
    const n = await notifyApproval(id);
    setBusyId("");
    setToast(formatNotifyToast(n, "Approved"));
    void load();
  }

  async function onConfirmReject() {
    if (!rejectOrderModal) return;
    const orderId = rejectOrderModal.id;
    setBusyId(orderId);
    const res = await rejectOrder(orderId, adminEmail);
    if (!res.ok) {
      setBusyId("");
      setToast(res.error || "Reject failed");
      return;
    }
    const n = await notifyRejection(orderId);
    setBusyId("");
    setRejectOrderModal(null);
    setRejectReason("");
    setToast(formatNotifyToast(n, "Rejected"));
    void load();
  }

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order ID",
      "Student Name",
      "Phone",
      "Email",
      "Package Name",
      "Amount ETB",
      "Payment Method",
      "Transaction Ref",
      "Status",
      "Created At",
      "Verified At",
      "Verified By",
    ];
    const rows = filtered.map((o) => [
      o.id,
      o.studentName,
      o.phone,
      o.email || "",
      o.packageName,
      o.amountEtb,
      o.paymentMethod || "",
      o.transactionRef,
      o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      o.verifiedAt ? new Date(o.verifiedAt).toLocaleString() : "",
      o.verifiedBy || "",
    ]);
    downloadCsv(`wisdom_tower_orders_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 inset-x-4 z-[60] rounded-2xl border border-amber-400/40 bg-wisdom-card p-3.5 text-sm font-semibold text-amber-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{toast}</span>
        </div>
      )}

      {/* Header and Actions */}
      <div className="space-y-3 border-b border-white/8 pb-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white flex items-start gap-2">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
            <span>Payment Operations & Order Verification</span>
          </h2>
          <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
            Manual bank slip verification, Telebirr & CBE confirmations, and automated student enrollment
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full border border-white/12 text-sm font-semibold text-white/90 active:bg-white/10 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export CSV ({filtered.length})</span>
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-sm font-semibold active:bg-amber-500/30 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Financial Pipeline Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="min-w-0 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Pending Verification
          </p>
          <p className="text-xl font-bold text-white mt-1 tabular-nums break-words">
            {formatEtb(pendingAmount)}
          </p>
          <p className="text-xs text-amber-200/80 mt-1 font-medium">
            {pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"} awaiting approval
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Total Verified Revenue
          </p>
          <p className="text-xl font-bold text-white mt-1 tabular-nums break-words">
            {formatEtb(verifiedAmount)}
          </p>
          <p className="text-xs text-emerald-200/80 mt-1 font-medium">
            {verifiedOrders.length} confirmed paid orders
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-white/10 bg-wisdom-card p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            All-Time Orders
          </p>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{orders.length}</p>
          <p className="text-xs text-wisdom-muted mt-1">
            Across Telebirr, CBE, Abyssinia, and other rails
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5 bg-wisdom-card/60 p-3 rounded-2xl border border-white/8">
        <div className="relative">
          <Search className="w-4 h-4 text-wisdom-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order, student, phone, email, ref"
            className={`${FIELD_CLASS} pl-10`}
          />
        </div>

        {/* Status filter: 2x2 pills, no scrolling row */}
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["pending_verification", `Pending (${pendingOrders.length})`],
              ["verified", "Verified"],
              ["rejected", "Rejected"],
              ["all", "All"],
            ] as const
          ).map(([stId, stLabel]) => (
            <button
              key={stId}
              type="button"
              onClick={() => setFilterStatus(stId)}
              className={`min-h-[44px] px-3 rounded-full border text-sm font-semibold cursor-pointer ${
                filterStatus === stId
                  ? "bg-amber-500 border-amber-400 text-wisdom-dark font-bold"
                  : "bg-wisdom-dark border-white/10 text-wisdom-muted active:bg-white/10"
              }`}
            >
              {stLabel}
            </button>
          ))}
        </div>

        {/* Bank Filter */}
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className={`${FIELD_CLASS} font-semibold`}
        >
          <option value="all">All Payment Methods</option>
          <option value="telebirr">Telebirr</option>
          <option value="cbe">CBE</option>
          <option value="abyssinia">Bank of Abyssinia</option>
        </select>

        <p className="text-xs text-wisdom-muted tabular-nums">
          Showing {filtered.length} of {orders.length}
        </p>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <BrandLoader size="md" label="Loading orders..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-wisdom-muted">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white mb-1">No orders found</p>
          <p className="text-sm">No orders matching the selected status or search filter.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((o) => (
            <div
              key={o.id}
              className={`rounded-2xl border p-3.5 ${
                o.status === "pending_verification"
                  ? "border-amber-400/40 bg-wisdom-card"
                  : o.status === "verified"
                    ? "border-white/10 bg-wisdom-card/90"
                    : "border-white/8 bg-wisdom-card/50 opacity-80"
              }`}
            >
              {/* Order id, status, method */}
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 font-mono text-sm font-bold text-white break-all">{o.id}</span>
                <span
                  className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    o.status === "verified"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                      : o.status === "pending_verification"
                        ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                        : "bg-rose-500/15 text-rose-300 border-rose-400/30"
                  }`}
                >
                  {statusLabel(o.status)}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-2 break-words">{o.packageName}</h3>
              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <p className="text-base font-extrabold text-amber-300 tabular-nums">
                  {formatEtb(o.amountEtb)}
                </p>
                <span className="text-xs text-wisdom-muted min-w-0 truncate">
                  via <strong className="text-white uppercase">{o.paymentMethod || "Bank"}</strong>
                </span>
              </div>

              {/* Student details */}
              <div className="space-y-1.5 text-xs text-wisdom-muted py-2.5 mt-2.5 border-t border-white/6">
                <p className="text-sm text-white/90 font-semibold break-words">{o.studentName}</p>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{o.phone}</span>
                </div>
                {o.email && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-wisdom-muted shrink-0" />
                    <span className="truncate">{o.email}</span>
                  </div>
                )}
              </div>

              {/* Transaction reference and timestamp */}
              <div className="space-y-1.5 py-2.5 text-xs text-wisdom-muted border-t border-white/6">
                <div className="break-all">
                  <span>Ref: </span>
                  <span className="font-mono font-bold text-cyan-300 select-all">
                    {o.transactionRef}
                  </span>
                  {o.note && <span className="text-wisdom-muted ml-1 italic">({o.note})</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Placed {new Date(o.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              {(o.receiptUrl || o.status === "pending_verification") && (
                <div className="space-y-2 pt-3 border-t border-white/6">
                  {o.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setViewReceiptUrl(o.receiptUrl!)}
                      className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-cyan-300 active:bg-white/10 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 shrink-0" />
                      <span>View Receipt</span>
                    </button>
                  )}

                  {o.status === "pending_verification" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onVerify(o.id)}
                        disabled={busyId === o.id}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-full text-sm font-bold bg-emerald-500 text-white active:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{busyId === o.id ? "Verifying..." : "Approve & Unlock"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectOrderModal(o)}
                        disabled={busyId === o.id}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-full text-sm font-semibold text-rose-300 active:bg-rose-500/10 border border-rose-500/30 disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4 shrink-0" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* SHEET 1: RECEIPT VIEWER                                   */}
      {/* ========================================================= */}
      {viewReceiptUrl && (
        <div className={SHEET_OVERLAY_CLASS}>
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/15 bg-wisdom-card p-4 space-y-3"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <h3 className="min-w-0 font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Payment Receipt Slip</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewReceiptUrl(null)}
                aria-label="Close"
                className="shrink-0 w-11 h-11 grid place-items-center rounded-full text-wisdom-muted active:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-black/50 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewReceiptUrl}
                alt="Payment Receipt"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>

            <button
              type="button"
              onClick={() => setViewReceiptUrl(null)}
              className="w-full min-h-[44px] rounded-full text-sm font-bold bg-white/10 text-white active:bg-white/15 cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SHEET 2: REJECT ORDER                                     */}
      {/* ========================================================= */}
      {rejectOrderModal && (
        <div className={SHEET_OVERLAY_CLASS}>
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl border border-rose-400/30 bg-wisdom-card p-4 space-y-4"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Reject Payment Order
              </p>
              <h3 className="text-lg font-bold text-white mt-0.5 break-all">
                Reject Order {rejectOrderModal.id}
              </h3>
              <p className="text-xs text-wisdom-muted mt-1 break-words">
                Student: {rejectOrderModal.studentName} ({formatEtb(rejectOrderModal.amountEtb)})
              </p>
            </div>

            <p className="text-sm text-wisdom-muted leading-relaxed">
              Are you sure you want to reject this payment? The order will be flagged as rejected and the student will be notified if email or SMS is active.
            </p>

            <div className="pt-3 border-t border-white/8 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRejectOrderModal(null)}
                className="min-h-[44px] rounded-full border border-white/15 text-sm font-semibold text-white/90 active:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmReject}
                disabled={busyId === rejectOrderModal.id}
                className="min-h-[44px] rounded-full text-sm font-bold bg-rose-500 text-white active:bg-rose-400 disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
