"use client";

/**
 * Notifications v2, slices R3-b2 and R3-b3 (sessions R3-C and R3-D). `[~]` NOT compiled, not opened in a browser.
 *
 * The new composer for the admin Notifications tab. Three categories only (owner order 2026-10-15):
 *   Admin announcement -> students read it inside Notifications (no navigation)
 *   New material release -> opens the subject or hub picked with the path selector
 *   Contest -> opens the Contest (trophy) screen; the server forces the url to /competitions
 * Writing uses the block editor with a gold live preview. Sending uses POST /api/notifications/send in
 * v2 mode (category + content [+ url] [+ target | audiences]); the server builds the short plain preview itself.
 * Audience (R3-b3): groups of students (chips with live counts, several allowed, empty = everyone) or one
 * student by user id.
 *
 * NOT here yet: scheduling and editing waiting rows (R3-b4).
 */

import { useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Megaphone, Send, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { NotificationCategory } from "@/lib/notification-v2";
import {
  editorToContent,
  newEditorBlock,
  type EditorBlock,
} from "@/lib/notification-authoring";
import {
  NOTIFICATION_PATH_TREE,
  findNotificationPath,
  type NotificationPathNode,
} from "@/lib/notification-paths";
import { NotificationBlockEditor, NotificationPreview } from "./NotificationBlockEditor";
import NotificationAudiencePicker from "./NotificationAudiencePicker";

const CATEGORIES: {
  id: NotificationCategory;
  label: string;
  hint: string;
  Icon: typeof Megaphone;
}[] = [
  {
    id: "admin",
    label: "Admin announcement",
    hint: "Students read it inside Notifications. It does not take them anywhere.",
    Icon: Megaphone,
  },
  {
    id: "material",
    label: "New material release",
    hint: "Opens the subject or hub you pick below.",
    Icon: BookOpen,
  },
  {
    id: "contest",
    label: "Contest",
    hint: "Opens the Contest (trophy) screen. Nothing to choose.",
    Icon: Trophy,
  },
];

function childrenAfter(trail: string[]): NotificationPathNode[] {
  let level = NOTIFICATION_PATH_TREE;
  for (const id of trail) {
    const node = level.find((n) => n.id === id);
    if (!node || !node.children) return [];
    level = node.children;
  }
  return level;
}

/** The deepest chosen node that has a public path. */
function pathFromTrail(trail: string[]): string | null {
  let level = NOTIFICATION_PATH_TREE;
  let path: string | null = null;
  for (const id of trail) {
    const node = level.find((n) => n.id === id);
    if (!node) break;
    if (node.path) path = node.path;
    level = node.children ?? [];
  }
  return path;
}

function initialBlocks(): EditorBlock[] {
  return [newEditorBlock("title"), newEditorBlock("p")];
}

export default function NotificationComposerV2({ onSent }: { onSent?: () => void }) {
  const [category, setCategory] = useState<NotificationCategory>("admin");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [trail, setTrail] = useState<string[]>([]);
  const [mode, setMode] = useState<"groups" | "user">("groups");
  const [groups, setGroups] = useState<string[]>([]);
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const pickedPath = category === "material" ? pathFromTrail(trail) : null;
  const pickedChoice = pickedPath ? findNotificationPath(pickedPath) : undefined;

  function setLevel(depth: number, id: string) {
    const next = trail.slice(0, depth);
    if (id) next.push(id);
    setTrail(next);
  }

  async function handleSend() {
    setFeedback(null);
    const content = editorToContent(blocks);
    if (!title.trim()) {
      setFeedback({ ok: false, message: "Write the notification title first." });
      return;
    }
    if (!content) {
      setFeedback({ ok: false, message: "Write the message (add a paragraph with some text)." });
      return;
    }
    if (category === "material" && !pickedPath) {
      setFeedback({ ok: false, message: "Pick where this material notice should open." });
      return;
    }
    if (mode === "user" && !targetUser.trim()) {
      setFeedback({ ok: false, message: "Enter the student's user id." });
      return;
    }
    if (mode === "groups") {
      const who =
        groups.length === 0
          ? "EVERY student"
          : groupCount === null
          ? "the selected groups"
          : `${groupCount} student(s)`;
      if (!window.confirm(`Send this to ${who} now? This cannot be undone.`)) return;
    }

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setFeedback({ ok: false, message: "Your admin session has expired. Please sign in again." });
        return;
      }

      const payload: Record<string, unknown> = {
        title: title.trim(),
        category,
        content,
      };
      if (category === "material" && pickedPath) payload.url = pickedPath;
      if (mode === "user") payload.target = targetUser.trim();
      else payload.audiences = groups;

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setFeedback({ ok: false, message: data.error || "Failed to send the notification." });
        return;
      }

      const recipients = typeof data.recipients === "number" ? data.recipients : 0;
      const pushed = typeof data.pushed === "number" ? data.pushed : null;
      setFeedback({
        ok: true,
        message:
          "Sent. " +
          (data.broadcast ? "Everyone can see it. " : recipients > 0 ? `Students reached: ${recipients}. ` : "") +
          (pushed !== null ? `Push sent to ${pushed} device(s).` : ""),
      });
      setTitle("");
      setBlocks(initialBlocks());
      onSent?.();
    } catch (err: unknown) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSending(false);
    }
  }

  const levels: NotificationPathNode[][] = [];
  if (category === "material") {
    for (let depth = 0; depth <= trail.length; depth += 1) {
      const options = childrenAfter(trail.slice(0, depth));
      if (options.length === 0) break;
      levels.push(options);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626] to-[#070e1a] p-5 sm:p-7 shadow-xl space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white">New notification</h3>
        <p className="text-[11px] text-wisdom-muted">
          1 Category, 2 Write, 3 Destination, 4 Audience, then send.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
            feedback.ok
              ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-400/30 text-rose-300"
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1 Category */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">1. Category</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(({ id, label, hint, Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  active
                    ? "border-amber-300/70 bg-amber-300/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-amber-300" : "text-slate-400"}`} />
                <span className="block text-sm font-bold text-white">{label}</span>
                <span className="block text-[11px] text-wisdom-muted mt-1 leading-relaxed">{hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Write */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-300">2. Write</p>
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400">
            Notification title (shown on the phone and in the list) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Exam schedule update"
            className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <NotificationBlockEditor value={blocks} onChange={setBlocks} />
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Live preview (reading view)</p>
            <NotificationPreview blocks={blocks} />
          </div>
        </div>
      </div>

      {/* 3 Destination */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">3. Destination</p>
        {category === "admin" && (
          <p className="text-xs text-wisdom-muted">
            None. A tap opens the full-screen reading view inside Notifications.
          </p>
        )}
        {category === "contest" && (
          <p className="text-xs text-wisdom-muted">
            Automatic: a tap opens the Contest (trophy) screen.
          </p>
        )}
        {category === "material" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {levels.map((options, depth) => (
                <select
                  key={depth}
                  value={trail[depth] ?? ""}
                  onChange={(e) => setLevel(depth, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-amber-300/60"
                >
                  <option value="">
                    {depth === 0 ? "Choose a group…" : "Choose (optional, deeper)…"}
                  </option>
                  {options.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              This opens:{" "}
              {pickedChoice ? (
                <>
                  <span className="text-amber-300">{pickedChoice.crumbs.join(" › ")}</span>{" "}
                  <span className="font-mono text-slate-500">({pickedChoice.path})</span>
                </>
              ) : (
                <span className="text-slate-500">nothing picked yet (choose at least a subject or course)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 4 Audience */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-300">4. Audience</p>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
            <input
              type="radio"
              name="v2audience"
              checked={mode === "groups"}
              onChange={() => setMode("groups")}
              className="accent-amber-300"
            />
            <span>Groups of students</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
            <input
              type="radio"
              name="v2audience"
              checked={mode === "user"}
              onChange={() => setMode("user")}
              className="accent-amber-300"
            />
            <span>One student (user id)</span>
          </label>
        </div>
        {mode === "groups" ? (
          <NotificationAudiencePicker
            value={groups}
            onChange={setGroups}
            onCountChange={setGroupCount}
          />
        ) : (
          <input
            type="text"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            placeholder="Student user id (UUID)"
            className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60"
          />
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? "Sending..." : "Send now"}</span>
        </button>
      </div>
    </div>
  );
}
