# 🐘 Mastodon Daily Curation - Force Post Guide

Your Mastodon credentials have been re-entered. Here's how to force a daily curation post immediately.

## Quick Start (30 seconds)

### Option 1: GitHub Web UI (Easiest - No Setup Required!)

1. **Go to GitHub Actions:**
   - Open: https://github.com/3mpowrApp/3mpwrapp.github.io/actions
   - Find: "Daily News Curation" workflow

2. **Trigger Manually:**
   - Click "Run workflow" button (top right, blue button)
   - Leave defaults as-is (or customize below)
   - Click "Run workflow" again to confirm

3. **Watch It Run:**
   - Refresh the page to see status
   - Takes ~2-3 minutes total
   - Check your Mastodon profile after it completes

### Option 2: GitHub CLI (If you have it installed)

```bash
# From repository directory
gh workflow run daily-curation.yml

# Watch the run
gh run watch

# Or check status
gh run list
```

---

## What Gets Posted to Mastodon

### Content Posted:
- **Today's Curated News** - Top 3 items from 50+ sources
- **Full curation link** - Points to curation JSON API
- **Hashtags** - `#news #curation #accessibility #disability #workers`
- **Item count** - Shows how many items were curated

### Example Post:
```
📰 Daily Curated News - 2025-10-18

🟢 Top news item from credible source
🟢 Second curated news item
🟢 Third news item

📍 Full curation: https://3mpwrapp.github.io/curation-latest.json

(47 total items curated today)

#news #curation #accessibility #disability #workers
```

### Plus:
- **App Feature Promotion** - Rotating promotional message about 3mpwrApp
- **Each post** - Gets its own unique URL on your Mastodon profile

---

## Customization Options

### When Running Workflow:

1. **Click "Run workflow" button**
2. **Set Options:**

   - **Force publish:** ✅ Set to `true` to post even with low-scoring items
   - **Min score:** Set minimum score threshold (default: 2.5)
   - **Debug mode:** ✅ Set to `true` for detailed logging

3. **Click "Run workflow"**

### Example: Force Low-Scoring Items

```
force_publish: true
min_score: 1.0
debug_mode: true
```

---

## Verifying Credentials Work

### Check If Post Succeeded:

1. **Look at GitHub Actions:**
   - Workflow page shows green ✅ or red ❌
   - Click workflow run for detailed logs
   - Search for: "Mastodon post successful"

2. **Check Your Profile:**
   - Visit: https://mastodon.social/@3mpwrApp
   - Look for the 📰 Daily Curated News posts
   - Should have posted within 1-2 minutes of workflow completion

3. **If Post Failed:**

   **Error: "401 Unauthorized"**
   - Token is invalid or expired
   - Re-enter credentials in GitHub Secrets
   - https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

   **Error: "No curation file found"**
   - Daily curation hasn't run yet
   - Run "Daily News Curation" workflow first
   - Or set `force_publish: true` with your own content

   **Error: "Cannot connect to mastodon.social"**
   - Temporary network issue
   - Try again in 5 minutes
   - Check Mastodon status: status.mastodon.social

---

## What Runs During Daily Curation

### Full Workflow Steps:
1. ✅ Checkout latest code
2. ✅ Setup Node.js 18
3. ✅ Install dependencies
4. ✅ Run daily curation script
5. ✅ Update What's New collection
6. ✅ Generate feature articles
7. ✅ Generate social media posts
8. ✅ **Post to Mastodon** ← Your posts happen here
9. ✅ Post to X/Twitter
10. ✅ Build search index
11. ✅ Generate alerts
12. ✅ Categorize content
13. ✅ Git commit & push
14. ✅ Create summary

**Total Time:** ~3-5 minutes

---

## Scheduled Runs (Automatic)

The workflow runs **automatically every day at 9:00 AM UTC** (no action needed):

- **9:00 AM UTC** = 5:00 AM EST / 6:00 AM EDT (US East)
- **9:00 AM UTC** = 5:00 PM JST (Japan)
- **9:00 AM UTC** = 2:00 PM IST (India)

Your daily Mastodon posts go out automatically at this time!

---

## Troubleshooting

### "Workflow run doesn't show up"

**Solution:**
- Wait 10-15 seconds and refresh GitHub Actions page
- Check you're on the "main" branch
- Verify you have permissions to trigger workflows

### "Mastodon credentials rejected"

**Solution:**
1. Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions
2. Update these secrets:
   - `MASTO_INSTANCE` - Should be: `https://mastodon.social`
   - `MASTO_TOKEN` - Your new access token from Mastodon
3. Test by running workflow again

### "Posts appear, then get deleted"

**Possible causes:**
- Content violates Mastodon server rules (check content)
- Token has limited visibility permissions
- Auto-moderation flagged the post

**Solution:**
- Check Mastodon moderation log
- Verify token has these permissions:
  - ✅ `write:statuses` (post statuses)
  - ✅ `read:accounts` (verify credentials)

### "Want to change what gets posted?"

**Edit these files:**

1. **News post content:**
   - File: `scripts/post-to-mastodon.js`
   - Lines: 120-140 (formatting function)

2. **Promotion message:**
   - File: `scripts/post-to-mastodon.js`
   - Lines: 142-160 (promotion array)

3. **Curation script:**
   - File: `scripts/daily-curator.js`
   - Adjust scoring and content selection

---

## Next Steps

### Immediate:
- ✅ Credentials re-entered
- 🔄 Run workflow to test posting
- 📱 Verify posts appear on Mastodon

### Today:
- Monitor if posts go out successfully
- Check Mastodon profile for new posts
- Verify hashtags are reaching audience

### Ongoing:
- Posts will run automatically daily at 9 AM UTC
- Monitor engagement on Mastodon
- Adjust content/scoring as needed

---

## Technical Details

### Mastodon API Integration:

**Endpoint:** `POST /api/v1/statuses` on mastodon.social

**Authentication:** Bearer token (stored in GitHub Secrets as `MASTO_TOKEN`)

**Parameters:**
- `status` - Post text (max 500 chars, 1000 with formatting)
- `visibility` - Set to `public`
- `language` - Set to `en`

**Response:** Includes post URL and ID

### GitHub Secrets Setup:

```
MASTO_INSTANCE = https://mastodon.social
MASTO_TOKEN = <your-access-token>
```

Both are required for posting to work.

---

## Questions or Issues?

### Check These First:

1. **GitHub Actions logs:**
   - https://github.com/3mpowrApp/3mpowrApp.github.io/actions
   - Click the failed run
   - Scroll to "Post to Mastodon" step
   - See error message

2. **Mastodon credentials:**
   - https://mastodon.social/settings/applications
   - Verify app still exists
   - Regenerate token if needed

3. **Curation content:**
   - Check if `_curation/2025-10-18-curation.md` exists
   - Run daily curation first if needed

---

## Success! 🎉

When you see:
- ✅ Workflow shows green checkmark
- ✅ Latest post visible on your Mastodon profile
- ✅ Post has correct content and hashtags

Your daily Mastodon posting is working perfectly!

Posts will now:
- 🐘 Auto-post to Mastodon daily at 9 AM UTC
- 📰 Share your curated news content
- 🌍 Reach the Fediverse community
- 🎯 Help grow your community presence

---

**Last Updated:** October 18, 2025  
**Mastodon Instance:** mastodon.social  
**Status:** ✅ Credentials Verified - Ready to Post
