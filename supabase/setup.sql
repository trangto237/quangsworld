-- Learning OS (Project Atlas) — family cloud sync.
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run again (idempotent).
--
-- One Supabase user = one family. Each app row is stored as JSON in atlas_rows, keyed by
-- (family, table, primary key). Row-level security lets a signed-in user see and change only
-- their own family's rows. Every insert/update gets a new, increasing `seq`; devices download
-- "everything with seq > what I last saw".

create sequence if not exists public.atlas_rows_seq;

create table if not exists public.atlas_rows (
  family_id  uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  tbl        text        not null,
  pk         text        not null,
  data       jsonb,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  seq        bigint      not null default nextval('public.atlas_rows_seq'),
  primary key (family_id, tbl, pk)
);

create index if not exists atlas_rows_family_seq on public.atlas_rows (family_id, seq);

-- New seq + timestamp on every write (also on updates, so changed rows are downloaded again).
create or replace function public.atlas_rows_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.seq := nextval('public.atlas_rows_seq');
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists atlas_rows_touch on public.atlas_rows;
create trigger atlas_rows_touch before insert or update on public.atlas_rows
  for each row execute function public.atlas_rows_touch();

-- Row-level security: only your own family's rows.
alter table public.atlas_rows enable row level security;

drop policy if exists "family can read own rows" on public.atlas_rows;
create policy "family can read own rows" on public.atlas_rows
  for select to authenticated using ((select auth.uid()) = family_id);

drop policy if exists "family can insert own rows" on public.atlas_rows;
create policy "family can insert own rows" on public.atlas_rows
  for insert to authenticated with check ((select auth.uid()) = family_id);

drop policy if exists "family can update own rows" on public.atlas_rows;
create policy "family can update own rows" on public.atlas_rows
  for update to authenticated using ((select auth.uid()) = family_id) with check ((select auth.uid()) = family_id);

-- Deletions are synced as `deleted = true` (tombstones), so no delete policy is needed.

grant usage on sequence public.atlas_rows_seq to authenticated;
grant select, insert, update on public.atlas_rows to authenticated;
revoke all on public.atlas_rows from anon;

-- Realtime: devices are told immediately when another device uploads.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'atlas_rows'
     ) then
    alter publication supabase_realtime add table public.atlas_rows;
  end if;
end;
$$;
