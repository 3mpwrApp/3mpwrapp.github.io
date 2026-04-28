---
layout: post
title: "How Accurate Are Outcome Predictions? (79% AI Accuracy Explained)"
category: Legal Basics
tags: [ai-predictions, accuracy, tribunal-outcomes, methodology]
excerpt: Understand how we achieve 79% accuracy predicting tribunal outcomes—and when you should trust vs. question the predictions.
last_updated: 2026-04-28
---

# How Accurate Are Outcome Predictions?

**Short answer:** Our AI model correctly predicts tribunal outcomes **79.0% of the time** when tested on cases it's never seen before.

---

## How We Measured Accuracy

### Training vs. Testing Split
- **Training set:** 252,978 decisions (98%) - Used to teach the AI
- **Test set:** 3,756 decisions (2%) - Hidden from AI, used only for accuracy testing
- **Result:** 79.0% of test cases predicted correctly

### What Does 79% Mean?
- **If the AI predicts "Allowed":** There's a 79% chance the actual decision was "Allowed"
- **If the AI predicts "Dismissed":** There's a 79% chance the actual decision was "Dismissed"
- **21% error rate:** In 1 out of 5 cases, the prediction is wrong

### Industry Context
- **Legal AI benchmarks:** 70-85% is typical for outcome prediction tasks
- **Human accuracy:** Experienced lawyers predict outcomes at 66-75% accuracy (according to legal research)
- **Our 79% accuracy:** Above average, but not perfect

---

## Confidence Levels Explained

### High Confidence (≥80% probability)
- **What we show:** Only high-confidence predictions appear in app search results
- **Example:** "Allowed (85% confidence)" = AI is 85% certain this is correct
- **Deployment:** 25,213 decisions (18.4%) meet high-confidence threshold
- **Your risk:** 15-20% chance the prediction is wrong

### Medium Confidence (60-79% probability)
- **What we show:** Warning label: "AI predicted, medium confidence"
- **Example:** "Dismissed (72% confidence)" = AI thinks it's probably Dismissed, but less certain
- **Your risk:** 28-40% chance the prediction is wrong

### Low Confidence (<60% probability)
- **What we show:** "Outcome unknown" or no prediction displayed
- **Example:** "Allowed (48% confidence)" = AI is guessing—don't trust it
- **Not deployed:** 11,430 WSIAT decisions (2020-2026) flagged low-confidence

---

## Why Some Predictions Are Wrong

### 1. Limited Training Data for Rare Outcomes
- **Problem:** Only 27 "Settled" cases in training data vs. 47,198 "Granted" cases
- **Result:** AI is terrible at predicting settlements (too few examples)
- **Your risk:** Higher for rare outcomes like "Partial Win" or "No Jurisdiction"

### 2. CanLII API Limitations & Unknown Outcomes
- **Problem:** Many decisions have "Unknown" outcomes because CanLII API doesn't label outcomes in metadata
- **What we tried to fix this:**
  - **CanLII API calls:** API returns case metadata but no explicit "outcome" field
  - **Keyword extraction:** We infer outcomes from keywords like "appeal allowed," "dismissed," "granted"—but many decisions use non-standard phrasing
  - **Web scraping attempts:** CanLII has CAPTCHA protection and rate limiting to prevent automated access
  - **API restrictions:** Request throttling, daily caps, IP blocking after excessive requests
- **Why this happens:** CanLII is designed for human researchers browsing cases, not bulk data extraction—this is NOT a CanLII issue, it's intentional API access restrictions to protect their servers
- **The only way to get 100% accurate outcomes:** Manually read each individual case text and extract the outcome by hand (not scalable for 137,252 decisions)
- **Result:** Many outcomes remain "Unknown" in our dataset—we use NLP to predict these based on keywords and case characteristics
- **Your risk:** Higher for cases with sparse keywords or non-standard outcome language

### 3. Missing Context in Keywords
- **Problem:** CanLII API returns only brief keywords, not full decision text
- **Example:** Decision says "chronic pain," but doesn't say if medical evidence was strong
- **Result:** AI can't distinguish between well-documented vs. poorly-documented chronic pain claims
- **Your risk:** Higher for recent WSIAT cases (2020-2026) with sparse keywords

