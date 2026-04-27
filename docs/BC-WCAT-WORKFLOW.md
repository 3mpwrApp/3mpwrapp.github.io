# BC WCAT Data Collection & Analysis

## Overview

Scripts for collecting and analyzing British Columbia Workers' Compensation Appeal Tribunal (WCAT) decisions from CanLII (2020-2026).

## Workflow

### Phase 1: Data Collection

```bash
# Set your CanLII API key
export CANLII_API_KEY="your_key_here"

# Run the scraper (collects all years: 2020-2026)
node scripts/scrape-bcwcat-comprehensive-2020-2026.js
```

**Output:**
- `data/tribunal-decisions/bcwcat-2020-complete.json`
- `data/tribunal-decisions/bcwcat-2021-complete.json`
- ... through 2026
- `data/tribunal-decisions/bcwcat-scraping-summary.json`

**Expected Volume:** ~2,500 cases total (~400-600 per year)

**Rate Limiting:** 15 seconds between API calls (avoid quota issues)

### Phase 2: Outcome Classification

```bash
# Classify outcomes into 3 tiers
node scripts/recover-bcwcat-outcomes.js
```

**Output:**
- `data/tribunal-decisions/bcwcat-YYYY-classified.json` (per year)
- `data/tribunal-decisions/bcwcat-outcomes-tier-a-high-precision.json`
- `data/tribunal-decisions/bcwcat-outcomes-tier-b-medium-confidence.json`
- `data/tribunal-decisions/bcwcat-outcomes-tier-c-manual-review-queue.json`
- `data/tribunal-decisions/bcwcat-outcomes-3-tier-summary.json`

**Classification Tiers:**
- **Tier A**: High confidence (explicit outcome statements like "appeal is allowed")
- **Tier B**: Medium confidence (keyword inference, context clues)
- **Tier C**: Manual review needed (insufficient data)

### Phase 3: Analysis

```bash
# Generate comprehensive analysis
node scripts/analyze-bcwcat-comprehensive.js
```

**Output:**
- `data/tribunal-decisions/bcwcat-comprehensive-analysis.json`
- `data/tribunal-decisions/bcwcat-analysis-blog-content.md`

**Analysis Includes:**
- Yearly volume trends
- Appeal success rates
- Injury type distribution
- Legal issue patterns
- BC vs Ontario comparison

## Key Metrics

### Expected Results

| Metric | Expected Range |
|--------|---------------|
| Total Cases (2020-2026) | 2,500-3,500 |
| Appeal Success Rate | 60-70% |
| Tier A Classification | 40-60% |
| Tier B Classification | 30-40% |
| Tier C Manual Review | 10-20% |

### Common Injury Types

- Chronic pain
- PTSD / psychological injuries
- Back/spine injuries
- Shoulder injuries
- Traumatic brain injury / concussion
- Hearing loss

### Common Legal Issues

- Entitlement (compensability)
- Causation (work-relatedness)
- Significant contributing factor test
- Pre-existing conditions
- Wage loss / permanent disability
- Recurrence vs. new injury

## Comparison to Ontario WSIAT

| Tribunal | Jurisdiction | Function | Volume (2020-2026) |
|----------|-------------|----------|-------------------|
| BC WCAT | British Columbia | Workers' comp appeals | ~2,500 |
| Ontario WSIAT | Ontario | Workers' comp appeals | ~11,000 |

**Key Differences:**
- BC uses "significant contributing factor" test
- Ontario uses "arising out of and in the course of employment" test
- BC has lower volume but similar success rates

## Troubleshooting

### Quota Exceeded Error

If you see "QUOTA_EXCEEDED":
```bash
# CanLII free tier resets at 8 PM ET daily
# Wait until after reset time, then resume
node scripts/scrape-bcwcat-comprehensive-2020-2026.js
```

The scraper automatically saves progress and resumes from checkpoint.

### Missing Data

If classification finds no outcome:
- Check that Tier C cases are properly flagged for manual review
- Review HTML extraction patterns in `scrape-bcwcat-comprehensive-2020-2026.js`
- Consider manual annotation for Tier C cases

## Next Steps

After completing BC analysis:

1. **Cross-Provincial Comparison**: Compare BC, Ontario, Quebec, Alberta
2. **Issue Slices**: Extract chronic pain, pre-existing, mental health patterns
3. **Blog Posts**: Generate shareable insights
4. **App Integration**: Export data to app-ready format

## File Structure

```
data/tribunal-decisions/
├── bcwcat-2020-complete.json         # Raw scraped data
├── bcwcat-2020-classified.json       # With tier classification
├── bcwcat-outcomes-tier-a-*.json     # High confidence outcomes
├── bcwcat-outcomes-tier-b-*.json     # Medium confidence outcomes
├── bcwcat-outcomes-tier-c-*.json     # Manual review queue
├── bcwcat-outcomes-3-tier-summary.json
├── bcwcat-comprehensive-analysis.json
└── bcwcat-analysis-blog-content.md

scripts/
├── scrape-bcwcat-comprehensive-2020-2026.js
├── recover-bcwcat-outcomes.js
└── analyze-bcwcat-comprehensive.js
```

## Author

3mpwrApp Research Team  
Date: April 26, 2026

## License

Data sourced from CanLII (Canadian Legal Information Institute) under open license.
Analysis and scripts: 3mpwrApp © 2026
