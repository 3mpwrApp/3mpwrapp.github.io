# CanLII Scraper v5.0-Enhanced - Ready for 8 PM ET

## What's New in v5.0

### Safety Features ✅
- **Rate limiting**: Random delays 0.8-1.5s (safe zone)
- **Resumable pipeline**: Progress tracking + automatic recovery
- **Local caching**: Avoids re-fetching (30-day cache)
- **Batch processing**: 750 cases/batch, 5-10 min pauses between batches
- **Error logging**: Comprehensive JSONL error log
- **Pre-flight checks**: Validates environment before starting

### Data Quality ✅
- **Enhanced outcome extraction**: 90%+ confidence scoring
- **Judge reasoning**: Extracts decision rationale (for templates)
- **Case law citations**: Captures precedents
- **Winning arguments**: Identifies successful appeal strategies
- **Medical evidence**: Tracks IME, FCE, specialists, tests
- **Quality scoring**: 0-100 scale, flags low-quality extractions
- **Validation**: Detects extraction failures

### Geographic Coverage ✅
- **Full Canada**: All 13 provinces/territories
- **Multi-level**: Municipal, regional, provincial
- **Cities**: 20+ major cities (Toronto, Vancouver, Thunder Bay, etc.)
- **Postal codes**: Automatic extraction (A1A 1A1 format)
- **Region detection**: Northern Ontario, GTA, Lower Mainland, etc.

### Additional Features ✅
- **Representation tracking**: Lawyer vs self-represented success rates
- **Recency categories**: Recent, Medium, Older, Historical
- **Duplicate detection**: Fingerprint-based deduplication
- **Session summary**: Flywheel readiness metrics

---

## Usage

### Quick Start (8 PM ET Tonight)

```bash
# 1. Set API key (if not already set)
$env:CANLII_API_KEY = "your_key_here"

# 2. Launch scraper (Ontario first to validate fix)
node scripts/launch-scraper-8pm.js

# OR run v5 directly
node scripts/scrape-canlii-tribunals-v5-enhanced.js --tribunals=onwsiat,onca,onhrt
```

### Advanced Usage

```bash
# Scrape specific tribunals
node scripts/scrape-canlii-tribunals-v5-enhanced.js --tribunals=bchrt,bcwcat,bcca

# Resume from progress (if quota hit)
node scripts/scrape-canlii-tribunals-v5-enhanced.js --tribunals=onwsiat

# Scrape all Canada
node scripts/scrape-canlii-tribunals-v5-enhanced.js
```

---

## Time Estimates

### Ontario Re-scrape (Tonight)
- **WSIAT**: 4,232 cases × 1.15s = ~1.35 hours + pauses = **~2.2 hours**
- **ONCA**: 200 cases × 1.15s = ~4 min
- **HRTO**: 100 cases × 1.15s = ~2 min
- **Total**: ~2.5 hours

### Full Canada (Tomorrow)
- **Estimated**: 15,000 cases
- **Base time**: ~5 hours
- **With pauses**: ~7.5 hours
- **Total**: Complete by 8 AM if started at midnight

---

## Output Files

### Decision Data
```
data/tribunal-decisions/
  onwsiat-historical-2026-04-05.json
  onca-historical-2026-04-05.json
  onhrt-historical-2026-04-05.json
  ...
```

### Progress Tracking
```
data/.scraper-progress.json
  {
    "onwsiat": {
      "completed": ["2026onwsiat88", ...],
      "failed": [],
      "lastBatch": 3,
      "lastUpdate": "2026-04-05T20:15:00Z"
    }
  }
```

### Cache
```
data/.scraper-cache/
  onwsiat_2026onwsiat88.json
  onwsiat_2026onwsiat87.json
  ...
```

### Error Log
```
data/.scraper-errors.jsonl
  {"timestamp":"...","case_id":"...","error_type":"FETCH_ERROR",...}
  {"timestamp":"...","case_id":"...","error_type":"RATE_LIMITED",...}
```

### Session Summary
```
docs/scrape-session-2026-04-05.json
  {
    "session": { "duration_hours": "2.3" },
    "statistics": {
      "total_cases": 4532,
      "with_outcomes": 4200,
      "high_quality": 3800
    },
    "flywheel_readiness": {
      "ready_for_templates": 1200,
      "ready_for_evidence_analysis": 2800,
      "ready_for_pattern_analysis": 4100
    }
  }
```

---

## Decision Data Structure

```json
{
  "case_id": "2026onwsiat88",
  "title": "Decision No. 1067/25",
  "date": "2026-01-22",
  "tribunal": "Workplace Safety & Insurance Appeals Tribunal (Ontario)",
  "url": "https://canlii.ca/t/kk30q",
  
  "province_territory": "ON",
  "cities": ["Thunder Bay"],
  "regions": ["Northern Ontario"],
  "postal_codes": ["P7B 1A1"],
  
  "condition": "chronic pain, back injury",
  "outcome": "Allowed",
  "outcome_confidence": 90,
  
  "evidence_cited": ["IME", "Medical records", "FCE"],
  "medical_evidence": {
    "reports": ["ime", "specialist report"],
    "tests": ["mri", "x-ray"],
    "specialists": ["orthopedic surgeon", "physiotherapist"]
  },
  
  "judge_reasoning": [
    "The panel finds that the medical evidence supports...",
    "Considering the worker's credible testimony..."
  ],
  
  "cited_case_law": ["2024 ONWSIAT 456", "Smith v. Jones"],
  
  "winning_arguments": [
    "The evidence demonstrates consistent symptoms...",
    "Medical records corroborate the worker's account..."
  ],
  
  "key_factors": ["Credible testimony", "Consistent evidence"],
  
  "representation_info": {
    "representation": "Legal Counsel",
    "has_legal_help": true
  },
  
  "recency_category": "Recent (Past Year)",
  
  "quality_score": 95,
  "validation_issues": [],
  
  "extraction_version": "v5.0-enhanced",
  "extraction_timestamp": "2026-04-05T20:15:30Z"
}
```

