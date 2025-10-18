# 🎯 MANUAL SOCIAL MEDIA TEST GUIDE (Oct 23 - Before Launch)

**Purpose:** Manually verify all three social media platforms work correctly before Oct 24 production launch  
**Time Needed:** 15-20 minutes  
**Success Criteria:** At least one test post on each platform  

---

## ✅ Quick Test (5 minutes)

### Step 1: GitHub Actions Workflow Test

This is the easiest way to test all three platforms at once:

1. **Open GitHub Actions**
   - Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/actions
   - Select: "Daily News Curation" workflow (left sidebar)

2. **Trigger Workflow**
   - Click blue "Run workflow" button (top right)
   - Optional settings:
     - `force_publish: true` ← Set this to force a test post
     - `debug_mode: true` ← Set this to see detailed logs
   - Leave others as default
   - Click "Run workflow" (green button)

3. **Wait for Execution**
   - Workflow should take 2-3 minutes
   - You'll see workflow running in the list
   - Check logs by clicking on the workflow run

4. **Verify Posts (3-5 minutes after workflow completes)**

   **Mastodon** 🐘
   - Go to: https://mastodon.social/@3mpwrApp
   - Look for: New post at top of timeline
   - Should say: Something about "Daily Curation" with links

   **Bluesky** 🦋
   - Go to: https://bsky.app/profile/3mpwrapp.bsky.social
   - Look for: New post at top
   - Should say: Curated content with links

   **X (Twitter)** 𝕏
   - Go to: https://x.com/3mpowrapp0816 (or search @3mpowrapp0816)
   - Look for: New tweet at top
   - Should say: Daily curation content

---

## 📋 Detailed Platform-by-Platform Testing

### MASTODON TEST

**Location:** Mastodon web interface  
**Steps:**

