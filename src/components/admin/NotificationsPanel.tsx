"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Smartphone,
  Trash2,
  ExternalLink,
  RefreshCw,
  Radio,
  Clock,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import ScheduledNotificationsPanel, { type ScheduledRowV2 } from "./ScheduledNotificationsPanel";
import NotificationComposerV2 from "./NotificationComposerV2";

/**
 * Admin Notifications tab.
 * 2026-10-15 (notifications v2): R3-b2 replaced the four-preset form by `NotificationComposerV2`;
 * R3-b4 moved scheduling into the composer (step 5 "When") and made the scheduled list editable:
 * pressing Edit on a waiting row loads it into the composer. History and the FCM guide are unchanged
 * apart from a badge for the `contest` type.
 *
 * 2026-10-15 (Admin mobile redesign, slice A6): LAYOUT ONLY. Compact header with a 44 px round Refresh icon,
 * no pulse or spin animation, no big shadows, history as bordered cards (no side-by-side desktop rows),
 * long links wrap, the FCM developer guide is a closed <details> and its code block wraps instead of
 * scrolling sideways. Logic and API calls are unchanged.
 */
export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<ScheduledRowV2 | null>(null);
  const [scheduleRefresh, setScheduleRefresh] = useState(0);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Listing every notification is admin-only: send the signed-in admin's access token.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch("/api/notifications?admin=true", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function handleDelete(id: string) {
    try {
      // Deleting is admin-only: send the signed-in admin's access token.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      /* ignore */
    }
  }

  const getTypeBadge = (t: NotificationType) => {
    switch (t) {
      case "material":
        return "bg-sky-500/15 text-sky-300 border-sky-400/30";
      case "admin":
        return "bg-amber-500/15 text-amber-300 border-amber-400/30";
      case "contest":
        return "bg-orange-500/15 text-orange-300 border-orange-400/30";
      case "payment":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
      default:
        return "bg-indigo-500/15 text-indigo-300 border-indigo-400/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30">
            <Radio className="w-3.5 h-3.5" />
            FCM Broadcast System
          </span>
          <h2 className="font-display text-xl font-bold text-white tracking-tight mt-1.5">
            Push Notifications & Announcements
          </h2>
          <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
            Publish real-time announcements, content releases, and contest alerts directly to the Android app and website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadNotifications()}
          disabled={loading}
          aria-label="Refresh"
          className="shrink-0 w-11 h-11 grid place-items-center rounded-full bg-white/5 border border-white/10 text-white active:bg-white/10 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Composer v2 (send now, schedule, edit a waiting row) */}
      <NotificationComposerV2
        editRow={editRow}
        onEditDone={() => setEditRow(null)}
        onSent={() => void loadNotifications()}
        onScheduled={() => setScheduleRefresh((n) => n + 1)}
      />

      {/* Scheduled notifications: list, edit, cancel */}
      <ScheduledNotificationsPanel refreshKey={scheduleRefresh} onEdit={setEditRow} />

      {/* History */}
      <div className="rounded-2xl border border-white/10 bg-[#08101e] p-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Notification Broadcast History ({notifications.length})</span>
          </h3>
        </div>

        {loading ? (
          <p className="text-sm text-wisdom-muted py-6 text-center">Loading broadcasts...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-wisdom-muted py-6 text-center">No notifications broadcasted yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-start gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTypeBadge(
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400 break-all">
                      Target: {n.target === "all" ? "All Users" : n.target}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{new Date(n.createdAt).toLocaleString()}</p>
                  <h4 className="text-sm font-bold text-white break-words">{n.title}</h4>
                  <p className="text-sm text-wisdom-muted line-clamp-2 mt-0.5 break-words">{n.body}</p>
                  {n.url && (
                    <a
                      href={n.url}
                      className="inline-flex items-start gap-1 text-xs text-sky-400 mt-1.5 break-all"
                    >
                      <span>Link: {n.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  title="Delete notification"
                  aria-label="Delete notification"
                  className="shrink-0 w-11 h-11 grid place-items-center rounded-full text-slate-400 active:text-rose-400 active:bg-rose-500/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Android FCM Integration Guide (developer note, closed by default) */}
      <details className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-3">
        <summary className="flex items-center gap-2 min-h-[44px] cursor-pointer text-xs font-bold uppercase tracking-wider text-sky-300">
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>Android App (Kotlin / Capacitor) FCM Endpoint</span>
        </summary>
        <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-300 leading-relaxed font-mono break-all">
            Endpoint: <span className="text-amber-300">POST /api/notifications/register-device</span>
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Android app registers device tokens by sending:
          </p>
          <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 font-mono whitespace-pre-wrap break-words">
{`// Example Android HTTP Request on FCM token refresh
fetch("/api/notifications/register-device", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: fcmToken,
    userId: currentUserId, // optional
    platform: "android",
    deviceName: "Samsung Galaxy A54" // optional
  })
});`}
          </pre>
        </div>
      </details>
    </div>
  );
}
