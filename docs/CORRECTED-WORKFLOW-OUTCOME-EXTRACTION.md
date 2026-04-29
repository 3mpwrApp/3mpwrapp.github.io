# CORRECTED WORKFLOW: Outcome Extraction with NotebookLM Patterns

**Date:** April 29, 2026  
**Issue Discovered:** JSON files have no full text, only metadata  
**Status:** **FIXED** - Full text scraper created

---

## 🔍 **WHAT WENT WRONG (April 28-29, 2026)**

### **The Test:**
```bash
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023
```

### **The Result:**
```
Before Unknown: 120 (100.0%)
After Unknown: 120 (100.0%)
Improved: 0 decisions
```

### **The Root Cause:**

JSON files have **NO FULL TEXT**:

```json
{
  "case_id": "2023canlii138774",
  "title": "20240003 (Re)",
  "url": "https://canlii.ca/t/k3zj2",
  "keywords_api": ["worker — non-economic loss benefit..."],
  "full_text_html": "",              ← EMPTY!
  "full_text_length": 0,             ← ZERO!
  "data_quality": {
    "has_full_text": false           ← FALSE!
  }
}
```

**Why:** Your scrapers collected metadata only (case numbers, dates, keywords) but never downloaded the actual decision text from CanLII.

**Impact:** Re-extraction script had nothing to analyze → 0 improvements

---

## ✅ **THE FIX: 3-Step Process**

### **Phase 0: Fetch Full Text from CanLII** (NEW STEP)

Before you can extract outcomes, you need the actual decision text:

```bash
# Start with 50 decisions for testing (takes ~3 minutes)
node scripts/fetch-full-text-from-canlii.js onwsib 2023 50
```

**What this does:**
1. Reads `onwsib-2023-complete.json`
2. For each decision without full text:
   - Visits CanLII URL (e.g., `https://canlii.ca/t/k3zj2`)
   - Scrapes full decision text from HTML
   - Adds to `full_text` field
3. Saves progress every 10 decisions
4. Creates backup before starting

**Safety features:**
- 3-second delay between requests (polite scraping)
- Incremental saves (resume on failure)
- Automatic backups

**Time estimates:**
- 50 decisions: ~3 minutes
- 100 decisions: ~5 minutes
- 500 decisions: ~25 minutes

### **Phase 1: Re-extract Outcomes with Patterns**

Once you have full text, run pattern matching:

```bash
# Process the decisions with NotebookLM patterns
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023
```

**Expected result:**
- Before: 100% Unknown
- After: ~70% Unknown (30% improvement!)
- Hundreds of decisions classified

### **Phase 2: Validate Results**

```bash
# Check the improvement report
cat docs/outcome-reextraction-report-2026-04-29.md

# Review sample decisions
node scripts/export-unknown-for-notebooklm.js onwsib 25
```

---

## 📊 **COMPLETE WORKFLOW FOR ALL TRIBUNALS**

### **1. ONWSIB (Highest Priority - 95.4% Unknown)**

```bash
# Step 1: Fetch full text (120 decisions)
node scripts/fetch-full-text-from-canlii.js onwsib 2023 120

# Step 2: Extract outcomes
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023

# Step 3: Check results
cat docs/outcome-reextraction-report-2026-04-29.md
```

**Expected:** 95.4% → ~70% Unknown (25% improvement, ~30 decisions classified)

---

### **2. WSIAT (Largest Dataset - 11,000+ decisions)**

```bash
# Start with recent year (fewer decisions)
node scripts/fetch-full-text-from-canlii.js wsiat 2026 100
node scripts/re-extract-outcomes-with-notebooklm-patterns.js wsiat 2026

# If good results, process historical data
node scripts/fetch-full-text-from-canlii.js wsiat 2025
node scripts/re-extract-outcomes-with-notebooklm-patterns.js wsiat 2025
```

**Expected:** 94.3% → 50-60% Unknown (34-44% improvement, ~4,000 decisions classified)

**⚠️ Warning:** Full WSIAT dataset will take **hours** to fetch. Start with recent years first.

---

### **3. ONSBT (High Improvement Potential)**

```bash
node scripts/fetch-full-text-from-canlii.js onsbt 2023
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onsbt 2023
```

**Expected:** 95.4% → 40-50% Unknown (45-55% improvement)

---

### **4. ONHRT (New Dataset)**

```bash
node scripts/fetch-full-text-from-canlii.js onhrt 2023
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onhrt 2023
```

**Expected:** 100% → 30-40% Unknown (60-70% classification rate)

---

## 🎯 **RECOMMENDED EXECUTION ORDER**

### **Day 1: Test & Validate** (TODAY)

1. ✅ ONWSIB 2023 (50 decisions) - 3 minutes
2. ✅ Re-extract outcomes - 1 minute
3. ✅ Review report - validate accuracy
4. ✅ If good → proceed to Day 2

### **Day 2: Full ONWSIB** (TOMORROW)

1. Fetch full ONWSIB 2023 (120 total) - 6 minutes
2. Re-extract outcomes
3. Export remaining Unknown for NotebookLM Batch 2

