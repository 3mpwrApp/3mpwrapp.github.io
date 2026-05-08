# 🚀 Blog Automation - Quick Reference

## ✅ What's Fixed

1. **Blog Links** - All social posts now link to: `https://3mpwrapp.ca/blog/#[section]`
2. **User-Friendly Names** - Section names now clear: "Daily News Highlights", "Feature Spotlights", etc.
3. **Deployment Verification** - Posts only sent after blog is confirmed live
4. **Better Social Content** - Time-based greetings, feature highlights, clear language

---

## 📍 Blog Sections & Links

### 1. 📰 Daily News Highlights
**Link:** https://3mpwrapp.ca/blog/#curated-daily  
**Posts:** Daily at 9 AM UTC  
**Tags:** `highlights`  
**Social:** Mastodon + Bluesky

### 2. ✨ Feature Spotlights
**Link:** https://3mpwrapp.ca/blog/#feature-articles  
**Posts:** Daily at 10 AM UTC  
**Tags:** `features`, `spotlight`  
**Social:** Mastodon + Bluesky

### 3. 📅 Weekly Recaps
**Link:** https://3mpwrapp.ca/blog/#weekly-recaps  
**Posts:** Monday at 9 AM UTC  
**Tags:** `weekly`, `updates`  
**Social:** Manual (optional)

### 4. 💬 Community Updates
**Link:** https://3mpwrapp.ca/blog/#blog-posts  
**Posts:** Manual  
**Tags:** Various  
**Social:** Manual

---

## 🔗 Social Media Accounts

**Mastodon:** https://mastodon.social/@3mpwrapp  
**Bluesky:** https://bsky.app/profile/3mpwrapp.bsky.social

**Posting Schedule:**
- Daily News: ~10:00 AM UTC (after deployment)
- Feature Article: ~11:00 AM UTC (after deployment)

---

## 🧪 Quick Test Commands

```bash
# Test content generation
node scripts/daily-curator.js
node scripts/daily-feature-generator.js
node scripts/weekly-update-generator.js

# Test social posting (needs env vars)
node scripts/social-post.js
node scripts/post-daily-feature.js
```

---

## 📊 Automation Schedule

| Time (UTC) | Workflow | Output | Social |
|------------|----------|--------|--------|
| 9:00 AM Daily | Daily Curator | `_posts/YYYY-MM-DD-daily-curation.md` | ✅ |
| 10:00 AM Daily | Daily Feature | `_posts/YYYY-MM-DD-feature-spotlight-*.md` | ✅ |
| 9:00 AM Monday | Weekly Update | `_posts/YYYY-MM-DD-weekly-update-*.md` | ❌ |

---

## 🔍 Verify Everything Works

### Check Content
```bash
# Latest daily news
ls -lh _posts/*daily-curation.md | tail -1

# Latest feature
ls -lh _posts/*feature-spotlight*.md | tail -1

# Latest weekly
ls -lh _posts/*weekly-update*.md | tail -1
```

### Check Social Posts
1. Visit: https://mastodon.social/@3mpwrapp
2. Visit: https://bsky.app/profile/3mpwrapp.bsky.social
3. Click links in posts
4. Verify they go to blog sections

### Check Blog Display
1. Visit: https://3mpwrapp.ca/blog/
2. Verify 4 sections visible
3. Check section names user-friendly
4. Test navigation links
5. Verify follow box displays

---

## 📁 Modified Files Summary

### Scripts (5 files)
- `scripts/social-post.js` ✅
- `scripts/post-daily-feature.js` ✅
- `scripts/post-to-mastodon.js` ✅
- `scripts/post-to-bluesky.js` ✅
- `scripts/daily-feature-generator.js` ✅

### Workflows (2 files)
- `.github/workflows/content-curator.yml` ✅
- `.github/workflows/daily-feature.yml` ✅

### Content (1 file)
- `blog/index.md` ✅

### Docs (3 new files)
- `BLOG-AUTOMATION-FIXES-NOV2025.md` ✅
- `BLOG-AUTOMATION-TESTING-GUIDE.md` ✅
- `BLOG-AUTOMATION-COMPLETE-SUMMARY.md` ✅
- `BLOG-AUTOMATION-QUICK-REFERENCE.md` ✅ (this file)

---

## 🚨 Troubleshooting

### Posts not showing up?
Check tags in frontmatter:
- Daily News: `tags: [highlights]`
- Features: `tags: [features, spotlight]`
- Weekly: `tags: [weekly, updates]`

### Social posts failing?
Check GitHub Secrets:
- `MASTO_INSTANCE`
- `MASTO_TOKEN`
- `BLUESKY_HANDLE`
- `BLUESKY_PASSWORD`

### Links not working?
1. Check blog is deployed to Cloudflare Pages
2. Verify Jekyll permalink format
3. Check `_config.yml` URL setting

### Deployment too slow?
1. Check Cloudflare Pages build logs
2. Consider increasing wait time (currently 45 min)
3. Add manual deployment trigger

---

## 📚 Full Documentation

For complete details, see:
- **Testing Guide:** `BLOG-AUTOMATION-TESTING-GUIDE.md`
- **Complete Summary:** `BLOG-AUTOMATION-COMPLETE-SUMMARY.md`
- **Fix Details:** `BLOG-AUTOMATION-FIXES-NOV2025.md`

---

## ✅ Ready to Go!

Everything is configured and ready. Just:

1. **Commit & push** all changes
2. **Monitor GitHub Actions** for next runs
3. **Check social media** posts
4. **Verify links** work correctly

---

**Last Updated:** November 8, 2025  
**Status:** ✅ ALL SYSTEMS GO
