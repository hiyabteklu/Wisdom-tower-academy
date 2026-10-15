"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Admin panel: schedule a notification for a later time, see the schedule and
 * cancel a waiting one.
 *
 * It calls the admin database functions admin_schedule_notification,
 * admin_list_scheduled_notifications and admin_cancel_scheduled_notification
 * with the signed-in admin's own session (the database checks that the caller
 * is an admin). The database scheduler (pg_cron, every minute) calls
 * /api/notifications/dispatch, which sends every due row.
 *
 * All times typed here are Ethiopia time (EAT, UTC+3), whatever the time zone
 * of the computer being used.
 */

type ScheduledStatus = "pending" | "sending" | "sent" | "failed" | "cancelled";

type ScheduledRow = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  send_at: string;
  status: ScheduledStatus;
  audience_scope: string | null;
  package_id: string | null;
  competition_id: string | null;
  created_at: string;
  sent_at: string | null;
  last_error: string | null;
  attempts: number;
};

const EAT_OFFSET = "+03:00";

function formatEat(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("en-GB", {
      timeZone: "Africa/Addis_Ababa",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " EAT"
  );
}

function friendlyError(message: string): string {
  if (message.includes("admin_only")) {
    return "Only an admin account can do this. Please sign in again as admin.";
  }
  if (message.includes("send_at_must_be_in_future")) return "The send time must be in the future.";
  if (message.includes("title_required")) return "Please enter a title.";
  if (message.includes("body_required")) return "Please enter a message.";
  if (message.includes("not_pending_or_not_found")) {
    return "This notification is no longer waiting to be sent.";
  }
  return message || "Something went wrong.";
}

function statusBadge(status: ScheduledStatus): string {
  switch (status) {
    case "pending":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "sending":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "sent":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "failed":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-400/30";
  }
}

export default function ScheduledNotificationsPanel() {
  const [rows, setRows] = useState<ScheduledRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [sendAtLocal, setSendAtLocal] = useState("");
  const [scope, setScope] = useState<"all" | "freshman">("all");
  const [packageId, setPackageId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_scheduled_notifications", {
      p_limit: 50,
    });
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? (data as ScheduledRow[]) : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !body.trim()) {
      setFeedback({ type: "error", message: "Please fill in the title and the message." });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sendAtLocal)) {
      setFeedback({ type: "error", message: "Please pick the date and time to send." });
      return;
    }
    // The typed time is Ethiopia time (UTC+3).
    const sendAt = new Date(`${sendAtLocal}:00${EAT_OFFSET}`);
    if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() <= Date.now() + 60_000) {
      setFeedback({
        type: "error",
        message: "Pick a time at least one minute from now (Ethiopia time).",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("admin_schedule_notification", {
      p_title: title.trim(),
      p_body: body.trim(),
      p_send_at: sendAt.toISOString(),
      p_url: url.trim() || null,
      p_audience_scope: scope === "all" ? null : scope,
      p_package_id: packageId.trim() || null,
    });
    setSaving(false);

    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
      return;
    }

    setFeedback({
      type: "success",
      message: `Scheduled for ${formatEat(sendAt.toISOString())}. It is sent within a minute after that time.`,
    });
    setTitle("");
    setBody("");
    setUrl("");
    setSendAtLocal("");
    setPackageId("");
    void load();
  }

  async function handleCancel(id: string) {
    if (!window.confirm("Cancel this scheduled notification? It will not be sent.")) return;
    setFeedback(null);
    const { error } = await supabase.rpc("admin_cancel_scheduled_notification", { p_id: id });
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
    } else {
      setFeedback({ type: "success", message: "Cancelled." });
    }
    void load();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSchedule}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626] to-[#070e1a] p-5 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-white/8 pb-4">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Schedule a Notification</h3>
            <p className="text-[11px] text-wisdom-muted">
              Sent automatically at the chosen time (Ethiopia time). Checked every minute.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-400/30 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Message <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Send at (Ethiopia time) <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={sendAtLocal}
              onChange={(e) => setSendAtLocal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Link when tapped (optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/competitions opens the trophy screen in the app"
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Who gets it</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value === "freshman" ? "freshman" : "all")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
            >
              <option value="all">All students</option>
              <option value="freshman">Freshman students</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Only students with this package id (optional)
            </label>
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{saving ? "Scheduling..." : "Schedule"}</span>
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-white/10 bg-[#08101e] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Scheduled Notifications ({rows.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-wisdom-muted py-6 text-center">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-wisdom-muted py-6 text-center">Nothing scheduled yet.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {rows.map((r) => (
              <div
                key={r.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${statusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatEat(r.send_at)}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {r.audience_scope ? r.audience_scope : "all students"}
                      {r.package_id ? ` / package ${r.package_id}` : ""}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{r.title}</h4>
                  <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">{r.body}</p>
                  {r.url && (
                    <p className="text-[11px] text-sky-400 mt-1">Link: {r.url}</p>
                  )}
                  {r.last_error && (
                    <p className="text-[11px] text-rose-300 mt-1">{r.last_error}</p>
                  )}
                </div>

                {r.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => void handleCancel(r.id)}
                    title="Cancel"
                    className="shrink-0 p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
