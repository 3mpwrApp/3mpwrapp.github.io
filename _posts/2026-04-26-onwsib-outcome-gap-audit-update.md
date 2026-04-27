---
layout: post
title: "ONWSIB 2020-2026: Outcome Gap Audit and Evidence Limits"
subtitle: "431 decisions collected quickly, but full-text and disposition fields remain mostly unresolved"
date: 2026-04-26
author: Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot
categories: community-updates
tags: [onwsib, data-quality, outcome-gap, audit-ci, research, workers-compensation]
toc: true
---

# ONWSIB Outcome Gap Update (2020-2026)

This report documents what was collected, what can be classified, and what remains unresolved.

## What Is ONWSIB?

The **Ontario Workplace Safety and Insurance Board (WSIB)** is the agency that decides initial workers' compensation claims. ONWSIB is their internal review/reconsideration process before cases go to WSIAT (the independent appeal tribunal).

**Key Difference:** ONWSIB is not an independent tribunal—it's WSIB reviewing its own decisions. This is often where workers first challenge benefit denials or coverage gaps.

## Dataset Overview

**431 ONWSIB decisions (2020-2026)** collected from CanLII public records.

**Important Context:** ONWSIB has far fewer public decisions than WSIAT (431 vs 11,430) because:
1. Most internal WSIB reviews don't get published to CanLII
2. Many workers skip ONWSIB and go directly to WSIAT appeals
3. WSIB may not publish all reconsideration decisions publicly

## What Was Verified

ONWSIB records collected by year:

| Year | Cases |
|------|-------|
| 2020 | 0 |
| 2021 | 28 |
| 2022 | 149 |
| 2023 | 120 |
| 2024 | 73 |
| 2025 | 61 |
| 2026 | 0 |
| **Total** | **431** |

**Peak:** 2022 (149 cases)  
**Trend:** Declining from 149 (2022) → 61 (2025)

## Top Issues in ONWSIB Cases (Keyword Analysis)

| Issue | Cases | % of Dataset |
|-------|-------|--------------|
| Worker-related | 345 | 80.0% |
| Work-related injury | 52 | 12.1% |
| Employer obligations/disputes | 50 | 11.6% |
| Pre-existing condition arguments | 29 | 6.7% |
| Pain-related cases | 24 | 5.6% |
| **Specific Injuries:** | | |
| → Knee | 21 | 4.9% |
| → Shoulder | 18 | 4.2% |
| → Neck | 13 | 3.0% |
| → Ankle | 11 | 2.6% |
| → Wrist | 8 | 1.9% |
| → Hip | 8 | 1.9% |
| **Mental Health:** | | |
| → Psychological injury | 10 | 2.3% |
| → Psychotraumatic disability | 9 | 2.1% |
| → Mental stress injury | 7 | 1.6% |
| **Employment Issues:** | | |
| → Return to work | 15 | 3.5% |
| → Re-employment obligation | 7 | 1.6% |
| → Modified duties | 8 | 1.9% |

**Key Findings:**
- **Pre-existing condition arguments appear in 6.7% of ONWSIB cases** (29 cases)—much lower than WSIAT's 13.3%, but still significant for a small dataset.
- **Knee and shoulder injuries dominate** musculoskeletal cases (4.9% and 4.2%).
- **Mental health injuries appear in ~6% of cases** combined (psychological, psychotraumatic, mental stress).
- **Re-employment obligation disputes** show up in 1.6% of cases—these are battles over whether employers followed the law in bringing injured workers back.

## Tiered Outcome Classification Snapshot

From 431 ONWSIB records:

- **Tier A (confirmed):** 1 (0.2%) — only ONE case has explicit confirmed outcome language
- **Tier B (probable):** 19 (4.4%) — keyword-based inference only
- **Tier C (unresolved):** 411 (95.4%) — **the vast majority remain unclassified**

### Confirmed/Probable Outcome Breakdown

**Tier A (1 case):**
- Other: 1 (procedural outcome, not a merits decision)

**Tier B (19 cases - probable only):**
- **Granted: 17** (89.5% of Tier B)
- **Denied: 2** (10.5% of Tier B)

**Total Classified (Tier A + B): 20 cases**
- Granted: 17 (85.0% of classified)
- Denied: 2 (10.0%)
- Other: 1 (5.0%)

**What This Means:**
- Of the tiny 4.6% of ONWSIB cases we can classify, **17 out of 19 with merits outcomes are probable grants**.
- This suggests workers who successfully get WSIB to reconsider often win at this stage.
- **HOWEVER:** The 95.4% unresolved rate means we have **no idea** what happens in the overwhelming majority of ONWSIB reconsiderations.

