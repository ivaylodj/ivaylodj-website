# Blog Comments — Plan & Resume Doc

**Status:** ✅ **BUILT, LIVE-TESTED, and MERGED to `main`** (2026-07-24). Supabase project live, schema applied, Google OAuth working, email notifications working. Full Aurel comment pattern implemented.
**Last updated:** 2026-07-24

### ▶ STATE (what shipped)
Backend live on Supabase (project `hzezbcryltiqnvekaxqg`, EU/Frankfurt). Front-end in the template's in-content comments section on **all** post templates.
- `js/comments.js` — Google sign-in/session; **threaded** list (Aurel pattern: depth-1 top-level + depth-2 replies); **Reply / Edit / Delete** own; avatar (initials fallback), name, provider badge, relative time, `(edited)` marker; char counter; loading/empty/error states; **all user strings HTML-escaped**. Exposes `window.PMComments.mount(slug)`. After Google redirect, scrolls back to the comment box.
- `js/comments-config.js` — **live** Project URL + publishable key (both public by design; RLS is the guard).
- `blog_post.js` — emits the wrapper + `Comments on This Post` heading + `<div id="comments">` in the common render path, then calls `PMComments.mount(postFile)`. Replaced the theme's static placeholder form.
- `blog_post.html` — 3 deferred `<script>` tags (supabase-js@2 CDN → config → comments.js).
- `css/theme.css` — comments styling (theme-consistent buttons: `#3a3e43`→`#ffbf00` hover, Roboto; threading indent; edit/reply forms). Plus scoped fix: `#blog-post-content` "You may also like" thumbnails = uniform 3:2 box, portraits letterboxed on black.
- `supabase/schema.sql` — table + RLS + grants (applied). `supabase/notify_new_comment.sql` — pg_net + Vault + Resend trigger (applied; Resend key stored encrypted in Supabase Vault, NOT in repo).
- **Moderation = INSTANT display** (CONFIRMED). `status` defaults to `approved`.

### Remaining follow-ups (non-blocking)
1. **Privacy policy page** — GDPR (we store name, avatar, provider, comment). Draft under review; once confirmed, add `privacy.html` + re-add the consent link in `comments.js` + footer link.
2. **Google consent screen** — App name/branding done; still to do: upload logo + verify `ivaylodj.com` ownership (Google Search Console DNS TXT in Cloudflare) so the screen shows the brand for everyone. Free "Option A".
3. **Facebook login later** — enable provider in Supabase + add a button; no schema change (`author_provider` already stored).

## How to moderate (as site owner)
Comments show instantly. To hide/remove anything, use the **Supabase Dashboard** (service key → bypasses RLS):
- **Hide (recommended, keeps the record):** Table Editor → `comments` → set the row's `status` to `spam` (or `pending`). Public read only shows `status='approved'`, so it vanishes immediately. SQL: `update public.comments set status='spam' where id='…';`
- **Delete permanently:** Table Editor → select row → Delete, or `delete from public.comments where id='…';` (deleting a top-level comment cascades to its replies).
- Users can already delete/edit **their own** comments from the site (RLS-enforced).
- New-comment **email alerts** arrive at `ivaylo.djounov@gmail.com` (Resend trigger) so you know when to check.

---

## Goal
Let visitors comment on blog posts, but only after signing in with a **real big-platform account**, and capture their **avatar, name, provider, timestamp, and comment**. Best-in-class, fast, fits the current static / CloudFlare Pages / Decap-CMS architecture.

## Decisions locked in
- **Backend:** Supabase (Auth + Postgres + Row-Level Security). Own-your-data, works directly from the static site (no custom server), EU region for GDPR.
- **Providers:** **Google now.** **Facebook later** (trivial: enable provider + add a button; schema already stores `author_provider`, no migration). **Apple = skipped** (requires Apple Developer Program at $99/yr — no free tier).
- **X (Twitter): dropped** — no free API tier in 2026 (pay-per-use).
- **Region:** Supabase **EU (Frankfurt)**.
- **Supabase dashboard account:** sign in with **GitHub + 2FA** (repo already on GitHub; solo project). Set billing/contact email to a stable address. This is separate from the end-user Google login.
- **Architecture separation:** Decap/git = *authored* content (posts). Supabase DB = *user-generated* content (comments). Do NOT store comments in git (commit-per-comment would trigger a rebuild each time).