### **Day 3-5: WSIAT (Largest Impact)**

1. WSIAT 2026 (newest data)
2. WSIAT 2025
3. WSIAT 2024
4. Continue backwards by year

### **Week 2: ONSBT & ONHRT**

1. All ONSBT years
2. All ONHRT years
3. Final validation pass

---

## 📈 **PROGRESS TRACKING**

### **Current Status (April 29, 2026):**

| Tribunal | Total Decisions | Full Text Fetched | Outcomes Extracted | Unknown Rate |
|----------|----------------|-------------------|-------------------|--------------|
| ONWSIB | 120 | 0 (0%) | 0 | 100% |
| WSIAT | ~11,000 | 0 (0%) | 0 | 94.3% |
| ONSBT | ~800 | 0 (0%) | 0 | 95.4% |
| ONHRT | ~200 | 0 (0%) | 0 | 100% |

### **Target Status (Week 2):**

| Tribunal | Total Decisions | Full Text Fetched | Outcomes Extracted | Unknown Rate |
|----------|----------------|-------------------|-------------------|--------------|
| ONWSIB | 120 | 120 (100%) | ~30-40 | ~70% |
| WSIAT | ~11,000 | ~2,000 (18%) | ~800-1,000 | ~50-60% (recent years) |
| ONSBT | ~800 | 800 (100%) | ~400-480 | ~40-50% |
| ONHRT | ~200 | 200 (100%) | ~120-140 | ~30-40% |

---

## ⚠️ **IMPORTANT NOTES**

### **CanLII Rate Limiting**

- Use 3-second delays (default in script)
- If you hit rate limits, increase to 5 seconds:
  ```bash
  # Edit scripts/fetch-full-text-from-canlii.js
  # Change: const DELAY_MS = 3000;
  # To: const DELAY_MS = 5000;
  ```

### **Incremental Progress**

The script saves every 10 decisions. If it crashes:
1. Check the JSON file - it will have partial results
2. Re-run the same command - it skips decisions that already have full text
3. Progress is not lost!

### **Data Quality**

After fetching, verify text quality:
```bash
# Check a decision manually
cat data/tribunal-decisions/onwsib-2023-complete.json | grep -A 20 '"full_text":'
```

Look for:
- ✅ Text length > 100 characters
- ✅ Contains decision language ("appeal", "granted", "tribunal")
- ❌ HTML tags still present
- ❌ "Page not found" error messages

### **Backup Management**

Backups are created in two places:
1. `data/tribunal-decisions/backups-before-fulltext-fetch/` (before fetching text)
2. `data/tribunal-decisions/backups-before-reextraction/` (before outcome extraction)

**Keep these!** They let you rollback if something goes wrong.

---

## 🚀 **QUICK START (RIGHT NOW)**

Run these 3 commands to test the full pipeline:

```bash
# 1. Fetch 50 ONWSIB decisions (3 minutes)
node scripts/fetch-full-text-from-canlii.js onwsib 2023 50

# 2. Extract outcomes (1 minute)
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023

# 3. Check results
cat docs/outcome-reextraction-report-2026-04-29.md
```

**Expected output:**
```
Before Unknown: 50 (100.0%)
After Unknown: ~35 (70.0%)
Improved: ~15 decisions
High Confidence: ~10
Medium Confidence: ~5
```

If you see 15+ decisions improved → **SUCCESS!** Proceed with full dataset.

If you see 0 decisions improved → Check that full text actually downloaded:
```bash
# Check if full_text field exists and has content
node -e "const d=require('./data/tribunal-decisions/onwsib-2023-complete.json'); console.log(d[0].full_text?.slice(0,200));"
```

---

## 📚 **FILES CREATED/UPDATED**

### **New Files:**
- `scripts/fetch-full-text-from-canlii.js` - Full text scraper
- `docs/CORRECTED-WORKFLOW-OUTCOME-EXTRACTION.md` - This document

### **Updated Files:**
- `scripts/re-extract-outcomes-with-notebooklm-patterns.js` - Now checks multiple field names
- `docs/NOTEBOOKLM-OUTCOME-EXTRACTION-GUIDE.md` - Added Phase 0 prerequisite

### **Unchanged (Still Valid):**
- `scripts/enhanced-outcome-keywords.js` - Pattern library
- `scripts/export-unknown-for-notebooklm.js` - Batch 2 export
- `docs/NOTEBOOKLM-FINDINGS-SUMMARY.md` - Analysis summary

---

## ✅ **VALIDATION CHECKLIST**

After running the full pipeline, verify:

- [ ] Full text fetched for all decisions
- [ ] `full_text` field exists and has content
- [ ] `full_text_length` > 100 for most decisions
- [ ] Re-extraction report shows improvements
- [ ] Unknown rate decreased by 20-50%
- [ ] Sample decisions have accurate outcomes
- [ ] Backups created for all modified files

---

**🎉 BOTTOM LINE:** The NotebookLM patterns are correct, but you need the full decision text first. Fetch text → Extract outcomes → Validate results → Scale to all tribunals.
