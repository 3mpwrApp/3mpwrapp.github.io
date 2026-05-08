# Curator System - Quick Reference Guide

## 📅 Posting Schedule

### Daily Posts (3x per day)
| Time (UTC) | Time (EST) | Context | Emoji |
|------------|------------|---------|-------|
| 09:00 | 5:00 AM | Morning news | ☀️ |
| 15:00 | 11:00 AM | Midday update | 🌤️ |
| 21:00 | 5:00 PM | Evening digest | 🌆 |

**Total:** 9 posts per day (3 platforms × 3 times)

---

## 🎯 Feature Highlights (Rotates Randomly)

1. **Benefits Navigator**: Find & apply for disability benefits across Canada
2. **Resource Directory**: Discover accessibility services in your area
3. **News Curation**: Stay informed on disability rights & policy
4. **Accessibility Tools**: Screen reader friendly, keyboard navigation
5. **Provincial Guides**: ODSP, AISH, PWD & more benefits explained
6. **Community Resources**: Connect with advocacy groups & support
7. **Multi-language Support**: Content available in EN & FR

---

## 📊 Configuration Settings

```json
{
  "minScore": 1.0,
  "maxItems": 30,
  "rssFeeds": 26,
  "languages": ["en", "fr"],
  "requireKeywords": false
}
```

---

## 🏷️ Keywords by Priority

### Critical (Score: 4.0)
Breaking news, urgent announcements, court decisions, policy changes

### High Priority (Score: 3.0)
Accessibility, disability, benefits, human rights, assistive technology, workers compensation

### Medium Priority (Score: 2.0)
Inclusion, employment, housing, healthcare, web accessibility, resource navigation

### Provincial Programs (Score: 2.5)
ODSP, AISH, PWD benefits, EIA, SAID, provincial disability programs

### Contextual (Score: 1.0)
General Canadian news, social programs, app/website/platform terms

---

## 🔧 Manual Testing

### Test Curation
```bash
node scripts/curator-core.js
```

### Test Configuration
```bash
node scripts/curator-config.js validate
node scripts/curator-config.js summary
```

### Test Social Posting
```bash
# Requires environment variables
node scripts/social-post.js
```

---

## 🌐 Social Media Platforms

### Mastodon
- **Instance**: mastodon.social
- **Visibility**: public
- **Format**: Longest (top 3 stories)
- **Rate Limit**: 300/5min ✅

### Bluesky
- **PDS**: bsky.social
- **Format**: Medium (top 3 stories)
- **Rate Limit**: No official limit ✅

### X/Twitter
- **API**: v2 (Bearer token)
- **Format**: Shortest (top 2 stories)
- **Rate Limit**: Free tier ✅

---

## 📁 Output Files

### Generated Each Run
- `public/curation-latest.json` - Latest curation (API)
- `public/curation-YYYY-MM-DD.json` - Daily archive
- `_curation/YYYY-MM-DD-curated.md` - Markdown format
- `_posts/YYYY-MM-DD-daily-curation.md` - Blog post
- `public/posting-results.json` - Social media results

---

## 🚨 Monitoring

### Check Workflow Status
GitHub Actions → Curator (Unified)

### Check Posting Success
View `public/posting-results.json`:
```json
{
  "mastodon": { "success": true, "message": "..." },
  "bluesky": { "success": true, "message": "..." },
  "x": { "success": true, "message": "..." }
}
```

### Check Curation Quality
View `public/curation-latest.json`:
- `count`: Number of items curated
- `items`: Array of scored stories

---

## 🎛️ Manual Workflow Trigger

**GitHub Actions → Curator (Unified) → Run workflow**

Options:
- `force_publish`: Publish even with low scores
- `min_score`: Override minimum score (default: 2.5 for manual, 1.0 for auto)
- `debug_mode`: Enable verbose logging
- `bluesky_thread`: Post as thread (1) or single post (0)

---

## 📈 Free Tier Limits

| Platform | Limit | Our Usage | Status |
|----------|-------|-----------|--------|
| Mastodon | 300 posts/5min | 3/day | ✅ 1% of limit |
| Bluesky | Unlimited | 3/day | ✅ No limit |
| X | Free tier | 3/day | ✅ Reasonable |

**Safety Factor:** Using < 1% of available capacity

---

## 🔄 Workflow Dependencies

```
curator.yml (3x daily)
  ├── curator-core.js (fetch & score)
  │   └── curator.json (configuration)
  └── social-post.js (format & post)
      ├── Time context (greeting)
      ├── Feature rotation
      └── Platform formatting

weekly-curator.yml (1x weekly)
  └── generate-weekly-post.js
```

---

## 🎨 Post Templates

### Morning (09:00 UTC)
```
☀️ Good morning! 📰 2025-10-18

3mpwrApp Start your day informed with 30 curated stories...

💡 [Random Feature Highlight]

Today's Top Stories:
1. [Story title]
   [Story link]

🔗 Visit: https://3mpwrapp.ca

#Accessibility #DisabilityRights #DisabilityBenefits #News #Canada
```

### Midday (15:00 UTC)
```
🌤️ Midday update! 📰 2025-10-18

3mpwrApp Check out what's happening: 30 curated stories...

💡 [Random Feature Highlight]
[Stories...]
```

### Evening (21:00 UTC)
```
🌆 Evening digest! 📰 2025-10-18

3mpwrApp Catch up on today's news: 30 curated stories...

💡 [Random Feature Highlight]
[Stories...]
```

---

## 🛠️ Troubleshooting

### No Items Curated
- Check min score (lower it)
- Check RSS feeds (test connectivity)
- Check keywords (ensure terms match content)

### Posting Failed
- Check environment variables (secrets)
- Check rate limits (unlikely at 3/day)
- Check API credentials (tokens valid?)

### Duplicate Posts
- Deduplication by URL is automatic
- Check different time slots aren't posting same content

---

## 📞 Quick Commands

```bash
# Validate config
node scripts/curator-config.js validate

# View config summary
node scripts/curator-config.js summary

# List RSS feeds
node scripts/curator-config.js feeds

# Run curation
node scripts/curator-core.js

# Post to social media
node scripts/social-post.js
```

---

## ✅ Success Criteria

- ✅ 3 curation runs per day
- ✅ 9 social media posts per day (3 platforms × 3 times)
- ✅ Time-appropriate greetings
- ✅ Rotating feature highlights
- ✅ No rate limit errors
- ✅ All platforms posting successfully
- ✅ Quality content (score-based filtering)

---

**Last Updated:** October 18, 2025  
**Version:** Curator Core 2.0 Enhanced  
**Status:** ✅ Production Ready
