# AGENTS.md — Project Context & Guidance

**Last updated:** 2026-07-19 | **Working on:** Site-wide audit remediation — see `REMEDIATION.md` for phase-by-phase status.

> Note: galleries live under `portfolio/` (not `galleries/`). Nav label is "Portfolio". The live blog renders via `js/blog_post.js`; `_templates/` holds reference templates (disallowed in robots.txt).

---

## Project Overview

**ivaylodj-website** — Static photography portfolio website built with HTML/CSS/JavaScript and deployed via CloudFlare Pages.

- **Live site:** https://ivaylodj.com
- **Dev deployment:** https://ivaylodj-website.pages.dev
- **Repo:** https://github.com/ivaylodj/ivaylodj-website
- **Tech stack:** HTML5, CSS3, JavaScript (jQuery), static blog system, Owl Carousel, CloudFlare Pages
- **Node version:** ≥18 (tests run on 18.x and 20.x)

---

## Important Notes

**⚠️ CRITICAL: Aurel Theme Reference**
The Aurel theme codebase is the single source of truth for correct HTML structure and menu patterns:
```
/Users/ivaylodj/html-themes/other themes/html/aurel
```
**ALWAYS reference this path when:**
- Analyzing HTML structure and menu patterns
- Identifying correct CSS class usage (menu-item-has-children, current-menu-item, etc.)
- Checking submenu nesting and markup patterns
- Auditing template consistency

**Aurel = Cherga (rebranded):** The Aurel theme is the same as the Cherga theme in this project—Aurel is the old name. Both use identical CSS/JS structure, just different class prefixes (aurel_ vs cherga_) in the HTML. When copying Aurel templates, they work with this project's Cherga CSS and JS files.

## Current State (as of commit 2c25b91)

### ✅ Completed

1. **Test Infrastructure** (52 tests, all passing)
   - Unit tests: markdown parser, date formatter
   - Integration tests: blog post loading, template system, blog sidebar rendering
   - Regression tests: post navigation (circular), layout switching, related posts
   - Run: `npm test` (runs on every push, blocks bad deployments)

2. **Navigation Fixed**
   - All served HTML pages updated with consistent menu structure
   - MY BLOG links to blog.html (not dropdown)
   - Galleries live under `portfolio/`; nav label is "Portfolio" throughout
   - Relative paths fixed (root: `blog.html`, portfolio/: `../blog.html`, portfolio/sub/: `../../blog.html`)
   - Both desktop and mobile menus consistent

3. **Blog Post System Working**
   - Posts load from `_posts/index.json` and `_posts/*.md` files
   - Template system: `blog_image` (carousel layout) vs `blog_standard` (simple layout)
   - Post navigation: circular (first→last, last→first)
   - Related posts: "You may also like" section showing 2 other posts
   - Filename matching fixed (.md extension handling)

4. **Blog Sidebar Enhanced** (commit 2c25b91)
   - Post metadata enriched with meaningful categories and tags
   - Categories: Sunsets, Nature, Photography, Behind the Scenes
   - Tags: photography, sunsets, nature, travel, behind-the-scenes
   - Sidebar renders: search, categories with counts, tag cloud, featured posts (up to 3)

5. **CI/CD Pipeline Active**
   - GitHub Actions: runs tests on Node 18.x and 20.x
   - Tests must pass before code can deploy
   - CloudFlare Pages auto-deploys on git push to main

### ⚠️ Known Issues (NEEDS FIXING)

1. **Blog Pages Layout Broken** (user feedback: "They are still wrong/bad")
   - Images not displaying properly in blog_image template (carousel)
   - Layout/styling issues with blog_standard template
   - Post content rendering may have issues
   - Sidebar visibility on single post page needs verification

2. **Blog Sidebar Rendering** 
   - Widget structure in HTML is correct but visual layout may need CSS fixes
   - Featured posts section styling (images, spacing, alignment)
   - Categories/tags styling consistency

