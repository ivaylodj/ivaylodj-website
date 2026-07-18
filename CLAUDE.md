# Claude Code Project Instructions - ivaylodj.com Photography Website

**CRITICAL: Read this before ANY work on this project.**

## Work Standards for This Project

### 1. COMPREHENSIVE AUDITS ONLY - NO PARTIAL FIXES
- **Every audit must scan EVERY file** in the project (HTML, CSS, JS, config files)
- **Scan by content AND structure** - don't just check tag balance, verify actual text/values
- **Check for patterns** - if issue found in one file, check if it exists in all similar files
- **Never claim "comprehensive" until you have verified EVERY file**
- **Document exactly what was scanned** - provide list of files checked and what was verified

### 2. Before Starting Work
1. Read this CLAUDE.md file completely
2. Check the memory at `/memory/` - especially `feedback_no-partial-fixes.md`
3. Read all related memory files about this project
4. Understand the history of issues on this project (see below)

### 3. HTML Files - What to Check
- [ ] Menu consistency across ALL pages (text content, not just structure)
- [ ] Portfolio link paths (different for subdirectories vs top-level)
- [ ] All href values point to EXISTING files
- [ ] Image paths all resolve correctly
- [ ] No orphaned closing tags or malformed structures
- [ ] Commented-out code doesn't hide issues

### 4. CSS Files - What to Check  
- [ ] All braces balanced
- [ ] All gallery-related selectors have proper transitions
- [ ] Classes match HTML structure
- [ ] No empty or incomplete rules
- [ ] Responsive breakpoints working

### 5. JavaScript Files - What to Check
- [ ] All braces and parentheses balanced
- [ ] No syntax errors (especially selectors matching HTML)
- [ ] Event handlers working for actual HTML elements
- [ ] No hardcoded file paths that might be outdated

### 6. When Fixing Issues
- **Apply fixes to entire codebase, not individual files**
- **If one file has issue, check all similar files for same problem**
- **Use find/replace or sed across all affected files, not just one**
- **Verify fixes with source code inspection, not browser testing**
- **Always commit with explanation of scope** (how many files affected, what was checked)

## Project History

### Critical Issues Found & Fixed
1. **Portfolio menu HTML malformation** (portfolio/index.html) - orphaned closing tags
2. **Gallery resize animations missing** - CSS transitions not added to packery/grid items
3. **Wrong Portfolio link paths** - double "portfolio/portfolio" paths causing 404s (23 portfolio files)
4. **blog_post.html menu completely wrong** - said "Sunsets Gallery" instead of "Portfolio"

### Why These Were Missed
- Audits claimed to be "comprehensive" when they weren't
- Only scanned subset of files instead of ALL files
- Checked structure (tags balanced) instead of CONTENT (menu text correct)
- Didn't test all variations (some files different, some same pattern)

## Files That Have Had Issues
These files need extra attention - they're prone to problems:
- `portfolio/index.html` - had orphaned HTML fragments
- `blog_post.html` - menu content wrong, commented-out orphaned code
- All `portfolio/*.html` - had wrong relative paths (23 files affected)
- Gallery CSS selectors - missing transitions

## Reference Information
- **Aurel template reference:** `/Users/ivaylodj/html-themes/other\ themes/html/aurel/`
- **Image directories exist:** `img/clipart/facebook/` with proper subdirectories
- **Gallery types:** packery, masonry, grid, fitRows
- **Main pages:** index.html, blog.html, about.html, contacts.html, blog_post.html
- **Portfolio structure:** portfolio pages under `portfolio/` across 4 subdirectories (varna, seasons, world-travels, europe-travels)

## Before Claiming Work is Complete
- [ ] List ALL files scanned (use `find . -name "*.html"` output as reference)
- [ ] Describe what was checked in EACH file type (HTML, CSS, JS)
- [ ] List specific edge cases tested (subdirectories, commented code, etc.)
- [ ] Provide git commits showing comprehensive fixes (not scattered single-file commits)
- [ ] Verify no "false completions" by testing key user paths (portfolio navigation, blog posts, etc.)

## User's Working Style
- Expects deep source code analysis, not browser-based testing
- Will test changes themselves - they'll catch partial fixes immediately
- Values precision and completeness over speed
- Prefers exact file paths and line numbers in explanations
- Will not accept "fully audited" claims unless genuinely comprehensive

---
**Last Updated:** 2026-07-18  
**Status:** Active project - maintaining high standards for all work
