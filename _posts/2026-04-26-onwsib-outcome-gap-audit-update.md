---
layout: post
title: "ONWSIB 2020-2026: Outcome Gap Audit and Evidence Limits"
subtitle: "463 decisions collected quickly, but full-text and disposition fields remain mostly unresolved"
date: 2026-04-26
author: Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot
categories: [community-updates, research, workers-compensation]
tags: [onwsib, data-quality, outcome-gap, audit-ci, research, workers-compensation]
toc: true
---

# ONWSIB Outcome Gap Update (2020-2026)

This report documents what was collected, what can be classified, and what remains unresolved.

Thousands of injured workers go through internal WSIB reconsideration processes each year, yet the public has almost no visibility into outcomes. This audit attempts to measure what can actually be verified from publicly available ONWSIB decisions and exposes how limited that visibility still is.

## What Is ONWSIB?

The **Ontario Workplace Safety and Insurance Board (WSIB)** is the agency that decides initial workers' compensation claims. ONWSIB is their internal review/reconsideration process before cases go to WSIAT (the independent appeal tribunal).

**Key Difference:** ONWSIB is not an independent tribunal—**it's WSIB reviewing its own decisions.** This is a core structural issue: the same agency that denied your claim is the one reconsidering whether that denial was correct. WSIAT provides an independent alternative, but many workers must go through this internal WSIB review process first.

## Dataset Overview

**463 ONWSIB decisions (2020-2026)** collected from CanLII public records.