## The Evidence Gap Crisis

**95.4% unresolved** is the highest unresolved rate of all four Ontario tribunals analyzed:
- HRTO: 50.2% unresolved
- ONSBT: 72.9% unresolved
- WSIAT: 94.3% unresolved
- **ONWSIB: 95.4% unresolved** ← worst

**Why is ONWSIB data so incomplete?**
1. CanLII may only publish a tiny fraction of ONWSIB internal reviews
2. WSIB may not be required to publish all reconsiderations
3. Keyword metadata from CanLII lacks disposition phrases for internal reviews
4. Most workers may skip ONWSIB and go straight to WSIAT appeals

## Cross-Issue Analysis

Using issue-slice data across all four Ontario tribunals:

### Pre-Existing Condition Cases at ONWSIB
- **31 cases** with pre-existing condition keywords (7.2% of ONWSIB dataset)
- **Tier A:** 0 cases
- **Tier B:** 1 case
- **Tier C:** 30 cases (96.8% unresolved)

**Comparison:** Pre-existing condition arguments are used in 13.3% of WSIAT cases (1,522 cases) but only 7.2% at ONWSIB. This may suggest WSIB filters out or resolves pre-existing arguments internally before they reach the appeals stage.

### Chronic Pain Cases at ONWSIB
- **4 cases** with chronic pain keywords (0.9% of ONWSIB dataset)
- All 4 are Tier C (unresolved)

**Comparison:** Chronic pain appears in 1.5% of WSIAT cases (172 cases) vs 0.9% at ONWSIB, suggesting chronic pain disputes may escalate to WSIAT rather than being resolved at the internal review stage.

## Audit Estimate (Sample-Pack Proxy)

Automated proxy audit from Tier B and Tier C sample packs:

- Tier B proxy error: 0.0% (95% CI: 0.0-16.8)
- Tier C missed-explicit proxy: 0.0% (95% CI: 0.0-3.1)

Tier B confidence band is wide due to small sample size.

## What This Means for Community Reporting

This dataset is useful for:
- Pattern discovery in keyword language (work-related injury, pre-existing conditions, employer obligations)
- Evidence-gap quantification (95.4% unresolved is a transparency crisis)
- Monitoring outcome-field completeness over time
- Injury type prevalence tracking (knee, shoulder, mental health trends)

This dataset is not yet sufficient for:
- Robust merits win-rate claims (only 20 classified cases)
- High-confidence causal explanations of denial dynamics
- System-wide success rate estimates

## What The Data Shows About ONWSIB

**Patterns in ONWSIB Internal Review Cases:**

1. **ONWSIB is WSIB reviewing itself—not an independent tribunal.** The agency structure means the same organization that made the initial decision is evaluating whether that decision was correct. WSIAT provides an independent alternative route.

2. **Limited but directional outcome data:** Of the 19 probable outcomes classified, 17 are grants (89.5%). With such a small sample, this cannot be generalized to all ONWSIB cases, but it suggests some reversals occur at this stage.

3. **Pre-existing condition arguments appear early:** 6.7% of ONWSIB cases cite pre-existing condition disputes. This is lower than WSIAT's 13.3% prevalence, suggesting some of these cases may be resolved at ONWSIB or escalate to WSIAT later.

4. **Knee and shoulder injuries dominate:** Musculoskeletal injuries account for the largest share of body-part-specific cases (knee: 4.9%, shoulder: 4.2%).

5. **Mental health claims appear in 6% of cases:** Psychological injury (2.3%), psychotraumatic disability (2.1%), and mental stress injury (1.6%) combine to represent a notable portion of the ONWSIB caseload.

6. **Re-employment obligation disputes:** 1.6% of cases involve disputes over whether employers met their legal obligations to accommodate or bring injured workers back to modified duties.

**Data Transparency Gap:** With 95.4% of ONWSIB outcomes unresolved in public records, outcome pattern analysis remains severely limited. Comparative research with WSIAT may provide better insight into the full workers' compensation appeal journey.

## Research Priority

The central ONWSIB issue is not speed of collection. It is **outcome completeness and unresolved-case volume**. The immediate accountability metric is reduction of Tier C from 95.4% to a materially lower share through:
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

---

**Methodology:** Tiered evidence classification framework with Wilson 95% confidence intervals. See [tribunal-audit-error-rate-estimates.json](/data/tribunal-decisions/tribunal-audit-error-rate-estimates.json) for statistical validation.

**Authors:** Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot  
**Data Source:** CanLII ONWSIB decisions (2020-2026)  
**Last Updated:** April 26, 2026