1. Go to https://mastodon.social/@3mpwrApp
2. You should see posts from 3mpwrApp
3. Look for posts with:
   - ✅ Title like "Daily Curation" or "Top Stories"
   - ✅ Multiple links to articles
   - ✅ Hashtags (#accessibility, #disability, etc.)
   - ✅ Posted recently (within last hour if testing now)

4. Click on post to verify:
   - Links clickable
   - Content visible
   - Metadata showing (timestamp, likes, shares)

5. **Interactive Test** (if you have Mastodon account):
   - Click heart icon to favorite
   - Click boost icon to share
   - Post reply

**Expected Result:** ✅ Post visible, content readable, links functional

**Troubleshooting:**
- No posts showing? Check GitHub Actions logs for errors
- Post is old? Verify GitHub Actions ran recently
- Links broken? Check daily-curator.js scoring

---

### BLUESKY TEST

**Location:** Bluesky web interface  
**Steps:**

1. Go to https://bsky.app/profile/3mpwrapp.bsky.social
2. You should see posts from 3mpwrapp
3. Look for posts with:
   - ✅ Title like "Daily Curation" or similar
   - ✅ Links in content
   - ✅ Posted recently

4. Click on post to verify:
   - Post details visible
   - Links clickable
   - Timestamps showing

5. **Interactive Test** (if you have Bluesky account):
   - Click like button
   - Click repost
   - Post reply
   - Follow profile

**Expected Result:** ✅ Post visible, content readable, links functional

**Troubleshooting:**
- Post is old? Verify GitHub Actions bluesky step ran
- Content truncated? Bluesky has 300 character limit - normal
- Links not working? Check AT Protocol connection

---

### X (TWITTER) TEST

**Location:** X (formerly Twitter)  
**Steps:**

1. Go to https://x.com/3mpowrapp0816
   - OR search: @3mpowrapp0816
   - OR search: 3mpowrApp

2. You should see tweets from the account
3. Look for recent tweets with:
   - ✅ Links to articles
   - ✅ Hashtags (#accessibility, #disability, etc.)
   - ✅ Posted recently

4. Click on tweet to verify:
   - Tweet details visible
   - Links clickable
   - Engagement metrics showing (likes, retweets)

5. **Interactive Test** (if you have X account):
   - Like tweet
   - Retweet
   - Reply
   - View thread (if multi-tweet post)

**Expected Result:** ✅ Tweet visible, content readable, links functional

**Troubleshooting:**
- Old tweets only? Verify X posting step in workflow
- OAuth error in logs? Check X credentials in GitHub Secrets
- Tweet not posting? May be rate limit - try again in 15 minutes

---

## 🔍 Detailed Workflow Log Analysis

To see exactly what happened during the test:

1. **Open GitHub Actions Workflow**
   - Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/actions
   - Click on your recent "Daily News Curation" run

2. **Review Each Step**
   
   **Expected Outputs:**

   ```
   ✅ Checkout repository
   ✅ Setup Node.js
   ✅ Install dependencies
   ✅ Run daily curation
      Output: "Feeds success: X, failed: Y, ranked: Z..."
   ✅ Post to Mastodon
      Output: "Posted successfully" or "Already posted today"
   ✅ Post to Bluesky
      Output: "Posted successfully" or error details
   ✅ Post to X (Twitter)
      Output: "Posted successfully" or error details
   ✅ Commit and push changes
   ```

3. **If Any Step Failed**
   - Click on failed step to expand
   - Read error message
   - Check troubleshooting section below

---

## 🚨 Troubleshooting

### "Missing Mastodon Credentials"
**Problem:** MASTO_INSTANCE or MASTO_TOKEN not found  
**Solution:** 
1. Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions
2. Verify secrets exist and are spelled correctly
3. Re-enter if needed

### "HTTPS Error" or "Connection Refused"
**Problem:** Can't reach API endpoints  
**Solution:**
1. Check internet connection
2. Verify API endpoints are online
3. Try GitHub Actions run again in 5 minutes

### "Authentication Failed" or "401 Unauthorized"
**Problem:** Credentials are invalid or expired  
**Solution:**
1. For Mastodon: Regenerate access token on mastodon.social
2. For Bluesky: Verify password is current
3. For X: Check if tokens expired - regenerate if needed

### "No Items Met Minimum Score"
**Problem:** Daily curator found no articles worthy of posting  
**Solution:**
1. Use `force_publish: true` in GitHub Actions
2. Or lower `min_score` parameter (default: 2.5)
3. This is normal if few news items match criteria

### "Already Posted Today"
**Problem:** Workflow already ran and posted today  
**Solution:**
1. Use different parameters (force_publish, min_score)
2. Or wait until tomorrow (workflows run at 9 AM UTC daily)
3. This is expected behavior

---

## 📸 What You Should See - Screenshots

### Mastodon Success Example
```
[3mpwrApp Profile Image]
@3mpwrApp@mastodon.social
↓
Top Stories - Daily Curation

Here's today's top 3-5 curated stories:

1. [Story Title] link
2. [Story Title] link
3. [Story Title] link

#accessibility #disability #workers

🤍 ❤️ (heart) ↰ (bookmark) ⤴️ (share)
```

### Bluesky Success Example
```
[3mpwrapp Profile Image]
@3mpwrapp.bsky.social
↓
Daily Curation Update

Top 3 stories from our curation:
- Story 1: link
- Story 2: link
- Story 3: link

❤️ ↰ (repost) ⤴️ (share)
```

### X Success Example
```
[@3mpowrapp0816]
Top Stories Today 🗞️

Curated from 50+ sources:
• Article Title link
• Article Title link  
• Article Title link

#accessibility #disability

❤️ ↰ (retweet) 💬 (reply) ⤴️ (share)
```

---

## ✅ Post-Test Verification Checklist

After running the test, verify:

- [ ] At least one post visible on Mastodon
- [ ] At least one post visible on Bluesky
- [ ] At least one post visible on X
- [ ] All posts contain links
- [ ] All posts have timestamp
- [ ] Links in posts are clickable
- [ ] Posts are recent (within last 30 minutes)
- [ ] No error messages in workflow logs
- [ ] GitHub Actions workflow shows ✅

**If all boxes checked:** ✅ **READY FOR LAUNCH**

---

## 🎯 Test Timing Recommendations

### Test Schedule (Oct 23)

1. **Early Morning Test** (6:00 AM UTC)
   - Quick sanity check
   - Verify basic posting works

2. **Mid-Day Test** (12:00 PM UTC)
   - Full workflow test
   - Verify all platforms
   - Check logs for issues

3. **Final Pre-Launch Test** (2:00 PM UTC - 2 hours before launch)
   - Confirm everything still working
   - Final verification
   - GO/NO-GO decision

---

## 📝 Test Report Template

```markdown
# Social Media Platform Test - October 23, 2025

## Test Execution
- **Date:** Oct 23, 2025
- **Time:** HH:MM UTC
- **Tester:** [Name]
- **Workflow Run ID:** [ID from GitHub Actions]

## Platform Results

### Mastodon
- Post visible: ✅ YES / ❌ NO
- Post recent: ✅ YES / ❌ NO
- Links working: ✅ YES / ❌ NO
- Content readable: ✅ YES / ❌ NO
- **Status:** ✅ PASS / ❌ FAIL

### Bluesky
- Post visible: ✅ YES / ❌ NO
- Post recent: ✅ YES / ❌ NO
- Links working: ✅ YES / ❌ NO
- Content readable: ✅ YES / ❌ NO
- **Status:** ✅ PASS / ❌ FAIL

### X (Twitter)
- Post visible: ✅ YES / ❌ NO
- Post recent: ✅ YES / ❌ NO
- Links working: ✅ YES / ❌ NO
- Content readable: ✅ YES / ❌ NO
- **Status:** ✅ PASS / ❌ FAIL

## Overall Result
- **All Platforms Working:** ✅ YES / ❌ NO
- **Issues Found:** None / [List issues]
- **Recommendation:** ✅ GO FOR LAUNCH / ❌ HOLD FOR FIXES

## Sign-Off
- **Tested By:** ___________ Date: _______
- **Approved By:** ___________ Date: _______
```

---

## 🚀 Next Steps

### If All Tests Pass ✅
1. ✅ Social media systems are ready
2. ✅ Proceed to launch on Oct 24
3. ✅ Plan 24-hour monitoring

### If Any Tests Fail ❌
1. ❌ Review error logs in GitHub Actions
2. ❌ Check credentials in GitHub Secrets
3. ❌ Re-run test after fixing
4. ❌ If still failing, post issue in GitHub Issues
5. ❌ Contact development team for support

---

## 💬 Still Have Questions?

**Common Questions Answered:**

**Q: Why use GitHub Actions instead of running script locally?**  
A: GitHub Actions has the credentials in GitHub Secrets. Local environment doesn't have access to secrets for security.

**Q: Can I test individual platforms?**  
A: Yes - use the workflow parameters or modify the GitHub Actions workflow to run specific steps.

**Q: What if I see old posts from before today?**  
A: Normal - posts accumulate over time. Look for posts with today's date.

**Q: Can I manually post without GitHub Actions?**  
A: Only if you have the credentials. Ask the team for setup help.

**Q: When does it normally post?**  
A: Daily at 9:00 AM UTC automatically. Can be triggered manually via GitHub Actions.

---

*Document Created: October 18, 2025*  
*Use Case: Oct 23 Pre-Launch Testing*  
*Status: Ready for Production Testing*