**⚠️ Data Limitations:** Many decision outcomes are inferred from keywords because current CanLII API responses do not include standardized structured outcome labels for these decisions. CanLII states it makes every effort to provide comprehensive databases, while noting content depends on document-provision sources and that transfer/processing delays can temporarily result in missing documents before omissions are corrected (see [canlii.org](https://www.canlii.org)). We tried: API calls (no outcome field), keyword extraction (non-standard phrasing), web scraping (CAPTCHA + rate limiting), and bulk requests (throttled/capped). To get 100% accurate outcomes, we'd need to manually read each case individually. Our analysis uses keyword patterns and NLP predictions where official outcomes aren't available.

**Important Context:** ONWSIB has far fewer public decisions than WSIAT (463 vs 11,430) because:
1. Most internal WSIB reviews don't get published to CanLII
2. Many workers skip ONWSIB and go directly to WSIAT appeals
3. WSIB may not publish all reconsideration decisions publicly

## What Was Verified

ONWSIB records collected by year:

| Year | Cases |
|------|-------|
| 2020 | 0 |
| 2021 | 49 |
| 2022 | 149 |
| 2023 | 120 |
| 2024 | 73 |
| 2025 | 64 |
| 2026 | 8 |
| **Total** | **463** |

**Peak:** 2022 (149 cases)  
**Trend:** 2022 peak remains highest, with 2024-2026 counts still far below peak levels

---

## See Also

**Related Resources:**
- [**ONWSIB Skip Strategy Guide**](/guides/onwsib-skip-strategy-guide/) - Why many workers skip internal review and go straight to WSIAT
- [**WSIAT Full Analysis**](/research/tribunal-transparency/wsiat-vs-bc-wcat-transparency-divide/) - The independent appeals tribunal (next step after ONWSIB)
- [**ONWSIB in App**](https://3mpwrapp.ca/resources/onwsib-analysis) - Analyze ONWSIB decisions interactively
- [**Visualization: ONWSIB vs ONSBT Outcomes**](/data/visualizations/onsbt-onwsib-classification-2020-2026.json) - Classification breakdown
- [**Interactive Chart: Outcome Tiers**](/data/visualizations/onsbt-onwsib-classification-2020-2026.json) - See Tier A/B/C distribution

### CanLII Browse Cross-Reference (Observed May 2026)

Cross-checking the ONWSIB browse view on CanLII shows a different year split in the currently visible public listing:

- 2020: 0 decisions
- 2021: 49 decisions
- 2022: 149 decisions
- 2023: 120 decisions
- 2024: 73 decisions
- 2025: 64 decisions
- 2026: 8 decisions

These observed browse counts are now aligned with the API-collected dataset table above after the May 8, 2026 reconciliation rerun.

## Top Issues in ONWSIB Cases (Keyword Analysis)

| Issue | Cases | % of Dataset |
|-------|-------|--------------|
| Worker-related | 416 | 89.8% |
| Employer obligations/disputes | 96 | 20.7% |
| Work-related injury | 81 | 17.5% |
| Benefits eligibility | 67 | 14.5% |
| Pre-existing condition arguments | 31 | 6.7% |
| Pain-related cases | 33 | 7.1% |
| **Specific Injuries:** | | |
| → Shoulder | 33 | 7.1% |
| → Knee | 30 | 6.5% |
| → Neck | 17 | 3.7% |
| → Ankle | 17 | 3.7% |
| → Wrist | 12 | 2.6% |
| → Hip | 10 | 2.2% |
| **Mental Health:** | | |
| → Psychotraumatic disability | 13 | 2.8% |
| → Mental stress injury | 21 | 4.5% |
| **Employment Issues:** | | |
| → Return to work | 20 | 4.3% |
| → Re-employment obligation | 10 | 2.2% |
| → Modified duties | 11 | 2.4% |

**Key Findings:**
- **Pre-existing condition arguments appear in 6.7% of ONWSIB cases** (31 cases)—still a meaningful signal even when most outcomes remain unresolved.
- **Shoulder and knee injuries dominate** the body-part-specific slice (7.1% and 6.5%).
- **Mental health keywords appear in at least 7.3% of cases** when psychotraumatic disability and mental stress language are combined.
- **Re-employment obligation disputes** show up in 2.2% of cases—these are battles over whether employers followed the law in bringing injured workers back.

## Pre-Existing Condition Sub-Analysis (31 Cases)

The new ONWSIB pre-existing-condition slice is now broken out separately in [onwsib-pre-existing-subanalysis.json](/data/tribunal-decisions/onwsib-pre-existing-subanalysis.json).

### Year Distribution

| Year | Pre-existing cases |
|------|--------------------|
| 2021 | 2 |
| 2022 | 21 |
| 2023 | 5 |
| 2024 | 0 |
| 2025 | 3 |
| 2026 | 0 |

### Body-Part Co-Occurrence

| Body part | Cases |
|-----------|-------|
| Shoulder | 6 |
| Knee | 5 |
| Neck | 2 |
| Ankle | 1 |
| Wrist | 1 |
| Hip | 1 |

### What This Slice Shows

- **2022 carries most of the public pre-existing-condition archive** with 21 of the 31 cases.
- **Shoulder and knee disputes are the most common body-part pairings** inside the pre-existing-condition subset.
- **Only 1 of the 31 cases has a publicly classified outcome.** The other 30 remain unresolved in public records.
- **None of the 31 cases cleared the 0.55 deep-dive threshold** for a high-confidence sidecar promotion, which shows how thin the public outcome language remains even inside this focused subset.

This is useful as a pattern map for worker advocacy and issue tracking, but not as an outcome study. The public record tells us that pre-existing-condition arguments recur at ONWSIB. It still does not tell us reliably how those disputes end.

## Local Deep-Dive Reclassification

The ONWSIB-specific deep-dive pass uses local file analysis only and does not make additional API calls. It identifies 12 high-confidence outcome reads in the current archive:

- 2021: 2
- 2022: 2
- 2023: 1
- 2024: 0
- 2025: 3
- 2026: 4

These are rule-based local classifications, not official CanLII labels. A separate manual-review queue contains 6 high-signal cases that still need human validation before they should be treated as settled.

For the short appendix describing the local-only review method, threshold, and year-by-year gains, see the [ONWSIB Deep-Dive Method Note](/docs/ONWSIB-DEEP-DIVE-METHODOLOGY-2026-05-08.html).

**What This Means:**
- The archive still remains mostly unresolved at the public-record level.
- The local deep-dive is useful for prioritizing review, but it does not change the fact that most ONWSIB records do not expose structured outcome language.
- The 95.7% unresolved rate means the public cannot reliably measure what happens in the overwhelming majority of ONWSIB reconsiderations.

<div style="border-left: 6px solid #b00020; background: #fff4f4; padding: 1rem 1.25rem; margin: 1.5rem 0; border-radius: 6px;">
	<strong style="color: #7f0000; font-size: 1.05rem;">Key Finding: 95.7% of ONWSIB outcomes are unresolved in public records.</strong>
	<p style="margin: 0.5rem 0 0.75rem;">Only 4.6% of cases are classifiable. This is an evidence-architecture problem, not a basis for system-wide outcome claims.</p>
	<div style="display: flex; height: 16px; border-radius: 999px; overflow: hidden; background: #e0e0e0;">
		<div style="width: 95.7%; background: #c62828;"></div>
		<div style="width: 4.6%; background: #2e7d32;"></div>
	</div>
	<p style="margin: 0.6rem 0 0; font-size: 0.92rem;"><strong>Unresolved:</strong> 95.7% | <strong>Classified:</strong> 4.3%</p>
	<p style="margin: 0.6rem 0 0;"><a href="/connecting-the-dots-canlii-keyword-visualization-network.html">View ONWSIB interactive visualization</a> (select <em>ONWSIB Only</em> in the tribunal filter).</p>
</div>

## The Evidence Gap Crisis

**95.7% unresolved** is the central ONWSIB data problem:
- Most public ONWSIB records still do not expose structured outcome language
- Keyword summaries are often too short to support automatic classification
- A large share of the archive remains suitable only for manual review or cautious rule-based inference

**Why is ONWSIB data so incomplete?**
1. CanLII may only publish a tiny fraction of ONWSIB internal reviews
2. WSIB may not be required to publish all reconsiderations
3. Some records are too short or too generic to support confident automated classification
4. Manual review is still required for the highest-confidence reads

## Cross-Issue Analysis

Using issue-slice data across all four Ontario tribunals:

### Pre-Existing Condition Cases at ONWSIB
- **31 cases** with pre-existing condition keywords (6.7% of ONWSIB dataset)
- **Local deep-dive signal:** 1 case can be promoted with confidence; the rest remain unresolved or require manual review
- **Interpretation:** pre-existing-condition language is present, but most records still do not provide enough detail for strong automatic outcome inference

### Chronic Pain Cases at ONWSIB
- **4 cases** with chronic pain keywords (0.9% of ONWSIB dataset)
- All 4 are Tier C (unresolved)

- All 4 remain unresolved in the current public archive

**Interpretation:** chronic-pain language is present but sparse, and the current public ONWSIB record does not expose enough structure to infer a consistent outcome pattern.

## Audit Estimate (Sample-Pack Proxy)

Automated proxy audit from Tier B and Tier C sample packs:

- Tier B proxy error: 0.0% (95% CI: 0.0-16.8)
- Tier C missed-explicit proxy: 0.0% (95% CI: 0.0-3.1)

Tier B confidence band is wide due to small sample size.

## What This Means for Community Reporting

This dataset is useful for:
- Pattern discovery in keyword language (work-related injury, pre-existing conditions, employer obligations)
- Evidence-gap quantification (95.7% unresolved shows major public-data limits)
- Monitoring outcome-field completeness over time
- Injury type prevalence tracking (knee, shoulder, mental health trends)

**Public ONWSIB data is insufficient to evaluate outcomes at scale:**
- Only 20 cases (4.6%) have classifiable outcomes—far too few for robust win-rate claims
- 95.7% unresolved means no system-wide success rate estimates are possible
- High-confidence causal explanations of denial dynamics cannot be drawn from this limited evidence

## Why This Matters to Injured Workers

**What This Means for You:**

If WSIB denies your claim, ONWSIB is often your first formal chance to challenge that decision—but it's not an independent review. **The same agency that said "no" is the one reconsidering whether they were right to say "no."** This structural reality shapes the entire reconsideration process.

We analyzed 463 ONWSIB decisions and found:
- **95.7% of outcomes are missing from public records**—we can't tell you what happened in the vast majority of cases
- Of the tiny 4.6% we could classify, 17 out of 19 appeared to be grants—but that sample is too small to promise you'll win
- **Pre-existing condition arguments appear in 6.7% of ONWSIB cases**—if WSIB denied you because they blamed your injury on a pre-existing condition, you're not alone

The transparency gap means injured workers go into ONWSIB reconsiderations with limited public guidance on which arguments succeed, which body parts recur most often, and how much of the archive remains unreadable at scale.

**What You Can Do:**
- Track your own case patterns using 3mpwrApp's Evidence Locker
- Request full written reasons for any ONWSIB decision
- Keep a dated record of medical, employer, and WSIB correspondence
- Share your experience (anonymously if preferred) to help build community knowledge

---

## What The Data Shows About ONWSIB

**Patterns in ONWSIB Internal Review Cases:**

1. **ONWSIB is WSIB reviewing itself—not an independent tribunal.** This is a core structural issue that injured workers need to understand: the same organization that made the initial decision is evaluating whether that decision was correct. This is an internal review process, not independent oversight.

2. **Local deep-dive reclassification is modest but useful:** The current archive yields 12 high-confidence outcome reads across 2021, 2022, 2023, 2025, and 2026, with 6 more cases queued for manual review.

3. **Pre-existing condition arguments appear early:** 6.7% of ONWSIB cases (31 cases) cite pre-existing condition disputes. This is a meaningful internal-review signal, but the current public archive still does not expose enough detail to resolve most of these cases automatically.

4. **Knee and shoulder injuries dominate:** Musculoskeletal injuries account for the largest share of body-part-specific cases (knee: 4.9%, shoulder: 4.2%).

5. **Mental health claims appear in 6% of cases:** Psychological injury (2.3%), psychotraumatic disability (2.1%), and mental stress injury (1.6%) combine to represent a notable portion of the ONWSIB caseload.

6. **Re-employment obligation disputes:** 1.6% of cases involve disputes over whether employers met their legal obligations to accommodate or bring injured workers back to modified duties.

**Data Transparency Gap:** With 95.7% of ONWSIB outcomes unresolved in public records, outcome pattern analysis remains severely limited. Local rule-based review helps prioritize manual checking, but the public archive still lacks enough structured detail for a full outcome map.

## Research Priority

The central ONWSIB issue is not speed of collection. It is **outcome completeness and unresolved-case volume**. The immediate accountability metric is reduction of Tier C from 95.7% to a materially lower share through:
1. Better source access (requesting full WSIB internal review decisions)
2. Stronger disposition extraction (improved keyword analysis)
3. Direct WSIB transparency commitments (publishing all reconsideration outcomes publicly)

## References

1. **CanLII (Canadian Legal Information Institute).** ONWSIB decisions database. Available at: [https://www.canlii.org/en/on/onwsib/](https://www.canlii.org/en/on/onwsib/)

2. **Workplace Safety and Insurance Board (WSIB) Ontario.** About WSIB. Available at: [https://www.wsib.ca/en/about-wsib](https://www.wsib.ca/en/about-wsib)

3. **Workplace Safety and Insurance Appeals Tribunal (WSIAT).** Annual Reports 2020-2025. Available at: [https://www.wsiat.on.ca/en/aboutUs/annualReports.html](https://www.wsiat.on.ca/en/aboutUs/annualReports.html)

4. **Institute for Work & Health (IWH).** (2022). Life After Work Injury Study. Available at: [https://www.iwh.on.ca/projects/life-after-work-injury-study](https://www.iwh.on.ca/projects/life-after-work-injury-study)

5. **Canadian Injured Workers Alliance (CIWA).** Workers' compensation system transparency reports. Available at: [https://www.ciwa.ca/](https://www.ciwa.ca/)

6. **FightWCB.** Important Papers & Reports on Workers' Compensation. Available at: [https://fightwcb.org/important-papers-reports/](https://fightwcb.org/important-papers-reports/)

## Open Data Access

Full datasets available for community analysis:
- [onwsib-outcomes-tier-a-high-precision.json](/data/tribunal-decisions/onwsib-outcomes-tier-a-high-precision.json)
- [onwsib-outcomes-tier-b-medium-confidence.json](/data/tribunal-decisions/onwsib-outcomes-tier-b-medium-confidence.json)
- [onwsib-outcomes-3-tier-summary.json](/data/tribunal-decisions/onwsib-outcomes-3-tier-summary.json)
- [onwsib-scraping-summary.json](/data/tribunal-decisions/onwsib-scraping-summary.json)
- [Tribunal audit error-rate estimates (all four tribunals)](/data/tribunal-decisions/tribunal-audit-error-rate-estimates.json)

## Methodology Notes, Research Constraints, and Confidence Levels

**Methodology Notes:**
- Tiered evidence framework was used: Tier A (confirmed language), Tier B (probable keyword inference), Tier C (unresolved).
- We combined direct API metadata, keyword parsing, and audit-sample validation.
- Confidence intervals are reported using Wilson 95% methods for small samples.

**Research Constraints:**
- Public records only; this does not represent all ONWSIB internal reviews.
- No standardized outcome field is available through current API responses for this dataset.
- Outcome language varies significantly across decisions, reducing extraction precision.
- Biggest current accuracy limiter: many ONWSIB rows have empty `full_text_html` and only short keyword summaries, which limits high-confidence outcome extraction.
- CanLII notes that while it strives for comprehensive databases, source-provider transfer and processing delays can temporarily result in missing documents before omissions are corrected.

**Confidence Levels:**
- High confidence: volume counts, year distribution, and Tier C share (95.7%).
- Moderate confidence: issue prevalence from recurring keyword patterns.
- Low confidence: inferred grant/denial rates from small Tier B sample (directional only).

## Why This Matters

- Injured workers need transparent systems to make informed appeal decisions.
- Researchers need measurable outcomes to test what is working and what is failing.
- Policymakers need reliable public data to evaluate fairness and performance.
- Appeals systems should be independently understandable without insider access.

---

**Methodology:** Tiered evidence classification framework with Wilson 95% confidence intervals. See the [ONWSIB Deep-Dive Method Note](/docs/ONWSIB-DEEP-DIVE-METHODOLOGY-2026-05-08.html) and [tribunal-audit-error-rate-estimates.json](/data/tribunal-decisions/tribunal-audit-error-rate-estimates.json) for validation context.

**Authors:** Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot  
**Data Source:** CanLII ONWSIB decisions (2020-2026)  
**Last Updated:** May 8, 2026 (May 8 reconciliation rerun completed)

---

## Questions or Feedback?

**📧 Email:** empowrapp08162025@gmail.com  
**🐘 Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)  
**🦋 Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)