## Decided
- **Moderation posture = INSTANT display** (CONFIRMED by user 2026-07-23). `status` defaults to `approved`; admin can hide/delete via dashboard, users can delete their own. One-line switch to pre-moderation documented in `supabase/schema.sql`; `comments.js` already handles a `pending` insert result.

---

## Phase 0 — user setup (the only part that needs your accounts; ~20–30 min)
1. Create a **Supabase project**, region **EU (Frankfurt)**, free tier. Sign in with GitHub (2FA on).
2. **Google OAuth:** Google Cloud Console → create OAuth 2.0 Client (Web). In Supabase → Auth → Providers → Google, paste Client ID + Secret. Copy Supabase's shown **redirect URL** back into the Google client's "Authorized redirect URIs".
3. Supabase → Auth → **URL Configuration** → add redirect allowlist: `https://ivaylodj.com`, `https://ivaylodj-website.pages.dev`, `http://localhost:8000`.
4. **Hand back to me two values** (both safe to commit — anon key is public by design; RLS is the real guard):
   - Project URL: `https://<ref>.supabase.co`
   - `anon` public API key
- ⚠️ #1 time-sink is **redirect-URI mismatch** (Google ↔ Supabase ↔ domains). Match them exactly.

## Phase 1 — database
- Run **`supabase/schema.sql`** (in this repo) in the Supabase SQL Editor. Creates the `comments` table + RLS policies. See that file for the moderation toggle.

## Phase 2 — frontend auth + submit
- Load `supabase-js` via CDN (no build step).
- `js/comments-config.js` — Project URL + anon key.
- `js/comments.js` — Google login/logout, session handling, submit (insert with name/avatar/provider from the OAuth session; RLS enforces `user_id = auth.uid()`).

## Phase 3 — display
- Render comment list into the section `blog_post.js` already creates in `#blog-post-content`: avatar, name, provider badge, relative time, body. Newest-first, lazy-loaded (never blocks the gallery/lightbox). Empty/loading states.

## Phase 4 — moderation + privacy
- Status workflow (per the locked decision), delete-own, simple rate-limit, GDPR consent line, admin flow via Supabase dashboard.

## Phase 5 — polish + ship
- Threaded replies (optional, `parent_id` already in schema), realtime updates (optional), avatar caching to Supabase Storage (avatar URLs can expire), style to match the Cherga theme, tests, deploy. Update `AGENTS.md`.

---

## Effort estimate (honest)
- **Focused engineering ≈ 4–6 hours (~half a day).** Bulk is `comments.js` (list render + auth wiring) and theme styling.
- **Calendar ≈ ~1 day** end-to-end, driven mostly by OAuth redirect-config round-trips and our review/merge cadence — not by code volume.

## Data captured per comment (see `supabase/schema.sql`)
`post_slug, user_id, author_name, author_avatar_url, author_provider, body, parent_id, status, created_at, edited_at`

## Files (status)
- `supabase/schema.sql` — ✅ created (DB schema + RLS; ready to paste). Not yet run (Phase 1, needs user's project).
- `js/comments-config.js` — ✅ created (stub w/ placeholders; graceful-disabled until keys land).
- `js/comments.js` — ✅ created (auth + submit + render + delete-own; XSS-safe; self-sources slug).
- `blog_post.html` — ✅ `#comments` sibling container + 3 deferred script tags. `js/blog_post.js` — untouched (by design).
- `css/theme.css` — ✅ comments block appended.

## How to resume
1. Read this file + `supabase/schema.sql`.
2. If Phase 0 is done, hand me the Project URL + anon key and confirm moderation → I build Phases 1–5 on a `comments` branch with review at each merge (same workflow as `REMEDIATION.md`).
3. If Phase 0 isn't done, do it first (checklist above).

## Adding Facebook later (non-breaking)
Enable Facebook in Supabase → Auth → Providers (Meta app + App Review), add a "Continue with Facebook" button in `comments.js`. No schema/data change (`author_provider` already stored).