3. **Carousel (Owl Carousel)**
   - CSS fixes added but may still need tweaking
   - Image sizing and alignment in carousel items
   - Transform/flex layout issues resolved but verify visually

---

## File Structure

```
/
├── index.html, about.html, contacts.html, blog.html, blog_post.html
├── blog_standard.html (template page)
├── portfolio/
│   ├── index.html, nightscapes.html, sunsets.html, birds.html, etc.
│   └── [subfolder galleries with index.html]
├── css/
│   ├── kube.css (framework)
│   ├── theme.css (main theme)
│   └── font-awesome.min.css
├── js/
│   ├── blog.js (blog listing page — renders posts, sidebar, search, filtering)
│   ├── blog_post.js (single post page — loads markdown, renders template, navigation, related posts)
│   ├── theme.js (global theme, carousel init, animations)
│   ├── jquery.min.js, owl.carousel.min.js, etc.
├── _posts/
│   ├── index.json (post metadata: filename, title, date, template, cover_image, categories, tags, excerpt)
│   ├── 2022-01-22-first-post.md (blog_image template)
│   └── 2022-01-22-welcome-post.md (blog_standard template)
├── _tests/ (52 tests, 8 test files)
│   ├── setup.js (mock XMLHttpRequest, jQuery, URLSearchParams)
│   ├── unit/ (markdown-parser, date-formatter)
│   ├── integration/ (blog-post-loading, template-system, blog-sidebar)
│   └── regression/ (post-navigation, layout-switching, related-posts)
├── .github/workflows/
│   └── test-and-deploy.yml (GitHub Actions: runs tests on push to main)
├── package.json (Node 18+, Jest, npm scripts)
├── jest.config.js (test config, 70% coverage threshold)
└── AGENTS.md (this file — keep updated!)
```

---

## Key Code Locations

### Blog Post Loading & Rendering
- **blog.js** (js/blog.js): Loads posts from `_posts/index.json`, builds sidebar widgets (categories, tags, featured posts), renders blog listing
- **blog_post.js** (js/blog_post.js): Loads single post markdown, parses frontmatter, applies template (blog_image vs blog_standard), renders related posts, handles navigation

### Template System
- **blog_image**: Full-width carousel layout, no sidebar
- **blog_standard**: Standard layout with sidebar on right
- Control via `template` field in `_posts/index.json`
- Implemented as conditional HTML in blog_post.js lines ~200-280

### Post Metadata
- **_posts/index.json**: Array of post objects with `filename`, `title`, `date`, `template`, `cover_image`, `categories`, `tags`, `excerpt`
- Categories used for sidebar widget + filtering
- Tags used for tag cloud + filtering
- Template field controls single-post layout

### Carousel Rendering
- **blog_post.js** (lines ~300-350): Owl Carousel initialization
- **blog_post.html** (lines 118-149): CSS for carousel display, flexbox layout, image constraints
- **theme.js**: May also initialize carousel (check for conflicts)

---

## Working Style Guide (CRITICAL)

### For Any Agent Working On This Project

1. **REFERENCE AUREL FIRST** — Before analyzing or changing HTML structure, check `/Users/ivaylodj/html-themes/other themes/html/aurel` to understand correct patterns
2. **Before editing** — read the file with `Read` tool, inspect with `grep/find`
3. **Verify assumptions** — if code looks wrong, check the actual file; don't guess
4. **Flag discrepancies** — if reality differs from spec, note it AND fix per intent
5. **Commit + Push** — always do BOTH in sequence, then verify git push output shows remote change
6. **Test before claiming** — run `npm test` and show output
7. **Check live** — after deployment, actually test the feature in browser (not just "tests pass")
8. **Be precise** — exact file paths (no `./` prefix), exact line numbers, exact strings for find/replace
9. **Gallery paths** — portfolio/ uses `../` for root-level files; portfolio/subfolder/ uses `../../`
10. **No AI attribution** — never add "Co-Authored-By: Claude..." unless explicitly asked
11. **One task at a time** — commit per logical change, don't batch unrelated fixes
12. **Always push** — verify git push output shows changes reached GitHub before saying "deployed"

