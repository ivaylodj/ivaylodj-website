# ivaylodj.com — Remediation Tracking Doc

**Purpose:** Living checklist for the site-wide audit remediation. Update the status boxes as work lands so we can resume at any point.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done (committed+pushed) · `[!]` blocked/needs decision

**Baseline:** audit performed on `main`; findings verified against disk. Full audit summary lives in the conversation that created this doc. Aurel reference: `/Users/ivaylodj/html-themes/other themes/html/aurel`.

---

## How to resume
1. Read this file top-to-bottom; the first phase with unchecked items is where we are.
2. Each item lists exact `file:line` (approximate — re-grep before editing, line numbers drift as edits land).
3. Complete a phase fully across ALL its files (no partial fixes), then commit + push, then check its boxes and note the commit hash.
4. Risky phases (3, 5) additionally require `npm test` + browser verification before commit.

---

## Phase 0 — Ground truth (prep)
- [x] Branch `remediation` created + `npm test` → **52 tests / 8 suites pass**. `_tests/STATUS.md` (47) is the stale doc (fix in Phase 6).

## Phase 1 — Broken links & SEO-critical (low risk) — **DONE** (commit see change log)
- [x] `sitemap.xml` — all `/galleries/` → `/portfolio/`; stale `namibia.html` entry dropped. Valid XML, 26 URLs.
- [x] `about.html:707` — `contacts_1.html` → `contacts.html`
- [x] `portfolio/namibia.html` — `contacts_1.html` → `../contacts.html`
- [x] `portfolio/world-travels/namibia-2021.html` — `contacts_1.html` → `../../contacts.html`
- [x] `blog_post.html` — next-post `blog_image.html` → `blog.html` (block itself removed in Phase 3)
- [x] `blog_standard.html` — next-post `blog_image.html` → `blog.html`
- [x] Removed `demo-storage.com` "Video Slider" links (both namibia pages)
- [x] Fixed malformed `href="/>` featured-post anchors → `blog.html` (8 across both namibia pages)
- [x] `static/admin/config.yml` — `galleries` collection `folder` → `portfolio`
- [x] **BONUS (found during Phase 1):** `world-travels/namibia-2021.html` featured-post images used `../img/` (1 level) but page is 2 levels deep → fixed to `../../img/`. Asset audit had missed these (inside the malformed anchors).

## Phase 2 — Portfolio gallery correctness (medium risk) — **DONE (needs browser eyeball for lightbox/masonry)**
- [x] Added `imagesloaded`+`isotope` (+swipebox/fullscreen/owl) to masonry pages: `varna/day-of-varna-2019.html`, `day-of-varna-2020.html`, `funfair-winter.html` — masonry now initializes.
- [x] Removed `cherga_albums_grid_page` body class from 4 nested indexes; **re-scoped inline card CSS** from `.cherga_albums_grid_page` → `.cherga_albums_grid` (the class still removed would have broken card heights).
- [x] Removed the 4 dead demo `items_set` injection blocks in `js/theme.js` (grid/masonry/packery/grid-blog). Syntax OK, 52 tests pass. (Inert `jQuery.fn.*_listing_addon` plugin defs left for Phase 6 hygiene.)
- [x] ~~Remove duplicate `.pswp` roots~~ **FALSE POSITIVE** — the `pswp__bg` matches are inline CSS rules, not hardcoded `.pswp` HTML roots (`class="pswp"` count = 0 on all 5). No action needed.
- [x] PhotoSwipe: **REAL root cause found during browser testing** — 8 gallery pages carried inline `<style>` blocks with `!important` overrides on `.pswp__img`/`.pswp__zoom-wrap` (incl. `transform: translate(0,0) !important`) that defeated PhotoSwipe's own JS-driven positioning → transparent backdrop, images uncentered/overflowing. All pages already link `photoswipe.css`+`default-skin.css`, so these inline blocks were redundant *and* breaking. Removed every inline `.pswp` style block from all 8 pages (`sunsets, birds, namibia, unsorted, varna/day-of-varna-2019, day-of-varna-2020, funfair-winter, world-travels/namibia-2021`). Complementary JS fix in `theme.js`: read real dims from the already-loaded thumbnails at click time (thumb = same file as full image) + 0×0 fallback resolved via `gettingData`. **⚠ Needs browser re-verification.**
- [x] Moved `<footer>` inside `cherga_site_wrapper` + added `cherga_back_to_top` on all 7 pages (`nightscapes`, `neowise`, `sunrises`, `vera-su`, `sunsets`, `unsorted`, `seasons/spring`). Div balance verified on all 7.

## Phase 3 — Blog single-post page (HIGH risk) — **DONE on branch (needs browser verification before merge)**
- [x] Removed duplicated static blocks (tags/share/nav/comments) from `blog_post.html`; `blog_post.js` renders all of these into `#blog-post-content`. Div balance 36/36.
- [x] `blog_post.js` tag links: replaced undefined `window.parent.setActiveTag(...)` with `blog.html?tag=<encoded>`; added `?tag=`/`?category=` URL-param handling in `blog.js` so the listing auto-filters.
- [x] Sidebar wired dynamic: `#post-category-list`, `#blog-featured-posts-list`, `#post-tag-cloud`. Rewrote `buildSidebarWidgets` featured-posts to emit theme-styled `cherga_posts_item` markup (the old JS emitted `cherga_featured_post_item`, which has **zero** theme.css support). Removed dead/racy per-post category loop in `loadPost`.
- [x] `blog_post.html`: GTM `GTM-5G6PPWB` → `GTM-WR3X354K`; added GTM `<noscript>` + Cloudflare analytics.
- [x] Added SEO/OG/Twitter/canonical head to `blog.html`, `blog_standard.html`, `blog_post.html` (blog_post.js already updates title/canonical/description/og per-post — now those tags exist for it to update).
- [x] Unified the two `index.json` sort comparators (were divergent: `localeCompare` vs `_originalIndex`; two posts share date 2022-01-22 so order actually differed). Double-fetch itself left as-is (perf only, not a bug) — noted below.
- [x] Reordered post sections to match Aurel `blog_standard.html`: tags → sharing → posts navigation → **Comments** → **"You may also like"** (was: related before comments). Applies to all templates (single renderer `blog_post.js`).
- [x] Made single-post sidebar Categories/Tags functional: link to `blog.html?category=`/`blog.html?tag=` (were inert `javascript:void(0)` placeholders, faithful to Aurel but useless). Consistent with post-body tag links + blog-listing filters.
- [ ] (optional, perf) `blog_post.js` still fetches `index.json` twice — consolidate later if desired.

