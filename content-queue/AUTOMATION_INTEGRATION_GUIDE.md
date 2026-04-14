# Automation Integration Guide

**Goal:** Feed Month 1 content calendar into automated social media posting workflows

---

## Current Automation (Already Running)

✅ **content-curator.yml** - Daily news curation (2x per day: 9 AM + 9 PM UTC)  
✅ **weekly-update.yml** - Weekly recap (Mondays 9 AM UTC)  
✅ **trending-keywords.yml** - Keyword updates (every 6 hours)  
✅ **daily-feature.yml** - Daily feature spotlight (10 AM UTC)

**These continue running automatically.** No changes needed.

---

## New Content to Automate (Month 1 Calendar)

**60 manual posts** from `month1-complete-calendar.md`:
- 2 posts per day (avg)
- Mix of flywheels, website, features, community questions
- All drafted and ready to copy/paste

---

## Integration Options

### Option 1: Manual Posting (Recommended for Week 1-2)

**Why start manual:**
- Test engagement patterns
- Find optimal posting times for YOUR audience
- Ensure posts resonate before full automation
- Fix any personalization needed ([YEAR], [your story], etc.)

**How:**
1. Open `month1-complete-calendar.md`
2. Copy Day 1, Post 1A text
3. Post manually to Mastodon + Bluesky
4. Log engagement in `engagement-metrics-manual.json`
5. Repeat for Post 1B

**Time:** ~5-10 min per post (10-20 min/day for 2 posts)

---

### Option 2: Queue-Based Automation (Week 3-4)

**How it works:**
1. Create `public/social-queue.json` with all 60 posts
2. GitHub Action reads queue
3. Posts at scheduled times
4. Removes posted items from queue

**Setup:**

#### Step 1: Create Social Queue File

```json
{
  "queue": [
    {
      "id": 1,
      "scheduledDate": "2026-04-14",
      "scheduledTime": "14:00",
      "platforms": ["mastodon", "bluesky"],
      "content": "🔄 The 3 Flywheels of Change\n\nMost apps collect data and sell it.\n3mpwrApp turns lived experience into POWER...",
      "hashtags": ["DisabilityJustice", "DataForGood", "CollectiveAction", "BuildInPublic"],
      "visualAsset": "assets/images/flywheels-diagram.png",
      "link": "https://3mpwrapp.pages.dev/#flywheels",
      "posted": false
    },
    {
      "id": 2,
      "scheduledDate": "2026-04-14",
      "scheduledTime": "19:00",
      "platforms": ["mastodon", "bluesky"],
      "content": "📚 Everything You Need (100% Free)\n\nCrisis hotlines → ...",
      "hashtags": ["DisabilityRights", "FreeResources"],
      "link": "https://3mpwrapp.pages.dev/crisis-resources",
      "posted": false
    }
  ]
}
```

#### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/social-queue-poster.yml`:

```yaml
name: Social Queue Poster

on:
  schedule:
    # Check queue every hour
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  post-from-queue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Check and Post from Queue
        env:
          MASTODON_ACCESS_TOKEN: ${{ secrets.MASTODON_ACCESS_TOKEN }}
          MASTODON_INSTANCE: ${{ secrets.MASTODON_INSTANCE }}
          BLUESKY_IDENTIFIER: ${{ secrets.BLUESKY_IDENTIFIER }}
          BLUESKY_PASSWORD: ${{ secrets.BLUESKY_PASSWORD }}
        run: |
          node scripts/process-social-queue.js
      
      - name: Commit Updated Queue
        run: |
          git config user.name "Social Queue Bot"
          git config user.email "bot@3mpwrapp.pages.dev"
          git add public/social-queue.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update social queue (posted items)"
          git push
```

#### Step 3: Create Queue Processing Script

Create `scripts/process-social-queue.js`:

```javascript
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { postToMastodon } from './post-to-mastodon.js';
import { postToBluesky } from './post-to-bluesky.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = path.join(__dirname, '../public/social-queue.json');

async function processQueue() {
  try {
    const queueData = JSON.parse(await fs.readFile(QUEUE_FILE, 'utf-8'));
    const now = new Date();
    const currentDateTime = `${now.toISOString().split('T')[0]} ${now.toISOString().split('T')[1].substring(0, 5)}`;
    
    let updated = false;
    
    for (const item of queueData.queue) {
      const scheduledDateTime = `${item.scheduledDate} ${item.scheduledTime}`;
      
      // Check if it's time to post
      if (!item.posted && scheduledDateTime <= currentDateTime) {
        console.log(`Posting item ${item.id}: ${item.content.substring(0, 50)}...`);
        
        // Post to platforms
        if (item.platforms.includes('mastodon')) {
          await postToMastodon(item.content, item.link);
        }
        
        if (item.platforms.includes('bluesky')) {
          await postToBluesky(item.content, item.link);
        }
        
        // Mark as posted
        item.posted = true;
        item.postedAt = now.toISOString();
        updated = true;
      }
    }
    
    // Save updated queue
    if (updated) {
      await fs.writeFile(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf-8');
      console.log('Queue updated successfully');
    } else {
      console.log('No posts scheduled for this time');
    }
    
  } catch (error) {
    console.error('Error processing queue:', error);
    process.exit(1);
  }
}

processQueue();
```

