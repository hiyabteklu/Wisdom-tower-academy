"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2, Clock } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const STORAGE_KEY = "wt_study_planner_v1";

type Block = {
  id: string;
  day: number; // 0 = Mon
  startHour: number;
  endHour: number; // exclusive
  title: string;
  color: string;
};

const COLORS = [
  "bg-cyan-500/80 border-cyan-300/50",
  "bg-amber-500/80 border-amber-300/50",
  "bg-violet-500/80 border-violet-300/50",
  "bg-emerald-500/80 border-emerald-300/50",
  "bg-rose-500/80 border-rose-300/50",
];

function loadBlocks(): Block[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Block[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: Block[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

/** JS getDay: 0=Sun … 6=Sat → our index 0=Mon … 6=Sun */
function todayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${period}`;
}

export default function StudyPlanner() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [draftDay, setDraftDay] = useState(0);
  const [draftStart, setDraftStart] = useState(9);
  const [draftEnd, setDraftEnd] = useState(10);
  const [draftTitle, setDraftTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setBlocks(loadBlocks());
    setReady(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const persist = useCallback((next: Block[]) => {
    setBlocks(next);
    saveBlocks(next);
  }, []);

  const currentDay = todayIndex(now);
  const currentHour = now.getHours();
  const minuteFrac = now.getMinutes() / 60;

  const blocksByCell = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const b of blocks) {
      for (let h = b.startHour; h < b.endHour; h++) {
        const key = `${b.day}-${h}`;
        const list = map.get(key) || [];
        list.push(b);
        map.set(key, list);
      }
    }
    return map;
  }, [blocks]);

  function addBlock() {
    const title = draftTitle.trim() || "Study block";
    const start = Math.min(draftStart, draftEnd - 1);
    const end = Math.max(draftEnd, start + 1);
    const block: Block = {
      id: `b-${Date.now()}`,
      day: draftDay,
      startHour: start,
      endHour: Math.min(24, end),
      title,
      color: COLORS[blocks.length % COLORS.length],
    };
    persist([...blocks, block]);
    setDraftTitle("");
    setShowForm(false);
  }

  function removeBlock(id: string) {
    persist(blocks.filter((b) => b.id !== id));
  }

  function onCellClick(day: number, hour: number) {
    setDraftDay(day);
    setDraftStart(hour);
    setDraftEnd(Math.min(24, hour + 1));
    setShowForm(true);
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-8 text-center text-sm text-wisdom-muted">
        Loading planner…
      </div>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-1">
            Weekly plan
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-300" />
            Study planner
          </h2>
          <p className="text-xs text-wisdom-muted mt-1">
            24-hour week view · live time bar moves with the clock
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2 text-sm font-bold text-wisdom-dark hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          Add block
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-wisdom-card p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="text-xs text-wisdom-muted">
            Title
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="e.g. Physics review"
              className="mt-1 w-full rounded-lg border border-white/15 bg-wisdom-dark/50 px-2.5 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-wisdom-muted">
            Day
            <select
              value={draftDay}
              onChange={(e) => setDraftDay(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-wisdom-dark/50 px-2.5 py-2 text-sm text-white"
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-wisdom-muted">
            Start
            <select
              value={draftStart}
              onChange={(e) => setDraftStart(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-wisdom-dark/50 px-2.5 py-2 text-sm text-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-wisdom-muted">
            End
            <select
              value={draftEnd}
              onChange={(e) => setDraftEnd(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-wisdom-dark/50 px-2.5 py-2 text-sm text-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h + 1}>
                  {formatHour(h + 1 > 23 ? 0 : h + 1)}
                  {h + 1 > 23 ? " (next)" : ""}
                </option>
              )).slice(0, 24)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={addBlock}
              className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-bold text-wisdom-dark"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-wisdom-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header days */}
            <div
              className="grid border-b border-white/10 bg-wisdom-dark/40 sticky top-0 z-20"
              style={{ gridTemplateColumns: "4.5rem repeat(7, minmax(0, 1fr))" }}
            >
              <div className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-wisdom-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time
              </div>
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`px-1 py-2.5 text-center text-xs font-bold ${
                    i === currentDay
                      ? "text-cyan-300 bg-cyan-500/10"
                      : "text-white/80"
                  }`}
                >
                  {d}
                  {i === currentDay && (
                    <span className="block text-[9px] font-semibold text-cyan-400/90 normal-case tracking-normal">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="relative max-h-[28rem] overflow-y-auto">
              {/* Now line across the week at current hour + minutes */}
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                style={{
                  top: `calc(${(currentHour + minuteFrac) * 2.75}rem)`,
                }}
                aria-hidden
              >
                <span className="ml-[0.15rem] shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="h-0.5 flex-1 bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              </div>

              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-white/[0.06]"
                  style={{
                    gridTemplateColumns: "4.5rem repeat(7, minmax(0, 1fr))",
                    height: "2.75rem",
                  }}
                >
                  <div
                    className={`px-2 text-[10px] font-medium tabular-nums flex items-start pt-1 ${
                      hour === currentHour ? "text-rose-300" : "text-wisdom-muted"
                    }`}
                  >
                    {formatHour(hour)}
                  </div>
                  {DAYS.map((_, day) => {
                    const cellBlocks = blocksByCell.get(`${day}-${hour}`) || [];
                    const isNow = day === currentDay && hour === currentHour;
                    return (
                      <button
                        key={`${day}-${hour}`}
                        type="button"
                        onClick={() => onCellClick(day, hour)}
                        className={`relative border-l border-white/[0.06] text-left transition-colors hover:bg-white/[0.04] ${
                          day === currentDay ? "bg-cyan-500/[0.04]" : ""
                        } ${isNow ? "ring-1 ring-inset ring-rose-400/40" : ""}`}
                      >
                        {cellBlocks.map((b) => (
                          <div
                            key={b.id}
                            className={`absolute inset-x-0.5 top-0.5 bottom-0.5 rounded-md border px-1 py-0.5 overflow-hidden ${b.color}`}
                            title={b.title}
                          >
                            <span className="block text-[9px] font-bold text-white truncate leading-tight">
                              {b.title}
                            </span>
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {blocks.length > 0 && (
          <div className="border-t border-white/10 p-3 flex flex-wrap gap-2">
            {blocks.map((b) => (
              <span
                key={b.id}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] text-white ${b.color}`}
              >
                {DAYS[b.day]} · {formatHour(b.startHour)}–{formatHour(b.endHour % 24)}
                {" · "}
                {b.title}
                <button
                  type="button"
                  onClick={() => removeBlock(b.id)}
                  className="p-0.5 rounded hover:bg-black/20"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
