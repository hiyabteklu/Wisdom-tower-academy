"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2, Clock, Check, ChevronRight } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const STORAGE_KEY = "wt_study_planner_v2";

export type StudyBlock = {
  id: string;
  day: number;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  title: string;
  color: string;
};

const COLORS = [
  "bg-cyan-500/25 border-cyan-400 text-cyan-200",
  "bg-amber-500/25 border-amber-400 text-amber-200",
  "bg-violet-500/25 border-violet-400 text-violet-200",
  "bg-emerald-500/25 border-emerald-400 text-emerald-200",
  "bg-sky-500/25 border-sky-400 text-sky-200",
];

function loadBlocks(): StudyBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudyBlock[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: StudyBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

function todayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

export default function StudyPlanner() {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  // Form state with minute-precise time inputs
  const [showForm, setShowForm] = useState(false);
  const [draftDay, setDraftDay] = useState(0);
  const [draftStart, setDraftStart] = useState("09:00");
  const [draftEnd, setDraftEnd] = useState("10:30");
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    const loaded = loadBlocks();
    if (loaded.length === 0) {
      // Sensible starter timetable blocks
      const starter: StudyBlock[] = [
        { id: "sb-1", day: 0, startTime: "09:00", endTime: "10:30", title: "Mathematics Calculus", color: COLORS[0] },
        { id: "sb-2", day: 0, startTime: "14:00", endTime: "15:30", title: "Physics Mechanics", color: COLORS[1] },
        { id: "sb-3", day: 1, startTime: "10:00", endTime: "11:30", title: "Chemistry Kinetics", color: COLORS[2] },
        { id: "sb-4", day: 2, startTime: "16:00", endTime: "17:15", title: "Flashcard Drill", color: COLORS[3] },
      ];
      setBlocks(starter);
      saveBlocks(starter);
    } else {
      setBlocks(loaded);
    }
    const today = todayIndex();
    setSelectedDay(today);
    setDraftDay(today);
    setReady(true);
  }, []);

  const persist = useCallback((next: StudyBlock[]) => {
    setBlocks(next);
    saveBlocks(next);
  }, []);

  function addBlock(e?: React.FormEvent) {
    e?.preventDefault();
    const title = draftTitle.trim() || "Study Session";
    const newBlock: StudyBlock = {
      id: `b-${Date.now()}`,
      day: draftDay,
      startTime: draftStart || "09:00",
      endTime: draftEnd || "10:00",
      title,
      color: COLORS[blocks.length % COLORS.length],
    };
    persist([...blocks, newBlock]);
    setDraftTitle("");
    setShowForm(false);
  }

  function removeBlock(id: string) {
    persist(blocks.filter((b) => b.id !== id));
  }

  // Active day blocks sorted by time
  const currentDayBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [blocks, selectedDay]);

  if (!ready) return null;

  return (
    <CollapsibleSection
      title="Study planner"
      subtitle="Weekly schedule & minute-precise timer blocks"
      icon={<CalendarDays className="w-5 h-5 text-cyan-400" />}
      defaultOpen={false}
    >
      <div className="space-y-4">
        {/* Top Control Bar: Mode Toggle + Add Block Button */}
        <div className="flex items-center justify-between gap-2">
          {/* Day / Week Switcher */}
          <div className="flex items-center rounded-xl bg-[#0a101c] p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "day"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Day View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "week"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Week Grid
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setDraftDay(selectedDay);
              setShowForm((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showForm ? "Close Form" : "Add Block"}</span>
          </button>
        </div>

        {/* Add Block Form with Native Rotating Clock / Time Pickers */}
        {showForm && (
          <form
            onSubmit={addBlock}
            className="rounded-2xl border border-cyan-400/40 bg-[#0a101c] p-4 space-y-3 shadow-xl animate-fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/8">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Schedule New Study Session
              </span>
              <span className="text-[10px] text-slate-400">Exact Hour & Minute Inputs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <label className="text-slate-400">
                Course / Subject Title
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="e.g. Calculus Derivatives"
                  className="mt-1 w-full rounded-xl border border-white/12 bg-[#111b2e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </label>

              <label className="text-slate-400">
                Day of Week
                <select
                  value={draftDay}
                  onChange={(e) => setDraftDay(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/12 bg-[#111b2e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i} className="bg-[#111b2e] text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              {/* Native Rotating Clock Time Pickers (Interactive on mobile/desktop) */}
              <label className="text-slate-400">
                Start Time (Clock)
                <div className="relative mt-1">
                  <input
                    type="time"
                    value={draftStart}
                    onChange={(e) => setDraftStart(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-[#111b2e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </label>

              <label className="text-slate-400">
                End Time (Clock)
                <div className="relative mt-1">
                  <input
                    type="time"
                    value={draftEnd}
                    onChange={(e) => setDraftEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-[#111b2e] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md"
              >
                Save Session
              </button>
            </div>
          </form>
        )}

        {/* Days Tabs (Mon - Sun) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {DAYS.map((d, i) => {
            const isSelected = i === selectedDay;
            const isToday = i === todayIndex();
            const count = blocks.filter((b) => b.day === i).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                    : "bg-[#0a101c] border-white/8 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <span>{d}</span>
                {isToday && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                {count > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-white/10 text-slate-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── View 1: Day View (Mobile-Friendly, No Overflow, Compact) ── */}
        {viewMode === "day" && (
          <div className="rounded-2xl border border-white/10 bg-[#0a101c] p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/8">
              <span className="text-xs font-bold text-white">
                {DAYS[selectedDay]} Study Timeline
              </span>
              <span className="text-[11px] text-slate-400">
                {currentDayBlocks.length} session{currentDayBlocks.length === 1 ? "" : "s"} scheduled
              </span>
            </div>

            {currentDayBlocks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No study sessions scheduled for {DAYS[selectedDay]}. Click &quot;Add Block&quot; to set one.
              </div>
            ) : (
              <div className="space-y-2">
                {currentDayBlocks.map((b) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${b.color}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/40 shrink-0">
                        {b.startTime} – {b.endTime}
                      </span>
                      <p className="font-bold text-white truncate">{b.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeBlock(b.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── View 2: Compact Week Grid (Smaller font, fit in mobile) ── */}
        {viewMode === "week" && (
          <div className="rounded-2xl border border-white/10 bg-[#0a101c] p-3 overflow-x-auto">
            <div className="min-w-[500px] grid grid-cols-7 gap-2 text-center text-[11px]">
              {DAYS.map((d, i) => {
                const dayBlocks = blocks
                  .filter((b) => b.day === i)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <div key={d} className="rounded-xl border border-white/8 bg-[#111b2e] p-2 space-y-1.5">
                    <p className={`font-bold pb-1 border-b border-white/8 ${i === todayIndex() ? "text-cyan-400" : "text-white"}`}>
                      {d}
                    </p>
                    {dayBlocks.length === 0 ? (
                      <p className="text-[10px] text-slate-500 py-2">Free</p>
                    ) : (
                      dayBlocks.map((b) => (
                        <div
                          key={b.id}
                          className={`p-1.5 rounded-lg border text-[10px] text-left relative group ${b.color}`}
                        >
                          <p className="font-bold truncate text-white">{b.title}</p>
                          <p className="text-[9px] font-mono opacity-80">{b.startTime}</p>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