### Feedback Rules
- **User gives exact instructions** — follow them exactly
- **If something differs** — flag it AND fix per intent, don't over-reach
- **Always show git output** after push/commit
- **Don't assume deployment** — verify push reached GitHub and CloudFlare shows new version

---

## Test Suite Details

### Run Tests
```bash
npm test                    # All tests + coverage
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:regression     # Regression tests only
npm run test:watch          # Watch mode (re-run on changes)
```

### Coverage Threshold
- 70% branches, functions, lines, statements
- Exceeds on most files; some jQuery/plugin code excluded

### What's Tested ✅
- Blog post loading from JSON
- Markdown parsing and HTML conversion
- Date formatting across locales
- Template system (blog_image removes sidebar, blog_standard keeps it)
- Circular post navigation (first↔last wrapping)
- Related posts section (displays 2 others, excludes current)
- Blog sidebar widgets (categories with counts, tags, featured posts)

### What's NOT Tested ⚠️
- End-to-end browser flows (would need Cypress)
- Image loading/rendering
- Carousel visual behavior
- Responsive design
- CSS styling appearance
- Form submissions

**Action:** Add Cypress E2E tests if visual/interaction bugs occur frequently.

---

## CI/CD Pipeline

### GitHub Actions Workflow
- **File:** `.github/workflows/test-and-deploy.yml`
- **Trigger:** Every push to main branch
- **Matrix:** Node 18.x, 20.x
- **Steps:**
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies (`npm ci`)
  4. Run unit tests (`npm run test:unit`)
  5. Run integration tests (`npm run test:integration`)
  6. Run regression tests (`npm run test:regression`)
  7. Run all tests with coverage (`npm test`)
  8. Upload coverage to codecov

### Deployment
- **CloudFlare Pages** handles auto-deploy on git push
- No manual deployment needed
- Tests must pass or deploy is blocked
- Previous attempts to use `cloudflare/pages-action` were removed (CloudFlare already auto-deploys via Git integration)

### Secrets Required (set in GitHub repo Settings → Secrets)
- `CLOUDFLARE_API_TOKEN` — CloudFlare API token
- `CLOUDFLARE_ACCOUNT_ID` — CloudFlare account ID
- (Currently not used in workflow, but may be needed if manual deploy re-added)

---

## Common Patterns & Solutions

### Blog Post Metadata (_posts/index.json)
```json
{
  "filename": "2022-01-22-post-slug.md",
  "title": "Post Title",
  "date": "2022-01-22",
  "template": "blog_image" or "blog_standard",
  "cover_image": "img/path/to/image.jpg",
  "categories": ["Category1", "Category2"],
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "Short description shown in blog listing"
}
```

### Relative Paths
- **From root (index.html, blog.html, blog_post.html):** `href="blog.html"`, `src="css/theme.css"`
- **From portfolio/ (portfolio/nightscapes.html):** `href="../blog.html"`, `src="../css/theme.css"`
- **From portfolio/subfolder/ (portfolio/world-travels/index.html):** `href="../../blog.html"`, `src="../../css/theme.css"`

### Template Switching (blog_post.js)
```javascript
if (post.template === 'blog_image') {
  // Full-width carousel layout, no sidebar
  document.body.classList.add('cherga_no_sidebar');
  // Render carousel with owl carousel
} else {
  // Standard layout with sidebar
  // Regular image + content
}
```

### Circular Navigation
```javascript
var postIndex = posts.findIndex(p => p.filename === currentPost);
var nextIndex = (postIndex + 1) % posts.length;  // Wraps to 0 at end
var prevIndex = (postIndex - 1 + posts.length) % posts.length;  // Wraps to last
```

