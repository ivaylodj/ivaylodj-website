# Image Cleanup — Record

**STATUS: ✅ COMPLETE (2026-07-19).** Branch: `image-cleanup`. Analysis verified against disk (usage cross-referenced across all live code; duplicates by content hash). 52 tests pass at every phase.

## Result
- **`img/` 400 MB → 163 MB** (~237 MB / 62% freed).
- Real photography moved out of the Aurel `clipart/` folder to a clean **`img/photos/`** (17 albums).
- `img/clipart/` now holds only 9 still-used loose files (about0*, about_me, about_title_bg, back_1 [og:image], banner, contacts). `img/logo.png` kept.

## Decisions (locked with user)
1. **Rename:** `img/clipart/facebook/` → **`img/photos/`** (moved out of `clipart/`).
2. **5 orphan Nightscapes photos** (`img-46,48,49,50,51`): **added** to the gallery.
3. **About-page carousel** (was Aurel demo `albums_carousel/`): **replaced** with a real-photo "collections showcase"; demo folder deleted.
4. **Homepage hero** (was `kenburns_album/`, a Sunsets duplicate): **repointed** to the real Sunsets album; duplicate deleted.

---

## Phase A — safe deletions — ✅ DONE
Deleted 34 fully-unused Aurel demo folders + 2 unused logos (`logo.nightowl.png`, `logo.samurai.png`) + 26 loose Aurel files (`ava-*`, `ba1/2`, `back_2..14`, `about05`, `bg_notebook`, `contacts03`, `footer_widget_thumb_01/02`, `price-img-1/2/3`) + stray `.DS_Store`/empty dirs. Verified **zero live references** to every target first. (400 MB → 184 MB.)

## Phase B — repoint used-demo + add orphans — ✅ DONE
- Homepage hero (`index.html`): Ken Burns slides repointed `kenburns_album/` → `img/photos/Sunsets/` (img-1..30).
- Nightscapes (`portfolio/nightscapes.html`): Ken Burns `data-slides` **regenerated from the actual files** — removed 5 broken refs (`img-9,12,13,16,19` never existed on disk) and added the 5 orphans (`img-46,48,49,50,51`); now 45 slides = 45 real files.
- About (`about.html`): carousel replaced with 11 real-album showcase items (one per portfolio album, linking to each gallery); div-balanced.
- Deleted `kenburns_album/` + `albums_carousel/` after repointing (verified unreferenced). (184 MB → 163 MB.)

## Phase C — rename `facebook/` → `img/photos/` — ✅ DONE
- `git mv img/clipart/facebook img/photos` (235 image files).
- Swept `img/clipart/facebook` → `img/photos` across 38 files: all portfolio/blog pages, `about.html`, `contacts.html`, `index.html`, `_posts/index.json` + 3 `.md`, `static/admin/config.yml` (Decap `media_folder`/`public_folder`/label), 2 test files, `_templates/*`, and docs (`AGENTS.md`, `CLAUDE.md`).
- Verified: 0 residual `img/clipart/facebook` refs; sampled paths resolve on disk; 52 tests pass.

## Phase D — Nightscapes contiguous renumber — ✅ DONE
- Renumbered `img/photos/Nightscapes/` from gappy (…8,10,11,14,15,17,18,20…46,48…51) to contiguous **img-1..img-45** (two-phase move, collision-safe).
- Rebuilt `nightscapes.html` Ken Burns `data-slides` → contiguous img-1..45.
- No other file needed changes: outside `nightscapes.html`, only `img-1`/`img-5` are referenced (both in the ungapped 1–8 range, so unchanged). All refs resolve; 52 tests pass.

## ⏳ OPEN FOLLOW-UP — Featured-posts / cover-image fixes (resume here next session)

**Context:** user noticed **"First Post"** and **"Golden Hour Sunsets"** show the *same* image, and the About-footer featured post shows a wrong image.

**Investigation findings (verified):**
- `_posts/index.json` covers: First Post → `img/photos/Sunsets/img-1.jpg`; Welcome Message → `img/photos/Sunrises/img-1.jpg`; Golden Hour Sunsets → `img/photos/Sunsets/img-1.jpg`.
- **Git history:** First Post has used `Sunsets/img-1.jpg` since its earliest commit — there is **no earlier distinct image to restore**; the duplicate is long-standing, NOT caused by the image cleanup.
- First Post is a generic stub (no gallery_images, empty categories/tags, excerpt "Welcome to my photography blog…"). Golden Hour Sunsets is a real Sunsets gallery post → legitimately keeps `Sunsets/img-1`.
- Featured-posts sections: **blog.html** (sidebar `#featured-posts-list`, footer `#footer-featured-posts-list`) and **blog_post.html** sidebar are **dynamic** (read `cover_image`) → they auto-correct once a cover changes.
- **about.html footer featured widget is HARDCODED and wrong** (~line 571-585): title "Welcome Message" but image `Nightscapes/img-1.jpg` (should be `Sunrises/img-1.jpg`) and `href="/"` broken (should link `blog_post.html?post=2022-01-22-welcome-post`).
- `portfolio/world-travels/namibia-2021.html` also has a hardcoded footer featured widget ("Mother Nature"→Nightscapes/img-1, "Road Trip"→Sunsets/img-1, links to blog.html) — generic placeholders; review/lower priority.

**Plan for next session:**
1. **First Post cover** → give it a DISTINCT image (recommend `img/photos/Nightscapes/img-1.jpg` — signature genre, distinct from Sunsets/Sunrises). Update BOTH `_posts/index.json` AND `_posts/2022-01-22-first-post.md` frontmatter. (Golden Hour Sunsets stays Sunsets; Welcome Message stays Sunrises.) → auto-fixes the dynamic featured-posts + blog listing. **⚠ Confirm the chosen image with user (they said they don't recall the original).**
2. **about.html footer featured** → image `Nightscapes/img-1.jpg` → `Sunrises/img-1.jpg`; fix both `href="/"` → `blog_post.html?post=2022-01-22-welcome-post`.
3. (optional) normalize the `namibia-2021.html` footer featured placeholders.
4. Verify blog listing + both sidebars + about footer show correct, non-duplicate images.

**Also still pending:** final user review of the whole `image-cleanup` branch (About square carousel + Nightscapes renumber), then **merge `image-cleanup` → `main`** (currently `main`=80cbd57, unmerged).

## Notes for the future
- New photos go under `img/photos/<Album>/img-N.jpg`. Decap CMS media folder is now `img/photos`.
- Nightscapes is now contiguously numbered (img-1..45). Other albums may still have gaps — the gallery slide lists are generated from actual files, so gaps are harmless; ask if you want another album renumbered.
