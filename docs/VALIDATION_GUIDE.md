# 🔬 Validation Sampling Quick Start Guide

## 📋 Overview
- **Goal**: Manually validate 600 ML-classified cases to measure actual accuracy
- **Time**: 10-15 hours (can be done over multiple days)
- **Impact**: Determines whether we can proceed with content updates or need to adjust thresholds

---

## ⚡ Step 1: Generate Samples (5 minutes)

```powershell
cd d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main
node scripts/ml/generate-validation-samples.js
```

**Outputs**:
- `validation-samples.json` (600 cases with metadata)
- `validation-samples.csv` (open this in Excel/Google Sheets)

**Expected console output**:
```
🔬 Ontario Tribunal Classification Validation Sampling
=====================================================

Target: 100 samples per tribunal (600 total)
Stratification: High 40, Medium 40, Low 20 per tribunal

📂 Loading tribunal decision files...
✅ Total classified cases loaded: 42,680

🎯 Sampling from ONWSIAT...
   high confidence (0.75-1.0): 3,421 cases → Sampled 40/40
   medium confidence (0.60-0.75): 4,112 cases → Sampled 40/40
   low confidence (0.50-0.60): 2,003 cases → Sampled 20/20
✅ ONWSIAT: 100 samples generated

📊 Total samples generated: 600/600
✅ JSON saved: validation-samples.json
✅ CSV saved: validation-samples.csv
```

---

## 👁️ Step 2: Manual Review (10-15 hours)

### Open the CSV file:
```powershell
start validation-samples.csv
```

### For each row:

1. **Click the `canlii_url`** column to open the decision
2. **Read the actual outcome** from the decision text
3. **Fill in `actual_outcome`** column (use same categories):
   - Allowed
   - Dismissed
   - Reconsideration
   - Settled/Withdrawn
   - No Jurisdiction
   - Procedural
   - Interim Decision
   - Costs Decision
   - Application Deficiency
   - Remitted

4. **Fill in `match`** column:
   - ✅ if ml_prediction matches actual_outcome
   - ❌ if they don't match
   - ⚠️ if ambiguous/partial outcome

5. **Add `notes`** if needed (optional):
   - "Partial win - some issues allowed, some dismissed"
   - "Procedural ruling, not substantive"
   - "Remitted for reconsideration"

### Tips:
- **Average time**: 3-5 minutes per case
- **Start small**: Review 20-30 at a time, save frequently
- **Keyboard shortcuts**: Copy/paste common outcomes
- **Search keywords**: Ctrl+F for "appeal is allowed", "dismissed", "reconsidered"
- **Speed up**: Look for the conclusion/decision section first

### Sample workflow:
```
Row 1: 2024onwsiat123
→ Click URL → Read conclusion: "Appeal is allowed"
→ actual_outcome: Allowed
→ match: ✅ (ml_prediction was "Allowed")

Row 2: 2024onsbt456
→ Click URL → Read: "Application dismissed"
→ actual_outcome: Dismissed
→ match: ❌ (ml_prediction was "Allowed")
→ notes: "Board found insufficient evidence"
```

---

## 📊 Step 3: Calculate Metrics (2 minutes)

After completing all 600 reviews (or a substantial portion), run:

```powershell
node scripts/ml/calculate-validation-metrics.js
```

**Outputs**:
- Console display with full results
- `validation-results.json` (detailed metrics)
- `docs/VALIDATION_REPORT_V3.0.md` (markdown report)

