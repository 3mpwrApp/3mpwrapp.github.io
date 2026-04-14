# Engagement Tracking Workflow

**Purpose:** Track social media performance to feed the viral hooks analytics optimization engine and improve reach organically.

---

## Why Track Engagement?

With ~50 followers across all platforms, you need data to understand:
- Which hooks/content types resonate with your audience
- Optimal posting times for the disability community
- Which platforms are worth focusing on (data-driven prioritization)
- What content drives actual app signups vs. vanity metrics

The [`viral-hooks-analytics.js`](scripts/viral-hooks-analytics.js) script auto-rotates underperforming hooks every 30 days based on engagement data - but it needs manual input since platform APIs don't provide detailed analytics for free accounts.

---

## Weekly Manual Tracking (15-20 min/week)

**Schedule:** Every Sunday morning (or your preferred low-stress time)

**Steps:**

### 1. Gather Platform Analytics

Visit each platform's analytics dashboard and note basic metrics for the past week's posts:

#### **Mastodon** (@3mpwrApp@mastodon.social)
- Navigate to Settings → Preferences → Export and download → Analytics
- OR manually check each post for: **Boosts (shares)**, **Favorites (likes)**, **Replies**
- Note: Mastodon doesn't track impressions on free instances

#### **Bluesky** (3mpwrapp.bsky.social)
- Click on each post individually
- Record: **Likes**, **Reposts**, **Replies**, **Quote Posts**
- Bluesky does not expose impressions data yet

#### **X/Twitter** (once configured)
- Go to Twitter Analytics dashboard
- For each post note: **Impressions**, **Engagements**, **Link clicks**, **Likes**, **Retweets**, **Replies**

#### **Facebook** (if active)
- Page Insights → Posts
- Record: **Reach**, **Reactions**, **Shares**, **Comments**, **Link clicks**

### 2. Update `posting-results.json`

Open [`public/posting-results.json`](public/posting-results.json) and add entries for each post:

```json
{
  "date": "2026-04-14",
  "posts": [
    {
      "platform": "mastodon",
      "postUrl": "https://mastodon.social/@3mpwrApp/112345678",
      "hookUsed": "🚨 PSA: A free app built BY the disability community...",
      "contentType": "feature-spotlight",
      "featureName": "Crisis Resources",
      "timestamp": "2026-04-14T09:00:00Z",
      "metrics": {
        "boosts": 12,
        "favorites": 28,
        "replies": 4,
        "engagementRate": 0.044
      }
    },
    {
      "platform": "bluesky",
      "postUrl": "https://bsky.app/profile/3mpwrapp.bsky.social/post/abc123",
      "hookUsed": "Your phone now knows when you have energy. No, seriously.",
      "contentType": "feature-spotlight",
      "featureName": "Spoon Theory Tracking",
      "timestamp": "2026-04-14T15:00:00Z",
      "metrics": {
        "likes": 15,
        "reposts": 3,
        "replies": 2,
        "engagementRate": 0.020
      }
    }
  ],
  "weeklyTotals": {
    "totalPosts": 14,
    "totalEngagements": 156,
    "avgEngagementRate": 0.023,
    "topPerformingHook": "22 letter templates that have won accommodations...",
    "topPerformingPlatform": "mastodon",
    "bestPostingTime": "09:00-11:00 ET"
  }
}
```

**Engagement rate calculation:**
- **Mastodon:** `(boosts * 2 + favorites + replies * 3) / estimated_reach`
- **Bluesky:** `(reposts * 2 + likes + replies * 3) / follower_count`
- **X/Twitter:** `(engagements) / impressions`
- **Facebook:** `(reactions + comments * 3 + shares * 2) / reach`

### 3. Run Monthly Hook Optimization

**Schedule:** First Sunday of each month

Run the viral hooks analytics script to rotate underperformers:

```bash
cd d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main
node scripts/viral-hooks-analytics.js
```

This will:
- Calculate engagement rates for each hook used in the past 30 days
- Auto-rotate hooks with <50% of average engagement (weight reduced to 0.3-0.7)
- Promote hooks with >150% of average engagement (weight increased to 1.2-2.0)
- Update [`public/viral-hooks-analytics.json`](public/viral-hooks-analytics.json) with new weights

---

## Platform-Specific Tips

### **Mastodon Analytics Workaround**
Since Mastodon doesn't expose impressions, use follower count as proxy for reach:
- Reach estimate: `follower_count * 0.1` (10% delivery rate is conservative)
- For posts with boosts, add: `booster_follower_count * 0.05 per_boost`

