# Ontario Tribunal Data Improvement - Complete Workflow

## Overview

This directory contains the complete multi-phase workflow for improving Ontario tribunal outcome data quality from 14.2% to 70-80% known outcomes.

## 📊 Current Status

- **Total Cases:** 48,298
- **Known Outcomes:** 16,866 (34.9%) ← After Phase 1
- **Unknown Outcomes:** 31,432 (65.1%)
- **Target:** 70-80% known outcomes

## 🎯 Strategy: 4-Phase Approach

### ✅ Phase 1: Pattern-Based ML Classification (COMPLETE)
- **Script:** `scripts/analysis/ml-outcome-classifier.js`
- **Result:** Classified 9,995 cases (14.2% → 34.9%)
- **API Calls:** 0
- **Runtime:** ~3 minutes

**Run:**
```bash
node scripts/analysis/ml-outcome-classifier.js
```

### 🔄 Phase 2: Targeted Full Text Extraction (READY)
- **Scripts:** 
  - `scripts/extraction/extract-full-text-batch.js` (single tribunal)
  - `scripts/extraction/run-extraction-schedule.js` (5-day schedule)
  - `scripts/extraction/monitor-extraction-progress.js` (progress monitor)
- **Target:** 1,150 high-value cases
- **API Calls:** 1,150 (over 5 days)
- **Expected Improvement:** +920 cases (~60% total known)

**Setup:**
```bash
# Set API key
$env:CANLII_API_KEY="your-canlii-api-key-here"

# Check extraction queues
dir data\tribunal-decisions\extraction-queues\

# Monitor progress
node scripts/extraction/monitor-extraction-progress.js
```

**Run 5-Day Schedule:**
```bash
# Day 1: ONSBT (WSIAT) - 500 cases, ~2 hours
node scripts/extraction/run-extraction-schedule.js 1

# Day 2: ONWSIB - 200 cases, ~50 minutes
node scripts/extraction/run-extraction-schedule.js 2

# Day 3: ONHRT - 200 cases, ~50 minutes
node scripts/extraction/run-extraction-schedule.js 3

# Day 4: ONLRB - 150 cases, ~38 minutes
node scripts/extraction/run-extraction-schedule.js 4

# Day 5: ONCA - 100 cases, ~25 minutes
node scripts/extraction/run-extraction-schedule.js 5
```

**Manual Extraction (if needed):**
```bash
# Extract specific tribunal
node scripts/extraction/extract-full-text-batch.js onsbt 0

# Resume from specific index (if quota exceeded)
node scripts/extraction/extract-full-text-batch.js onsbt 250
```

### 🤖 Phase 3: TF-IDF ML Classifier (AFTER PHASE 2)
- **Script:** `scripts/ml/train-tfidf-classifier.js`
- **Training Set:** 16,726 known + 1,150 extracted = 17,876 cases
- **Target:** Remaining ~13,000 unknowns
- **Expected Improvement:** +6,600 cases (~70-80% total known)
- **Requires:** `npm install natural`

**Setup:**
```bash
# Install ML package
npm install natural
```

**Run:**
```bash
# Train and classify
node scripts/ml/train-tfidf-classifier.js
```

### 🎯 Phase 4: Final Review & Manual Classification
- Review low-confidence predictions
- Manual classification of edge cases
- Final data quality validation

## 📁 File Structure

```
scripts/
├── analysis/
│   ├── ml-outcome-classifier.js              # Phase 1: Pattern-based ML
│   ├── all-ontario-tribunals-inventory.js    # Data quality report
│   ├── ontario-data-improvement-strategy.js  # Strategy document
│   └── generate-extraction-queues-ontario.js # Queue generator
├── extraction/
│   ├── extract-full-text-batch.js            # Single tribunal extractor
│   ├── run-extraction-schedule.js            # 5-day schedule runner
│   └── monitor-extraction-progress.js        # Progress monitor
└── ml/
    └── train-tfidf-classifier.js             # Phase 3: TF-IDF classifier

data/tribunal-decisions/
├── extraction-queues/                        # Prioritized case lists
│   ├── onsbt-extraction-queue.json          # 500 cases
│   ├── onwsib-extraction-queue.json         # 200 cases
│   ├── onhrt-extraction-queue.json          # 200 cases
│   ├── onlrb-extraction-queue.json          # 150 cases
│   └── onca-extraction-queue.json           # 100 cases
├── .extraction-progress-*.json              # Extraction progress files
└── *-complete.json                          # Tribunal data files (updated in-place)
```

