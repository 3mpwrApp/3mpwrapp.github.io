# 🚀 QUICK REFERENCE - Social Media Automation

## One-Command Test Post

```bash
# Trigger manual workflow with defaults
gh workflow run daily-curation.yml

# Trigger with custom options
gh workflow run daily-curation.yml \
  -f force_publish=true \
  -f min_score=2.5 \
  -f debug_mode=false \
  -f bluesky_thread=0
```

## Web UI Test Post (2 clicks)

1. Go: https://github.com/3mpowrApp/3mpwrapp.github.io/actions
2. Click "Daily News Curation"
3. Click blue "Run workflow" button
4. Click "Run workflow" again

**Wait 2-3 minutes** → Check your profiles:
- 🐘 https://mastodon.social/@3mpwrApp
- 🦋 https://bsky.app/profile/3mpwrapp.bsky.social

---

## Credentials Status

| Platform | Secret | Status |
|----------|--------|--------|
| 🐘 Mastodon | `MASTO_INSTANCE` + `MASTO_TOKEN` | ✅ Stored |
| 🦋 Bluesky | `BLUESKY_HANDLE` + `BLUESKY_PASSWORD` + `BLUESKY_PDS` | ✅ Stored |
| 🐦 X/Twitter | `X_API_KEY` + more | ✅ Configured |

---

## What Posts Automatically

### Time: 9:00 AM UTC Daily

### Content:
- 📰 Top 3 curated news items
- 🔗 Link to full curation JSON
- 📊 Total items count
- #️⃣ Hashtags: #news #curation #accessibility #disability #workers
- ✨ App promotion message

### Reach:
- 🐘 **Mastodon:** Fediverse network (10M+ users)
- 🦋 **Bluesky:** AT Protocol network (growing)
- 🐦 **X/Twitter:** 500M+ daily users

---

## Workflow File

**Location:** `.github/workflows/daily-curation.yml`

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run daily curation (generate items)
5. Update What's New
6. Generate articles
7. Generate social posts
8. **Post to Mastodon** ← Your posts here
9. **Post to Bluesky** ← Your posts here
10. Post to X/Twitter
11. Build search index
12. Generate alerts
13. Categorize content
14. Git commit & push

**Total time:** ~3-5 minutes

---

## Scripts

| Script | What It Does |
|--------|-------------|
| `scripts/post-to-mastodon.js` | Posts to Mastodon via REST API |
| `scripts/post-to-bluesky.js` | Posts to Bluesky via AT Protocol |
| `scripts/post-to-x.js` | Posts to X/Twitter via API |
| `scripts/daily-curator.js` | Generates curated items |

---

## Troubleshooting

### Posts not appearing?
1. Check workflow logs: Actions → Daily News Curation → latest run
2. Verify secrets: Settings → Secrets → Actions
3. Wait 2-3 minutes and refresh
4. Check error in "Post to Mastodon" or "Post to Bluesky" step

### 401 Error?
- **Mastodon:** Token expired → https://mastodon.social/settings/applications → Regenerate → Update `MASTO_TOKEN`
- **Bluesky:** Wrong password → https://bsky.app/settings/app-passwords → Create new → Update `BLUESKY_PASSWORD`

### No curation file found?
- Run curation first: "Run daily curation" step must complete
- Or: Use `force_publish: true` when triggering

---

## Customize

### Change post time:

Edit `.github/workflows/daily-curation.yml` line ~5:
```yaml
cron: '0 9 * * *'  # 9:00 AM UTC
```

Examples:
- `0 12 * * *` = 12 PM UTC
- `30 8 * * *` = 8:30 AM UTC
- `0 6 * * 1-5` = 6 AM UTC, Monday-Friday

### Change post content:

Edit `scripts/post-to-mastodon.js`:
- Function: `formatMastodonContent()`
- Change greeting, hashtags, format

Edit `scripts/post-to-bluesky.js`:
- Function: `formatBlueskyContent()`
- Function: `formatBlueskyThread()`

### Enable thread posts on Bluesky:

When running workflow, set `bluesky_thread: 1`

Or make permanent in `.github/workflows/daily-curation.yml`:
```yaml
BLUESKY_THREAD: ${{ github.event.inputs.bluesky_thread || '1' }}
```

---

## Links

- **Mastodon:** https://mastodon.social/@3mpwrApp
- **Bluesky:** https://bsky.app/profile/3mpwrapp.bsky.social
- **X/Twitter:** https://x.com/3mpowrapp0816
- **Website:** https://3mpwrapp.github.io
- **GitHub Actions:** https://github.com/3mpowrApp/3mpwrapp.github.io/actions
- **GitHub Secrets:** https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

---

## Status

✅ **Credentials Stored**  
✅ **Workflow Configured**  
✅ **Scripts Ready**  
✅ **Tests Can Be Run**  
⏳ **Automatic Posts Start Tomorrow 9 AM UTC**  

---

**Created:** October 18, 2025  
**Mastodon:** Ready ✅  
**Bluesky:** Ready ✅  
**X/Twitter:** Ready ✅
