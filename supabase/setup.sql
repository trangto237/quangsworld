-- Learning OS (Project Atlas) — family cloud sync.
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run again (idempotent).
--
-- One Supabase user = one family. Each app row is stored as JSON in atlas_rows, keyed by
-- (family, table, primary key). Row-level security lets a signed-in user see and change only
-- their own family's rows. Every insert/update gets a new, increasing `seq`; devices download
-- "everything with seq > what I last saw".


-- ── Family codes ─────────────────────────────────────────────────────────────
-- The parent account owns the family (family_id = the parent's user id). Other devices, like the
-- kid's laptop, join with a family code: they sign in anonymously and become *members* of the family.

create table if not exists public.atlas_members (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  family_id  uuid        not null references auth.users (id) on delete cascade,
  label      text,
  created_at timestamptz not null default now()
);

create table if not exists public.atlas_family_codes (
  family_id  uuid        primary key references auth.users (id) on delete cascade,
  code       text        not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.atlas_join_attempts (
  user_id uuid        not null,
  at      timestamptz not null default now()
);
-- Members who signed in with their own email (e.g. a child aged 12+) show it in the parent's list.
alter table public.atlas_members add column if not exists email text;

create index if not exists atlas_join_attempts_user on public.atlas_join_attempts (user_id, at);

-- The family the signed-in user belongs to: their own (parent) or the one they joined.
create or replace function public.atlas_my_family() returns uuid
language sql stable security definer set search_path = '' as $$
  select coalesce((select m.family_id from public.atlas_members m where m.user_id = auth.uid()), auth.uid());
$$;

create sequence if not exists public.atlas_rows_seq;

create table if not exists public.atlas_rows (
  family_id  uuid        not null default public.atlas_my_family() references auth.users (id) on delete cascade,
  tbl        text        not null,
  pk         text        not null,
  data       jsonb,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  seq        bigint      not null default nextval('public.atlas_rows_seq'),
  primary key (family_id, tbl, pk)
);

alter table public.atlas_rows alter column family_id set default public.atlas_my_family();

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

-- Row-level security: only your own family's rows (parent account or a device that joined it).
alter table public.atlas_rows enable row level security;

drop policy if exists "family can read own rows" on public.atlas_rows;
create policy "family can read own rows" on public.atlas_rows
  for select to authenticated using ((select public.atlas_my_family()) = family_id);

drop policy if exists "family can insert own rows" on public.atlas_rows;
create policy "family can insert own rows" on public.atlas_rows
  for insert to authenticated with check ((select public.atlas_my_family()) = family_id);

drop policy if exists "family can update own rows" on public.atlas_rows;
create policy "family can update own rows" on public.atlas_rows
  for update to authenticated using ((select public.atlas_my_family()) = family_id) with check ((select public.atlas_my_family()) = family_id);

-- Deletions are synced as `deleted = true` (tombstones), so no delete policy is needed.

grant usage on sequence public.atlas_rows_seq to authenticated;
grant select, insert, update on public.atlas_rows to authenticated;
revoke all on public.atlas_rows from anon;


-- ── Family code functions ────────────────────────────────────────────────────
alter table public.atlas_members enable row level security;
alter table public.atlas_family_codes enable row level security;
alter table public.atlas_join_attempts enable row level security;

drop policy if exists "parent sees family devices" on public.atlas_members;
create policy "parent sees family devices" on public.atlas_members
  for select to authenticated using ((select auth.uid()) = family_id or (select auth.uid()) = user_id);
drop policy if exists "parent removes family devices" on public.atlas_members;
create policy "parent removes family devices" on public.atlas_members
  for delete to authenticated using ((select auth.uid()) = family_id);

drop policy if exists "parent sees own code" on public.atlas_family_codes;
create policy "parent sees own code" on public.atlas_family_codes
  for select to authenticated using ((select auth.uid()) = family_id);
-- atlas_join_attempts: no policies — only the functions below touch it.

grant select, delete on public.atlas_members to authenticated;
grant select on public.atlas_family_codes to authenticated;
revoke all on public.atlas_members, public.atlas_family_codes, public.atlas_join_attempts from anon;

-- Parent: create (or replace) the family code. Old codes stop working; joined devices stay joined.
create or replace function public.atlas_new_family_code() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no 0/O, 1/I/L
  bytes bytea;
  c text;
begin
  if me is null then raise exception 'Sign in first.'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) or exists (select 1 from public.atlas_members where user_id = me) then
    raise exception 'Only the parent account can make a family code.';
  end if;
  loop
    bytes := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
    c := '';
    for i in 0..9 loop
      c := c || substr(alphabet, 1 + (get_byte(bytes, i) % length(alphabet)), 1);
    end loop;
    exit when not exists (select 1 from public.atlas_family_codes where code = c);
  end loop;
  insert into public.atlas_family_codes (family_id, code) values (me, c)
    on conflict (family_id) do update set code = excluded.code, created_at = now();
  return c;
end;
$$;

-- Device: join the family that owns this code. Returns the family id, or null for a wrong code.
create or replace function public.atlas_join_family(p_code text, p_label text default null) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  fam uuid;
  clean text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if me is null then raise exception 'Sign in first.'; end if;
  if (select count(*) from public.atlas_join_attempts where user_id = me and at > now() - interval '15 minutes') >= 10 then
    raise exception 'Too many wrong codes. Wait 15 minutes and try again.';
  end if;
  select family_id into fam from public.atlas_family_codes where code = clean;
  if fam is null then
    -- Return instead of raising, so the failed try is recorded (a raise would roll it back).
    insert into public.atlas_join_attempts (user_id) values (me);
    return null;
  end if;
  if fam = me or exists (select 1 from public.atlas_family_codes where family_id = me) then
    raise exception 'This device is signed in as a parent account already.';
  end if;
  insert into public.atlas_members (user_id, family_id, label, email) values (me, fam, left(p_label, 80), nullif(auth.jwt() ->> 'email', ''))
    on conflict (user_id) do update set family_id = excluded.family_id, label = excluded.label, email = excluded.email, created_at = now();
  return fam;
end;
$$;

revoke all on function public.atlas_my_family(), public.atlas_new_family_code(), public.atlas_join_family(text, text) from public, anon;
grant execute on function public.atlas_my_family(), public.atlas_new_family_code(), public.atlas_join_family(text, text) to authenticated;

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

-- ── Child logins ─────────────────────────────────────────────────────────────
-- The parent makes a username + password for each child in the parent app (Profiles). Children
-- sign in with it on the one sign-in screen and go straight to their own profile; the parent's
-- email login opens the parent app. Usernames are stored as <username>@kids.atlas.app accounts that
-- are confirmed at once (no email is ever sent).
alter table public.atlas_members add column if not exists student_id text;
alter table public.atlas_members add column if not exists username text;
create unique index if not exists atlas_members_username on public.atlas_members (lower(username)) where username is not null;

-- Parent only: the family the caller owns, or an error.
create or replace function public.atlas_parent_family() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'Sign in first.'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) or exists (select 1 from public.atlas_members where user_id = me) then
    raise exception 'Only the parent account can manage child logins.';
  end if;
  return me;
