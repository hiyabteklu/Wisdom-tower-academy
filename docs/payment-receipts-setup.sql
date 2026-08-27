-- Run in Supabase SQL Editor (after supabase-setup.sql)
-- Enables receipt photo/PDF uploads on checkout

-- 1) Column on orders
alter table public.orders
  add column if not exists receipt_url text;

-- 2) Storage bucket (public read so admin can open links)
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', true)
on conflict (id) do update set public = true;

-- 3) Anyone can upload (guest checkout)
drop policy if exists "Anyone upload payment receipts" on storage.objects;
create policy "Anyone upload payment receipts"
  on storage.objects for insert
  with check (bucket_id = 'payment-receipts');

-- 4) Public read
drop policy if exists "Public read payment receipts" on storage.objects;
create policy "Public read payment receipts"
  on storage.objects for select
  using (bucket_id = 'payment-receipts');

-- 5) Authenticated can update/delete (cleanup)
drop policy if exists "Authenticated manage payment receipts" on storage.objects;
create policy "Authenticated manage payment receipts"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'payment-receipts');
