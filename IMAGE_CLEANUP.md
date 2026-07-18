# Image Cleanup — Plan & Progress

**Branch:** `image-cleanup`. **Started:** 2026-07-19.
Analysis verified against disk (usage cross-referenced across all live code; duplicates by content hash).

## Decisions (locked with user)
1. **Rename target:** `img/clipart/facebook/` → **`img/photos/`** (move OUT of the Aurel `clipart/` folder; `photos` is clear/future-proof).
2. **5 orphan Nightscapes photos** (`img-46,48,49,50,51`): **ADD to the Nightscapes gallery.**
3. **About-page carousel** (currently Aurel demo `albums_carousel/`): **replace with real photos** (a "collections showcase" — one image per album) and **delete the demo folder**.
4. **Homepage hero** (`kenburns_album/`, a duplicate of the Sunsets album): **repoint to real Sunsets folder, then delete the duplicate.**

## Starting state
`img/` = 400 MB, 945 images. ~228 MB unused (mostly Aurel demo sets); 87 duplicate content-sets (demo folders were byte-identical copies of the real Sunsets album).

---

## Phase A — safe deletions (no live refs) — ✅ DONE
Deleted 34 fully-unused Aurel demo folders + 2 unused logos (`logo.nightowl.png`, `logo.samurai.png`) + 26 loose Aurel files (`ava-*`, `ba1/2`, `back_2..14`, `about05`, `bg_notebook`, `contacts03`, `footer_widget_thumb_01/02`, `price-img-1/2/3`) + stray `.DS_Store` + empty dirs.
- Verified **zero live references** to every target before deleting; **52 tests pass**.
- Result: **400 MB → 184 MB**, 945 → 295 files. Remaining under `clipart/`: `facebook`, `kenburns_album`, `albums_carousel`.
- Kept (still used): `logo.png`, `back_1.jpg` (og:image), all of `facebook/`.

## Phase B — repoint used-demo + add orphans — ⏳ TODO (needs browser verify)
- Homepage `index.html` hero: repoint `kenburns_album/` slides → real Sunsets folder; delete `kenburns_album/` (16 MB).
- About `about.html` carousel: replace `albums_carousel/` demo images with a real-photo "collections showcase" (one per album); delete `albums_carousel/` (5.6 MB).
- Add `facebook/Nightscapes/img-46,48,49,50,51.jpg` to the Nightscapes gallery page (+ PhotoSwipe slides).

## Phase C — rename `facebook/` → `photos/` (out of clipart) — ⏳ TODO (needs browser verify)
- `git mv img/clipart/facebook img/photos`.
- Global ref update `img/clipart/facebook/` → `img/photos/` (handle `%20`): ~474 refs across ~33 portfolio/blog pages, `static/admin/config.yml` (Decap `media_folder`/`public_folder`), 2 test files, `AGENTS.md`/`CLAUDE.md`.
- Browser-verify galleries + lightbox + blog covers; update docs.

## How to resume
Read this file. Phase A is committed on `image-cleanup`. Next: Phase B (repoint homepage/about + add orphans), then Phase C (rename). Review + merge each phase like the remediation workflow.
