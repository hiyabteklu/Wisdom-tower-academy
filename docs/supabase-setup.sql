-- Wisdom Tower Digital — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → paste → Run

-- 1) Academic progress (already documented in AcademicResultSaver)
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

create index if not exists academic_results_user_scope_idx
  on public.academic_results (user_id, scope_id, created_at desc);

alter table public.academic_results enable row level security;

drop policy if exists "Users read own results" on public.academic_results;
create policy "Users read own results" on public.academic_results
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own results" on public.academic_results;
create policy "Users insert own results" on public.academic_results
  for insert with check (auth.uid() = user_id);

-- 2) Cached AI explanations (keyed by question_id so we never regenerate the same one)
create table if not exists public.question_explanations (
  question_id text primary key,
  explanation text not null,
  subject text,
  difficulty text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_explanations_subject_idx
  on public.question_explanations (subject);

alter table public.question_explanations enable row level security;

-- Anyone can read cached explanations (safe educational content)
drop policy if exists "Anyone can read explanations" on public.question_explanations;
create policy "Anyone can read explanations" on public.question_explanations
  for select using (true);

-- Writes happen only via service role from the Next.js API route (bypasses RLS).
-- Do NOT add a public insert policy.

-- 3) Simple rate-limit buckets (optional; API also works with in-memory fallback)
create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  hit_count int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;
-- No public policies: only service role touches this table.
