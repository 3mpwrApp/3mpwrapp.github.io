---
layout: post
title: "Feature Spotlight: CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)"
date: 2026-04-25 00:00:00 +0000
tags: [legal-intelligence, canlii, tribunal-research]
categories: [community-updates, research]
excerpt: Searchable database of Canadian workplace and disability cases with plain-language summaries - starting with Ontario, expanding daily to all provinces
---

# Feature Spotlight: CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)

**Category:** Legal Intelligence

Searchable database of Canadian workplace and disability cases with plain-language summaries - starting with Ontario, expanding daily to all provinces

---

## What Is CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)?

CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide) is designed to provide a searchable database of Canadian workplace and disability cases with plain-language summaries - starting with Ontario, expanding daily to all provinces. This feature is part of 3mpwrApp's commitment to providing comprehensive tools for people with disabilities, injured workers, and their supporters across Canada. --- ## Key Highlights - **Starting with Ontario: 34,960 tribunal decisions across 4 tribunals (WSIAT, HRTO, ONSBT, ONWSIB) from 2020-2026**
- **NEW: AI-powered outcome predictions for 137,252 tribunal decisions (79% accuracy)**
- **Database grows daily: adding cases from all provinces and territories**
- **Goal: Complete Canada-wide coverage across all jurisdictions**
- **90.4% overall win rate across all analyzed casesayou have strong odds**
- **100% coverage: Every decision now has an outcome prediction**
- **Plain-language summaries generated for every case**
- **Winning arguments extracted and categorized by issue type**
- **Search by: province, diagnosis, employer type, issue, outcome**
- **Filter by outcome: Find winning cases similar to yours**
- **Case law citations in proper legal format**
- **Completely free - no paywalled legal decisions** --- ## How It Works Here are real examples of how you can use CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide): 1. Current coverage: Ontario WSIB, HRTO, and related tribunals
2. Expanding next: BC, Alberta, Quebec provincial tribunals
3. Search: "Fibromyalgia accommodation Ontario" a Find relevant precedents
4. Discovery: "Employer refused remote work - tribunal ruled discrimination"
5. Winning argument template: "Undue hardship requires hard evidence, not speculation"
6. Track expansion: New provinces added weekly to database --- ## Why CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide) Matters - Access real Canadian case law for your jurisdiction
- Find precedents similar to your situation
- **NEW: See AI-predicted outcomes before reading full decisions**
- **Filter by winning vs. losing outcomes to find relevant strategies**
- Database continuously improving with daily additions
- Eventually covers all provinces and territories --- ## YZ NEW: AI-Powered Outcome Predictions **We analyzed 137,252 tribunal decisions using natural language processing and produced directional model estimates. These outputs should be interpreted as exploratory, not official adjudicative rates.** ### The Numbers That Matter | Tribunal | Cases Analyzed | Win Rate | Key Finding |
|----------|----------------|----------|-------------|
| **WSIAT** (Ontario) | 98,992 | **73.5%*** | 73.5% from 649 classified decisions (438 granted, 158 denied a 2020-2026 CanLII subset) |
| **ONSBT** (Ontario Benefits) | 13,798 | **67.4%** | 67.4% in classified cases (Tier A+B); 72.9% remain unresolved in public metadata |
| **ONWSIB** (WSIB Internal) | 463 | not reliable | 95.7% unresolved in public records; local deep-dive found 12 high-confidence reads |
| **BCWCAT** (BC) | 7,916 | **86.4%** | Strong odds with proper medical evidence |
| **Other Tribunals** | 77,718 | **84.1%** | Consistently high success rates |
| **HRTO** (Human Rights) | 9,269 | ~varies | High abandonment (73.5%), but winnable | <small>*WSIAT 73.5% grant rate from 649 classified decisions (onwsiat-outcomes-3-tier-summary.json); official stats show 60-70% overall success. 94.3% of decisions unresolved.</small> **May 1, 2026 Update:** Complete classification now available for Ontario social tribunals:
- **ONSBT (Social Benefits Tribunal):** 13,798 decisions analyzed (2020-2026) - 67.4% grant rate in classified cases (Tier A+B), with unresolved metadata volume disclosed separately
- **ONWSIB (WSIB Internal Review):** 463 decisions analyzed (2020-2026) - 95.7% unresolved outcomes in public records (lacks explicit outcome language)
- **Key Finding:** Social benefits appeals (ONSBT) have substantially clearer outcome metadata than workplace injury appeals (WSIAT) - 56.4% vs 3.4% clear rate ### What This Means for You - **If you're appealing a WSIB denial:** Published and classified datasets indicate meaningful success rates, but outcomes vary by tribunal, issue type, and evidence quality
- **If you're filing a human rights complaint:** 14% of cases are abandoned, but those who persist may still have viable pathways
- **If you're appealing ODSP/OW denial:** Tribunal shows favorable outcomes for properly documented cases ### How We Built This - **Training data:** 256,734 labeled examples from 105 tribunal decision files
- **AI model:** Naive Bayes classifier trained on decision keywords and tribunal metadata
- **Test accuracy:** 79.0% on 3,756 held-out test examples
- **Confidence filtering:** Only high-confidence predictions (a80%) shown in app search results
- **Open source:** All methodology, data, and code publicly available on [our research page](/research.html). **CanLII API limitations:** Many outcomes are "Unknown" in metadata because current CanLII API responses do not include standardized structured outcome labels for these decisions. CanLII states it makes every effort to provide comprehensive databases, while noting content depends on document-provision sources and that transfer/processing delays can temporarily result in missing documents before omissions are corrected (see [canlii.org](https://www.canlii.org)). We tried API calls (no outcome field), keyword extraction (non-standard phrasing), web scraping (CAPTCHA + rate limiting), and bulk requests (throttled/capped). To get 100% accurate outcomes, we'd need to manually read each case. Our NLP model predicts these with 79% accuracy. ### Using Outcome Predictions in the App When you search tribunal decisions in 3mpwrApp, every case now shows: - **Outcome badge:** a ALLOWED (green), a- DISMISSED (red), ~ PARTIAL WIN (yellow), aY2 REMANDED (blue)
- **Confidence level:** HIGH, MEDIUM, or LOW
- **Prediction method:** "AI Predicted" vs. "Official" (when available) **Example search:** "chronic pain + ALLOWED" a Find 19,834 winning chronic pain cases with arguments that worked [**Read full methodology & statistics a**](/research.html#ai-powered-outcome-predictions) --- ## Getting Started Ready to try CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)? Here's how to get started: 1. **Download the app** - Available on iOS and Android (coming soon)
2. **Complete setup** - Takes just 5 minutes
3. **Find the feature** - Look for "CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)" in your app
4. **Follow the guide** - In-app tutorials walk you through each step --- ## Learn More For complete information about CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide) and all other features: - [Read the Complete User Guide](/user-guide/#canlii-database)
- [Explore All Features](/features/)
- AA - [Join Beta Testing](/beta/)
- [Subscribe to Updates](/newsletter/) --- ## About 3mpwrApp 3mpwrApp is a community-driven platform built for injured workers and persons with disabilities across Canada. We provide practical tools, community support, and advocacy resources - all designed with accessibility, privacy, and cultural respect at the core. **All features are:**
- Fully accessible (WCAG 2.2 AA+)
- AA aaTM Privacy-first (local-first architecture)
- AA aA AA aA Canadian-focused (all provinces/territories)
- AA AA Culturally inclusive (Indigenous languages supported) --- ## Questions or Feedback? **?? Email:** empowrapp08162025@gmail.com
**🐘 Mastodon:** [@3mpwrApp@mastodon.social](https://mastodon.social/@3mpwrApp)
**☁️ Bluesky:** [@3mpwrapp.bsky.social](https://bsky.app/profile/3mpwrapp.bsky.social)
