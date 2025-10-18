# 🦋 Bluesky Auto-Post Setup Guide

Add automated Bluesky posting to your daily news curation! Posts to your Bluesky profile when daily curation runs.

## Quick Start (5 minutes)

### Step 1: Create App Password (Bluesky)

1. **Log into Bluesky:** https://bsky.app
2. **Go to Settings:**
   - Click your avatar (top right)
   - Click "Settings"
   - Find "App passwords" section

3. **Create New App Password:**
   - Click "Generate app password"
   - Name it: `3mpwrApp Daily Curator`
   - ⚠️ **IMPORTANT:** This is a special password, NOT your main password!
   - Copy the password (you'll only see it once)

### Step 2: Add GitHub Secrets

1. **Go to GitHub Repository Settings:**
   - https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

2. **Add Secret 1 - Bluesky Handle:**
   - **Name:** `BLUESKY_HANDLE`
   - **Value:** `3mpwrapp.bsky.social` (or your actual handle)
   - Click "Add secret"

3. **Add Secret 2 - App Password:**
   - **Name:** `BLUESKY_PASSWORD`
   - **Value:** (paste the app password from Bluesky)
   - Click "Add secret"

4. **Optional - Custom PDS:**
   - **Name:** `BLUESKY_PDS`
   - **Value:** `https://bsky.social` (or your PDS URL)
   - Click "Add secret"

### Step 3: Test Bluesky Posting

1. **Trigger Workflow:**
   - Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/actions
   - Click "Daily News Curation"
   - Click "Run workflow" (blue button)
   - Set `bluesky_thread` to `0` (single post) or `1` (thread)
   - Click "Run workflow"

2. **Watch Execution:**
   - Workflow takes ~3-5 minutes
   - Look for "Post to Bluesky" step
   - Should show green ✅

3. **Verify on Bluesky:**
   - Check your profile: https://bsky.app/profile/3mpwrapp.bsky.social
   - Look for 📰 Daily Curated News post
   - Should appear within 1-2 minutes of workflow completion

---

## What Gets Posted

### Single Post (Default):

```
📰 Daily Curated News - 2025-10-18

🟢 Top curated news item title
https://example.com/news

(47 items curated today)

#news #curation #accessibility
```

### Thread Format (If enabled):

**Post 1:** Intro + item count
```
📰 Daily Curated News - 2025-10-18

47 quality items from 50+ sources today:
```

**Posts 2-4:** Individual items
```
1. First curated news item
https://source.com/article

Description excerpt...
```

**Final Post:** Link to full curation
```
🔗 See full curation:
https://3mpwrapp.github.io/curation-latest.json

#news #curation #accessibility #disability #workers
```

---

## Customization

### Enable/Disable Thread Posts

**During Manual Trigger:**
- When running workflow manually
- Set `bluesky_thread` input:
  - `0` = Single post (default)
  - `1` = Post as thread (posts 3-5 items)

**Permanent Setting:**
- Edit workflow: `.github/workflows/daily-curation.yml`
- Find line: `BLUESKY_THREAD: ${{ github.event.inputs.bluesky_thread || '0' }}`
- Change `'0'` to `'1'` to default to threads

### Change Post Content

**Edit:** `scripts/post-to-bluesky.js`

**Function: `formatBlueskyContent` (lines 145-160)**
```javascript
function formatBlueskyContent(items) {
  // Customize text here
  let content = `📰 Daily Curated News - ${today}\n\n`;
  
  const topItem = items[0];
  content += `🟢 ${topItem.title}\n${topItem.url}`;
  
  // Add your custom text
  
  return content;
}
```

**Function: `formatBlueskyThread` (lines 163-190)**
- Customize thread post format
- Change number of items posted
- Modify hashtags or descriptions

---

## Scheduled Posting

### Automatic Daily Posts

The workflow runs **automatically every day at 9:00 AM UTC**:

- **9:00 AM UTC** = 5:00 AM EST / 6:00 AM EDT
- **9:00 AM UTC** = 5:00 PM JST (Japan)
- **9:00 AM UTC** = 2:00 PM IST (India)

Your Bluesky posts go out at this time automatically!

### Manual Posts

You can manually trigger posting anytime:
1. Go to GitHub Actions
2. Click "Daily News Curation"
3. Click "Run workflow"
4. Click "Run workflow" to confirm

---

## Troubleshooting

### "Bluesky posting optional - continuing"

**Cause:** One of these is missing:
- `BLUESKY_HANDLE` secret
- `BLUESKY_PASSWORD` secret

**Solution:**
1. Go to GitHub Secrets settings
2. Add both secrets (see Step 2 above)
3. Try again

### "401 - Unauthorized"

**Cause:** App password is invalid or expired

**Solution:**
1. Go to Bluesky: https://bsky.app/settings/app-passwords
2. Delete the old password
3. Create a new app password
4. Update `BLUESKY_PASSWORD` secret in GitHub
5. Try again

### "No items found in curation file"

**Cause:** Daily curation hasn't run yet or no items met score threshold

**Solution:**
1. Run "Daily News Curation" workflow first
2. Or set `force_publish: true` when triggering
3. Or check if curation file was created: `_curation/2025-10-18-curation.md`

### "Cannot connect to Bluesky PDS"

**Cause:** Network issue or wrong PDS URL

**Solution:**
1. Check Bluesky status: https://bsky.app/
2. Verify `BLUESKY_PDS` is correct (usually `https://bsky.social`)
3. Try again in 5 minutes

### "Content exceeds 300 bytes"

**Cause:** Post text is too long for Bluesky

**Solution:**
- Single post auto-truncates to 280 chars (handles this)
- Thread posts also auto-truncate
- Edit `formatBlueskyContent()` to use shorter text

### "Posts appear then disappear"

**Possible causes:**
- Content violates Bluesky server rules
- Spam detection triggered
- App password doesn't have correct permissions

**Solution:**
1. Check post manually on Bluesky
2. Verify app password has `write` permissions
3. Check Bluesky moderation status

---

## AT Protocol Technical Details

### Authentication Flow:

1. **Create Session:**
   - POST to `/xrpc/com.atproto.server.createSession`
   - Send: handle + app password
   - Receive: accessJwt + DID (Decentralized Identifier)

2. **Create Record (Post):**
   - POST to `/xrpc/com.atproto.repo.createRecord`
   - Send: post text + facets (links) + timestamp
   - Receive: URI + CID (Content Identifier)

3. **Verification:**
   - All posts include cryptographic verification
   - Can be verified via AT Protocol specs

### Bluesky Secrets Required:

```
BLUESKY_HANDLE = your-handle.bsky.social
BLUESKY_PASSWORD = app-password-only (NOT main password!)
BLUESKY_PDS = https://bsky.social (or custom PDS)
```

### Post Structure:

- **Max length:** 300 characters (UTF-8 bytes)
- **Facets:** Links are automatically detected and formatted
- **Visibility:** All posts are public
- **Language:** Automatically set to English

---

## GitHub Workflow Integration

### What Runs:

1. ✅ Daily curation runs (generates news items)
2. ✅ Items scored and filtered
3. ✅ Mastodon posts generated and sent
4. ✅ X/Twitter posts generated and sent
5. ✅ **Bluesky posts generated and sent** ← You are here
6. ✅ Search index built
7. ✅ Content categorized
8. ✅ All changes committed to git

### Timing:

- **Daily:** 9:00 AM UTC (automatic)
- **Manual:** Anytime via "Run workflow"
- **Total duration:** ~3-5 minutes per run

### Logs & Debugging:

**Check Workflow Logs:**
1. Go to Actions page
2. Click the workflow run
3. Click "Post to Bluesky" step
4. View detailed output

**Check Git Results:**
- Logs saved to: `public/bluesky-posting-results.json` (if enabled)
- Check workflow summary after run completes

---

## Fediverse Integration

### How Bluesky Fits In:

Your 3mpwrApp content now posts to:

| Platform | Status | Frequency |
|----------|--------|-----------|
| 🐘 Mastodon | ✅ Active | Daily 9 AM UTC |
| 🐦 X/Twitter | ✅ Active | Daily 9 AM UTC |
| 🦋 Bluesky | ✅ Active | Daily 9 AM UTC |
| 📱 Facebook | ⏳ Optional | Via Mastodon Bridge |
| 📸 Instagram | ⏳ Optional | Via Mastodon Bridge |
| 🌐 Website | ✅ Active | Real-time |

### Cross-Platform Reach:

- **Mastodon users** see posts immediately
- **Bluesky users** see posts immediately
- **X/Twitter users** see posts with scheduling
- **Fediverse network** can share content
- **Your website** stays as authoritative source

---

## Next Steps

### Immediate:
- ✅ Create app password on Bluesky
- ✅ Add GitHub Secrets
- 🔄 Test by running workflow manually
- 📱 Verify posts appear on Bluesky

### Today:
- Monitor first automatic post (tomorrow at 9 AM UTC)
- Check engagement/reach
- Adjust content if needed

### Ongoing:
- Posts post automatically every day
- Monitor Bluesky for engagement
- Adjust hashtags/content as needed
- Track cross-platform reach metrics

---

## Questions or Issues?

### Verify Setup:

1. **Check GitHub Secrets:**
   - https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions
   - Confirm `BLUESKY_HANDLE` exists
   - Confirm `BLUESKY_PASSWORD` exists

2. **Check Bluesky App Passwords:**
   - https://bsky.app/settings/app-passwords
   - Verify app password still exists
   - Create new one if needed

3. **Check Workflow Logs:**
   - Go to Actions
   - Click latest "Daily News Curation" run
   - Scroll to "Post to Bluesky" step
   - See error details

### Common Issues Resolved:

| Issue | Solution |
|-------|----------|
| Secrets not found | Add both `BLUESKY_HANDLE` + `BLUESKY_PASSWORD` |
| 401 Unauthorized | Create new app password, update secret |
| Posts truncated | Normal - Bluesky 300 char limit |
| No posts appearing | Check if curation ran first |
| Profile shows nothing | Wait 2-3 minutes after workflow |

---

## Success! 🎉

When you see:
- ✅ Workflow shows green checkmark
- ✅ "Post to Bluesky" step shows success
- ✅ Latest post visible on your Bluesky profile
- ✅ Post has curated content + links + hashtags

Your Bluesky automation is working perfectly!

Posts will now:
- 🦋 Auto-post to Bluesky daily at 9 AM UTC
- 📰 Share your curated news content
- 🌍 Reach the Bluesky community
- 🎯 Help grow your reach across platforms

---

**Last Updated:** October 18, 2025  
**Bluesky Handle:** 3mpwrapp.bsky.social  
**Mastodon Integration:** Yes (coordinated posting)  
**Status:** ✅ Ready to Post
