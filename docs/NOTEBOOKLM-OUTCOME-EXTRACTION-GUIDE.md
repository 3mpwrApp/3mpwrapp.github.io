# NotebookLM Findings: Reducing Unknown Outcomes from ~95% to 30-70%

**Date:** April 28, 2026  
**Source:** NotebookLM analysis of 100+ Ontario tribunal decisions (1986-2025)  
**Goal:** Reduce "Unknown" outcome rates across all tribunals

---

## 🎯 THE BREAKTHROUGH DISCOVERY

### **Why ONWSIB Had 95.7% Unknown Outcomes:**

Your keyword extraction was looking for **tribunal language**:
```
✓ "appeal allowed"
✓ "appeal dismissed"  
✓ "granted"
✓ "denied"
```

But WSIB internal reviews use **administrative language**:
```
✓ "reconsideration results in..."
✓ "upon review, the Board finds..."
✓ "original decision is amended..."
✓ "Board reverses its earlier determination..."
```

**This is why 95.7% were Unknown!** You were searching for legal terms in administrative documents.

---

## 📊 EXPECTED IMPROVEMENTS BY TRIBUNAL

| Tribunal | Before | Target After | Key Patterns Added |
|----------|--------|--------------|-------------------|
| **ONWSIB** | 95.7% Unknown | ~70% Unknown | Administrative review language (30+ phrases) |
| **WSIAT** | 94.3% Unknown | 50-60% Unknown | "Directed", "Reversing", "Deemed" patterns |
| **ONSBT** | 95.4% Unknown | 40-50% Unknown | "Eligible for ODSP", consent orders |
| **ONHRT** | N/A | 30-40% Unknown | "Discrimination found", prima facie |

---

## 🚀 HOW TO RUN RE-EXTRACTION

### **⚠️ CRITICAL PREREQUISITE: Fetch Full Text First**

**IMPORTANT:** Your JSON files only have metadata (case numbers, keywords), but **NO full decision text**. The re-extraction script needs text to analyze!

Before running re-extraction, fetch full text from CanLII:

```bash
# Fetch full text for ONWSIB 2023 (start with 50 decisions for testing)
node scripts/fetch-full-text-from-canlii.js onwsib 2023 50
```

**What this does:**
1. Reads `onwsib-2023-complete.json`
2. Visits each CanLII URL (e.g., `https://canlii.ca/t/k3zj2`)
3. Scrapes full decision text from the page
4. Adds `full_text` field to each decision
5. Saves progress every 10 decisions
6. Creates backup before starting

**Time estimate:** ~3 minutes for 50 decisions (3-second delay between requests)

**After fetching full text, THEN run re-extraction:**

### **Step 1: Test on One File First**

```bash
# Now process ONWSIB 2023 with full text available
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023
```

**What happens:**
1. Creates backup: `BACKUP-[timestamp]-onwsib-2023-complete.json`
2. Re-scans each decision with new patterns
3. Updates `outcome` field if High/Medium confidence match found
4. Adds `outcomeConfidence` and `outcomeMatchedPhrase` fields
5. Generates report: `docs/outcome-reextraction-report-[date].md`

### **Step 2: Review Results**

Check the report:
```bash
cat docs/outcome-reextraction-report-2026-04-28.md
```

Look for:
- **Before Unknown:** Original rate (should be ~95%)
- **After Unknown:** New rate (target: 30-70%)
- **Improved:** Number of decisions now classified
- **High/Medium Confidence:** Distribution of match quality

### **Step 3: Process All Files**

If you're happy with the test results:

```bash
# Process all tribunals, all years
node scripts/re-extract-outcomes-with-notebooklm-patterns.js all all

# OR process specific tribunal
node scripts/re-extract-outcomes-with-notebooklm-patterns.js wsiat all
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onsbt all
```

---

## 🔍 NEW PATTERNS ADDED (BY TRIBUNAL)

### **ONWSIB Administrative Language** (CRITICAL)

