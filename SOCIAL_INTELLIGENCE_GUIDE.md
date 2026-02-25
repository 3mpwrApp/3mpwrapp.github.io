# Social Intelligence Engine - Quick Start Guide

**Last Updated:** February 24, 2026

## Overview

The Social Intelligence Engine is an AI-powered system that automatically optimizes social media performance through:

1. **Hashtag Performance Tracking** - Identifies which hashtags drive engagement
2. **A/B Testing** - Tests hashtag combinations to find winners
3. **Content Quality Improvement** - Auto-applies agent recommendations
4. **Trend Integration** - Injects trending topics into content generation
5. **Performance Analytics** - Tracks what works, what doesn't

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Social Intelligence Engine                 │
│                  (social-intelligence-engine.js)             │
└────────────┬────────────────────────────────────────────────┘
             │
        ┌────┴─────┬─────────────┬─────────────────────┐
        │          │             │                     │
        ▼          ▼             ▼                     ▼
┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────────┐
│ Hashtag  │ │ Content  │ │   Agent     │ │  Trending        │
│Optimizer │ │ Feedback │ │  Feedback   │ │  Keywords        │
│          │ │   Loop   │ │   System    │ │  Tracker         │
└──────────┘ └──────────┘ └─────────────┘ └──────────────────┘
     │             │             │                    │
     ▼             ▼             ▼                    ▼
  Hashtag     Content       Actionable           Trending
Performance Improvements  Recommendations         Topics
   JSON          JSON           JSON               JSON
```

## Quick Start

### 1. Run Complete Pipeline

```bash
node scripts/social-intelligence-engine.js
```

This runs:
- Hashtag optimization
- Content feedback loop with auto-improvements
- Performance analytics
- Dashboard generation

### 2. Run Individual Components

**Hashtag Optimization Only:**
```bash
node scripts/hashtag-optimizer.js
```

**Content Feedback Loop Only:**
```bash
node scripts/content-feedback-loop.js
```

**Agent Feedback (prerequisite):**
```bash
node scripts/agent-feedback-system.js
```

### 3. Automated Runs via GitHub Actions

The system runs automatically:
- **Daily at 00:30 UTC** - Full social intelligence pipeline
- **Daily at 23:00 UTC** - Agent feedback system
- **Every 6 hours** - Trending keywords update
- **Daily at 06:00 UTC** - Hashtag tracker

## Data Files

### Input Files

| File | Purpose | Updated By |
|------|---------|------------|
| `public/hashtag-tracking.json` | Raw hashtag mention data | `hashtag-tracker.js` |
| `public/trending-topics.json` | Trending keywords with time decay | `curator-trending.js` |
| `public/social-trends.json` | Bluesky/Mastodon trending hashtags | `curator-social-trends.js` |
| `feedback/agent-feedback-*.json` | Agent content analysis | `agent-feedback-system.js` |

### Output Files

| File | Purpose | Used By |
|------|---------|---------|
| `public/hashtag-performance.json` | Hashtag engagement metrics | Dashboard, optimizer |
| `public/content-improvements.json` | Applied improvements log | Reporting |
| `public/social-performance.json` | Complete performance data | Dashboard |
| `_data/optimized-hashtags.json` | Top recommended hashtags | Blog production |
| `_data/social-analytics-dashboard.md` | Human-readable dashboard | Website |

## Key Features

### 1. Hashtag Optimization

**Input:** Historical hashtag usage + engagement metrics  
**Process:**
- Track which hashtags get clicks, shares, replies
- Test combinations via A/B testing
- Calculate engagement rate per hashtag
- Identify top performers vs. underperformers

**Output:**
```json
{
  "recommended": ["3mpwrApp", "DisabilityRights", "Accessibility"],
  "trending": ["ChronicIllness", "SpoonTheory"],
  "proven": ["3mpwrApp", "DisabilityJustice", "A11y"]
}
```

### 2. Content Feedback Loop

**Input:** Agent feedback reports (JSON)  
**Process:**
- Parse actionable recommendations
- Classify by confidence level (high/medium/low)
- Auto-apply high-confidence fixes (>80%)
- Generate manual guidance for medium-confidence

**Output:**
- Auto-added hashtags to posts without them
- Auto-added CTAs to posts missing calls-to-action
- Flagged low-quality content for expansion

### 3. Trend Integration

**Input:** Trending topics from social monitoring  
**Process:**
- Load current trending hashtags
- Inject trending context into blog prompts
- Prioritize content on viral topics

**Output:**
- Blog posts incorporate trending keywords
- Content aligned with community conversations

### 4. Performance Analytics

**Dashboard at:** `_data/social-analytics-dashboard.md`

Shows:
- Top 10 performing hashtags (engagement rate)
- Currently trending topics (mentions)
- Content improvement stats
- Actionable recommendations
- Priority alerts

## Integration Points

### Blog Production

`agent-blog-production.js` now:
1. Loads trending topics from `public/trending-topics.json`
2. Loads optimized hashtags from `_data/optimized-hashtags.json`
3. Injects trending context into AI prompts
4. Auto-applies optimized hashtags to frontmatter

**Before:**
```yaml
---
title: "My Blog Post"
tags: [blog, post]
---
```

**After:**
```yaml
---
title: "My Blog Post"
tags: [blog, post]
hashtags: "#3mpwrApp #DisabilityRights #Accessibility #ChronicIllness #A11y"
---
```

### Agent Feedback

`agent-feedback-system.js` now generates:
```json
{
  "actionableRecommendations": {
    "highPriority": [
      {
        "type": "hashtags",
        "action": "add-hashtags",
        "target": "2026-02-24-post.md",
        "issue": "No hashtags present",
        "confidence": 0.95
      }
    ]
  }
}
```

These are consumed by `content-feedback-loop.js` for auto-application.

## A/B Testing

Create hashtag A/B tests:

```javascript
const HashtagOptimizer = require('./scripts/hashtag-optimizer');
const optimizer = new HashtagOptimizer();

