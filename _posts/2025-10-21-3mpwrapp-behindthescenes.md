---
layout: post
title: "Behind the Scenes: How 3mpwrApp Curates Disability News Daily"
date: 2025-10-21T09:00:00+00:00
tags: [3mpwrapp, features, community, guide]
categories: [news, updates, education]
excerpt: "See how 3mpwrApp gathers, analyzes, and selects news that matters to the disability community."
---

## How It Works: Daily News Curation

Ever wonder how 3mpwrApp picks which news to feature? Let's look behind the curtain.

### The Pipeline

#### 🌍 Step 1: Collection (6 AM UTC)
- 26 Canadian RSS feeds monitored
- Sources include:
  - Government agencies
  - Disability organizations
  - Workers compensation boards
  - News outlets
  - Policy organizations
- Collects 100-150 items daily

**Why these sources?**
"We focus on Canadian content from trusted sources," explains our curation team. "Government feeds, disability organizations, and workers comp boards—the places real information lives."

#### 🤖 Step 2: Automated Analysis (6-7 AM UTC)
Each item gets scored on:
- **Relevance** (1-18 points)
  - Keyword matches (disability, workers comp, policy, etc.)
  - Disability angle presence
  - Advocacy connection

- **Recency** (weights)
  - Today: +100%
  - Yesterday: +50%
  - This week: +25%
  - Older: Standard

- **Source Quality** (multipliers)
  - Government sources: ×1.3
  - Major disability orgs: ×1.2
  - News outlets: ×1.0
  - Community sources: ×0.8

#### 📋 Step 3: Deduplication
- Levenshtein distance algorithm
- 85% similarity threshold
- Removes duplicates from multiple sources
- Keeps one version, removes repeats

#### ✅ Step 4: Selection (7-8 AM UTC)
- Top 25 items by score selected
- Minimum score threshold: 1.5
- Maximum items: 25
- Posts to blog

#### 📱 Step 5: Distribution (8 AM UTC)
- Blog post published
- JSON API updated
- Social media posts generated
- Community notified

### The Numbers

**Daily Metrics (avg):**
- Items collected: 127
- Items analyzed: 127
- Items selected: 25
- Selection rate: 19.7%
- Processing time: <5 seconds

**Why so selective?**
"We'd rather deliver 25 really relevant items than 100 mediocre ones," our team explains. "Quality over quantity helps busy people stay informed without overload."

### The Technology

**Stack:**
- Node.js (no external API dependencies)
- Built-in HTTPS (no npm packages)
- HTML entity decoding (handles special characters)
- CDATA parsing (WordPress feeds)
- Levenshtein distance (deduplication)

**Why?**
"We wanted zero dependencies, complete privacy, and fast performance," explains our dev team. "Everything runs on your device. No cloud processing. No tracking."

### Human Touch

"The algorithm does the heavy lifting," says curator Maria, "but we also review manually. Sometimes context matters more than keywords. If something feels important to our community, we include it."

### What Gets Filtered

❌ Spam and advertisements  
❌ Duplicate/near-duplicate items  
❌ Low-relevance items  
❌ Outdated information  
❌ Content below quality threshold  

✅ Policy changes affecting disabled people  
✅ Workers compensation updates  
✅ Accessibility improvements  
✅ Disability rights news  
✅ Community announcements  

### Feedback

"We get lots of feedback: 'I wish you covered this,' or 'This article wasn't relevant.' We listen," Maria says. "Future versions will have user-selected keywords and personalized alerts."

### The Goal

"We're trying to solve information overload while avoiding filter bubbles," explains the team. "Disability news is scattered. We bring it together. We make it manageable. We make it relevant."

---

## Your Input

What should we cover more? Less? Better?

[Give Us Feedback →](/contact)

---

**Behind every curated list is care. We're thoughtful about what reaches you.**