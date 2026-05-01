# Path A+B Combo Workflow
## FREE Classification + CanLII Scraper

**Goal:** Classify 11,430 WSIAT decisions without spending $742 on OpenAI API

**Current Progress:** 50/11,430 (0.4%) - 228 batches remaining

---

## 🎯 Path A: Manual Batch Classification (Immediate)

**Why:** Get classifications NOW using Claude (FREE via GitHub Copilot)  
**Time:** ~2-5 minutes per batch, can do multiple per session  
**Cost:** $0  
**Accuracy:** 60% low confidence (keywords only, no full text)

### Workflow:

1. **Prepare Next Batch:**
   ```bash
   node scripts/prepare-ai-batch.mjs
   ```
   Creates `data/comprehensive-extraction/ai-batches/batch-X-PENDING.json`

2. **Classify with Claude:**
   - Say: "Classify these WSIAT decisions in batch-X-PENDING.json"
   - Claude analyzes keywords/titles, fills in:
     - `outcome`: allowed/denied/partial/remitted/other/unclear
     - `confidence`: high/medium/low
     - `reasoning`: brief explanation

3. **Consolidate Results:**
   ```bash
   node scripts/consolidate-ai-batch.mjs
   ```
   Merges batch into `wsiat-classified.json` master file

4. **Repeat:** Go back to step 1 for next batch

### Tips:
- Can classify 5-10 batches per session (~30 min)
- Takes ~30 sessions to complete all 228 batches
- Run when you have spare time over several days/weeks
- Progress auto-saved after each batch

---

## 🚀 Path B: CanLII Scraper (Better Accuracy)

**Why:** Get full decision text for 70-80% high confidence classification  
**Time:** ~3 hours to scrape all 11,430 decisions (1 req/sec rate limit)  
**Cost:** $0 (CanLII API is free)  
**Benefit:** Can re-classify with much higher accuracy

### Workflow:

1. **Start Scraper:**
   ```bash
   node scripts/scrape-canlii-full-text.mjs
   ```
   - Fetches full text from CanLII URLs
   - Rate limited: 1 request/second (respectful usage)
   - Auto-saves progress every 100 decisions
   - Resumable if interrupted

2. **Output:**
   - `data/tribunal-decisions/full-text/YYYY/caseId.txt`
   - One file per decision

3. **Monitor Progress:**
   - Check `data/tribunal-decisions/full-text/scrape-progress.json`
   - Shows: scraped count, failed count, ETA

4. **After Scraping Complete:**
   - Re-classify decisions using full text (much more accurate)
   - Update visualizations with true success rates

---

## 🔄 Combo Strategy (Recommended)

**Best approach: Do BOTH in parallel!**

### Week 1-2: Get Initial Data
- **Evening sessions:** Classify 5-10 batches manually with Claude
  - 10 batches/session × 3 sessions = 30 batches = 1,500 decisions
  - Quick wins: Get some data immediately
  
- **Background:** Run CanLII scraper overnight
  - Let it run for 3 hours unattended
  - 11,430 decisions fully scraped

### Week 3-4: Continue + Re-classify
- **Manual:** Continue classifying remaining batches (198 left)
  - Do batches when you have time
  - No rush - progress saved

- **After scraper done:** Re-classify high-value decisions
  - Focus on "unclear" outcomes (currently 50%)
  - Use full text for better accuracy
  - 70-80% will upgrade to high confidence

### Result:
- ✅ 11,430 decisions classified (keyword-based, 60% low confidence)
- ✅ 11,430 full text files scraped (enable future high-accuracy)
- ✅ Can update statistics when ready
- ✅ Total cost: $0 (vs $742 OpenAI API)

---

## 📊 Current Status

| Metric | Value |
|--------|-------|
| Total Decisions | 11,430 |
| Classified (Batch 1) | 50 (0.4%) |
| Remaining Batches | 228 |
| Batch 2 Status | ✅ READY |
| Scraper Status | ✅ READY |
| Full Text Scraped | 0 (not started) |

### Batch 1 Results:
- Allowed: 6 (12%)
- Denied: 1 (2%)
- Partial: 7 (14%)
- Other: 11 (22%)
- Unclear: 25 (50%)

**Confidence:**
- High: 9 (18%)
- Medium: 11 (22%)
- Low: 30 (60%)

### Why 50% Unclear?
Keywords show topics, not outcomes. Full text needed for clarity.

---

## 🎯 Next Actions

### RIGHT NOW:
1. **Start Scraper (Background):**
   ```bash
   node scripts/scrape-canlii-full-text.mjs
   ```
   Let it run for 3 hours, walk away.

2. **Classify Batch 2 (Manual):**
   - Open: `data/comprehensive-extraction/ai-batches/batch-2-PENDING.json`
   - Say to Claude: "Classify these WSIAT decisions"
   - Run: `node scripts/consolidate-ai-batch.mjs`

3. **Repeat Batch 3-10** (if you have time today)

### THIS WEEK:
- Do 30 batches (1,500 decisions)
- Let scraper finish in background
- Check progress daily

### THIS MONTH:
- Complete all 228 batches over several sessions
- Use full text to re-classify unclear decisions
- Update visualizations with real success rates

---

## 📁 Files Reference

### Scripts:
- `scripts/prepare-ai-batch.mjs` - Create next batch (50 decisions)
- `scripts/consolidate-ai-batch.mjs` - Merge classified batch
- `scripts/scrape-canlii-full-text.mjs` - Fetch full text from CanLII

### Data:
- `data/comprehensive-extraction/ai-batches/batch-X-PENDING.json` - Next batch
- `data/comprehensive-extraction/ai-batches/batch-X-CLASSIFIED.json` - Your classifications
- `data/comprehensive-extraction/ai-batches/batch-X-MERGED.json` - Consolidated
- `data/comprehensive-extraction/wsiat-classified.json` - Master file
- `data/comprehensive-extraction/ai-progress.json` - Progress tracking
- `data/tribunal-decisions/full-text/YYYY/caseId.txt` - Scraped text

---

## 💡 Tips

1. **Batch Size:** 50 decisions is manageable. Don't increase it.

2. **Time Management:** Do batches when waiting for builds, deployments, or other tasks.

3. **Scraper:** Run overnight or during lunch. No need to watch it.

4. **Quality:** It's OK to mark "unclear" - full text will help later.

5. **Progress:** Every batch helps! Don't feel pressure to finish all 228 immediately.

6. **Budget:** This entire system costs $0. Take your time.

---

## ✅ Validation

After classifying all decisions, compare stats:
- Current (keyword-based): 12.0% detected success rate
- After full classification: True success rate (likely 60-70% per independent research)
- Visualization updates: Replace "Estimated" with "Classified"

Success metrics:
- 11,430 decisions classified ✓
- Full text archived for future analysis ✓
- $0 spent (vs $742 OpenAI) ✓
- Research credibility maintained ✓
