# Blog Automation Testing Guide

## Quick Test Commands

### 1. Test Daily News Curator
```bash
node scripts/daily-curator.js
```
**Expected Output:**
- Creates `_posts/YYYY-MM-DD-daily-curation.md`
- Creates `_curation/YYYY-MM-DD-curation.md`
- Creates `public/curation-latest.json`
- Logs: "Feeds success: X, failed: Y, ranked: Z"

### 2. Test Daily Feature Generator
```bash
node scripts/daily-feature-generator.js
```
**Expected Output:**
- Creates `_posts/YYYY-MM-DD-feature-spotlight-[feature-name].md`
- Creates `public/daily-feature-social.json`
- Logs: "Daily feature article generated!"

### 3. Test Weekly Update Generator
```bash
node scripts/weekly-update-generator.js
```
**Expected Output:**
- Creates `_posts/YYYY-MM-DD-weekly-update-week-[NN].md`
- Creates `_whats_new/YYYY-MM-DD-week-[NN]-updates.md`
- Logs: "Weekly update generated successfully!"

### 4. Test Social Media Posting (Daily News)
```bash
# Set environment variables first
export MASTO_INSTANCE="mastodon.social"
export MASTO_TOKEN="your_token_here"
export BLUESKY_HANDLE="3mpwrapp.bsky.social"
export BLUESKY_PASSWORD="your_password_here"

node scripts/social-post.js
```
**Expected Output:**
- Reads `public/curation-latest.json`
- Posts to Mastodon & Bluesky
- Creates `public/posting-results.json`
- Logs: "Results: 2/2 platforms succeeded"

### 5. Test Daily Feature Social Posting
```bash
node scripts/post-daily-feature.js
```
**Expected Output:**
- Reads `public/daily-feature-social.json`
- Posts to Mastodon & Bluesky
- Creates `public/feature-posting-results.json`
- Logs: "POSTING SUMMARY: Mastodon ✅ Bluesky ✅"

---

## GitHub Actions Manual Testing

### Test Daily Curator Workflow
```bash
# Go to: https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/content-curator.yml
# Click "Run workflow" → "Run workflow"
```
**What it does:**
1. Runs `daily-curator.js`
2. Commits new posts to `_posts/` and `_curation/`
3. Waits 45 minutes for Cloudflare deployment
4. Verifies blog is accessible
5. Posts to Mastodon & Bluesky
6. Creates GitHub Actions summary

**Check these after run:**
- [ ] New post in `_posts/`
- [ ] Curation file in `_curation/`
- [ ] JSON output in `public/`
- [ ] Mastodon post live
- [ ] Bluesky post live
- [ ] Links work

### Test Daily Feature Workflow
```bash
# Go to: https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/daily-feature.yml
# Click "Run workflow" → "Run workflow"
```
**What it does:**
1. Runs `daily-feature-generator.js`
2. Commits new feature article to `_posts/`
3. Waits 45 minutes for Cloudflare deployment
4. Verifies blog is accessible
5. Posts to Mastodon & Bluesky
6. Creates GitHub Actions summary

**Check these after run:**
- [ ] New feature article in `_posts/`
- [ ] Social content in `public/daily-feature-social.json`
- [ ] Mastodon post live
- [ ] Bluesky post live
- [ ] Article link works

### Test Weekly Update Workflow
```bash
# Go to: https://github.com/3mpwrApp/3mpwrapp.github.io/actions/workflows/weekly-update.yml
# Click "Run workflow" → "Run workflow"
```
**What it does:**
1. Runs `weekly-update-generator.js`
2. Analyzes last 7 days of git commits
3. Creates weekly summary post
4. Commits to `_posts/` and `_whats_new/`

**Check these after run:**
- [ ] New weekly post in `_posts/`
- [ ] What's New entry in `_whats_new/`
- [ ] Post summarizes recent commits
- [ ] Categories organized properly

---

## Verify Blog Display

### Check Blog Sections
Visit: https://3mpwrapp.pages.dev/blog/

**Verify these sections exist:**
- [ ] 📰 Daily News Highlights
- [ ] ✨ Feature Spotlights
- [ ] 📅 Weekly Recaps
- [ ] 💬 Community Updates

**Check each section:**
- [ ] Section headers user-friendly
- [ ] Posts display correctly
- [ ] Tags filter properly
- [ ] Links work
- [ ] Dates formatted correctly

### Check Social Media Follow Box
- [ ] Mastodon link works
- [ ] Bluesky link works
- [ ] Posting schedule displayed
- [ ] Links open in new tab

---

## Verify Social Media Links

### Check Mastodon Posts
Visit: https://mastodon.social/@3mpwrapp

**For Daily News posts:**
- [ ] Link goes to: `https://3mpwrapp.pages.dev/blog/#curated-daily`
- [ ] Link works and scrolls to correct section
- [ ] Top stories listed
- [ ] Hashtags relevant

**For Feature posts:**
- [ ] Link goes to: `https://3mpwrapp.pages.dev/YYYY/MM/DD/feature-spotlight-[name]/`
- [ ] Link works and loads article
- [ ] Feature description clear
- [ ] Hashtags relevant

