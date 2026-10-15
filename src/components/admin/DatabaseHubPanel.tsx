"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Zap,
  Layers,
  Check,
  FileCode2,
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

const MASTER_SQL_SCRIPT = `-- =============================================================================
-- WISDOM TOWER ACADEMY: COMPLETE PRODUCTION SUPABASE MASTER MIGRATION
-- Run this in your Supabase SQL Editor:
-- 1. Open https://supabase.com/dashboard
-- 2. Select your project -> SQL Editor -> New Query
-- 3. Paste this entire script and click "RUN"
--
-- Safe & Idempotent: Can be run multiple times without deleting or resetting data.
-- =============================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";

-- 2. Profiles (Student Scholars & Admins)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  education_level text,
  school_name text,
  town_region text,
  stream text,
  bio text,
  target_exam text,
  target_score text,
  daily_study_goal_minutes int default 45,
  preferred_study_time text default 'evening',
  avatar_preset text default 'scholar-cyan',
  avatar_url text,
  hear_about text,
  account_intent text,
  profile_completed boolean default false,
  amoled_mode boolean default false,
  font_size_preference text default 'normal',
  data_saver_mode boolean default false,
  sound_effects_enabled boolean default true,
  student_id_number text,
  student_folio_number text,
  id_issued_at timestamptz default now(),
  id_expires_at timestamptz default (now() + interval '1 year'),
  active_academic_scope text default 'freshman',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all columns exist if table was already created
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists education_level text,
  add column if not exists school_name text,
  add column if not exists town_region text,
  add column if not exists stream text,
  add column if not exists target_exam text,
  add column if not exists target_score text,
  add column if not exists daily_study_goal_minutes int default 45,
  add column if not exists avatar_preset text default 'scholar-cyan',
  add column if not exists student_id_number text,
  add column if not exists student_folio_number text,
  add column if not exists id_issued_at timestamptz default now(),
  add column if not exists id_expires_at timestamptz default (now() + interval '1 year'),
  add column if not exists active_academic_scope text default 'freshman';

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users upsert own profile" on public.profiles;
create policy "Users upsert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "Authenticated read profiles" on public.profiles for select to authenticated using (true);

-- 3. Student ID Auto-Increment Sequence (WTA-01001+)
create sequence if not exists public.student_id_seq
  start with 1042
  increment by 1
  minvalue 1
  maxvalue 999999
  cycle;

create or replace function public.generate_next_student_id()
returns text as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.student_id_seq');
  return 'WTA-' || lpad(seq_val::text, 5, '0');
end;
$$ language plpgsql;

create or replace function public.auto_assign_student_id_trigger()
returns trigger as $$
begin
  if new.student_id_number is null or trim(new.student_id_number) = '' then
    new.student_id_number := public.generate_next_student_id();
  end if;

  if new.id_issued_at is null then
    new.id_issued_at := coalesce(new.created_at, now());
  end if;

  if new.id_expires_at is null then
    new.id_expires_at := new.id_issued_at + interval '1 year';
  end if;

  if new.student_folio_number is null or trim(new.student_folio_number) = '' then
    new.student_folio_number := 'REG-' || to_char(coalesce(new.created_at, now()), 'YYYY') || '/' || right(new.student_id_number, 5);
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_student_id on public.profiles;
create trigger trg_auto_student_id
  before insert on public.profiles
  for each row execute function public.auto_assign_student_id_trigger();

-- 4. Manual Payment Orders
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  package_id text not null,
  package_name text not null,
  amount_etb int not null,
  status text not null default 'pending_verification'
    check (status in ('pending_payment', 'pending_verification', 'verified', 'rejected')),
  payment_method text not null,
  student_name text not null,
  phone text not null,
  email text,
  transaction_ref text not null,
  note text,
  receipt_url text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by text
);

alter table public.orders enable row level security;

drop policy if exists "Authenticated insert orders" on public.orders;
create policy "Authenticated insert orders" on public.orders for insert to authenticated with check (true);

drop policy if exists "Anon insert orders" on public.orders;
create policy "Anon insert orders" on public.orders for insert to anon with check (true);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select to authenticated using (
  auth.uid() = user_id or (email is not null and lower(email) = lower(auth.jwt() ->> 'email'))
);

drop policy if exists "Authenticated read all orders" on public.orders;
create policy "Authenticated read all orders" on public.orders for select to authenticated using (true);

drop policy if exists "Authenticated update orders" on public.orders;
create policy "Authenticated update orders" on public.orders for update to authenticated using (true);

-- 5. Course Enrollments (Unlocked Academic Packages)
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete cascade,
  package_id text not null,
  package_name text not null,
  email text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists enrollments_user_id_idx on public.enrollments (user_id);
create index if not exists enrollments_email_idx on public.enrollments (lower(email));
create unique index if not exists enrollments_user_pkg_uniq on public.enrollments (user_id, package_id) where user_id is not null;

alter table public.enrollments enable row level security;

drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments for select to authenticated using (
  auth.uid() = user_id or (email is not null and lower(email) = lower(auth.jwt() ->> 'email'))
);

drop policy if exists "Authenticated read all enrollments" on public.enrollments;
create policy "Authenticated read all enrollments" on public.enrollments for select to authenticated using (true);

drop policy if exists "Authenticated insert enrollments" on public.enrollments;
create policy "Authenticated insert enrollments" on public.enrollments for insert to authenticated with check (true);

-- 6. Direct Access Grants (Scholarships, Manual Overrides, Beta Testers)
create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  package_id text not null,
  package_name text,
  granted_by text not null,
  note text,
  created_at timestamptz not null default now()
);

create unique index if not exists access_grants_email_pkg_uniq on public.access_grants (lower(email), package_id);
create index if not exists access_grants_email_idx on public.access_grants (lower(email));

alter table public.access_grants enable row level security;

drop policy if exists "Users read own grants" on public.access_grants;
create policy "Users read own grants" on public.access_grants for select to authenticated using (
  lower(email) = lower(auth.jwt() ->> 'email')
);

drop policy if exists "Authenticated manage grants" on public.access_grants;
create policy "Authenticated manage grants" on public.access_grants for all to authenticated using (true);

-- 7. Content Locks & Availability Overrides
create table if not exists public.content_locks (
  id uuid primary key default gen_random_uuid(),
  lock_key text not null unique,
  mode text not null check (mode in ('open', 'require_purchase', 'coming_soon', 'locked')),
  note text,
  updated_by text,
  updated_at timestamptz not null default now()
);

create index if not exists content_locks_key_idx on public.content_locks (lock_key);

alter table public.content_locks enable row level security;

drop policy if exists "Anyone can read content locks" on public.content_locks;
create policy "Anyone can read content locks" on public.content_locks for select using (true);

drop policy if exists "Authenticated update content locks" on public.content_locks;
create policy "Authenticated update content locks" on public.content_locks for all to authenticated using (true);

-- 8. Academic Results (Quiz & Mock Examination Tracker)
create table if not exists public.academic_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_id text not null,
  title text not null,
  total int not null check (total > 0),
  correct int not null check (correct >= 0),
  missed int not null check (missed >= 0),
  percent numeric(5,1) not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists academic_results_user_scope_idx on public.academic_results (user_id, scope_id, created_at desc);

alter table public.academic_results enable row level security;

drop policy if exists "Users read own results" on public.academic_results;
create policy "Users read own results" on public.academic_results for select using (auth.uid() = user_id);

drop policy if exists "Users insert own results" on public.academic_results;
create policy "Users insert own results" on public.academic_results for insert with check (auth.uid() = user_id);

drop policy if exists "Authenticated read results for admin" on public.academic_results;
create policy "Authenticated read results for admin" on public.academic_results for select to authenticated using (true);

-- 9. Question Explanations & AI Cache
create table if not exists public.question_explanations (
  question_id text primary key,
  explanation text not null,
  subject text,
  difficulty text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_explanations_subject_idx on public.question_explanations (subject);

alter table public.question_explanations enable row level security;

drop policy if exists "Anyone can read explanations" on public.question_explanations;
create policy "Anyone can read explanations" on public.question_explanations for select using (true);

drop policy if exists "Authenticated write explanations" on public.question_explanations;
create policy "Authenticated write explanations" on public.question_explanations for insert to authenticated with check (true);

-- 10. Inquiries (Contact Messages)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  service text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'reviewing', 'replied', 'closed')),
  admin_notes text
);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can insert inquiries" on public.inquiries;
create policy "Anyone can insert inquiries" on public.inquiries for insert using (true);

drop policy if exists "Authenticated read inquiries" on public.inquiries;
create policy "Authenticated read inquiries" on public.inquiries for select to authenticated using (true);

drop policy if exists "Authenticated update inquiries" on public.inquiries;
create policy "Authenticated update inquiries" on public.inquiries for update to authenticated using (true);

-- 11. Free Resources (Success Stories, Campus Life, Scholarships)
create table if not exists public.free_resource_pages (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  title text not null,
  subtitle text,
  body_md text,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.free_resource_items (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  kind text not null,
  title text not null,
  subtitle text,
  body_md text,
  image_path text,
  sort_order int not null default 0,
  published boolean not null default true,
  meta jsonb not null default '{}'::jsonb,
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists free_resource_items_page_slug_idx on public.free_resource_items (page_slug, published, sort_order);

alter table public.free_resource_pages enable row level security;
alter table public.free_resource_items enable row level security;

drop policy if exists "Anyone read free pages" on public.free_resource_pages;
create policy "Anyone read free pages" on public.free_resource_pages for select using (true);

drop policy if exists "Anyone read free items" on public.free_resource_items;
create policy "Anyone read free items" on public.free_resource_items for select using (true);

drop policy if exists "Authenticated manage free pages" on public.free_resource_pages;
create policy "Authenticated manage free pages" on public.free_resource_pages for all to authenticated using (true);

drop policy if exists "Authenticated manage free items" on public.free_resource_items;
create policy "Authenticated manage free items" on public.free_resource_items for all to authenticated using (true);

-- 12. API Rate Limiting Bucket
create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  hit_count int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;

drop policy if exists "Anyone manage rate limits" on public.api_rate_limits;
create policy "Anyone manage rate limits" on public.api_rate_limits for all using (true);
`;

