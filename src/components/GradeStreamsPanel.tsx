"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { streamsForGrade, type GradeSubject } from "@/data/grade-subjects";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";

export default function GradeStreamsPanel({ gradeId }: { gradeId: string }) {
  const streams = streamsForGrade(gradeId);
  const [selected, setSelected] = useState<GradeSubject | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {streams.map((stream) => (
          <section
            key={stream.id}
            className={`rounded-3xl border ${stream.border} bg-wisdom-card/90 overflow-hidden shadow-card-3d`}
          >
            <div className="px-5 sm:px-6 py-4 border-b border-white/10">
              <h2 className={`font-display text-xl font-bold ${stream.accent}`}>{stream.label}</h2>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {stream.subjects.map((sub) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(sub)}
                    className="w-full flex items-start gap-3.5 px-5 sm:px-6 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-wisdom-dark/50 ${stream.accent}`}
                    >
                      <GradeSubjectIcon name={sub.icon} className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm sm:text-base">{sub.name}</p>
                      {sub.hint && (
                        <p className="text-xs text-wisdom-muted mt-0.5 leading-relaxed">{sub.hint}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/15 bg-wisdom-card p-8 text-center shadow-card-3d"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 p-2 text-wisdom-muted hover:text-white rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-1">{selected.name}</h3>
            <p className="text-sm text-amber-300 font-semibold mb-3">Coming soon</p>
            <p className="text-sm text-wisdom-muted leading-relaxed">
              Materials for this subject are not available yet.
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