## Phase 4 — Consistency & polish (low risk) — **DONE on branch**
- [x] `current-menu-item` alignment: added to desktop nav on the 4 nested indexes (now 2 each: desktop+mobile). `index.html` (homepage, not the portfolio page) — removed the misleading desktop `current-menu-item` so it highlights nothing, consistent with mobile.
- [x] `blog.html` — copyright `div#copyright-year` → `<div class="cherga_copyright"><span id="copyright-year"></span></div>`.
- [x] `portfolio/index.html` — Vera Su tile label "portraits" → "black sea".
- [x] Removed dead commented `albums_grid.html` menu fragments (`index.html`, `about.html` ×2).
- [x] Fixed `Day%20of%20Varna` URL-encoding in visible title/meta/JSON-LD on `day-of-varna-2019.html` + `day-of-varna-2020.html` (image-path `%20` correctly preserved). `varna/index.html` had none in text.
- [ ] (optional, skipped) Normalize subdir canonicals to trailing-slash form — cosmetic only.

## Phase 5 — Sticky header — **INVESTIGATED: already matches Aurel (no code change)**
Verified line-by-line against the Aurel reference (2026-07-19). Our sticky header
is a faithful port — identical in every respect:
- `stick_me` toggle at `width > 1024` (Aurel `js/theme.js` 884/890/994 = ours ~802/811/963)
- `position:fixed` gated to `@media(min-width:1200px)` (both)
- logo-shrink rules global in BOTH themes (Aurel css 1178/1191 = ours ~1215/1231)
- solid-header placeholder created, height reserved, hidden `<1200px` via `@media(max-width:1200px){display:none}` (both)

The earlier "broken/ugly" project memory **predates the rewrite** (recent commits
"Add header placeholder…" / "…match Aurel exactly" already fixed it). The one
residual oddity — logo shrinks at 1025–1199px before the header is fixed — is
**inherent Aurel behavior**; changing it would DIVERGE from the reference, so it
is intentionally left as-is. Memory corrected. **No code change made.**
- [ ] (only on explicit user approval to deviate from Aurel) align JS threshold to 1200, or move logo-shrink rules into `@media(min-width:1200px)`.

## Phase 6 — Hygiene & docs (no user-facing risk) — **DONE on branch**
- [x] Deleted orphan `portfolio/namibia.html` (unreferenced dup of `world-travels/namibia-2021.html`; sitemap entry already removed in Phase 1) and orphan root `blog_standard.html` (canonical copy lives in `_templates/blog_standard.html`; nothing links to root after Phase 3). No lingering refs in live HTML.
- [x] `git rm` `blog_post.html.bak`, `img/clipart/back_1.old.jpg`, `img/clipart/blog_single/img-7.old.jpg`; added `*.bak` + `*.old.*` to `.gitignore`.
- [x] `js/blog_post.js` — removed dead `galleryConfigFromMd` block.
- [x] `js/blog.js` — replaced fake "Page 1 of N" pagination with an honest no-op (all posts render on one page).
- [x] `js/theme.js` — fixed handler missing `event` param (`.cherga_photo_proofing_notified`); removed stray `;0` token.
- [~] **Deferred (low value / higher risk on shared theme.js):** the 27× `setTimeout` string-eval → function-ref sweep and the dead `nested-toggle` handler removal. No CSP is in use; these work fine. Noted for a future dedicated pass.
- [x] Docs reconciled: `AGENTS.md` (`galleries/`→`portfolio/`, Photos→Portfolio, remediation note), root `MEMORY.md` (stale commit/Photos wording → remediation pointer), `CLAUDE.md` (5→4 subdirs). Test count 52 confirmed accurate.

---

## Change log
_(append commit hashes as phases land)_
- Phase 0+1 — broken links, sitemap, CMS config, namibia widget + image-depth fix (merged to `main` @ 772ebea)
- Phase 2 — masonry scripts, nested-index body class + CSS re-scope, theme.js demo removal, PhotoSwipe fix (removed breaking inline overrides), footer relocation ×7 (merged to `main` @ 5d3c647)
- Phase 3 — blog_post.html de-duplication, dynamic sidebar wiring, setActiveTag→blog.html?tag=, GTM fix, SEO heads ×3, unified sort, section reorder, functional sidebar cat/tag links (merged to `main` @ 7a507f4)
- Phase 4 — current-menu-item alignment ×5, blog.html copyright span, Vera Su label, dead comment removal, Day-of-Varna title decode (merged to `main` @ 2914b0e)
- Phase 6 — deleted 2 orphan pages + 3 junk files, .gitignore, dead-code removal (blog_post.js/blog.js), theme.js micro-fixes, docs reconciliation (merged to `main` @ 93952be)
- Phase 5 — investigated sticky header: verified faithful to Aurel, no code change needed; stale "broken" memory corrected (branch `remediation`, docs only)