---

### Option 3: Bulk Upload to Scheduling Tool (Easiest)

**Use existing social media scheduling tools:**

**Buffer (Free Plan):**
- Supports Mastodon + Bluesky
- Upload all 60 posts at once via CSV
- Set custom schedule
- Auto-posts for you

**Hootsuite:**
- Same capabilities
- Bulk upload via spreadsheet

**Steps:**
1. Export month1-complete-calendar.md posts to CSV:
   - Column A: Date
   - Column B: Time
   - Column C: Platform (Mastodon/Bluesky)
   - Column D: Content
   - Column E: Link
2. Upload CSV to Buffer/Hootsuite
3. Review schedule
4. Approve → Auto-posts

---

## Recommended Hybrid Approach (Best of All Options)

### Week 1 (April 14-20):
**Manual posting**
- Test engagement
- Find optimal times
- Personalize content
- Log metrics

### Week 2 (April 21-27):
**Semi-automated**
- Create `social-queue.json` for Week 2 posts
- GitHub Action posts automatically
- You monitor + respond to engagement

### Week 3-4 (April 28 - May 11):
**Fully automated**
- All posts in queue
- Auto-posting via GitHub Actions
- You focus on engagement (replies, DMs)

---

## Converting Month 1 Calendar to JSON Queue

I can create a script to convert `month1-complete-calendar.md` → `social-queue.json`:

**Script:** `scripts/generate-social-queue.js`

```javascript
// Parses month1-complete-calendar.md
// Extracts all posts
// Outputs social-queue.json with scheduling data
// Run: node scripts/generate-social-queue.js
```

**Want me to create this script?** It would save hours of manual JSON creation.

---

## Monitoring Automation

### Daily Checks (5 min):
- [ ] Posts published on schedule?
- [ ] No errors in GitHub Actions logs?
- [ ] Engagement metrics tracked?

### Weekly Review (20 min):
- [ ] Which posts performed best?
- [ ] Any automation failures?
- [ ] Adjust queue for next week?

---

## Failsafe: Automated + Manual Hybrid

**Best practice:**
- Automate 80% of posts (educational, website, features)
- Manually post 20% (community questions, responses to current events)

**Why:**
- Automation handles consistency
- Manual posting handles zeitgeist moments
- You stay human, not robotic

**Example:**
- Monday 10 AM: Automated (3 Flywheels post)
- Monday 3 PM: Manual (response to trending #DisabilityRights topic)
- Tuesday 10 AM: Automated (Founder story)
- Tuesday 3 PM: Manual (reply to beta tester feedback)

---

## Tools You Already Have

✅ **post-to-mastodon.js** - Ready to use  
✅ **post-to-bluesky.js** - Ready to use (with smart truncate!)  
✅ **GitHub Actions secrets** - Already configured  
✅ **UTF-8 encoding** - Fixed (all posts render correctly)  
✅ **Smart truncation** - No more character limit errors  

**You're 90% there!** Just need to choose automation level.

---

## Next Step Decision Tree

**Ask yourself:**

### Do you want full control?
→ **Manual posting** (Option 1)
→ Time: 10-20 min/day
→ Max flexibility

### Do you want consistency without daily work?
→ **Queue automation** (Option 2)
→ Time: 2 hrs setup, then 5 min/day monitoring
→ Best long-term solution

### Do you want to use existing tools?
→ **Buffer/Hootsuite** (Option 3)
→ Time: 1 hr setup, then zero maintenance
→ Easiest for non-technical users

---

**My recommendation:** Start with Option 1 (manual) for Week 1, then graduate to Option 2 (queue automation) for Weeks 2-4.

**Want me to:**
1. Create the `generate-social-queue.js` script?
2. Create the `social-queue-poster.yml` workflow?
3. Convert all 60 posts to JSON queue format?

Let me know what you need!
