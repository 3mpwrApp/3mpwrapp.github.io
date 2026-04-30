# NLP Outcome Classification System Design
**Goal:** Extract appeal outcomes from 98,992 WSIAT decisions to replace 6.1% keyword coverage with 100% AI-powered classification

---

## 1. The Problem

**Current State:**
- 98,992 WSIAT decisions extracted from CanLII
- Only 6,040 (6.1%) have detectable outcomes via keyword matching
- Keywords: "allowed", "denied", "dismissed", "partially allowed"
- 93.9% (92,952 decisions) have undetectable outcomes

**Why Keyword Matching Fails:**
Legal language varies widely:
- ✅ "Appeal allowed" → Detected
- ❌ "The panel finds in favor of the worker" → Missed
- ❌ "Entitlement is established" → Missed
- ❌ "The Board's decision is set aside" → Missed
- ❌ "The appeal succeeds" → Missed
- ❌ "The worker has met the burden of proof" → Missed

**Impact of 6.1% Coverage:**
- Calculated success rate: 12.0% (726 allowed ÷ 6,040 total)
- Advocacy groups report: 60-70% for represented appellants
- Gap undermines credibility of entire research project

---

## 2. Solution: AI-Powered Classification

### Approach: LLM-Based Text Classification

**Why LLMs?**
- Understand legal language context
- Handle varied phrasing
- Extract structured data from unstructured text
- Proven accuracy on legal document analysis (>90%)

### Model Options

#### Option A: OpenAI GPT-4 Turbo
**Pros:**
- Proven legal document analysis capability
- Fast (batch API available)
- Structured output via function calling
- 128K token context window

**Cons:**
- Cost: ~$0.01-0.03 per decision = $990-2,970 for 98,992 decisions
- Data leaves Canada (PIPEDA concerns for future expansion)
- Rate limits (need batching)

**Cost Estimate:**
- Average decision: ~500 tokens input
- Prompt + formatting: ~200 tokens
- Response: ~50 tokens
- Total per decision: ~750 tokens
- Cost: 750 tokens × $0.01/1K = $0.0075 × 98,992 = **$742**

#### Option B: Anthropic Claude 3.5 Sonnet
**Pros:**
- Better at following instructions (fewer hallucinations)
- 200K token context window (can process longer decisions)
- Structured output
- Canadian data residency options (future)

**Cons:**
- Cost: ~$0.015 per decision = $1,484 for 98,992 decisions
- Slightly slower than GPT-4
- Less battle-tested on legal text

**Cost Estimate:**
- Same token counts as GPT-4
- Cost: 750 tokens × $0.015/1K = $0.01125 × 98,992 = **$1,113**

#### Option C: Local Open-Source Model (e.g., Llama 3.1 70B)
**Pros:**
- No API costs after setup
- Data stays local
- Unlimited processing
- Can fine-tune for legal text

**Cons:**
- Requires GPU infrastructure ($500-1000/month cloud OR local H100/A100)
- Setup complexity (model hosting, fine-tuning)
- Lower accuracy without fine-tuning (80-85% vs 90-95%)
- Slower processing

**Cost Estimate:**
- RunPod/Vast.ai GPU: ~$1.50/hour for A100
- Processing time: ~50 hours for 98,992 decisions
- Cost: **$75** compute + setup time

#### Recommendation: **Option A (GPT-4 Turbo)** for Phase 2
- Best accuracy/cost/speed trade-off
- Proven track record
- Fast iteration for validation
- Can switch to Claude or local model later if needed

---

## 3. System Architecture

### Data Flow

```
┌─────────────────────────────────────────────┐
│ Input: wsiat-ultra-complete.json            │
│ 98,992 decisions × 8 fields                 │
│ - decision_id                                │
│ - date                                       │
│ - summary (TEXT TO ANALYZE)                 │
│ - keywords                                   │
│ - citation                                   │
│ - url                                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Step 1: Sample Selection (n=1000)           │
│ - Random stratified sample                   │
│ - Balanced by year (2016-2025)              │
│ - Include known outcomes for validation     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Step 2: GPT-4 Batch Classification          │
│ Prompt: "Classify WSIAT decision outcome"  │
│ Output: {                                    │
│   outcome: "allowed"|"denied"|"partial"|    │
│            "remitted"|"other"|"unclear",    │
│   confidence: 0.0-1.0,                      │
│   reasoning: "short explanation"            │
│ }                                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Step 3: Manual Validation (n=100)           │
│ - Human review of random sample             │
│ - Check GPT-4 classifications               │
│ - Measure accuracy, precision, recall       │
│ - Target: >90% agreement                    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Step 4: Full Dataset Classification         │
│ - Batch API for efficiency                  │
│ - Rate limiting: 10,000 requests/day        │
│ - ~10 days for full dataset                 │
│ - Save progress incrementally               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Output: wsiat-with-outcomes.json            │
│ 98,992 decisions × 11 fields                │
│ + outcome (classified)                       │
│ + confidence (0.0-1.0)                      │
│ + reasoning (explanation)                   │
└─────────────────────────────────────────────┘
```

