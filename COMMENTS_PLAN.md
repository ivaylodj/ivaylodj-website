# Blog Comments — Plan & Resume Doc

**Status:** ACTIVE — pre-launch priority (2026-07-22), ahead of SPA (deferred → `SPA_POST_LAUNCH_PLAN.md`). **Front-end pre-build DONE on branch `comments`** (2026-07-23). Not merged to `main`; live testing blocked only on the user's Supabase keys.
**Last updated:** 2026-07-23

### ▶ RESUME HERE (next session)
**Front-end is built and committed on branch `comments`** — isolated & additive, exactly as planned:
- `js/comments.js` — Google sign-in/session/submit/render (avatar w/ initials fallback, name, provider badge, relative time), delete-own, char counter, loading/empty/error states, **all user strings HTML-escaped**. Reads the `?post=` slug itself → **zero changes to the fragile `blog_post.js`**.
- `js/comments-config.js` — stub with `REPLACE_WITH_…` placeholders; until real keys land the UI shows a graceful "being set up" notice instead of erroring.
- `blog_post.html` — sibling `<div id="comments">` inside `.col9` (never wiped by blog_post.js's `#blog-post-content` overwrite at L586) + 3 deferred `<script>` tags (supabase-js@2 CDN → config → comments.js).
- `css/theme.css` — comments block appended (dark theme + `#ffbf00` accent; reuses `.cherga_comment_*`).
- **Moderation = INSTANT display** — CONFIRMED by user 2026-07-23. Matches `schema.sql` default (`status='approved'`). Submit UX still handles a `pending` result gracefully if the DB is later switched.

**Still blocked on user Phase 0** (Supabase project + Google OAuth + hand back Project URL + anon key — see Phase 0; only the user can do it).
**Next action when keys arrive:** (1) paste Project URL + anon key into `js/comments-config.js`; (2) run `supabase/schema.sql` in the SQL Editor (Phase 1); (3) test live OAuth on `localhost:8000` + `*.pages.dev`; (4) merge `comments` → `main`. Target: ship before go-live 2026-07-24.
**Follow-up (not blocking):** no `privacy.html` exists on the site — the consent line therefore does NOT link out. Before/at launch, create a privacy policy page (GDPR: we store name, avatar, provider, comment) and re-add the link in `comments.js`.

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
