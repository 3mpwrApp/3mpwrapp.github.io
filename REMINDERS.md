# 3mpwrApp Social Media Automation - Reminders

## 📅 Upcoming Tasks

### Week 2 Checkpoint (April 28, 2026)
**Task:** Analytics Review & Optimization

**Actions:**
1. **Check engagement metrics:**
   ```bash
   cat public/feature-posting-results.json
   cat public/queue-posting-results.json
   ```

2. **Review what's working:**
   - Which post types got most engagement?
   - Best posting times (if platforms provide data)?
   - Which features resonated most?

3. **Check automation health:**
   - GitHub Actions: any failed runs?
   - Queue status: posts publishing on schedule?
   - UTF-8 encoding: any character issues in posted content?

4. **Adjust if needed:**
   - Update posting times if better engagement found
   - Prioritize high-performing content types
   - Fix any automation issues

**Expected Metrics (2 weeks):**
- Posts published: 14 (1/day)
- Platforms: Bluesky, Mastodon, Discord
- Queue remaining: 46 posts

---

### Month 1 Refresh (May 14, 2026)
**Task:** Content Calendar Refresh & Expansion

**Actions:**
1. **Generate Month 2 content calendar:**
   - 60 more posts for next 60 days
   - Use analytics to inform content mix
   - Focus on what resonated in Month 1

2. **Expand feature library:**
   - Add new features as they're developed
   - Update CanLII database status (provinces added)
   - Reflect any beta tester feedback (factual only)

3. **Refresh social queue:**
   ```bash
   # Update month1-complete-calendar.md with Month 2 content
   # Or create month2-complete-calendar.md
   node scripts/social-queue-converter.js
   git add public/social-queue.json
   git commit -m "feat: Month 2 social queue (60 posts)"
   git push
   ```

4. **Review automation performance:**
   - Total posts: 30 (Month 1)
   - Follower growth: baseline → ?
   - Engagement rate trends
   - Any technical issues encountered

5. **Blog feature article rotation:**
   - Check feature rotation (53 features total)
   - Verify UTF-8 encoding still working
   - Review article quality and accuracy
   - Ensure factual content standards maintained

**Expected Status (1 month):**
- Posts published: 30 (Month 1 complete)
- New queue ready: 60 posts (Month 2)
- CanLII database: Ontario + ? provinces
- Beta testing: ? testers onboarded

---

## 🔔 Reminder System

**Method 1: GitHub Issues**
Create GitHub issues with due dates:
- Issue #1: "Week 2 Analytics Review" (due: 2026-04-28)
- Issue #2: "Month 1 Content Refresh" (due: 2026-05-14)

**Method 2: Calendar Events**
Add to your calendar:
- April 28, 2026: "3mpwrApp Analytics Review"
- May 14, 2026: "3mpwrApp Content Refresh"

**Method 3: Automated Reminder**
Create GitHub Actions workflow to open issue automatically:

```yaml
# .github/workflows/reminder-analytics.yml
name: Analytics Review Reminder
on:
  schedule:
    - cron: '0 9 28 4 *' # April 28, 9 AM
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create reminder issue
        run: gh issue create --title "Week 2: Analytics Review Due" --body "See REMINDERS.md for checklist"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📊 Analytics Tracking

### Current Setup
Check if analytics are activated:

```bash
# Check for analytics scripts
ls scripts/*analytics* scripts/*tracking*

# Check for analytics results
ls public/*analytics* public/*metrics* public/*engagement*

# Review posting results
cat public/feature-posting-results.json | tail -20
```

### Expected Analytics Files
- `public/feature-posting-results.json` - Multi-platform posting outcomes
- `public/queue-posting-results.json` - Queue processing history
- `public/engagement-metrics-manual.json` - Manual engagement tracking (if exists)

### Manual Analytics Collection (Week 2)
Since platforms don't auto-report, manually record:

**Bluesky:**
- Check each post for likes, reposts, replies
- Record in spreadsheet or JSON

**Mastodon:**
- Check notifications for boosts, favorites
- Note which posts got most engagement

**Discord:**
- Check #app-announcements reactions
- Track discussion thread activity

**Template JSON:**
```json
{
  "date": "2026-04-28",
  "posts_reviewed": 14,
  "bluesky": {
    "avg_likes": 0,
    "avg_reposts": 0,
    "top_post": "Post title with most engagement"
  },
  "mastodon": {
    "avg_favorites": 0,
    "avg_boosts": 0,
    "top_post": "Post title"
  },
  "insights": [
    "Feature spotlights perform better than...",
    "Tech details get more engagement than...",
    "Best time to post seems to be..."
  ]
}
```

---

## 🎯 Success Criteria

### Week 2 (April 28)
- ✅ 14 posts published successfully
- ✅ No automation failures
- ✅ UTF-8 characters displaying correctly
- ✅ First engagement data collected

### Month 1 (May 14)  
- ✅ 30 posts published (half of Month 1)
- ✅ Content calendar proven sustainable
- ✅ Analytics inform Month 2 strategy
- ✅ Any issues identified and resolved

---

**Created:** April 14, 2026  
**Next Review:** April 28, 2026 (Week 2)  
**Next Refresh:** May 14, 2026 (Month 1 Complete)