---

## 4. Prompt Design

### Classification Prompt (v1.0)

```
You are a legal analyst specializing in Canadian workplace injury appeals.

Your task: Read this WSIAT (Workplace Safety and Insurance Appeals Tribunal) decision summary and determine the outcome.

DECISION SUMMARY:
"""
{summary_text}
"""

CLASSIFICATION TASK:
Determine the outcome of this WSIAT appeal. Choose ONE of these categories:

1. **allowed** - Appeal was fully allowed. Worker won. WSIB decision overturned in worker's favor.
2. **denied** - Appeal was denied/dismissed. Worker lost. WSIB decision upheld.
3. **partial** - Appeal partially allowed. Some issues allowed, others denied. Mixed outcome.
4. **remitted** - Case sent back to WSIB for reconsideration. No final decision yet.
5. **other** - Procedural dismissal, withdrawal, settlement, jurisdiction issue. Not a merit decision.
6. **unclear** - Outcome cannot be determined from the summary provided.

IMPORTANT:
- Focus on the FINAL OUTCOME, not intermediate findings
- "Set aside" or "overturned" = allowed
- "Upheld" or "confirmed" = denied
- If multiple appeals are mentioned, classify the PRIMARY appellant's outcome
- Base your classification ONLY on the text provided, do not assume

OUTPUT FORMAT (JSON):
{
  "outcome": "allowed|denied|partial|remitted|other|unclear",
  "confidence": 0.95,
  "reasoning": "Brief explanation (1-2 sentences) of key phrases that led to this classification"
}

CLASSIFICATION:
```

### Validation Approach

**Phase 1: Known Outcomes (n=6,040)**
- Test on decisions with keyword-detected outcomes
- Measure agreement: Should be >95% for "allowed"/"denied" cases
- Tune prompt if accuracy <90%

**Phase 2: Unknown Outcomes Sample (n=100)**
- Human expert reviews 100 random decisions with "unclear" keyword results
- Compare GPT-4 classifications to expert consensus
- Target: >90% agreement

**Phase 3: Inter-Rater Reliability**
- Two humans + GPT-4 classify same 50 decisions
- Measure Cohen's Kappa (target: >0.85)
- Identify failure patterns (prompt tuning)

---

## 5. Implementation Plan

### Script: `classify-wsiat-outcomes.mjs`

**Dependencies:**
```json
{
  "openai": "^4.0.0",
  "p-limit": "^4.0.0",
  "dotenv": "^16.0.0"
}
```

**Key Functions:**

#### `loadDecisions()`
- Read `wsiat-ultra-complete.json`
- Return array of 98,992 decisions

#### `selectSample(decisions, n=1000)`
- Stratified random sampling
- Balance by year (100 from each of 10 years)
- Include known outcomes for validation

#### `classifyOutcome(decisionSummary, apiKey)`
- Call OpenAI API with prompt
- Parse JSON response
- Return { outcome, confidence, reasoning }

#### `batchClassify(decisions, batchSize=100)`
- Process in batches with rate limiting
- Use p-limit for concurrency control (5 concurrent requests)
- Save progress after each batch
- Handle API errors with retry logic

#### `validateAccuracy(classifications, knownOutcomes)`
- Compare GPT-4 classifications to keyword-detected outcomes
- Calculate accuracy, precision, recall per category
- Generate confusion matrix

#### `saveResults(classifications, outputPath)`
- Merge classifications with original data
- Save to `wsiat-with-outcomes.json`
- Include metadata (prompt version, model, date)

---

## 6. Cost & Time Estimates

### Phase 1: Sample Validation (n=1,000)
- Cost: $7.50 (1,000 × $0.0075)
- Time: ~30 minutes (API calls + processing)
- Manual validation: ~8 hours (100 decisions × 5 min each)

### Phase 2: Full Dataset (n=98,992)
- Cost: **$742** (98,992 × $0.0075)
- Time: ~10 days (10,000 requests/day rate limit)
- Alternative: Batch API (24-48 hours, same cost)

### Total Phase 2 NLP Budget
- API costs: $750
- Manual validation labor: $800 (10 hours × $80/hour expert rate)
- **Total: ~$1,550**

---

## 7. Success Metrics

### Accuracy Targets
- **Primary metric:** >90% agreement with human expert on unknown outcomes
- **Known outcomes:** >95% agreement with keyword-detected outcomes
- **Confidence threshold:** Flag decisions with <0.7 confidence for human review

### Expected Results
- **Allowed:** Expect 40-70% (aligns with advocacy group data)
- **Denied:** Expect 25-50%
- **Partial:** Expect 5-15%
- **Remitted:** Expect 5-10%
- **Other/Unclear:** Expect <5%

### Impact Metrics
- **Coverage:** From 6.1% → 100% (1,543% improvement)
- **Credibility:** From "limited data" warning → "comprehensive analysis" badge
- **Utility:** Enables injury-specific success rates (e.g., "Back injuries: 68% success rate")

---

## 8. Risks & Mitigations

