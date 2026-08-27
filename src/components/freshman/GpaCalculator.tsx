"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Info,
} from "lucide-react";
import { freshmanSubjects } from "@/data/freshman";
import {
  GRADE_BANDS,
  LETTER_OPTIONS,
  POINT_OPTIONS,
  bandFromLetter,
  bandFromPercent,
  bandFromPoints,
  intervalLabel,
  type GradeBand,
} from "@/data/gpa-scale";

type InputMode = "percent" | "letter" | "points";

type Row = {
  id: string;
  subjectId: string;
  credits: number;
  mode: InputMode;
  percent: string;
  letter: string;
  points: string;
};

function newRow(subjectId = ""): Row {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subjectId,
    credits: 3,
    mode: "percent",
    percent: "",
    letter: "A",
    points: "4",
  };
}

function resolveBand(row: Row): GradeBand | null {
  if (row.mode === "percent") {
    const n = parseFloat(row.percent);
    if (Number.isNaN(n) || row.percent.trim() === "") return null;
    return bandFromPercent(n);
  }
  if (row.mode === "letter") {
    return bandFromLetter(row.letter) ?? null;
  }
  const n = parseFloat(row.points);
  if (Number.isNaN(n)) return null;
  return bandFromPoints(n);
}

function subjectName(id: string) {
  return freshmanSubjects.find((s) => s.id === id)?.name ?? "—";
}

