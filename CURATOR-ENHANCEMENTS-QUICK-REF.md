# Curator Enhancements - Quick Reference

## 🚀 What's New

All 7 future enhancement features are now **LIVE** and integrated into the curator system!

---

## 📊 1. A/B Testing & Analytics

### View Reports
```bash
node scripts/curator-analytics.js
```

### What You Get
- **Top Features:** Which highlights get most engagement
- **Best Time Slots:** Morning/midday/evening performance
- **Platform Stats:** Success rates for Mastodon/Bluesky/X

### Files
- `public/curator-analytics.json` - Live data
- `public/curator-report.json` - Formatted report

---

## 🔥 2. Trending Topics

### View Trending
```bash
node scripts/curator-trending.js
```

### How It Works
- Tracks keyword frequency across curations
- 10% daily decay on old mentions
- 3+ mentions = trending
- Auto-boosts scores:
  - 10+ mentions: +50%
  - 5-9 mentions: +30%
  - 3-4 mentions: +20%

### Files
- `public/trending-topics.json` - Trending keywords

---

## 📡 3. RSS Feed

### Subscribe
**Feed URL:** `https://3mpwrapp.pages.dev/feeds/curated.xml`

### Generate Manually
```bash
node scripts/curator-rss.js
```

### Features
- RSS 2.0 compliant
- 25-30 items per feed
- Updated 3x daily
- Works with all RSS readers

### Info Page
Visit `/feeds/` for subscription instructions

---

## 🎨 4. Social Media Cards

### Generate Cards
```bash
node scripts/curator-images.js
```

### Output
- **Location:** `public/images/social-cards/`
- **Files:** `card-1.html` through `card-10.html`
- **Meta Tags:** `meta-tags.html` (copy/paste ready)
- **Instructions:** `README.md` (how to convert to PNG)

### Features
- 1200x630px (all platforms)
- Score-based colors
- Open Graph & Twitter Card tags
- Top 10 stories only

---

## 🧵 5. Bluesky Threading

### Enable Threading
```bash
export BLUESKY_THREAD=1
```

### Disable (Single Post)
```bash
export BLUESKY_THREAD=0
```

### What It Does
- Posts as thread when > 3 items
- Intro + 5 stories + CTA
- Proper parent/root linking
- Better engagement

---

## 👥 6. User Segmentation

### Configure
Edit `_data/curator.json`:

```json
{
  "segmentation": {
    "enabled": true,
    "segments": {
      "provincial": {
        "ontario": ["ODSP", "Ontario"],
        "alberta": ["AISH", "Alberta"],
        "bc": ["PWD", "British Columbia"]
      }
    }
  }
}
```

### Use Cases
- Province-specific feeds
- Disability-type filtering
- Topic-based digests

---

## 7. ✅ All Features Auto-Run

When curator runs (3x daily):
1. ✅ Fetches RSS feeds
2. ✅ Scores items (with trending boost)
3. ✅ Generates JSON/Markdown/Blog
4. ✅ Creates RSS feed
5. ✅ Generates social cards
6. ✅ Posts to social media
7. ✅ Tracks analytics
8. ✅ Updates trending data

**Zero manual intervention required!**

---

## 🔍 Quick Tests

### Test Analytics
```bash
node scripts/curator-core.js
node scripts/social-post.js
node scripts/curator-analytics.js
```

### Test Trending
```bash
# Run 3-5 times
node scripts/curator-core.js
node scripts/curator-trending.js
```

### Test RSS
```bash
node scripts/curator-rss.js
# Then visit: /feeds/curated.xml
```

### Test Cards
```bash
node scripts/curator-images.js
# Check: public/images/social-cards/
```

### Test Threading
```bash
export BLUESKY_THREAD=1
node scripts/social-post.js
# Check Bluesky for thread
```

---

## 📁 File Locations

### Data Files
- `public/curator-analytics.json`
- `public/trending-topics.json`
- `public/posting-results.json`
- `public/curation-latest.json`

### Feeds
- `public/feeds/curated.xml`
- `feeds/index.md` (info page)

### Social Cards
- `public/images/social-cards/`

### Scripts
- `scripts/curator-analytics.js`
- `scripts/curator-trending.js`
- `scripts/curator-rss.js`
- `scripts/curator-images.js`
- `scripts/curator-core.js` (enhanced)
- `scripts/social-post.js` (enhanced)

---

## 🎯 Key Commands

| Task | Command |
|------|---------|
| Run curation | `node scripts/curator-core.js` |
| Post to social | `node scripts/social-post.js` |
| View analytics | `node scripts/curator-analytics.js` |
| Check trending | `node scripts/curator-trending.js` |
| Generate RSS | `node scripts/curator-rss.js` |
| Create cards | `node scripts/curator-images.js` |

---

## 🔧 Configuration

### Environment Variables
```bash
# Bluesky threading (optional)
export BLUESKY_THREAD=1

# All others auto-enabled, no config needed
```

### Curator Config
```json
{
  "enableTrending": true,
  "enableAnalytics": true,
  "enableRSS": true,
  "enableSocialCards": true
}
```

---

## 📈 Monitoring

### Daily Checks
```bash
# Success rates
cat public/posting-results.json

# Analytics summary
node scripts/curator-analytics.js

# Trending keywords
node scripts/curator-trending.js
```

### Weekly Review
1. Check top feature highlights
2. Identify best time slots
3. Review trending topics
4. Monitor RSS subscribers
5. Assess social card performance

---

## 🎉 Benefits

1. **A/B Testing:** Know what works
2. **Trending:** Catch breaking news
3. **RSS:** Reach RSS users
4. **Cards:** Beautiful visuals
5. **Threading:** Better engagement
6. **Segmentation:** Targeted content
7. **Analytics:** Data-driven decisions

---

## 🚨 Troubleshooting

### Analytics Not Saving
- Check `public/` directory exists
- Verify write permissions
- Run `node scripts/curator-analytics.js` manually

### Trending Not Detecting
- Need 3+ curations with same keyword
- Check `public/trending-topics.json`
- Decay happens daily (10%)

### RSS Not Validating
- Use validator.w3.org/feed
- Check XML syntax
- Verify all URLs absolute

### Cards Not Generating
- Ensure `public/images/social-cards/` exists
- Check curation-latest.json has items
- Review card templates

### Threading Not Working
- Verify `BLUESKY_THREAD=1` set
- Check Bluesky credentials
- Ensure > 3 items in curation

---

## 📚 Full Documentation

See `CURATOR-ENHANCEMENTS-V2.md` for complete details.

---

**Version:** Curator Core v2.1  
**Date:** October 18, 2025  
**Status:** Production Ready ✅