---

## Debugging Tips

### Tests Fail
```bash
npm test                              # Full output
npm run test:unit 2>&1 | tail -30    # Last 30 lines
grep -r "test description" _tests/   # Find specific test
```

### Blog Posts Don't Load
1. Check `_posts/index.json` is valid JSON: `cat _posts/index.json | jq`
2. Check markdown files exist: `ls _posts/2022-*.md`
3. Check filename in index.json matches actual file (with .md extension)
4. Check browser console for XMLHttpRequest errors
5. Check blog.js is loaded: `curl https://ivaylodj-website.pages.dev/js/blog.js | head -20`

### Images Don't Show
1. Check cover_image path is correct in `_posts/index.json`
2. Check image file exists: `ls img/clipart/...`
3. Check path is relative to website root, not to _posts/
4. Check for CORS issues in browser DevTools Network tab
5. For carousel images, also check CSS width/height constraints

### Sidebar Widgets Missing
1. Check blog.html has `<div id="blog-categories-list">` etc.
2. Check blog.js loads and runs: look at browser console for errors
3. Check _posts/index.json has posts with categories/tags
4. Run test: `npm run test:integration -- blog-sidebar`

### Deploy Not Working
1. Check GitHub Actions: https://github.com/ivaylodj/ivaylodj-website/actions
2. Check test output in workflow logs
3. If tests pass but CloudFlare page shows old content: hard refresh browser (Cmd+Shift+R)
4. Check CloudFlare deployment status: https://dash.cloudflare.com

### Git Push Didn't Work
1. Always run `git push origin main` — don't assume it worked
2. Verify: `git branch -vv` should show `main [origin/main]` (not "ahead 1")
3. If behind: `git pull origin main` first
4. If merge conflict: resolve, commit, then push

---

## Next Steps (User's Stated Goals)

### Immediate (BLOCKING)
1. **Fix blog pages layout** — images, carousel, post content rendering
   - Test in browser: https://ivaylodj-website.pages.dev/blog_post.html?post=2022-01-22-first-post
   - Compare with expected vs actual layout
   - Likely issues: CSS constraints, carousel not displaying, image sizing

2. **Verify sidebar appearance** — styling, spacing, alignment
   - Check featured posts images load
   - Check category/tag counts display
   - Check responsive design on mobile

### Future (Nice to Have)
- Add more posts to blog (build out `_posts/index.json` with real content)
- Add Cypress E2E tests for visual/interaction verification
- Improve carousel functionality (lazy loading, transitions)
- Add search functionality improvements
- Add pagination or infinite scroll to blog listing

---

## Key Contacts & Resources

- **User email:** ivaylo.djounov@mypos.com
- **GitHub:** https://github.com/ivaylodj/ivaylodj-website
- **Live site:** https://ivaylodj.com
- **Dev deployment:** https://ivaylodj-website.pages.dev
- **CloudFlare Dashboard:** https://dash.cloudflare.com (for monitoring deployments)
- **GitHub Actions:** https://github.com/ivaylodj/ivaylodj-website/actions (for CI/CD logs)

---

## Gallery Pages Guide

- **Templates:** Copy from existing (e.g. `portfolio/nightscapes.html`), don't start from scratch
- **Images:** Live at `img/clipart/facebook/<Album Name>/`, use `../img/...` paths from `portfolio/`
- **Nested galleries:** Use `../../img/...` from subfolders like `portfolio/world-travels/index.html`
- **After adding:** Update `sitemap.xml`, add to header/mobile menu, update `portfolio/index.html` grid

---

## Document Maintenance

**This file should be updated:**
- After every major feature completion
- When new issues are discovered
- When working style feedback is given
- When test coverage changes
- When deployment process changes
- When new common patterns emerge

**Format:** Keep sections clear, use checkmarks (✅) for done, warnings (⚠️) for issues, examples in code blocks, commit IDs for reference.

