-- ============================================================
-- Wisdom Tower Academy — Free resource pages (admin-editable)
-- Run in Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Free resource pages (one row per section)
create table if not exists public.free_resource_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in (
    'success-stories',
    'study-techniques',
    'campus-life',
    'universities',
    'departments',
    'scholarships'
  )),
  title text not null,
  subtitle text,
  body_md text not null default '',
  -- Structured data: university cards, department guides, image galleries, etc.
  meta jsonb not null default '{}'::jsonb,
  -- Optional cover / hero image path in storage
  cover_path text,
  published boolean not null default false,
  sort_order int not null default 0,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists free_resource_pages_slug_idx
  on public.free_resource_pages (slug);
create index if not exists free_resource_pages_published_idx
  on public.free_resource_pages (published);

-- 2) Seed the six pages (empty body — migrate content later)
insert into public.free_resource_pages (slug, title, subtitle, body_md, meta, published, sort_order)
values
  ('success-stories', 'Success Stories', 'Journeys of students who leveled up with Academy', '', '{}'::jsonb, false, 10),
  ('study-techniques', 'Study Techniques', 'Methods to learn faster and retain under pressure', '', '{}'::jsonb, false, 20),
  ('campus-life', 'Campus Life', 'Friends, focus, burnout, lectures, facilities and group work', '', '{}'::jsonb, false, 30),
  ('universities', 'Ethiopian Universities', 'Practical guides — distance, climate, campuses, and first-year life', '', '{"items":[]}'::jsonb, false, 40),
  ('departments', 'Department Info', 'What each field of study actually involves', '', '{}'::jsonb, false, 50),
  ('scholarships', 'Scholarship Info', 'Funding options and how to prepare applications', '', '{}'::jsonb, false, 60)
on conflict (slug) do nothing;

-- 3) RLS
alter table public.free_resource_pages enable row level security;

-- Public read of published pages (anon + authenticated)
drop policy if exists "free_resource_pages_select_published" on public.free_resource_pages;
create policy "free_resource_pages_select_published" on public.free_resource_pages
  for select
  using (published = true);

-- Authenticated can read all (admin UI needs drafts)
drop policy if exists "free_resource_pages_select_auth" on public.free_resource_pages;
create policy "free_resource_pages_select_auth" on public.free_resource_pages
  for select to authenticated
  using (true);

-- Authenticated write (tighten later with admin-only if needed)
drop policy if exists "free_resource_pages_write_auth" on public.free_resource_pages;
create policy "free_resource_pages_write_auth" on public.free_resource_pages
  for all to authenticated
  using (true)
  with check (true);

-- 4) Storage bucket for free-resource images / graphics (public read)
insert into storage.buckets (id, name, public)
values ('free-resources', 'free-resources', true)
on conflict (id) do nothing;

drop policy if exists "free_resources_public_read" on storage.objects;
create policy "free_resources_public_read" on storage.objects
  for select
  using (bucket_id = 'free-resources');

drop policy if exists "free_resources_auth_write" on storage.objects;
create policy "free_resources_auth_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'free-resources');

drop policy if exists "free_resources_auth_update" on storage.objects;
create policy "free_resources_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'free-resources');

drop policy if exists "free_resources_auth_delete" on storage.objects;
create policy "free_resources_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'free-resources');
