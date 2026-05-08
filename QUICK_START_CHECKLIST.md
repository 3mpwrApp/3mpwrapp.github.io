# 3mpwrApp Social Media Quick Start Checklist

**Current Status:** Beta testers just onboarding, ~50 followers, 100% organic strategy, 5-10 hrs/week available  
**Last Updated:** April 14, 2026  
**Estimated Time to Complete:** 2-3 hours (one-time setup)

---

## ✅ Phase 1: Test Technical Fixes (30 min)

### 1.1 Verify UTF-8 Encoding Fix
```powershell
# Test Bluesky posting with emoji content
cd d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main
node scripts/post-to-bluesky.js
```

**What to check:**
- [ ] Emojis render correctly (✨ not âœ¨)
- [ ] Em dashes render correctly (— not â€")
- [ ] Content truncates at word boundaries (no mid-word cuts)
- [ ] "... Read more: [URL]" suffix appears when truncated
- [ ] Total character count ≤ 300 for Bluesky

**If test fails:** Check browser console on posted content, verify `daily-feature-social.json` shows proper UTF-8

---

### 1.2 Verify Mastodon Truncation
```powershell
node scripts/post-to-mastodon.js
```

**What to check:**
- [ ] Posts ≤ 500 characters (no HTTP 422 errors in `posting-results.json`)
- [ ] Emojis render correctly
- [ ] Word boundary preservation working
- [ ] URL facets clickable

---

### 1.3 Check Results Files
```powershell
# View posting results
cat public/posting-results.json
cat public/feature-posting-results.json
```

**What to look for:**
- [ ] `"status": "success"` for all platforms
- [ ] No encoding errors in `postContent` field
- [ ] Character counts logged correctly

---

## 📅 Phase 2: Set Up Calendar & Reminders (15 min)

### 2.1 Daily Engagement Reminders
**Add to your calendar app:**

| Time | Task | Duration | Recurrence |
|------|------|----------|-----------|
| 7:30 AM | Morning community engagement | 15 min | Daily |
| 7:00 PM | Evening community engagement | 15 min | Daily |

**What you'll do:** 
- Search hashtags (#DisabilityRights #WSIB #ODSP #CPPDisability)
- Reply to 3-5 posts with value-add insights
- Follow 2-3 new advocates

---

### 2.2 Weekly Tasks
**Add to calendar:**

| Day | Time | Task | Duration |
|-----|------|------|----------|
| Sunday | 10:00 AM | Weekly metrics review | 15-20 min |
| Wednesday | 9:00 AM | Post "Wins Wednesday" content | 10 min |
| Friday | 3:00 PM | Weekly AMA thread | 30 min |
| Sunday | 11:00 AM | Influencer outreach (DM 1-2 people) | 30 min |

---

### 2.3 Monthly Tasks
**First Sunday of each month:**
- [ ] Hook performance analysis (run `node scripts/viral-hooks-analytics.js`)
- [ ] Review top 3 performing post types
- [ ] Adjust content strategy based on data

---

## 📝 Phase 3: Create Initial Content Queue (45 min)

### 3.1 Write "Wins Wednesday" Founder Story
**Use Template 4 (Early Stage) from CONTENT_OPTIMIZATION_TEMPLATES.md**

**Example based on your project:**
```
🎤 This Week's Win

Shipped offline-first Crisis Resources feature + fixed UTF-8 encoding bugs across entire blog.

Why it matters: 
• Mental health crises don't wait for Wi-Fi
• Emojis rendering correctly = accessible, human content

Every crisis line (provincial + national) works 100% offline. Zero login required.

Building tools for hard days: https://3mpwrapp.ca/features/crisis-resources

#BuildInPublic #DisabilityTech #MentalHealthSupport #AccessibilityFirst
```

**Action:** 
- [ ] Write your version (mention UTF-8 fix, smart truncation, beta tester onboarding)
- [ ] Save to `content-queue/wins-wednesday-week1.txt`
- [ ] Schedule for Wednesday 9 AM UTC

---

### 3.2 Write "Pro Tip" Post
**Use Template 6 from CONTENT_OPTIMIZATION_TEMPLATES.md**

**Example:**
```
💡 Pro Tip for WSIB Appeals:

Your objection must be filed within 6 months of the decision date—NOT 6 months from when you received the letter.

Miss this deadline = appeal automatically dismissed.

3mpwrApp's Benefits Tracker sends reminders 30 days before deadlines.

Never miss another one: https://3mpwrapp.ca/features/benefits-tracker

#WSIB #WorkersComp #Ontario #LegalTips
```

**Action:**
- [ ] Write 2-3 "Pro Tip" posts (WSIB, ODSP, CPP-D deadlines)
- [ ] Save to `content-queue/pro-tips/`
- [ ] Schedule 1 per week

---

### 3.3 Write Founder Personal Story
**Use Template 5 from CONTENT_OPTIMIZATION_TEMPLATES.md**

**Key elements:**
- Vulnerable personal moment (your WSIB/disability experience)
- System failure you experienced
- Why you built 3mpwrApp as solution
- Invitation to try app

**Action:**
- [ ] Write founder story (300-400 words max)
- [ ] Save to `content-queue/founder-story.txt`
- [ ] Schedule for high-traffic day (Tuesday or Thursday 10 AM UTC)

---

### 3.4 Create 5 Feature Spotlight Posts
**Use Template 1 (Problem → Solution) from CONTENT_OPTIMIZATION_TEMPLATES.md**

**Features to highlight:**
1. Evidence Locker (encryption, timestamping, offline access)
2. AI Case Interpreter (plain-language summaries)
3. Crisis Resources (offline-first, no login)
4. Spoon Theory Tracker (energy budgeting)
5. Benefits Tracker (deadline reminders)

**Action:**
- [ ] Write 5 feature posts using Template 1 format
- [ ] Save to `content-queue/features/`
- [ ] Schedule 1 per week (rotate with other content)

---

## 🎯 Phase 4: Start Community Engagement (30 min today, then 15 min 2x daily)

### 4.1 Create Target List (30 min one-time setup)
**Find 20 disability advocates to follow:**

**Where to search:**
- Mastodon: `#DisabilityRights #ActuallyAutistic #ChronicIllness #WSIB`
- Bluesky: Search same hashtags in Discover tab
- Discord: Join disability rights servers

**Criteria:**
- 100-10K followers (authentic engagement, not mega-influencers)
- Posts 3-5x per week (active but not spammy)
- Disability advocacy focus (lived experience preferred)
- Canadian content creators (bonus points for Ontario/BC)

**Action:**
- [ ] Find 10 advocates on Mastodon
- [ ] Find 10 advocates on Bluesky
- [ ] Save list to `target-advocates.md` with format:
  ```
  - @username (Platform) - 2.5K followers - Posts about ODSP advocacy
  - @username2 (Platform) - 850 followers - Chronic illness community organizer
  ```

---

### 4.2 First Daily Engagement Session (15 min)
**Do this TODAY at 7:30 AM or 7:00 PM:**

**Step 1: Search hashtags (3 min)**
- Mastodon: Search `#DisabilityRights` → Filter: Last 24 hours
- Bluesky: Discover tab → `#WSIB` or `#ODSP`

**Step 2: Reply to 3 posts (10 min)**
- Pick 3 posts that resonate
- Write thoughtful replies (2-3 sentences)
- Add value (insight, resource, validation)
- NO promotional content
- NO "check out my app" replies

**Example good reply:**
```
This is such an important point. I've seen so many injured workers miss WSIB deadlines because the decision date ≠ mail delivery date. 

The 6-month clock starts ticking whether you received the letter or not. It's a systemic access issue.
```

**Step 3: Follow 2 new people (2 min)**
- From your target list
- People whose posts you just replied to

**Action:**
- [ ] Complete first engagement session TODAY
- [ ] Log results: replied to __ posts, followed __ people
- [ ] Set recurring reminder for tomorrow

---

## 📊 Phase 5: Set Up Engagement Tracking (20 min)

### 5.1 Create Tracking Spreadsheet
**Manual tracking required (no API access for small accounts):**

**Create file:** `public/engagement-metrics-manual.json`

```json
{
  "trackingStartDate": "2026-04-14",
  "weeklySnapshots": [
    {
      "week": "2026-W16",
      "mastodon": {
        "followers": 25,
        "avgLikesPerPost": 0,
        "avgRepliesPerPost": 0,
        "avgBoostsPerPost": 0,
        "postsPublished": 0,
        "topPost": {
          "url": "",
          "likes": 0,
          "boosts": 0,
          "content": ""
        }
      },
      "bluesky": {
        "followers": 25,
        "avgLikesPerPost": 0,
        "avgRepliesPerPost": 0,
        "avgRepostsPerPost": 0,
        "postsPublished": 0,
        "topPost": {
          "url": "",
          "likes": 0,
          "reposts": 0,
          "content": ""
        }
      },
      "notes": "Baseline week - beta testers just onboarding, testing UTF-8 encoding fixes"
    }
  ],
  "goals": {
    "30day": {
      "totalFollowers": 200,
      "avgEngagementRate": 0.05,
      "userStoriesReceived": 3
    },
    "60day": {
      "totalFollowers": 500,
      "avgEngagementRate": 0.08,
      "userStoriesReceived": 10
    }
  }
}
```

**Action:**
- [ ] Create tracking file with current follower counts
- [ ] Add to Sunday calendar: "Update weekly metrics"
- [ ] Commit to git: `git add public/engagement-metrics-manual.json && git commit -m "feat: engagement tracking baseline"`

---

### 5.2 Sunday Metrics Review Process
**Every Sunday 10 AM (15-20 min):**

**Step 1: Collect platform metrics (10 min)**
- Mastodon: Profile → followers count, last 7 posts → avg likes/boosts
- Bluesky: Profile → followers count, last 7 posts → avg likes/reposts

**Step 2: Update JSON file (5 min)**
- Add new weekly snapshot
- Calculate averages manually (total likes ÷ post count)
- Note top-performing post of the week

**Step 3: Identify trends (5 min)**
- Which content type got most engagement?
- Which platform is growing faster?
- What time of day got most replies?

**Action:**
- [ ] Set Sunday 10 AM reminder
- [ ] Do first metrics review this Sunday

---

## 🚀 Phase 6: First Week Execution Plan

### Monday (Today)
- [x] Read this checklist
- [ ] Test UTF-8 encoding fixes (30 min)
- [ ] Create target advocate list (30 min)
- [ ] Write "Wins Wednesday" post (20 min)
- [ ] **Post 3 Flywheels introduction (2 PM UTC, 10 min) - PRIORITY!**
- [ ] First engagement session 7 PM (15 min)

### Tuesday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] Post founder personal story (10 AM - personalize draft from week1-content.md)
- [ ] Evening engagement (7 PM, 15 min)

### Wednesday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] Post "Wins Wednesday" content (9 AM UTC via automation)
- [ ] Post Pro Tip (WSIB deadline) at 2 PM (copy from week1-content.md)
- [ ] Evening engagement (7 PM, 15 min)

### Thursday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] Choose: Feature spotlight OR CanLII discovery post (10 AM - both drafted in week1-content.md)
- [ ] Evening engagement (7 PM, 15 min)

### Friday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] Post community question about CanLII prioritization (10 AM, 10 min)
- [ ] Evening engagement + reply to community question responses (7 PM, 20 min)

### Saturday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] Write Pro Tip (ODSP) OR Feature Tutorial post (20 min)
- [ ] Evening engagement (7 PM, 15 min)

### Sunday
- [ ] Morning engagement (7:30 AM, 15 min)
- [ ] **Weekly metrics review** (10 AM, 20 min)
- [ ] Post CanLII milestone celebration (11 AM, 10 min)
- [ ] Send 1-2 influencer DMs (11:30 AM, 30 min)
- [ ] Plan next week's content (30 min)

**Total time:** ~5.5 hours this week (within 5-10 hr budget)

**New focus:** Educational content (3 Flywheels, CanLII) instead of AMAs

---

## 📈 Success Metrics (30-Day Targets)

| Metric | Baseline (Today) | 30-Day Target | 60-Day Target |
|--------|------------------|---------------|---------------|
| Total followers (all platforms) | 50 | 200 | 500 |
| Avg engagement rate | Unknown | 5% | 8% |
| Posts per week | 5 (automated) | 12 (automated + manual) | 15 |
| Genuine conversations/week | 0 | 10 | 20 |
| Beta user stories received | 0 | 3 | 10 |
| Influencer partnerships | 0 | 2 | 5 |

---

## 🛠️ Tools & Resources Reference

**Posting Scripts:**
- `scripts/post-to-mastodon.js` - Mastodon posting (500 char limit, UTF-8 fixed)
- `scripts/post-to-bluesky.js` - Bluesky posting (300 char limit, smart truncation added)
- `scripts/post-daily-feature.js` - Daily feature automation
- `scripts/weekly-update-generator.js` - Weekly recap automation

**Content Templates:**
- `CONTENT_OPTIMIZATION_TEMPLATES.md` - 15+ post templates
- `scripts/viral-hooks-config.js` - 150+ categorized hooks

**Strategy Guides:**
- `COMMUNITY_ENGAGEMENT_STRATEGY.md` - Daily routine, influencer outreach
- `ENGAGEMENT_TRACKING_WORKFLOW.md` - Metrics collection process

**Data Files:**
- `public/posting-results.json` - Automated posting outcomes
- `public/engagement-metrics-manual.json` - Manual tracking (create this)
- `public/viral-hooks-analytics.json` - Hook performance data

---

## ❓ Troubleshooting

### "Posting script fails with encoding errors"
- Check `daily-feature-social.json` for garbled characters (âœ¨ instead of ✨)
- Verify all `fs.writeFile()` calls have `'utf-8'` parameter
- Files fixed: agent-curation-production.js, agent-blog-production.js, weekly-update-generator.js, post-daily-feature.js

### "Mastodon returns HTTP 422 (character limit exceeded)"
- Check `posting-results.json` for exact error
- Verify `smartTruncate()` function is being used in `post-to-mastodon.js` line 165
- Mastodon limit: 500 chars (script targets 480 for safety buffer)

### "Bluesky posts cut off mid-word"
- Check `formatBlueskyContent()` in `post-to-bluesky.js` is calling `smartTruncate()`
- Bluesky limit: 300 chars (script targets 280)
- Updated function includes emoji boundary detection + word preservation

### "No one is engaging with posts"
- Double-check you're posting in peak hours (8-11 AM, 6-9 PM local time)
- Are you using hashtags? (#DisabilityRights #WSIB #ODSP minimum)
- Are you engaging WITH others first? (reply before you post)
- Check viral hooks rotation (might be using low-performers)

---

## ✅ Completion Checklist

**Setup complete when:**
- [ ] UTF-8 encoding verified working (emojis render correctly)
- [ ] Smart truncation verified working (no character limit errors)
- [ ] Calendar reminders set (daily 7:30 AM + 7 PM, Sunday 10 AM)
- [ ] Target advocate list created (20 people)
- [ ] **3 Flywheels introduction posted (MONDAY - HIGH PRIORITY!)**
- [ ] Founder personal story personalized and ready
- [ ] First engagement session completed (replied to 3+ posts)
- [ ] Tracking file created (`engagement-metrics-manual.json`)
- [ ] Week 1 content queue prepared (8-9 posts ready)

**You're ready to start Week 1 execution plan! 🚀**

**New resources created:**
- 📚 **`content-queue/month1-complete-calendar.md`** - 60 posts for 30 days (18,000 words) ⭐ MAIN RESOURCE
- 📚 `content-queue/educational-content-ideas.md` - Content series for Flywheels + CanLII + Features
- 📋 `content-queue/week1-quick-reference.md` - Priority list + time budgets
- 📝 `content-queue/week1-content.md` - Week 1 posts drafted (revised without AMA)
- 🤝 `content-queue/target-advocates.md` - 20 advocates to engage with
- 📧 `content-queue/influencer-outreach-tracker.md` - DM templates + partnership tracking
- 🤖 `content-queue/AUTOMATION_INTEGRATION_GUIDE.md` - How to automate posting
- 📖 `content-queue/README.md` - Navigation guide for all content files

**Start here:** Open `content-queue/README.md` and choose your quick start path!
