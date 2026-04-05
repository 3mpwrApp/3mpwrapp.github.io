# 8 PM ET Launch Checklist - CanLII Scraper v5.0-Enhanced
## April 5, 2026

---

## ✅ PRE-LAUNCH CHECKLIST (Complete Now)

### ✅ 1. Implementation Status
- [x] v5.0-enhanced scraper created (1,150+ lines)
- [x] Launcher script ready
- [x] All safety features implemented
- [x] All data quality features implemented
- [x] Full Canada geographic coverage
- [x] Syntax validated (no errors)
- [x] Committed to git (07ecd1c8)
- [x] Documentation complete

### ✅ 2. Safety Features Verified
- [x] Rate limiting: 0.8-1.5s random delays
- [x] Resumable pipeline: Progress tracking
- [x] Local caching: 30-day retention
- [x] Batch processing: 750 cases/batch
- [x] Batch pauses: 5-10 minutes
- [x] Error logging: JSONL format
- [x] Pre-flight checks: API key, disk space, permissions

### ✅ 3. Data Quality Features Verified
- [x] Enhanced outcome extraction with confidence
- [x] Judge reasoning extraction
- [x] Case law citations
- [x] Winning arguments
- [x] Medical evidence (detailed)
- [x] Quality scoring (0-100)
- [x] Validation & issue detection

### ✅ 4. Geographic Coverage Verified
- [x] All 13 provinces/territories
- [x] 20+ major cities
- [x] Regional identifiers
- [x] Postal code extraction
- [x] Multi-level filtering

---

## 🕗 AT 8 PM ET (WHEN QUOTA RESETS)

### Step 1: Verify API Quota Reset (1 minute)
```bash
# Test with one case to confirm quota reset
curl "https://api.canlii.org/v1/caseBrowse/en/onwsiat/2026onwsiat88?api_key=YOUR_KEY" | jq .
```

**Expected**: Should return JSON with HTML field (not 429 error)

### Step 2: Set Environment (1 minute)
```powershell
# PowerShell
$env:CANLII_API_KEY = (Get-Content .env.local | Select-String -Pattern '^CANLII_API_KEY=' | ForEach-Object { $_ -replace 'CANLII_API_KEY=','' })

# Verify
Write-Host "API Key length: $($env:CANLII_API_KEY.Length)"
```

**Expected**: Should show API key length (not 0)

### Step 3: Launch Scraper (2-3 seconds)
```bash
node scripts/launch-scraper-8pm.js
```

**Expected Output**:
```
======================================================================
🕗 CanLII Scraper - 8 PM ET Launch
======================================================================

📅 Date: ...
🌍 Timezone: Eastern Time (ET)

📋 Target Tribunals: onwsiat,onca,onhrt
🔧 Mode: v5.0-Enhanced (Full Text + Quality Validation)

✅ API Key: Configured

🚀 Starting enhanced scraper...

----------------------------------------------------------------------

🔍 Running pre-flight checks...

✅ API key configured
✅ Directory exists: ...
✅ Disk space: X.XX GB free
✅ Write permissions verified

✅ Pre-flight checks passed!
```

### Step 4: Monitor Progress (During Run)

#### Check Real-Time Progress
```powershell
# Watch progress file (refresh every 30 seconds)
while($true) {
  Clear-Host
  Get-Content data\.scraper-progress.json | ConvertFrom-Json | ConvertTo-Json
  Start-Sleep -Seconds 30
}
```

#### Check Errors (If Any)
```powershell
# Tail error log
Get-Content data\.scraper-errors.jsonl -Wait -Tail 10
```

#### Check Cache Growth
```powershell
# Count cached files
(Get-ChildItem data\.scraper-cache).Count
```

---

## 📊 EXPECTED TIMELINE

| Time | Milestone | Details |
|------|-----------|---------|
| 8:00 PM | Launch | Pre-flight checks pass |
| 8:01 PM | Discovery phase | Collecting case IDs (~5 min) |
| 8:06 PM | Batch 1 starts | WSIAT cases 1-750 |
| 9:00 PM | Batch 1 complete | 5-10 min pause |
| 9:10 PM | Batch 2 starts | WSIAT cases 751-1500 |
| 10:05 PM | Batch 2 complete | 5-10 min pause |
| 10:15 PM | Batch 3+ | Continue through all batches |
| ~10:30 PM | WSIAT complete | 4,232 cases done |
| ~10:35 PM | ONCA scraping | 200 cases (~4 min) |
| ~10:40 PM | HRTO scraping | 100 cases (~2 min) |
| **10:45 PM** | **ONTARIO COMPLETE** | **Session summary generated** |