### Check Bluesky Posts
Visit: https://bsky.app/profile/3mpwrapp.bsky.social

**For Daily News posts:**
- [ ] Link goes to: `https://3mpwrapp.pages.dev/blog/#curated-daily`
- [ ] Link works and scrolls to correct section
- [ ] Top stories listed (max 2)
- [ ] Character limit respected (< 300)

**For Feature posts:**
- [ ] Link goes to article page
- [ ] Link works and loads article
- [ ] Feature description clear
- [ ] Character limit respected (< 300)

---

## Troubleshooting

### Issue: Posts not generating
**Solution:**
1. Check GitHub Actions logs
2. Verify no workflow errors
3. Check if RSS feeds are accessible
4. Verify environment variables set

### Issue: Social media posts failing
**Solution:**
1. Verify API credentials in GitHub Secrets:
   - `MASTO_INSTANCE`
   - `MASTO_TOKEN`
   - `BLUESKY_HANDLE`
   - `BLUESKY_PASSWORD`
2. Check posting results in `public/posting-results.json`
3. Review GitHub Actions logs for errors

### Issue: Links not working
**Solution:**
1. Verify site deployed to Cloudflare Pages
2. Check Jekyll permalink format
3. Verify `_config.yml` has correct `url`
4. Check post frontmatter has correct `date`

### Issue: Deployment taking too long
**Solution:**
1. Check Cloudflare Pages dashboard
2. Increase wait time in workflows (currently 45 min)
3. Add manual deployment trigger

### Issue: Blog sections empty
**Solution:**
1. Check posts have correct tags:
   - Daily News: `tags: [highlights]`
   - Features: `tags: [features, spotlight]`
   - Weekly: `tags: [weekly, updates]`
2. Verify Jekyll is processing tags correctly
3. Check `blog/index.md` Liquid filters

---

## Automated Posting Schedule

### Daily at 9:00 AM UTC
**Workflow:** `content-curator.yml`
**Action:** Daily News Curator
**Output:** `_posts/YYYY-MM-DD-daily-curation.md`
**Social:** Mastodon + Bluesky
**Link:** `https://3mpwrapp.pages.dev/blog/#curated-daily`

### Daily at 10:00 AM UTC
**Workflow:** `daily-feature.yml`
**Action:** Daily Feature Article
**Output:** `_posts/YYYY-MM-DD-feature-spotlight-[name].md`
**Social:** Mastodon + Bluesky
**Link:** `https://3mpwrapp.pages.dev/YYYY/MM/DD/feature-spotlight-[name]/`

### Monday at 9:00 AM UTC
**Workflow:** `weekly-update.yml`
**Action:** Weekly Update
**Output:** `_posts/YYYY-MM-DD-weekly-update-week-[NN].md`
**Social:** None (manual if needed)
**Link:** `https://3mpwrapp.pages.dev/YYYY/MM/DD/weekly-update-week-[NN]/`

---

## Success Criteria Checklist

### Content Generation ✅
- [x] Daily news posts created automatically
- [x] Daily feature articles created automatically
- [x] Weekly updates created automatically
- [x] All posts have correct frontmatter
- [x] Posts categorized with proper tags

### Social Media Posting ✅
- [ ] Mastodon posts successfully
- [ ] Bluesky posts successfully
- [ ] Links point to correct blog sections
- [ ] Posts wait for deployment
- [ ] Error handling works properly

### Blog Display ✅
- [x] All 4 sections have user-friendly names
- [x] Posts appear in correct sections
- [x] Tags filter correctly
- [x] Navigation links work
- [x] Social media follow box displayed

### User Experience ✅
- [x] Section names clear and descriptive
- [x] Posts easy to find
- [x] Links work consistently
- [x] Social media accounts easy to find
- [x] Posting schedule communicated

---

## Next Steps After Testing

1. **Monitor for 1 week:**
   - Check daily posts generate
   - Verify social posts go live
   - Confirm links work
   - Watch for errors

2. **Document any issues:**
   - GitHub Issues for bugs
   - Note patterns in failures
   - Track API rate limits

3. **Optimize if needed:**
   - Adjust posting times
   - Improve error messages
   - Add more verification steps

4. **Communicate to users:**
   - Announce social media schedule
   - Share blog organization
   - Promote follow links

---

## Emergency Manual Posting

If automation fails, post manually:

### Manual Mastodon Post
```
📰 Daily News Highlights - YYYY-MM-DD

[Brief summary]

Top stories on disability rights, accessibility & workers' comp from across Canada.

📰 Read all stories: https://3mpwrapp.pages.dev/blog/#curated-daily

#DisabilityRights #Accessibility #WorkersComp #Canada
```

### Manual Bluesky Post
```
📰 Daily News - YYYY-MM-DD

[Brief summary]

📰 All stories: https://3mpwrapp.pages.dev/blog/#curated-daily

#DisabilityRights #Accessibility
```

---

**Last Updated:** November 8, 2025
**Status:** Ready for testing
