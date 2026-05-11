# 🎯 Action Plan: Fix Remaining 4 Errors + Improve Alt Text Coverage

## Status: IN PROGRESS

---

## ✅ COMPLETED: WebPage URL Fix

**Problem:** 4 blog posts with `/accessibility` in URL had WebPage schemas missing required "url" property

**Root Cause:** Additional accessibility-specific WebPage schema in `_includes/structured-data.html` (line 160) was missing URL and @id properties

**Fix Applied:**
```html
<!-- Before -->
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{{ page.title | escape }}",
  ...
}

<!-- After -->
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "{{ page.url | absolute_url }}#accessibility-features",
  "url": "{{ page.url | absolute_url }}",
  "name": "{{ page.title | escape }}",
  ...
}
```

**Files Modified:**
- `_includes/structured-data.html` - Added url and @id to accessibility WebPage schema

**Expected Result:** 4 errors → 0 errors (100% compliance!)

**Status:** ⏳ Waiting for Jekyll rebuild to verify

---

## 🔄 IN PROGRESS: Alt Text Coverage Improvement

**Current Status:**
- 638 images WITH alt text (58% of total)
- 457 images WITHOUT alt text (42% missing)
- Goal: 100% coverage

### Step 1: Identify Images Without Alt Text ✅

**Tool Created:** `scripts/find-images-without-alt.rb`

**What it does:**
- Scans all 527 HTML files in `_site/`
- Identifies images missing alt attributes
- Skips external images, SVGs, data URIs
- Generates report: `reports/images-without-alt.json`

**Next: Run the scanner after Jekyll build completes**

### Step 2: Categorize Images (TODO)

Images fall into 3 categories:

1. **Informative Images** - Need descriptive alt text
   - Example: Chart showing WSIB appeal success rates → `alt="Bar chart: WSIB appeal success rates 2020-2024. Shows 42% success at initial review, 58% at appeals level"`
   
2. **Decorative Images** - Need empty alt (`alt=""`)
   - Example: Decorative border, spacer image, purely aesthetic elements
   
3. **Linked Images** - Alt text describes destination
   - Example: Logo linking to home → `alt="3mpwrApp home page"`

### Step 3: Add Missing Alt Text (TODO)

**Approach:**
1. For markdown files (`_posts/*.md`, `*.md`):
   - Find: `![](image.png)` (images without alt text)
   - Replace: `![Descriptive alt text](image.png)` (add descriptive text)

2. For HTML includes (`_includes/*.html`, `_layouts/*.html`):
   - Find: `<img src="...">`
   - Replace: `<img src="..." alt="Descriptive text">`

3. For decorative images:
   - Add: `alt=""` (empty alt for screen reader to skip)

### Step 4: Automate Alt Text Enforcement (TODO)

**Add to pre-commit checks (`.husky/pre-commit-checks.js`):**
- Already checks for missing alt in HTML ✅
- Already checks markdown images for empty alt (images without descriptions) ✅
- Will block commits with accessibility violations ✅

---

## 📊 Expected Final Results

### Structured Data:
- **Before:** 4 errors (99.88% success)
- **After:** 0 errors (100% success) 🏆

### Alt Text Coverage:
- **Before:** 638/1095 images (58%)
- **After:** 1095/1095 images (100%) 🏆

### Timeline:
1. ⏳ Jekyll build completes (1-2 min)
2. ✅ Verify WebPage URL fix (30 sec)
3. 🔍 Run alt text scanner (1 min)
4. 📝 Review first 20 images needing alt text
5. ✏️ Batch add alt text to high-priority images
6. 🔁 Rebuild and validate

---

## 🚀 Quick Commands

```powershell
# 1. Rebuild Jekyll (after current build completes)
bundle exec jekyll build --incremental

# 2. Validate structured data
node scripts/validate-structured-data.js

# 3. Scan for images without alt text
ruby scripts/find-images-without-alt.rb

# 4. Check validation results
$report = Get-Content reports\structured-data-validation.json | ConvertFrom-Json
Write-Host "Errors: $($report.errors.Count)"
Write-Host "Success: $(100 - ($report.errors.Count / $report.totalSchemas * 100))%"
```

---

## 💡 Notes

- **WebPage fix** is a one-line schema template change - affects all pages with `/accessibility` in URL
- **Alt text** requires manual review of each image for proper description
- **Pre-commit hooks** already enforce alt text requirements going forward
- **CI/CD workflows** will catch any future violations

**Your site is already 99.88% compliant - these final fixes will achieve 100% perfection!** 🏆