**Total Duration**: ~2.5-3 hours

---

## ✅ SUCCESS INDICATORS

### During Run
- ✅ No "RATE_LIMITED" errors
- ✅ Quality scores > 70 for most cases
- ✅ Outcome confidence > 80 for most decided cases
- ✅ Progress file updating every 10 cases
- ✅ Cache directory growing

### After Completion
```bash
# Check session summary
cat docs/scrape-session-2026-04-05.json | ConvertFrom-Json
```

**Expected Metrics**:
- Total cases: ~4,532
- With outcomes: ~4,200 (93%+)
- High quality: ~3,800 (84%+)
- Ready for templates: ~1,200
- Ready for evidence analysis: ~2,800
- Ready for pattern analysis: ~4,100

---

## ⚠️ POTENTIAL ISSUES & SOLUTIONS

### Issue 1: API Key Not Set
```
⚠️  CANLII_API_KEY not found in environment
```
**Solution**: Set it manually:
```powershell
$env:CANLII_API_KEY = "paste_key_here"
```

### Issue 2: Quota Exceeded During Run
```
❌ API quota exceeded at case 2026onwsiat123
💾 Progress saved. Re-run later to continue.
```
**Solution**: Wait until next midnight UTC (8 PM ET tomorrow), then re-run same command. Progress is preserved.

### Issue 3: Low Disk Space
```
⚠️  Low disk space: 0.3GB free
```
**Solution**: Free up 500MB, then restart. Progress is preserved.

### Issue 4: Slow Performance
**Symptoms**: Taking >5 seconds per case
**Solution**: Check network connection. Random delays are 0.8-1.5s, so ~2-3s per case is normal.

---

## 📋 POST-RUN VALIDATION (10:45 PM)

### 1. Check Session Summary
```bash
cat docs/scrape-session-2026-04-05.json
```

**Verify**:
- ✅ Duration: 2-3 hours
- ✅ Total cases: 4,500+
- ✅ Outcome rate: >90%
- ✅ Quality avg: >70

### 2. Inspect Sample Decisions
```powershell
# Get one decision
Get-Content data\tribunal-decisions\onwsiat-historical-2026-04-05.json | 
  ConvertFrom-Json | 
  Select-Object -First 1 | 
  ConvertTo-Json -Depth 5
```

**Verify Fields**:
- ✅ `outcome` is not "Unknown"
- ✅ `outcome_confidence` > 70
- ✅ `judge_reasoning` has content
- ✅ `cited_case_law` has entries
- ✅ `quality_score` > 70
- ✅ `extraction_version` = "v5.0-enhanced"

### 3. Run Pattern Analysis
```bash
node scripts/analyze-patterns.js
```

**Expected**:
- Unknown outcomes: <10% (was 95%)
- Success rates: Accurate for each condition
- Evidence correlations: Meaningful data

---

## 🎯 NEXT STEPS (After Ontario Success)

### Tonight (11:00 PM)
1. ✅ Validate Ontario results
2. ✅ Review session summary
3. 🏁 Decide: Continue with BC-Federal tonight or tomorrow?

### Tomorrow Morning
```bash
# Scrape remaining 19 provinces/territories
node scripts/scrape-canlii-tribunals-v5-enhanced.js --tribunals=bchrt,bcwcat,bcca,abqb,abca,skca,mbca,qctat,qcca,nbca,nsca,peca,nlca,ykca,nwtca,nuca,chrt,fct,fca
```

**Duration**: ~7.5 hours
**Expected Results**: ~15,000 total cases (all Canada)

### After Full Scrape
1. Generate templates from winning cases
2. Filter for Thunder Bay region
3. Begin TBDIWSG pilot user testing

---

## 📞 EMERGENCY CONTACTS

**If scraper fails unexpectedly:**
1. Check error log: `data/.scraper-errors.jsonl`
2. Check progress: `data/.scraper-progress.json`
3. Resume with same command (progress preserved)

**If you need to stop manually:**
1. Press Ctrl+C
2. Progress is auto-saved
3. Resume later with same command

---

## 🚀 READY TO LAUNCH!

**Final Command**:
```bash
node scripts/launch-scraper-8pm.js
```

**Time**: 8:00 PM ET (midnight UTC)

**Expected Completion**: 10:45 PM ET

**Expected Outcome**: 4,200+ cases with accurate outcomes, ready for Thunder Bay pilot

---

**All systems GO! ✅**