### **Bluesky Manual Checking**
Bluesky's API doesn't yet provide post analytics, so manual checking is required:
- Click each post individually → note metrics
- Use browser DevTools to scrape if posting >20 times/week

### **X/Twitter CSV Export**
If you post frequently on X:
- Go to Twitter Analytics → Tweets tab
- Export to CSV (covers last 28 days)
- Parse CSV to auto-populate `posting-results.json`

---

## What To Look For (Data Insights)

### **High-Performing Patterns**
After 4-8 weeks of tracking, analyze:

1. **Hook Emotion Triggers**
   - Which emotions get highest engagement? (validation, empowerment, curiosity, urgency)
   - See [viral-hooks-config.js](scripts/viral-hooks-config.js) for categorized hooks

2. **Content Types**
   - Feature spotlights vs. tutorials vs. dev updates vs. community stories
   - Which drives engagement? Which drives clicks to the app?

3. **Posting Times**
   - Best time of day: Morning (7-11 AM ET) vs. Evening (6-9 PM ET)
   - Best day of week: Weekdays vs. weekends
   - Hypothesis: Disability community may have higher capacity mornings (Spoon Theory)

4. **Platform Performance**
   - Which platform has highest engagement rate?
   - Which drives most app signups? (track via UTM parameters if possible)
   - Should you focus 80% effort on top performer?

### **Red Flags (What's Not Working)**
- Engagement rate <1% across all platforms → content/hook mismatch
- Zero link clicks → CTA weak or content not compelling
- High impressions, low engagement → hook works, content doesn't deliver
- Same hook used 3+ times with declining performance → audience fatigue

---

## Automation Opportunities (Future)

**Current:** Manual weekly tracking (15-20 min)

**Future automation options:**
1. **Mastodon API Integration** - Auto-fetch metrics for posted statuses
2. **Bluesky AppView Stats** - Once API supports it, auto-fetch engagement
3. **Google Sheets Integration** - Weekly cron job populates spreadsheet for review
4. **Analytics Dashboard** - [`social-analytics-dashboard.md`](scripts/social-analytics-dashboard.md) generation

**Blockers:** Most platforms don't provide detailed analytics via free-tier APIs. Manual tracking is required for now.

---

## Files Reference

### **Input Files** (you update manually)
- [`public/posting-results.json`](public/posting-results.json) - Weekly post metrics
- [`public/feature-posting-results.json`](public/feature-posting-results.json) - Daily feature post tracking

### **Generated Files** (scripts update)
- [`public/viral-hooks-analytics.json`](public/viral-hooks-analytics.json) - Hook performance + rotation state
- [`public/social-performance.json`](public/social-performance.json) - Platform-level metrics
- [`_data/social-analytics-dashboard.md`](scripts/_data/social-analytics-dashboard.md) - Human-readable report

### **Scripts**
- [`scripts/viral-hooks-analytics.js`](scripts/viral-hooks-analytics.js) - Monthly optimization engine
- [`scripts/social-intelligence-engine.js`](scripts/social-intelligence-engine.js) - Master orchestrator
- [`scripts/hashtag-tracker.js`](scripts/hashtag-tracker.js) - #3mpwrApp mention tracking

---

## Quick Start Checklist

- [ ] Set calendar reminder: **Every Sunday at 10 AM** - "Review social media metrics"
- [ ] Bookmark platform analytics pages (Mastodon settings, Bluesky profile, X analytics)
- [ ] Create template row in `posting-results.json` for quick copy-paste
- [ ] Set monthly reminder: **First Sunday** - "Run viral-hooks-analytics.js script"
- [ ] After 30 days, compare week 1 vs. week 4 metrics → identify trends

---

## Expected Outcomes (30-90 days)

**30 days:**
- Baseline established: Know avg engagement rate per platform
- Identified 3-5 top-performing hooks (use more frequently)
- Identified 3-5 underperformers (auto-rotated out by script)
- Follower growth rate measured (target: 10-20 new/week with consistent posting + engagement)

**60 days:**
- Platform prioritization decision: Focus 80% effort on top 1-2 platforms
- Optimal posting time identified: Data shows when engagement peaks
- Content type preference clear: Features vs. tutorials vs. community stories

**90 days:**
- Sustainable growth loop: Know what works, doing more of it
- Engagement rate improving: >2% is good, >5% is excellent for disability community
- Hook library refined: 20-30 proven high performers rotating regularly

---

**Remember:** "What gets measured gets improved" - but only measure what matters (engagement → signups → community building → advocacy impact).