### 4. Tribunal Policy Changes
- **Problem:** AI learns from historical decisions (2020-2023), but tribunals change policies
- **Example:** If WSIAT started favoring chronic pain claims more in 2025, AI trained on 2020-2023 data won't know
- **Your risk:** Higher for very recent decisions (2025-2026)

### 5. Case-Specific Nuances
- **Problem:** Two "low back pain" cases can have completely different evidence quality
- **Example:** Case A has 5 specialist reports + employer incident report; Case B has only family doctor note
- **Result:** AI sees both as "low back pain" but can't distinguish evidence strength
- **Your risk:** Always compare your evidence quality to similar cases

---

## When to Trust Predictions

### ✅ Trust predictions when:
- **High confidence (≥80%):** AI is relatively certain
- **Common outcome:** "Allowed," "Granted," "Dismissed" (AI has seen thousands of examples)
- **Historical WSIAT data:** Pre-2020 decisions with rich keywords
- **HRTO/ONSBT:** These tribunals have more consistent outcome patterns

### ⚠️ Question predictions when:
- **Medium/low confidence:** AI is uncertain
- **Rare outcome:** "Partial Win," "Settled," "No Jurisdiction"
- **Recent WSIAT (2020-2026):** Sparse keywords, lower AI accuracy
- **Your case has unique factors:** Complex pre-existing conditions, multiple injuries, policy violations

---

## Comparing to Official Statistics

| Data Source | WSIAT Win Rate | Notes |
|-------------|----------------|-------|
| **WSIAT Annual Report (official)** | 65-73% | Worker success rate on entitlement appeals |
| **Our AI Predictions** | 100% (onwsiat tribunal) | Likely overstates—reflects data limitations |
| **Our AI Predictions** | 86.4% (BC WCAT) | More accurate—better training data |
| **Our AI Predictions** | 84.1% (other tribunals) | Averaged across mixed jurisdictions |

**Conclusion:** AI predictions are **directionally correct** but not gospel truth. Use them as a starting point, not a guarantee.

---

## How to Use Predictions Responsibly

### 1. Compare to Similar Cases
- Don't just look at AI prediction—read 5-10 similar cases manually
- Ask: "Do those cases have better/worse evidence than mine?"
- If your evidence is weaker, your real odds are lower than AI prediction

### 2. Focus on Patterns, Not Individual Cases
- AI says "chronic pain" has 87% success rate across 1,200 cases? That's useful.
- AI says *your specific case* will be Allowed? That's less reliable.

### 3. Consult a Lawyer for High-Stakes Cases
- If your appeal affects $50K+ in benefits, don't rely solely on AI
- Lawyers can assess evidence quality (AI can't)

### 4. Check Confidence Level
- **High confidence:** Reasonable to trust as a data point
- **Medium confidence:** Treat as "maybe, maybe not"
- **Low confidence:** Ignore—look at similar cases manually instead

---

## Ongoing Improvements

### What We're Doing to Increase Accuracy
1. **Requesting official outcome data from WSIAT** (covers 11,430 low-confidence cases)
2. **Adding full decision text** (when available) instead of keywords only
3. **Retraining model quarterly** as new decisions are published
4. **Integrating user feedback** ("Was this prediction accurate?") to identify weak spots

### How You Can Help
- **Report errors:** If you know the actual outcome and it differs from prediction, let us know
- **Share your case:** If you win/lose an appeal, tell us what worked/didn't (anonymously)

---

## Related Resources

- **[Understanding Tribunal Outcomes](/knowledge-base/understanding-tribunal-outcomes/)** - What "Allowed," "Dismissed," etc. mean
- **[What Affects Your Appeal Outcome?](/knowledge-base/what-affects-appeal-outcome/)** - Evidence factors that predict success
- **[All Outcome Statistics →](/research/#ai-powered-outcome-predictions)** - Full research methodology

---

**📧 Email:** empowrapp08162025@gmail.com  
**🔗 Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)  
**🔗 Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)