end;
$$;

create or replace function public.atlas_create_child_login(p_username text, p_password text, p_student_id text, p_label text default null) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  fam uuid := public.atlas_parent_family();
  u text := lower(trim(coalesce(p_username, '')));
  mail text;
  uid uuid := gen_random_uuid();
begin
  if u !~ '^[a-z0-9][a-z0-9._-]{2,29}$' then
    raise exception 'Usernames are 3–30 letters or numbers (dots, dashes and underscores allowed), with no spaces.';
  end if;
  if length(coalesce(p_password, '')) < 6 then raise exception 'The password needs at least 6 characters.'; end if;
  if coalesce(p_student_id, '') = '' then raise exception 'Choose which child this login is for.'; end if;
  mail := u || '@kids.atlas.app';
  if exists (select 1 from auth.users where lower(email) = mail) or exists (select 1 from public.atlas_members where lower(username) = u) then
    raise exception 'That username is taken. Try another one.';
  end if;
  -- One login per child: replace an older one.
  delete from auth.users where id in (select user_id from public.atlas_members where family_id = fam and student_id = p_student_id and username is not null);
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                          created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail, extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('atlas_child', true, 'username', u), now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true), 'email', now(), now(), now());
  insert into public.atlas_members (user_id, family_id, label, email, student_id, username)
  values (uid, fam, left(coalesce(p_label, u), 80), mail, p_student_id, u);
  return uid;
end;
$$;

create or replace function public.atlas_set_child_password(p_username text, p_password text) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  fam uuid := public.atlas_parent_family();
  kid uuid;
begin
  if length(coalesce(p_password, '')) < 6 then raise exception 'The password needs at least 6 characters.'; end if;
  select user_id into kid from public.atlas_members where family_id = fam and lower(username) = lower(trim(p_username));
  if kid is null then raise exception 'No such child login in this family.'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = kid;
end;
$$;

create or replace function public.atlas_delete_child_login(p_username text) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  fam uuid := public.atlas_parent_family();
  kid uuid;
begin
  select user_id into kid from public.atlas_members where family_id = fam and lower(username) = lower(trim(p_username));
  if kid is null then raise exception 'No such child login in this family.'; end if;
  delete from auth.users where id = kid; -- the member row goes with it (on delete cascade)
end;
$$;

revoke all on function public.atlas_parent_family(), public.atlas_create_child_login(text, text, text, text), public.atlas_set_child_password(text, text), public.atlas_delete_child_login(text) from public, anon;
grant execute on function public.atlas_create_child_login(text, text, text, text), public.atlas_set_child_password(text, text), public.atlas_delete_child_login(text) to authenticated;