---

## Quality Metrics

### Quality Score Breakdown (0-100)
- **30 points**: Outcome extracted (not Unknown)
- **20 points**: High confidence (≥70%)
- **15 points**: Judge reasoning present
- **10 points**: Case law citations found
- **15 points**: Winning arguments extracted
- **10 points**: Evidence cited

### Quality Categories
- **Excellent (90-100)**: Ready for all 3 flywheels
- **Good (70-89)**: Ready for pattern analysis
- **Fair (50-69)**: Needs manual review
- **Poor (<50)**: Extraction likely failed

---

## Flywheel Readiness

### Flywheel 1: Templates (Winning Cases)
**Requirements:**
- Outcome = "Allowed"
- Judge reasoning present
- Winning arguments extracted
- Quality score ≥ 70

### Flywheel 2: Evidence Analysis
**Requirements:**
- Medical evidence extracted (reports, tests, specialists)
- Quality score ≥ 50

### Flywheel 3: Pattern Analysis
**Requirements:**
- Outcome ≠ "Unknown"
- Condition identified
- Quality score ≥ 50

---

## Monitoring During Run

### Check Progress
```bash
# View progress file
cat data/.scraper-progress.json | ConvertFrom-Json | ConvertTo-Json

# Count completed cases
(Get-Content data/.scraper-progress.json | ConvertFrom-Json).onwsiat.completed.Count
```

### Check Errors (Real-time)
```bash
# Tail error log
Get-Content data/.scraper-errors.jsonl -Wait -Tail 10
```

### Check Cache Size
```bash
# Count cached responses
(Get-ChildItem data/.scraper-cache).Count
```

---

## Troubleshooting

### API Quota Exceeded
```
❌ API quota exceeded at case 2026onwsiat123
💾 Progress saved. Re-run later to continue.
```
**Solution**: Wait until midnight UTC (8 PM ET), then re-run same command. Progress is preserved.

### Low Disk Space
```
⚠️  Low disk space: 0.3GB free
```
**Solution**: Free up disk space. Scraper needs ~500MB for full Canada.

### No API Key
```
❌ CANLII_API_KEY not set
```
**Solution**: 
```bash
# PowerShell
$env:CANLII_API_KEY = "your_key_here"

# Or add to .env.local file
echo "CANLII_API_KEY=your_key_here" >> .env.local
```

---

## Next Steps After Scraping

### 1. Validate Results
```bash
# Check session summary
cat docs/scrape-session-2026-04-05.json

# Check one decision file
cat data/tribunal-decisions/onwsiat-historical-2026-04-05.json | ConvertFrom-Json | Select-Object -First 1
```

### 2. Run Pattern Analysis
```bash
node scripts/analyze-patterns.js
```

### 3. Generate Templates
```bash
# Filter for Thunder Bay winning cases
node scripts/generate-templates-from-wins.js --city="Thunder Bay" --min-quality=70
```

### 4. Start BC-Federal Scraping
```bash
# After Ontario validation, scrape rest of Canada
node scripts/scrape-canlii-tribunals-v5-enhanced.js --tribunals=bchrt,bcwcat,bcca,abqb,abca,skca,mbca,qctat,qcca,nbca,nsca,peca,nlca,ykca,nwtca,nuca,chrt,fct,fca
```

---

## Features Comparison

| Feature | v3.0 (Old) | v4.0 (Fixed) | v5.0 (Enhanced) |
|---------|------------|--------------|-----------------|
| HTML extraction | ❌ Metadata only | ✅ Full text | ✅ Full text |
| Rate limiting | Fixed 3s | Fixed 3s | Random 0.8-1.5s |
| Resumable | ❌ No | ❌ No | ✅ Yes |
| Caching | ❌ No | ❌ No | ✅ 30-day cache |
| Batch pauses | ❌ No | ❌ No | ✅ 5-10 min |
| Outcome extraction | Basic | Basic | Enhanced + confidence |
| Judge reasoning | ❌ No | ❌ No | ✅ Yes |
| Case law | ❌ No | ❌ No | ✅ Yes |
| Winning arguments | ❌ No | ❌ No | ✅ Yes |
| Medical evidence | Basic | Basic | Detailed |
| Geographic data | ❌ No | ❌ No | ✅ Full Canada |
| Quality scoring | ❌ No | ❌ No | ✅ 0-100 scale |
| Error logging | Console only | Console only | JSONL file |
| Session summary | ❌ No | ❌ No | ✅ Full metrics |

---

## Ready for 8 PM ET! 🚀

**Command to run:**
```bash
node scripts/launch-scraper-8pm.js
```

**Expected duration:** ~2.5 hours for Ontario

**Expected outcome:** 4,200+ decisions with 90%+ outcomes extracted

**Next milestone:** Full Canada coverage by 8 AM tomorrow
