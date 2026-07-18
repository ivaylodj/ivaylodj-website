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
- [ ] (optional, perf) `blog_post.js` still fetches `index.json` twice — consolidate later if desired.

## Phase 4 — Consistency & polish (low risk)
- [ ] `current-menu-item` desktop↔mobile alignment: `portfolio/europe-travels/index.html`, `seasons/index.html`, `world-travels/index.html`, `varna/index.html` (desktop `:88`), and `index.html` (mobile `:153`)
- [ ] `blog.html:279` — copyright `div#copyright-year` → `span` pattern
- [ ] `portfolio/index.html:368` — Vera Su tile label "portraits" → "black sea" (matches `black-sea` class/filter)
- [ ] Remove dead commented `albums_grid.html` menu fragments: `index.html:88`, `about.html:700,701`
- [ ] (optional) Normalize subdir canonicals to trailing-slash form

## Phase 5 — Sticky header (isolated; known rabbit hole — browser-test vs Aurel)
- [ ] Align JS threshold (`theme.js:851,860,1012` `>1024`) to `1200` OR move logo-shrink rules (`theme.css:1215–1234`) into `@media(min-width:1200px)`
- [ ] Consolidate to one scroll handler; create `cherga_header_holder` placeholder in `ready` not `load`

## Phase 6 — Hygiene & docs (no user-facing risk)
- [ ] Remove/relink orphan `portfolio/namibia.html`; move root `blog_standard.html` → `_templates/` (repoint `blog_post.html` placeholders)
- [ ] `git rm` `blog_post.html.bak`, `img/clipart/back_1.old.jpg`, `img/clipart/blog_single/img-7.old.jpg`; add `*.bak`/`*.old.*` to `.gitignore`
- [ ] `js/theme.js` — convert `setTimeout` string-eval (×27) to fn refs; add `event` param (`:204`); remove stray `0` (`:90`); remove dead `nested-toggle` handler
- [ ] `js/blog_post.js` — remove dead `galleryConfigFromMd` (281–308)
- [ ] `js/blog.js` — remove/curtail fake "Page 1 of N" pagination (256–272)
- [ ] Docs: `AGENTS.md`, `MEMORY.md`, `CLAUDE.md` — `galleries/`→`portfolio/`, "Photos"→"Portfolio", fix counts (29 pages, 4 subdirs, real test count), stale commit IDs

---

## Newly discovered during remediation (not yet scheduled)
- [ ] URL-encoded titles/meta on Varna pages: `varna/day-of-varna-2019.html`, `day-of-varna-2020.html`, `varna/index.html` show `Day%20of%20Varna%20...` in `<title>`, `og:title`, `twitter:title`, JSON-LD (the visible `<h1>` is correct). Decode `%20`→space. (Cosmetic/SEO — slot into Phase 4.)

## Change log
_(append commit hashes as phases land)_
- Phase 0+1 — broken links, sitemap, CMS config, namibia widget + image-depth fix (merged to `main` @ 772ebea)
- Phase 2 — masonry scripts, nested-index body class + CSS re-scope, theme.js demo removal, PhotoSwipe fix (removed breaking inline overrides), footer relocation ×7 (merged to `main` @ 5d3c647)
- Phase 3 — blog_post.html de-duplication, dynamic sidebar wiring, setActiveTag→blog.html?tag=, GTM fix, SEO heads ×3, unified sort (branch `remediation`; needs browser eyeball before merge)