**Worker Wins:**
- "reconsideration results in approval"
- "reconsideration results in entitlement"
- "upon review, the board finds entitlement"
- "original decision is amended to allow"
- "original decision is overturned"
- "board reverses its earlier determination"
- "board admits error"
- "decision varied in favour"
- "benefits reinstated"

**Worker Loses:**
- "reconsideration results in denial"
- "reconsideration upholds original"
- "upon review, the board maintains"
- "original decision is maintained"
- "original decision is confirmed"
- "board affirms its earlier determination"
- "decision stands"
- "no change to original decision"

### **WSIAT Legal Language**

**Worker Wins:**
- "granted entitlement"
- "directed the board to"
- "allowed the worker's appeal"
- "reconsideration granted"

**Worker Loses:**
- "denied entitlement"
- "leave denied"
- "deemed not to have"
- "deemed ineligible"

**Procedural:**
- "remitted" / "sent back to the board"
- "decision varied"
- "endorsed withdrawal"
- "adjourned pending"

### **ONSBT Eligibility Language**

**Worker Wins:**
- "eligible for odsp"
- "meets the disability criteria"
- "substantial impairment found"
- "approved for benefits"

**Worker Loses:**
- "not eligible for odsp"
- "does not meet disability criteria"
- "substantial impairment not established"

### **ONHRT Discrimination Language**

**Worker Wins:**
- "discrimination found"
- "prima facie case established"
- "damages awarded"
- "remedy ordered"

**Worker Loses:**
- "no discrimination found"
- "failed to establish prima facie case"
- "no remedy warranted"

---

## 📋 WHAT HAPPENS TO YOUR DATA

### **Before Re-extraction:**

```json
{
  "caseNumber": "Decision No. 1161/25",
  "summary": "Upon review, the Board finds entitlement for COVID-19 under the Communicable Illnesses policy.",
  "outcome": "Unknown",
  "keywords": {
    "issues": ["COVID-19", "initial entitlement"]
  }
}
```

### **After Re-extraction:**

```json
{
  "caseNumber": "Decision No. 1161/25",
  "summary": "Upon review, the Board finds entitlement for COVID-19 under the Communicable Illnesses policy.",
  "outcome": "Appeal Allowed",
  "outcomeConfidence": "High",
  "outcomeMatchedPhrase": "upon review, the board finds entitlement",
  "keywords": {
    "issues": ["COVID-19", "initial entitlement"]
  }
}
```

---

## ✅ VALIDATION CHECKLIST

After running re-extraction:

1. **Check Backups:**
   ```bash
   ls -lh data/tribunal-decisions/backups-before-reextraction/
   ```
   - Verify original files are backed up before any changes

2. **Review Sample Decisions:**
   - Open JSON file
   - Find decisions with `outcomeConfidence: "High"`
   - Read `outcomeMatchedPhrase` — does it make sense?
   - Check `summary` — does outcome match the text?

3. **Compare Before/After:**
   - Load original backup
   - Compare outcome distribution
   - Calculate reduction in "Unknown" rate

4. **Check Edge Cases:**
   - Look for `outcomeConfidence: "Medium"`
   - Read full summary to confirm outcome is correct
   - If wrong, add to exception list for manual review

---

## 🎯 NEXT STEPS AFTER RE-EXTRACTION

### **For Remaining "Unknown" Outcomes:**

1. **Export Sample for NotebookLM Batch 2:**
   ```bash
   # Extract 50 random Unknown decisions
   node scripts/export-unknown-for-notebooklm.js wsiat 50
   ```

2. **Manual Pattern Review:**
   - Read decisions still marked "Unknown"
   - Look for common phrases not in keyword list
   - Add to `enhanced-outcome-keywords.js`
   - Re-run extraction

3. **Bulk Data Acquisition:**
   - **WSIAT:** Contact data@wsiat.ca for Open Data CSV
   - **ONSBT:** Request bulk metadata from tribunals
   - **ONHRT:** Extract from CanLII using proximity operators

4. **CanLII Text Extraction:**
   ```
   # Advanced Boolean search for full text
   COVID-19 /p entitlement /s granted
   ```
   - `/p` = same paragraph
   - `/s` = same sentence
   - Use for high-precision outcome extraction

