"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listTalentApplications,
  updateTalentApplicationStatus,
  type TalentApplicationRow,
} from "@/lib/admin-data";
import {
  Briefcase,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STATUSES = ["new", "reviewing", "interview", "accepted", "rejected", "archived"] as const;

export default function TalentApplicationsPanel() {
  const [items, setItems] = useState<TalentApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("new");

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await listTalentApplications());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    const res = await updateTalentApplicationStatus(id, status);
    setBusyId("");
    if (res.ok) {
      setToast(`Marked ${status}`);
      load();
    } else {
      setToast(res.error || "Update failed");
    }
  }

  const filtered =
    filter === "all" ? items : items.filter((i) => (i.status || "new") === filter);
  const newCount = items.filter((i) => i.status === "new").length;

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
            <Briefcase className="w-5 h-5 text-violet-400" />
            Talent applications
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            {newCount} new · {items.length} total · from Work with us
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
        {(["new", "reviewing", "interview", "accepted", "rejected", "archived", "all"] as const).map(
          (id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                filter === id
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 text-wisdom-muted hover:text-white"
              }`}
            >
              {id}
            </button>
          )
        )}
      </div>

      {loading && items.length === 0 ? (
        <p className="py-12 text-center text-wisdom-muted">Loading applications…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-wisdom-muted">
          <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/80 mb-1">No applications here</p>
          <p className="text-sm">
            Talent forms from Digital → Work with us land in{" "}
            <code className="text-cyan-300">talent_applications</code>.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((q) => {
            const open = expanded === q.id;
            return (
              <li
                key={q.id}
                className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{q.name}</p>
                    <p className="text-sm text-wisdom-muted inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {q.email}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase text-wisdom-muted">
                    {q.status || "new"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {q.category && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-wisdom-muted">
                      {q.category}
                    </span>
                  )}
                  {q.service && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-wisdom-cyan/10 border border-wisdom-cyan/30 text-wisdom-cyan">
                      {q.service}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-wisdom-muted mb-3">
                  {q.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {q.phone}
                    </span>
                  )}
                  {q.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {q.city}
                    </span>
                  )}
                  <span>{new Date(q.created_at).toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : q.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-wisdom-cyan mb-3"
                >
                  {open ? (
                    <>
                      Hide details <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      View details <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {open && (
                  <div className="space-y-3 mb-4 rounded-xl border border-white/8 bg-wisdom-dark/40 p-4 text-sm">
                    {q.letter_of_interest && (
                      <div>
                        <p className="text-xs font-semibold text-wisdom-muted mb-1">Letter of interest</p>
                        <p className="text-white/85 whitespace-pre-wrap leading-relaxed">
                          {q.letter_of_interest}
                        </p>
                      </div>
                    )}
                    {q.experience && (
                      <div>
                        <p className="text-xs font-semibold text-wisdom-muted mb-1">Experience</p>
                        <p className="text-white/85 whitespace-pre-wrap">{q.experience}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-wisdom-muted">
                      {q.availability && <span>Start: {q.availability}</span>}
                      {q.hours_per_week && <span>Hours/week: {q.hours_per_week}</span>}
                      {q.heard_about && <span>Heard via: {q.heard_about}</span>}
                    </div>
                    {q.portfolio_url && (
                      <a
                        href={q.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-300 font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Portfolio / samples
                      </a>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={busyId === q.id || (q.status || "new") === st}
                      onClick={() => setStatus(q.id, st)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40 ${
                        (q.status || "new") === st
                          ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                          : "border-white/10 text-wisdom-muted hover:text-white"
                      }`}
                    >
                      {(q.status || "new") === st && <Check className="w-3 h-3" />}
                      {st}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