export default function GpaCalculator() {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [showScale, setShowScale] = useState(false);

  const usedIds = useMemo(() => new Set(rows.map((r) => r.subjectId).filter(Boolean)), [rows]);

  const computed = useMemo(() => {
    const lines: {
      row: Row;
      band: GradeBand;
      name: string;
    }[] = [];

    let creditSum = 0;
    let pointCreditSum = 0;

    for (const row of rows) {
      if (!row.subjectId) continue;
      const band = resolveBand(row);
      if (!band) continue;
      const cr = Math.max(0.5, row.credits || 0);
      lines.push({ row, band, name: subjectName(row.subjectId) });
      creditSum += cr;
      pointCreditSum += band.points * cr;
    }

    const gpa = creditSum > 0 ? pointCreditSum / creditSum : null;
    return { lines, creditSum, gpa };
  }, [rows]);

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  const gpaColor =
    computed.gpa == null
      ? "text-white"
      : computed.gpa >= 3.5
        ? "text-emerald-300"
        : computed.gpa >= 2.5
          ? "text-sky-300"
          : computed.gpa >= 2.0
            ? "text-amber-300"
            : "text-rose-300";

  return (
    <section className="rounded-3xl border border-purple-400/25 bg-gradient-to-br from-purple-500/[0.08] via-wisdom-card to-wisdom-card overflow-hidden shadow-card-3d">
      {/* Header */}
      <div className="px-5 sm:px-7 py-5 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-transparent to-pink-500/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl border border-purple-400/30 bg-purple-500/15 text-purple-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300/90">
                Freshman tool
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                GPA calculator
              </h2>
              <p className="text-sm text-wisdom-muted mt-1 max-w-lg leading-relaxed">
                Build your semester from the course list, enter percent, letter, or fixed points — we
                map everything to the official scale.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowScale((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 border border-purple-400/30 rounded-xl px-3 py-2 hover:bg-purple-500/10"
          >
            <Info className="w-3.5 h-3.5" />
            {showScale ? "Hide scale" : "Grade scale"}
          </button>
        </div>
      </div>

      {/* Scale table */}
      {showScale && (
        <div className="px-4 sm:px-6 py-4 border-b border-white/10 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-wisdom-muted border-b border-white/10">
                <th className="py-2 pr-3 font-semibold">Interval %</th>
                <th className="py-2 pr-3 font-semibold">Letter</th>
                <th className="py-2 pr-3 font-semibold">Points</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_BANDS.map((b) => (
                <tr key={b.letter} className="border-b border-white/5 text-white/90">
                  <td className="py-2 pr-3 font-mono text-white/70">{intervalLabel(b)}</td>
                  <td className="py-2 pr-3 font-bold text-purple-200">{b.letter}</td>
                  <td className="py-2 pr-3 tabular-nums">{b.points.toFixed(2)}</td>
                  <td className="py-2 text-wisdom-muted">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4">
        {/* Rows */}
        {rows.map((row, index) => {
          const band = resolveBand(row);
          const available = freshmanSubjects.filter(
            (s) => s.id === row.subjectId || !usedIds.has(s.id)
          );

          return (
            <div
              key={row.id}
              className="rounded-2xl border border-white/10 bg-wisdom-dark/40 p-3 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted">
                  Course {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  disabled={rows.length <= 1}
                  className="p-1.5 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30"
                  aria-label="Remove course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <label className="sm:col-span-5 block">
                  <span className="text-[10px] text-wisdom-muted uppercase tracking-wider">
                    Subject
                  </span>
                  <select
                    value={row.subjectId}
                    onChange={(e) => update(row.id, { subjectId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                  >
                    <option value="">Select course…</option>
                    {available.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2 block">
                  <span className="text-[10px] text-wisdom-muted uppercase tracking-wider">
                    Credits
                  </span>
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={row.credits}
                    onChange={(e) =>
                      update(row.id, { credits: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                  />
                </label>

                <label className="sm:col-span-2 block">
                  <span className="text-[10px] text-wisdom-muted uppercase tracking-wider">
                    Input
                  </span>
                  <select
                    value={row.mode}
                    onChange={(e) =>
                      update(row.id, { mode: e.target.value as InputMode })
                    }
                    className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                  >
                    <option value="percent">%</option>
                    <option value="letter">Letter</option>
                    <option value="points">Points</option>
                  </select>
                </label>

                <div className="sm:col-span-3">
                  <span className="text-[10px] text-wisdom-muted uppercase tracking-wider">
                    Grade
                  </span>
                  {row.mode === "percent" && (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="0–100"
                      value={row.percent}
                      onChange={(e) => update(row.id, { percent: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                    />
                  )}
                  {row.mode === "letter" && (
                    <select
                      value={row.letter}
                      onChange={(e) => update(row.id, { letter: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                    >
                      {LETTER_OPTIONS.map((L) => (
                        <option key={L} value={L}>
                          {L}
                        </option>
                      ))}
                    </select>
                  )}
                  {row.mode === "points" && (
                    <select
                      value={row.points}
                      onChange={(e) => update(row.id, { points: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-card px-3 py-2.5 text-sm text-white outline-none focus:border-purple-400/50"
                    >
                      {POINT_OPTIONS.map((p) => (
                        <option key={p} value={String(p)}>
                          {p.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {band && row.subjectId && (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-purple-200 font-semibold">
                    {band.letter}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/80 tabular-nums">
                    {band.points.toFixed(2)} pts
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-wisdom-muted">
                    {band.status}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= freshmanSubjects.length}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-purple-400/40 text-purple-200 text-sm font-semibold hover:bg-purple-500/10 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add course
        </button>

        {/* Results */}
        <div className="rounded-2xl border border-white/12 bg-wisdom-dark/50 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <h3 className="font-display font-bold text-white text-sm sm:text-base">
              Semester result
            </h3>
          </div>

          {computed.lines.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-2" />
              <p className="text-sm text-wisdom-muted">
                Select courses and enter grades to see your GPA table.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-wisdom-muted border-b border-white/10">
                      <th className="px-4 py-2.5 font-semibold">Course</th>
                      <th className="px-3 py-2.5 font-semibold">Cr</th>
                      <th className="px-3 py-2.5 font-semibold">Letter</th>
                      <th className="px-3 py-2.5 font-semibold">Points</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.lines.map(({ row, band, name }) => {
                      const cr = Math.max(0.5, row.credits || 0);
                      const quality = band.points * cr;
                      return (
                        <tr key={row.id} className="border-b border-white/5 text-white/90">
                          <td className="px-4 py-2.5 font-medium">{name}</td>
                          <td className="px-3 py-2.5 tabular-nums">{cr}</td>
                          <td className="px-3 py-2.5 font-bold text-purple-200">{band.letter}</td>
                          <td className="px-3 py-2.5 tabular-nums">{band.points.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-wisdom-muted">{band.status}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-white/80">
                            {quality.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 sm:px-5 py-4 bg-gradient-to-r from-purple-500/15 to-transparent flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
                    Total credits
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {computed.creditSum.toFixed(1)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
                    Semester GPA
                  </p>
                  <p className={`text-3xl sm:text-4xl font-black tabular-nums ${gpaColor}`}>
                    {computed.gpa != null ? computed.gpa.toFixed(2) : "—"}
                  </p>
                  <p className="text-[11px] text-wisdom-muted mt-0.5">
                    Σ (points × credits) ÷ total credits
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
