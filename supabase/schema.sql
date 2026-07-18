-- ============================================================================
-- ivaylodj.com — Blog comments schema + Row-Level Security
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
--
-- Security model: the browser talks to Supabase directly using the PUBLIC
-- anon key. That is safe ONLY because of the RLS policies below — they are the
-- actual access control. Do not skip enabling RLS.
-- ============================================================================

-- 1. Table -------------------------------------------------------------------
create table if not exists public.comments (
  id                 uuid primary key default gen_random_uuid(),
  post_slug          text not null,                    -- e.g. '2024-06-15-gallery-collection'
  user_id            uuid not null references auth.users(id) on delete cascade,
  author_name        text not null,
  author_avatar_url  text,
  author_provider    text,                             -- 'google' | 'facebook' | ...
  body               text not null check (char_length(body) between 1 and 4000),
  parent_id          uuid references public.comments(id) on delete cascade,  -- threaded replies (phase: later)
  status             text not null default 'approved'  -- 'approved' | 'pending' | 'spam'
                     check (status in ('approved','pending','spam')),
  created_at         timestamptz not null default now(),
  edited_at          timestamptz
);

create index if not exists comments_post_created_idx
  on public.comments (post_slug, created_at);

-- 2. Row-Level Security ------------------------------------------------------
alter table public.comments enable row level security;

-- Public (anon + authenticated) can READ only approved comments.
drop policy if exists "read approved" on public.comments;
create policy "read approved" on public.comments
  for select using (status = 'approved');

-- Logged-in users can INSERT only rows that belong to themselves
-- (auth.uid() = user_id prevents impersonation). Also forces status to a
-- non-spam value at write time; change default to 'pending' below for
-- pre-moderation (see MODERATION note).
drop policy if exists "insert own" on public.comments;
create policy "insert own" on public.comments
  for insert with check (auth.uid() = user_id and status in ('approved','pending'));

-- Users can UPDATE only their own comment (e.g. edit body).
drop policy if exists "update own" on public.comments;
create policy "update own" on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can DELETE only their own comment.
drop policy if exists "delete own" on public.comments;
create policy "delete own" on public.comments
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- MODERATION
--   Default above = INSTANT display (status defaults to 'approved').
--   To switch to PRE-MODERATION (you approve first), change ONE line:
--     alter table public.comments alter column status set default 'pending';
--   Then approve from Dashboard → Table Editor (set status = 'approved'),
--   or via SQL: update public.comments set status='approved' where id='...';
--   Admin (dashboard) uses the service key and bypasses RLS, so you can always
--   read/hide/delete anything from the Supabase UI.
-- ============================================================================

-- Optional: quick verification after running
-- select * from public.comments order by created_at desc;