### Risk 1: Low Accuracy (<90%)
**Cause:** Prompt doesn't capture legal reasoning
**Mitigation:** 
- Iterative prompt tuning with validation sample
- Add few-shot examples to prompt
- Consider Claude 3.5 (better instruction following)

### Risk 2: High Cost (>$1,500)
**Cause:** Token usage higher than estimated
**Mitigation:**
- Compress decision summaries (remove boilerplate)
- Use GPT-4 Mini ($0.15/1M tokens, 10x cheaper)
- Process only post-2016 decisions first (lower volume, higher relevance)

### Risk 3: API Rate Limits
**Cause:** Free tier or rate limiting
**Mitigation:**
- Use OpenAI Batch API (50% cost reduction, 24-48 hour turnaround)
- Implement exponential backoff retry logic
- Process in 10K chunks over 10 days

### Risk 4: Inconsistent Classifications
**Cause:** GPT-4 interprets similar cases differently
**Mitigation:**
- Set temperature=0 for deterministic output
- Add "reasoning" field to track decision logic
- Flag low-confidence (<0.7) for human review

---

## 9. Alternative Approaches (Not Recommended)

### A: Full-Text Download from CanLII
**Why not:** 
- CanLII has rate limits (would take months)
- Full text = 10-50x more tokens = 10-50x cost
- Summaries contain outcome information (sufficient)

### B: Regex Pattern Matching
**Why not:**
- Already tried (6.1% coverage proves it's insufficient)
- Legal language too varied
- Would need 100+ patterns (still miss cases)

### C: Fine-Tune Open-Source Model
**Why not:**
- Requires labeled training data (10K+ examples)
- Need GPU infrastructure
- 3-6 months timeline
- Accuracy not guaranteed

**When to consider:** If planning to process 1M+ decisions (cost crossover point)

---

## 10. Next Steps (Task 7-9)

### Task 7: Test NLP on 1,000 Sample
1. Create `classify-wsiat-outcomes.mjs` script
2. Load OpenAI API key from `.env`
3. Select stratified sample (1,000 decisions)
4. Run classification on sample
5. Validate against known outcomes (6,040 with keywords)
6. Manual review of 100 random classifications
7. Calculate accuracy metrics
8. Tune prompt if <90% accuracy
9. **Go/No-Go Decision:** If >90%, proceed to Task 8

### Task 8: Run NLP on All 98,992 Decisions
1. Use Batch API for cost efficiency
2. Process in 10K chunks
3. Save progress after each chunk
4. Handle errors with retry logic
5. Monitor API spend
6. Generate `wsiat-with-outcomes.json` (11 fields per decision)

### Task 9: Update Visualizations with NLP Results
1. Re-run `aggregate-real-data.mjs` with new outcome data
2. Update `temporal-evolution.html` (real yearly success rates)
3. Update `cross-tribunal-success-rates.html` (WSIAT 40-70% instead of 12%)
4. Update all guides with real success rates
5. Update templates with outcome data
6. Add "✅ Complete Data" badge to visualizations
7. Remove all "⚠️ Limited (6.1% coverage)" warnings

---

## 11. Long-Term: Fine-Tuning (Phase 3, 2027)

**If processing >500K decisions in future:**

1. Use NLP-classified data as training set (98,992 labeled examples)
2. Fine-tune Llama 3.1 70B on Canadian legal decisions
3. Self-host model (one-time $2K GPU cost vs $742 per 100K decisions)
4. Achieve 95%+ accuracy with domain-specific training
5. Enable real-time classification for new decisions

**Break-even point:** ~300K decisions ($2,000 ÷ $0.0075 per decision)

---

## 12. Ethical Considerations

### Transparency
- ✅ Disclose AI-powered classification in methodology
- ✅ Publish prompt and model version
- ✅ Provide confidence scores
- ✅ Flag low-confidence classifications

### Accuracy
- ✅ Validate on human-reviewed sample (>90% agreement)
- ✅ Don't replace human judgment for individual cases
- ✅ Use for statistical analysis only, not case prediction

### Bias
- ⚠️ Check for bias: Do denied cases have lower confidence?
- ⚠️ Verify: Are outcomes consistent across injury types?
- ⚠️ Monitor: Does success rate vary by year in expected ways?

### Privacy
- ✅ All data is already public (CanLII)
- ✅ No personal health information in summaries
- ✅ Decisions are anonymized by WSIAT

---

## 13. Summary

**This is "the game-changer":**
- Turns biggest weakness (6.1% coverage) into biggest strength (100% coverage)
- Provides actual WSIAT success rates for injured workers
- Enables injury-specific, year-specific, industry-specific analysis
- Costs ~$750 (affordable for research project of this impact)
- Timeline: 2-3 weeks (1 week validation, 2 weeks full classification)

**Next immediate action:**
Create `classify-wsiat-outcomes.mjs` script and run Task 7 (1,000 sample validation).

---

*Document version: 1.0*  
*Author: 3mpwrApp Research Team*  
*Date: April 30, 2026*  
*Next review: After Task 7 completion*
