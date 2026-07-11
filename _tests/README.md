# Test Suite Documentation

## Overview

Complete automated test suite for ivaylodj-website project including unit, integration, regression, and acceptance tests.

**Tests run BEFORE every deployment to catch regressions.**

## Test Structure

```
_tests/
├── unit/                    # Isolated function tests
│   ├── markdown-parser.test.js       # Markdown parsing
│   └── date-formatter.test.js        # Date formatting
├── integration/             # Feature integration tests
│   ├── blog-post-loading.test.js    # Post loading flow
│   └── template-system.test.js      # Template rendering
├── regression/              # Previous bug fixes
│   ├── post-navigation.test.js      # Circular navigation
│   ├── layout-switching.test.js     # Template layouts
│   └── related-posts.test.js        # You may also like
└── setup.js                 # Global test configuration
```

## Running Tests

### Local Development

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:regression     # Regression tests only

# Watch mode (re-run on file changes)
npm run test:watch
```

### Coverage Report

```bash
npm test
# Coverage report in ./coverage/
```

**Coverage thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Categories

### Unit Tests

Test individual functions in isolation.

**Files tested:**
- Markdown parser (blog_post.js)
- Date formatter (blog_post.js)

**What's tested:**
- Markdown to HTML conversion
- Date formatting for different locales
- Edge cases (leap years, month variations)

### Integration Tests

Test how components work together.

**Files tested:**
- Blog post loading flow
- Template system

**What's tested:**
- Post index loading from JSON
- Template field presence and values
- DOM injection and rendering
- Filename matching with/without .md extension

### Regression Tests

Ensure previous bug fixes remain fixed.

**Test scenarios:**
1. **Post Navigation** - Circular loop navigation
   - First → Next → Last → First
   - Prev navigation wrapping
   - Filename matching (.md handling)

2. **Layout Switching** - Template-based layouts
   - blog_image removes sidebar
   - blog_standard keeps sidebar
   - Content width adjustment
   - Layout preservation

3. **Related Posts** - "You may also like" section
   - Displays heading
   - Shows other posts
   - Limits to 2 posts
   - Includes images, dates, excerpts
   - Creates proper links
   - Excludes current post

## Deployment Process

### Automatic Testing on Push

1. **GitHub Actions triggers on push to main**
2. **Runs all test suites** (unit, integration, regression)
3. **If tests PASS:**
   - ✅ Deploys to CloudFlare Pages
   - ✅ Comments on PR/commit with deployment URL
4. **If tests FAIL:**
   - ❌ Blocks deployment
   - ❌ Shows error details in GitHub Actions log
   - ❌ No changes go live

### Manual Testing Before Commit

Set up pre-commit hook (optional):

```bash
npm run pre-commit
```

This runs unit + integration + regression tests before allowing commit.

## What Gets Tested?

### ✅ Tested (Regression Prevention)

- Blog post loading and rendering
- Template system (blog_image vs blog_standard)
- Circular post navigation (first/last wrapping)
- Layout switching (sidebar show/hide)
- "You may also like" related posts section
- Date formatting
- Markdown parsing

### ⚠️ Not Tested (Manual Verification Needed)

- End-to-end browser flows (Cypress suite needed)
- Image loading and display (requires Cypress)
- Carousel rendering (owl carousel jQuery integration)
- Responsive design (requires Cypress)
- CSS styling and layout appearance

## Adding New Tests

When adding features:

1. **Write test first** (TDD approach)
2. **Implement feature**
3. **Run tests:** `npm test`
4. **Commit with tests passing**
5. **Tests block bad deployment** ✨

### Example: New Feature Test

```javascript
// _tests/regression/my-feature.test.js
describe('My New Feature', () => {
  test('should do something important', () => {
    expect(result).toBe(expected);
  });
});
```

## Troubleshooting

### Test fails locally but passes in CI

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be ≥18)
- Run with same Node version as CI matrix

### Tests won't run

```bash
# Check Node/npm
node --version
npm --version

# Reinstall
rm package-lock.json
npm install

# Run tests
npm test
```

### Deployment blocked by tests

1. Check GitHub Actions log for error details
2. Run tests locally: `npm test`
3. Fix the failing test
4. Push again

## CI/CD Configuration

### GitHub Actions Secrets Required

Set these in GitHub repo settings → Secrets:

```
CLOUDFLARE_API_TOKEN        # CloudFlare API token
CLOUDFLARE_ACCOUNT_ID       # CloudFlare account ID
```

### Test Matrix

Runs tests on:
- Node 18.x
- Node 20.x

Ensures compatibility across Node versions.

## Future Enhancements

- [ ] Add Cypress E2E tests for browser automation
- [ ] Add image loading tests
- [ ] Add carousel/owl carousel tests
- [ ] Add responsive design tests
- [ ] Add performance benchmarks
- [ ] Add accessibility (a11y) tests