optimizer.createABTest(
  'Disability Rights Messaging',
  ['DisabilityRights', 'Accessibility', 'Inclusion'],
  ['DisabilityJustice', 'CripTheVote', 'NothingAboutUsWithoutUs']
);
```

Results saved in `public/hashtag-performance.json`.

## Metrics Tracked

### Hashtag Metrics
- Total uses
- Total reach (followers * posts)
- Total engagement (likes + shares + replies)
- Average engagement rate
- Best performing post
- Platform breakdown (X, Bluesky, Mastodon)

### Content Metrics
- Quality score (0-10)
- Engagement potential (high/medium/low)
- Issues identified
- Improvements applied
- Success rate

### Trend Metrics
- Keyword mentions over time
- Trending velocity (rate of change)
- Time decay factor
- Emerging topics

## Recommendations System

The engine generates 4 types of recommendations:

1. **Use Top Performers** (High Priority)
   - Action: Include these hashtags in next posts
   - Expected impact: High engagement

2. **Avoid Low Performers** (Medium Priority)
   - Action: Replace underperforming hashtags
   - Expected impact: Improved engagement

3. **Test Trending** (High Priority)
   - Action: Test trending hashtags in content
   - Expected impact: Increased reach

4. **Use Best Combo** (High Priority)
   - Action: Use proven hashtag combination
   - Expected impact: Quantified avg engagement

## Troubleshooting

### No trending data available

**Cause:** `public/trending-topics.json` doesn't exist  
**Fix:** Run `node scripts/curator-trending.js` first

### No hashtag performance data

**Cause:** No mentions tracked yet  
**Fix:** Run `node scripts/hashtag-tracker.js` to collect data

### Auto-apply fixes not working

**Cause:** Confidence threshold too high or no high-confidence issues  
**Check:** Review `feedback/agent-feedback-*.json` for `actionableRecommendations`

### Dashboard not generated

**Cause:** Missing dependencies or insufficient data  
**Fix:** Ensure all input files exist, run with `--verbose` flag

## Next Steps

1. **Monitor Dashboard:** Check `_data/social-analytics-dashboard.md` daily
2. **Review Recommendations:** Apply high-priority suggestions
3. **Track Performance:** Watch hashtag engagement over time
4. **Iterate:** Test new combinations, monitor results
5. **Expand:** Add more platforms, metrics, content types

## Support

For issues or questions:
- Review logs in `logs/feedback-loop/`
- Check GitHub Actions workflow runs
- Verify data file formats match schema

---

**Built with:** Node.js, Claude 3.5 Sonnet, GPT-4o  
**Maintained by:** 3mpwrApp Social Intelligence Bot
