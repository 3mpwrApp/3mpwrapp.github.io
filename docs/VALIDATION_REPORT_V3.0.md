# Ontario Tribunal Classification Validation Report v3.0

**Date**: 2026-05-16  
**Samples Reviewed**: 0/100  
**Overall Accuracy**: 0%

## Executive Summary

This report documents the validation of v3.0 ML classification results across 100 manually-reviewed cases from 6 Ontario tribunals.

**Key Findings**:
- 0 correct predictions (0%)
- 0 incorrect predictions
- 0 ambiguous cases

## Accuracy by Tribunal

| Tribunal | Accuracy | Correct | Total | Samples |
|----------|----------|---------|-------|----------|

## Accuracy by Confidence Band

| Band | Accuracy | Avg Confidence | Correct | Total |
|------|----------|----------------|---------|-------|

## Precision by ML Prediction

| Outcome | Precision | Correct | Total |
|---------|-----------|---------|-------|

## Accuracy by Classification Method

| Method | Accuracy | Correct | Total |
|--------|----------|---------|-------|

## Top Misclassifications


## Recommendations

### CRITICAL: Overall accuracy 0% is below acceptable threshold. Consider major revision of classification methodology.

**Action**: Increase minimum confidence threshold to 0.65 or higher. Consider excluding low-confidence predictions entirely.


## Methodology

**Sampling Strategy**: Stratified random sampling
- 100 samples per tribunal (600 total)
- 40 high confidence (0.75-0.95)
- 40 medium confidence (0.60-0.75)
- 20 low confidence (0.50-0.60)

**Validation Process**:
1. Generated random samples from classified cases
2. Manually reviewed each case via CanLII URL
3. Compared ML prediction with actual decision outcome
4. Marked as correct (✅), incorrect (❌), or ambiguous (⚠️)

**Limitations**:
- Sample size represents ~1.4% of classified cases
- Manual review subject to human interpretation
- Some decisions have mixed/partial outcomes
- Keyword-only classification (no full text analysis)

## Next Steps

⚠️ Accuracy below 70% threshold. Additional work needed.

- Implement recommended threshold adjustments
- Add "Preliminary Classification" disclaimer
- Consider re-classifying with stricter parameters