## 🚀 Quick Start

### 1. Check Current Status
```bash
node scripts/analysis/all-ontario-tribunals-inventory.js
```

### 2. Phase 1 (if not already done)
```bash
node scripts/analysis/ml-outcome-classifier.js
```

### 3. Phase 2 - Start Extraction
```bash
# Set API key first!
$env:CANLII_API_KEY="your-key-here"

# Run Day 1
node scripts/extraction/run-extraction-schedule.js 1

# Monitor progress
node scripts/extraction/monitor-extraction-progress.js
```

### 4. Phase 3 - After extraction complete
```bash
npm install natural
node scripts/ml/train-tfidf-classifier.js
```

### 5. Verify Final Results
```bash
node scripts/analysis/all-ontario-tribunals-inventory.js
```

## 📊 Expected Timeline

| Phase | Duration | API Calls | Improvement |
|-------|----------|-----------|-------------|
| Phase 1 (ML Pattern) | 3 minutes | 0 | +9,995 cases (14.2% → 34.9%) |
| Phase 2 (Extraction) | 5 days | 1,150 | +920 cases (34.9% → ~60%) |
| Phase 3 (TF-IDF ML) | 2 hours | 0 | +6,600 cases (~60% → 70-80%) |

**Total:** ~1 week to reach 70-80% known outcomes

## ⚠️ Important Notes

### API Quota Management
- CanLII free tier: ~1,000 requests/day
- Required delay: 15 seconds between requests
- Safe daily limit: 500 extractions/day
- Scripts include automatic quota handling

### Resume Capability
All scripts save progress and can be resumed:
- Progress files: `data/tribunal-decisions/.extraction-progress-*.json`
- Resume command shown if quota exceeded
- Check progress: `monitor-extraction-progress.js`

### Data Safety
- Original files backed up before Phase 1
- In-place updates to maintain file structure
- Progress saved every 50 cases
- Failed extractions logged in progress files

## 🎯 Prioritization Criteria

High-value cases selected based on:
- ✅ Worker injury/retaliation flags (+100 points)
- ✅ Injury-related keywords (+50 points)
- ✅ Substantive outcome hints (+40 points)
- ✅ Recent cases (2024+) (+30 points)
- ✅ Legislation cited (+25-50 points)
- ✅ Rich metadata (+5-15 points)

## 📈 Success Metrics

### Phase 1 Results
| Tribunal | Before | After | Improvement |
|----------|--------|-------|-------------|
| HRTO | 19.4% | 67.4% | **+48.0%** |
| ONCA | 41.9% | 82.1% | **+40.2%** |
| ONLRB | 27.1% | 53.0% | **+25.9%** |
| ONSBT | 0.4% | 6.7% | +6.3% |
| ONWSIB | 1.9% | 4.8% | +2.9% |

### Projected Final Results
- **Current:** 34.9% known (16,866 cases)
- **After Phase 2:** ~60% known (~23,000 cases)
- **After Phase 3:** 70-80% known (~28,000-31,000 cases)
- **Remaining 20-30%:** Administrative notices, incomplete filings

## 🔧 Troubleshooting

### Error: CANLII_API_KEY not set
```bash
$env:CANLII_API_KEY="your-key-here"
```

### Error: Quota exceeded
- Check progress: `monitor-extraction-progress.js`
- Resume from last index (shown in error message)
- Wait 24 hours for quota reset

### Error: natural package not found
```bash
npm install natural
```

### Check extraction progress
```bash
node scripts/extraction/monitor-extraction-progress.js
```

## 📚 References

- **Strategy Document:** `docs/ONTARIO_DATA_IMPROVEMENT_SUMMARY.md`
- **CanLII API Docs:** https://www.canlii.org/en/info/api.html
- **GitHub Repository:** https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io

## 🙏 Support

For issues or questions:
1. Check `docs/ONTARIO_DATA_IMPROVEMENT_SUMMARY.md`
2. Review progress with `monitor-extraction-progress.js`
3. Check GitHub Issues

---

**Last Updated:** 2026-05-14  
**Status:** Phase 1 Complete ✅ | Phase 2 Ready 🚀 | Phase 3 Pending ⏳