---

## 🛠️ TROUBLESHOOTING

### **"No enhanced keywords for tribunal: bcwcat"**

BC WCAT not included in NotebookLM analysis (Ontario-focused). To add BC WCAT patterns:

1. Export 50 BC WCAT decisions with known outcomes
2. Upload to NotebookLM
3. Ask: "What phrases indicate worker wins vs. losses?"
4. Add patterns to `enhanced-outcome-keywords.js`

### **"Improved: 0 decisions"**

Possible causes:
- **Already processed:** File might have been updated before
- **No summaries:** Decisions have no `summary` or `disposition` text
- **Wrong tribunal code:** Script couldn't determine tribunal from filename

Check:
```bash
head -n 50 data/tribunal-decisions/onwsib-2023-complete.json
```
- Look for `summary` field
- Verify filename matches pattern (e.g., `onwsib-YYYY-complete.json`)

### **"Medium confidence but outcome looks wrong"**

This is expected for:
- **"Reversing" language:** Context-dependent (who appealed?)
- **"Deemed" language:** Can be positive or negative
- **Partial outcomes:** Multiple issues in one decision

Solution:
1. Mark decision for manual review
2. Check full text on CanLII
3. Update outcome manually if necessary
4. Add to training set for future improvements

---

## 📊 SUCCESS METRICS

### **Target Reduction Rates:**

| Metric | Target |
|--------|--------|
| ONWSIB Unknown Rate | 95.7% → 70% (25.7% improvement) |
| WSIAT Unknown Rate | 94.3% → 50-60% (34-44% improvement) |
| ONSBT Unknown Rate | 95.4% → 40-50% (45-55% improvement) |
| ONHRT Unknown Rate | N/A → 30-40% (60-70% classification) |

### **Quality Checks:**

- **High Confidence Ratio:** >60% of improved outcomes
- **False Positive Rate:** <5% (check sample of 50)
- **Coverage Rate:** >25% reduction in Unknown outcomes

---

## 🎓 KEY LEARNINGS FROM NOTEBOOKLM

1. **Administrative vs. Legal Language:**
   - Internal reviews (WSIB) use administrative phrasing
   - Tribunals (WSIAT) use legal terminology
   - Must match keywords to document type

2. **Passive Voice Patterns:**
   - "Deemed not to have" (worker loses)
   - "Considered to be" (context-dependent)
   - Requires sentence-level analysis

3. **Procedural Outcomes Are Distinct:**
   - "Remitted" ≠ win or loss (sent back to Board)
   - "Varied" = changed decision (not replaced)
   - "Withdrawn" = voluntary abandonment

4. **Confidence Levels Matter:**
   - **High:** Explicit outcome statement
   - **Medium:** Implied from reasoning
   - **Low:** Ambiguous or requires full context

5. **Database Architecture Enables Validation:**
   - WSIAT numbering (Root/Year/Status) tracks procedural history
   - Cross-reference Reconsiderations (R suffix) with original decisions
   - Validate outcomes match across related cases

---

## 📚 REFERENCE FILES

- **Enhanced Keywords:** `scripts/enhanced-outcome-keywords.js`
- **Re-extraction Script:** `scripts/re-extract-outcomes-with-notebooklm-patterns.js`
- **Original Analysis:** Conversation summary (April 28, 2026)
- **Backups:** `data/tribunal-decisions/backups-before-reextraction/`
- **Reports:** `docs/outcome-reextraction-report-*.md`

---

## 💡 QUICK START

```bash
# 1. Test on one file
node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023

# 2. Check results
cat docs/outcome-reextraction-report-2026-04-28.md

# 3. If good, process all
node scripts/re-extract-outcomes-with-notebooklm-patterns.js all all

# 4. Validate changes
git diff data/tribunal-decisions/onwsib-2023-complete.json | head -n 100
```

---

**🎉 EXPECTED RESULT:** Thousands of decisions will move from "Unknown" to classified outcomes with High/Medium confidence, dramatically improving your research capabilities!
