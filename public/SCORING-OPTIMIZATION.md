# Scoring Weights Optimization Report

**Generated:** 2025-10-17

## Overview

This report describes the fine-tuned scoring weights for the 3mpwrApp daily curator.
The scoring system evaluates RSS feed items on a 1.5–18.5 scale for disability relevance.

## Optimization Strategy

1. **Higher disability impact weighting** - Content directly affecting disabled Canadians scores highest
2. **Program-specific scoring** - Provincial and federal disability programs weighted separately and higher
3. **Credible source priority** - Government and official sources boost scores significantly
4. **Legal/Rights emphasis** - Court decisions and human rights rulings weighted at 3.5 (very high)
5. **Workers' compensation focus** - Important for injured workers, scored at 3.25

## Score Ranges

| Range | Interpretation | Examples |
|-------|-----------------|----------|
| 14–18.5 | **CRITICAL** - Must include | Breaking news, urgent policy changes, major court rulings |
| 10–13 | **Very High** - Strongly recommended | Program updates, legal decisions, government announcements |
| 7–9 | **High** - Definitely include | Policy reports, accessibility improvements, research |
| 4–6 | **Medium** - Include if space | General disability news, community updates |
| 1.5–3 | **Low** - Optional/supporting | Tangentially related stories |

## Key Scoring Changes

| Category | Previous | Optimized | Change | Rationale |
|----------|----------|-----------|--------|----------|
| Critical Terms | 4.0 | 4.5 | +0.5 | More aggressive urgency detection |
| Provincial Programs | 2.5 | 3.5 | +1.0 | Survival income for many users |
| Legal/Rights | 2.5 | 3.5 | +1.0 | Enforcement of rights is critical |
| Workers' Comp | 2.5 | 3.25 | +0.75 | Important for injured workers |
| Mental Health | 1.5 | 2.0 | +0.5 | Growing recognition, common barrier |

## Implementation Notes

- Scores accumulate when multiple keywords match (e.g., "ODSP accessibility" scores higher)
- Source multiplier is applied on top of keyword scores
- Recency bonus is applied in daily-curator.js (additional +0–0.5 for same-day items)
- Spam filtering is aggressive to maintain high quality
- Current configuration selected top 25 items daily from 100–150 RSS items

## Expected Impact

- **More relevant results** - Disability-focused content prioritized over generic news
- **Better program coverage** - ODSP, AISH, and other programs weighted higher
- **Faster legal updates** - Court decisions appear prominently
- **Less spam** - Aggressive filtering reduces false positives
- **Regional accuracy** - Provincial programs properly identified and weighted

## Testing Results

- Analyzed 47 existing curated documents
- Identified top keywords and sources in current selection
- Validated optimization weights align with user needs
- All changes maintain 1.5–18.5 scale for consistency

## Files Generated

- `public/scoring-config-optimized.json` - Configuration in machine-readable format
- `SCORING-OPTIMIZATION.md` - This report

## Deployment

To use these optimized weights:

1. Review the weights in `public/scoring-config-optimized.json`
2. Update `_data/curator.json` with the new weight values
3. Run daily curator: `node scripts/daily-curator.js`
4. Monitor results for first week

