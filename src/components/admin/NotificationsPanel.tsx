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
import ScheduledNotificationsPanel from "./ScheduledNotificationsPanel";
import NotificationComposerV2 from "./NotificationComposerV2";

/**
 * Admin Notifications tab.
 * 2026-10-15 (notifications v2, slice R3-b2): the old four-preset form was replaced by
 * `NotificationComposerV2` (three categories, block editor with gold preview, path selector).
 * The scheduled panel below still uses the old scheduling form until R3-b4. History and the FCM guide
 * are unchanged apart from a badge for the new `contest` type.
 */
export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              FCM Broadcast System
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Push Notifications & Announcements
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
            Publish real-time announcements, content releases, and contest alerts directly to the Android app and website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadNotifications()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Composer v2 */}
      <NotificationComposerV2 onSent={() => void loadNotifications()} />

      {/* Scheduled notifications: schedule for later, list, cancel */}
      <ScheduledNotificationsPanel />

      {/* History Table */}
      <div className="rounded-3xl border border-white/10 bg-[#08101e] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Notification Broadcast History ({notifications.length})</span>
          </h3>
        </div>

        {loading ? (
          <p className="text-xs text-wisdom-muted py-8 text-center">Loading broadcasts...</p>
        ) : notifications.length === 0 ? (
          <p className="text-xs text-wisdom-muted py-8 text-center">No notifications broadcasted yet.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTypeBadge(
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Target: {n.target === "all" ? "All Users" : n.target}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">
                    {n.body}
                  </p>
                  {n.url && (
                    <a
                      href={n.url}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline mt-1"
                    >
                      <span>Link: {n.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    title="Delete notification"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Android FCM Integration Guide */}
      <div className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>Android App (Kotlin / Capacitor) FCM Endpoint</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Endpoint: <span className="text-amber-300">POST /api/notifications/register-device</span>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Android app registers device tokens by sending:
        </p>
        <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 font-mono overflow-x-auto">
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
    </div>
  );
}
