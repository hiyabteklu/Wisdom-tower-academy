"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";

interface TableHealth {
  table: string;
  label: string;
  description: string;
  status: "checking" | "ok" | "missing" | "error";
  errorDetail?: string;
  rowCount?: number;
}

const TRACKED_TABLES: Omit<TableHealth, "status" | "rowCount">[] = [
  {
    table: "profiles",
    label: "Student Profiles",
    description: "Matriculation data, student IDs, streams, school names, settings",
  },
  {
    table: "orders",
    label: "Payment Orders",
    description: "Manual payment orders, transaction refs, Telebirr/CBE reconciliation",
  },
  {
    table: "enrollments",
    label: "Course Enrollments",
    description: "Active access records matching verified payment orders",
  },
  {
    table: "access_grants",
    label: "Manual Access Grants",
    description: "Direct admin-granted access, scholarship passes, beta testing overrides",
  },
  {
    table: "content_locks",
    label: "Content Access Locks",
    description: "Fine-grained chapter/hub locks, coming soon toggles, purchase gates",
  },
  {
    table: "academic_results",
    label: "Quiz & Exam Scores",
    description: "Student test submissions, scores, percentages, and progress history",
  },
  {
    table: "question_explanations",
    label: "AI Explanations Cache",
    description: "Cached Groq/OpenAI tutor explanations for zero-latency queries",
  },
  {
    table: "inquiries",
    label: "Contact & Inquiries",
    description: "Student help inquiries, contact form messages, and support records",
  },
  {
    table: "free_resource_items",
    label: "Free Resource Hub",
    description: "Scholarships, campus guides, success stories, and university articles",
  },
  {
    table: "api_rate_limits",
    label: "API Rate Limiting",
    description: "Protection against brute force on AI endpoints and checkouts",
  },
];

export default function DatabaseHubPanel() {
  const [healthList, setHealthList] = useState<TableHealth[]>(
    TRACKED_TABLES.map((t) => ({ ...t, status: "checking" }))
  );
  const [checking, setChecking] = useState(false);

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    const updated: TableHealth[] = await Promise.all(
      TRACKED_TABLES.map(async (item) => {
        try {
          const { count, error } = await supabase
            .from(item.table)
            .select("*", { count: "exact", head: true });

          if (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("404")) {
              return {
                ...item,
                status: "missing",
                errorDetail: "Table not created yet",
              };
            }
            return {
              ...item,
              status: "error",
              errorDetail: error.message,
            };
          }

          return {
            ...item,
            status: "ok",
            rowCount: count ?? 0,
          };
        } catch (e) {
          return {
            ...item,
            status: "error",
            errorDetail: e instanceof Error ? e.message : "Network error",
          };
        }
      })
    );
    setHealthList(updated);
    setChecking(false);
  }, []);

  useEffect(() => {
    void runHealthCheck();
  }, [runHealthCheck]);

  const healthyCount = healthList.filter((h) => h.status === "ok").length;
  const missingCount = healthList.filter((h) => h.status === "missing").length;

  return (
    <div className="space-y-4">
      {/* Top header: title, then two equal pills */}
      <div className="space-y-3 border-b border-white/8 pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white flex items-start gap-2 break-words">
            <Database className="w-5 h-5 mt-0.5 shrink-0 text-cyan-400" />
            Supabase & System Architecture Hub
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5 break-words">
            Real-time diagnostic health check and table status
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={runHealthCheck}
            disabled={checking}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-white/12 px-3 text-sm font-semibold text-white/80 text-center leading-tight disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            {checking ? "Checking…" : "Recheck Tables"}
          </button>
          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-cyan-500 px-3 text-sm font-bold text-wisdom-dark text-center leading-tight"
          >
            Open SQL Editor
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>

      {/* Health overview: first card full width, the other two side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-2xl border border-white/10 bg-wisdom-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            Database Health
          </p>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-white tabular-nums">
              {healthyCount} / {healthList.length}
            </p>
            <span className="text-xs text-emerald-400 font-semibold">Active Tables</span>
          </div>
          <p className="text-sm text-wisdom-muted mt-1 break-words">
            {missingCount === 0
              ? "All core tables and schemas are online"
              : `${missingCount} table(s) need initialization`}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            Security & RLS
          </p>
          <ShieldCheck className="w-6 h-6 mt-2 text-emerald-400" />
          <p className="text-sm font-bold text-white mt-1 break-words">Row Level Security</p>
          <p className="text-xs text-wisdom-muted mt-1 break-words">
            Strict isolation: students access own data; admins manage all
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            Auto-ID Sequencing
          </p>
          <Zap className="w-6 h-6 mt-2 text-amber-400" />
          <p className="text-sm font-bold text-white mt-1 break-words">WTA-XXXXX Digital IDs</p>
          <p className="text-xs text-wisdom-muted mt-1 break-words">
            Auto-assigned to students upon registration with 1-year expiry
          </p>
        </div>
      </div>

      {/* Table diagnostic list: stacked cards, no table, no sideways scroll */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <h3 className="font-semibold text-white flex items-start gap-2 break-words">
            <Layers className="w-4 h-4 mt-1 shrink-0 text-cyan-400" />
            Live Database Diagnostic Matrix
          </h3>
          <p className="text-xs text-wisdom-muted mt-0.5 break-words">
            Current accessibility status of all application tables via authenticated client
          </p>
        </div>

        <ul className="divide-y divide-white/6">
          {healthList.map((item) => (
            <li key={item.table} className="px-4 py-3 text-sm">
              <p className="font-mono text-xs font-bold text-cyan-300 break-all">
                public.{item.table}
              </p>
              <p className="text-sm text-white/90 font-medium break-words mt-0.5">{item.label}</p>
              <p className="text-xs text-wisdom-muted mt-0.5 break-words">{item.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {item.status === "ok" && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                    <span className="text-xs text-wisdom-muted tabular-nums">
                      {item.rowCount} row{item.rowCount === 1 ? "" : "s"}
                    </span>
                  </>
                )}
                {item.status === "missing" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Needs Setup
                  </span>
                )}
                {item.status === "error" && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-400/30"
                    title={item.errorDetail}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Permission / Error
                  </span>
                )}
                {item.status === "checking" && (
                  <span className="text-xs text-wisdom-muted">Checking…</span>
                )}
              </div>
              {(item.status === "missing" || item.status === "error") && item.errorDetail && (
                <p className="text-xs text-wisdom-muted mt-1.5 break-words">{item.errorDetail}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* The old "master SQL script" was retired (2026-10-15): it was a stale copy that would re-create
          policies the live project no longer has (open read/update for every signed-in user). */}
      <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white break-words">Setup script retired</h3>
            <p className="text-sm text-wisdom-muted leading-relaxed break-words mt-1">
              The old copy-and-paste master script was removed on purpose. It no longer matches the live database
              and would bring back open permissions. Database changes are now made as tested migrations by the
              developer; do not paste old SQL into the SQL Editor.
            </p>
            <p className="text-sm text-wisdom-muted leading-relaxed break-words mt-2">
              A table marked Needs Setup above means it is missing in the live project: tell the developer which
              one instead of creating it by hand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