**Expected console output**:
```
═══════════════════════════════════════════════════════
           VALIDATION RESULTS SUMMARY
═══════════════════════════════════════════════════════

📋 Review Status:
   Total samples: 600
   Reviewed: 600 (100.0%)
   ✅ Correct: 438
   ❌ Incorrect: 142
   ⚠️  Ambiguous: 20

🎯 Overall Accuracy: 73.0% (438/600 correct)

📊 Accuracy by Tribunal:
   ONWSIAT  75.0% ███████████████      (75/100)
   ONSBT    82.0% ████████████████     (82/100)
   ONWSIB   66.0% █████████████        (66/100)
   ONHRT    71.0% ██████████████       (71/100)
   ONLRB    68.0% █████████████        (68/100)
   ONCA     76.0% ████████████████     (76/100)

🎲 Accuracy by Confidence Band:
   high     86.0% █████████████████    (206/240) avg: 0.832
   medium   68.0% █████████████        (163/240) avg: 0.672
   low      57.5% ███████████          (69/120) avg: 0.542

═══════════════════════════════════════════════════════
              RECOMMENDATIONS
═══════════════════════════════════════════════════════

📌 MEDIUM PRIORITY:
   1. Overall accuracy 73.0% is acceptable but could be improved.
      → Current conservative messaging appropriate.

   2. Low confidence band accuracy 57.5% below target.
      → Raise minimum threshold from 0.50 to 0.60.
```

---

## 🎯 Step 4: Interpret Results

### ✅ If Overall Accuracy ≥70%:
- **Action**: Proceed with content updates
- **Messaging**: Maintain conservative disclaimers
- **Publish**: Validation report as blog post
- **Reference**: Include accuracy in tribunal landing pages

### ⚠️ If Accuracy 60-70%:
- **Action**: Raise minimum threshold 0.50 → 0.60
- **Messaging**: Add "Preliminary Classification" label
- **Re-run**: `node scripts/ml/classify-super-enhanced-v3.js` with new threshold
- **Update**: Content with stronger disclaimers

### 🚨 If Accuracy <60%:
- **Action**: Major revision needed
- **Consider**: Excluding low-confidence predictions entirely
- **Review**: Classification patterns and methodology
- **Consult**: May need human-verified training data

---

## 📁 File Locations

**Input** (generated):
- `validation-samples.json` - Full metadata
- `validation-samples.csv` - For manual review

**Output** (after review):
- `validation-samples.csv` - Completed with actual outcomes
- `validation-results.json` - Detailed metrics
- `docs/VALIDATION_REPORT_V3.0.md` - Human-readable report

---

## 🔄 Partial Progress

**Don't have time to review all 600?**

The metrics script works with partial reviews:
- Minimum recommended: 200 cases (33% sample)
- Each tribunal needs ≥30 samples for statistical validity
- Script shows "Not reviewed: X" and calculates accuracy from completed rows

To pause and resume:
1. Save CSV file frequently
2. Script automatically skips blank `actual_outcome` rows
3. Continue where you left off next session

---

## 🆘 Common Issues

**Q: Case has multiple outcomes (e.g., "2 issues allowed, 1 dismissed")**
- A: Choose the *primary* outcome or mark as ⚠️ ambiguous with notes

**Q: Procedural ruling with no substantive decision**
- A: Use "Procedural" as actual_outcome, likely matches ML prediction

**Q: Case was remitted for reconsideration**
- A: Use "Reconsideration" or "Remitted" depending on ML prediction options

**Q: Decision text is unclear/contradictory**
- A: Mark as ⚠️ ambiguous and add notes explaining why

**Q: CanLII URL is broken/404**
- A: Leave actual_outcome blank (will be excluded from metrics)

---

## 📈 Progress Tracking

Suggested schedule (3 hours/day over 5 days):

**Day 1**: ONWSIAT (100 cases) + ONSBT (50 cases)
**Day 2**: ONSBT (50 cases) + ONWSIB (100 cases)
**Day 3**: ONHRT (100 cases)
**Day 4**: ONLRB (100 cases)
**Day 5**: ONCA (100 cases) + run metrics script

---

## ✨ Next Steps After Validation

Once validation complete and accuracy measured:

1. **Update session plan** with actual accuracy numbers
2. **Adjust thresholds** if recommended
3. **Begin Phase 1**: Update 28 blog posts with validated statistics
4. **Phase 2-5**: Update guides, knowledge base, visualizations
5. **Phase 8**: Create tribunal landing pages referencing validation
6. **Publish**: Validation report and methodology transparency

---

**Ready to begin?**

```powershell
# Generate samples
node scripts/ml/generate-validation-samples.js

# Open CSV for review
start validation-samples.csv

# Calculate metrics (after completing reviews)
node scripts/ml/calculate-validation-metrics.js
```