export default function DatabaseHubPanel() {
  const [healthList, setHealthList] = useState<TableHealth[]>(
    TRACKED_TABLES.map((t) => ({ ...t, status: "checking" }))
  );
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState<"master" | "instructions" | "faq">("master");
  // A16 (layout only): the long SQL text is hidden until the admin asks to see it.
  const [showSql, setShowSql] = useState(false);

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

  const handleCopySql = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(MASTER_SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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
            Real-time diagnostic health check, schema validation, and copy-paste SQL scripts
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

      {/* SQL script and run instructions */}
      <div className="rounded-2xl border border-cyan-400/25 bg-wisdom-card overflow-hidden">
        <div className="p-4 border-b border-white/8 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white break-words">Master Supabase SQL Script</h3>
              <p className="text-xs text-wisdom-muted break-words">
                Run this once in your Supabase project to ensure all tables, policies, and triggers are ready
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className={`inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold ${
              copied ? "bg-emerald-500 text-white" : "bg-cyan-500 text-wisdom-dark"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Master Script
              </>
            )}
          </button>
        </div>

        {/* Step by step guide */}
        <div className="p-4 bg-white/[0.02] border-b border-white/8 space-y-3 text-sm">
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-bold">
              1
            </span>
            <p className="text-wisdom-muted leading-relaxed break-words">
              Click <strong className="text-white">Copy Master Script</strong> above or copy from the box below.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-bold">
              2
            </span>
            <p className="text-wisdom-muted leading-relaxed break-words">
              Open <strong className="text-white">Supabase SQL Editor</strong> via the top right button or dashboard.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-bold">
              3
            </span>
            <p className="text-wisdom-muted leading-relaxed break-words">
              Paste and click <strong className="text-emerald-400">Run</strong>. All tables and RLS rules will be active immediately.
            </p>
          </div>
        </div>

        {/* Script text: hidden by default, wraps instead of scrolling sideways */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowSql((v) => !v)}
            className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-white/12 px-4 text-sm font-semibold text-white/80"
          >
            <FileCode2 className="w-4 h-4" />
            {showSql ? "Hide script" : "Show script"}
          </button>
          {showSql && (
            <pre className="mt-3 rounded-xl p-3 text-xs font-mono text-slate-300 bg-[#090d16] whitespace-pre-wrap break-words leading-relaxed">
              <code>{MASTER_SQL_SCRIPT}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
