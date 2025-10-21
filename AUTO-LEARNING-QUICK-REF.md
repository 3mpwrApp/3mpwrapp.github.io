# 🧠 Auto-Learning Curator - Quick Reference

## What It Does

Your curator now **automatically learns** from viral disability content and stays at the **forefront of the disability movement** without any manual intervention.

---

## 🔥 Key Features

### 1. **Auto-Discovers New Keywords**
- Learns from high-scoring articles (≥5.0 score)
- Extracts disability movement phrases automatically
- Adds top 5 viral keywords to config per run

### 2. **Tracks Social Media Trends**
- Monitors 15 disability hashtags on Bluesky
- Identifies viral posts (10+ engagement)
- Boosts content matching trending topics

### 3. **Self-Updating System**
- No manual keyword updates needed
- Automatically commits config changes
- Runs 3x daily with main curator

---

## 📊 How It Works

```
Curator runs → Finds high-quality content → 
Extracts new keywords → Checks Bluesky trends → 
Applies boosts → Auto-updates config → 
Posts to social media → Repeat 3x daily
```

---

## 🎯 Expected Results

- **5-10 new keywords** discovered per curation
- **1-2 keywords** auto-added to config per week
- **24-48 hour lead time** on breaking disability news
- **1.1x - 2.25x boost** for viral trending topics

---

## 📁 Key Files Created

| File | What It Does |
|------|--------------|
| `scripts/curator-auto-learn.js` | Auto-discovers keywords from content |
| `scripts/curator-social-trends.js` | Tracks Bluesky disability hashtags |
| `.github/workflows/trending-keywords.yml` | Updates trends every 6 hours |
| `public/learned-keywords.json` | Log of discovered keywords |
| `public/social-trends.json` | Social media trending data |

---

## 🛠️ Manual Testing

```bash
# Test auto-learning
node scripts/curator-auto-learn.js

# Track social trends (requires Bluesky credentials)
BLUESKY_HANDLE=your@handle BLUESKY_PASSWORD=yourpass node scripts/curator-social-trends.js

# View learned keywords
cat public/learned-keywords.json

# View social trends
cat public/social-trends.json
```

---

## 📈 What Gets Tracked

### **Bluesky Hashtags** (15 monitored):
- #DisabilityRights
- #DisabilityJustice
- #Accessibility / #A11y
- #CripTheVote
- #DisabilityPride
- #DisabledAndProud
- #ActuallyAutistic
- #ChronicIllness
- #DisabilityAdvocacy
- #AccessibilityMatters
- #InclusionMatters
- #NothingAboutUsWithoutUs
- #Ableism
- #UniversalDesign

### **Movement Patterns Detected**:
- "disability justice"
- "disability rights"
- "nothing about us without us"
- "ableism"
- "accessibility is a right"
- "disability pride"
- "universal design"
- "barrier-free"
- Plus any disability-related 2-3 word phrases

---

## 🚀 Boost System

### **Score Calculation**
```
Final Score = Base × Trending Boost × Social Boost

Example:
7.0 (base) × 1.3 (trending) × 1.2 (social) = 10.92
```

### **Boost Multipliers**

**Trending:**
- 10+ mentions → 1.5x
- 5-9 mentions → 1.3x
- 3-4 mentions → 1.2x

**Social:**
- 20+ posts → 1.5x
- 10-19 posts → 1.3x
- 5-9 posts → 1.2x
- 3-4 posts → 1.1x

**Maximum Combined:** 2.25x (1.5 × 1.5)

---

## ⏰ Update Schedule

### **Main Curator** (3x daily)
- 9:00 AM UTC
- 3:00 PM UTC
- 9:00 PM UTC

**Actions:**
1. Fetch RSS feeds
2. Score content
3. Apply trending boost
4. Apply social boost
5. Auto-learn keywords
6. Post to social media

### **Trending Update** (every 6 hours)
- 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM UTC

**Actions:**
1. Track Bluesky hashtags
2. Apply time decay (10% daily)
3. Update trends files
4. Commit changes

---

## 🔐 Required Setup

Add to GitHub Secrets:

```
BLUESKY_HANDLE: your.handle.bsky.social
BLUESKY_PASSWORD: your-app-password
```

**Get app password:**
1. Bluesky Settings → Privacy & Security → App Passwords
2. Create new password for "3mpwrApp Curator"
3. Add to GitHub repo secrets

---

## ✅ Verification

Check it's working:

1. **GitHub Actions**
   - Go to: Actions → Content Curator
   - Look for: "feat(curator): Daily curation + auto-learned keywords"

2. **Learned Keywords**
   - Check: `public/learned-keywords.json`
   - Should have: `newKeywords` array with 10+ items

3. **Social Trends**
   - Check: `public/social-trends.json`
   - Should have: `emergingTopics` array with hashtag mentions

4. **Config Updates**
   - Check: `_data/curator.json` → `scoring.medium_priority.terms`
   - Should see: New keywords added over time

---

## 🚨 Troubleshooting

**No keywords being learned?**
- Check high-scoring items (≥5.0) exist in curation
- Verify `learned-keywords.json` exists in `public/`

**Social trends empty?**
- Verify Bluesky credentials in GitHub Secrets
- Check workflow logs: Actions → Trending Keywords Update

**Boosts not applying?**
- Ensure `trending-topics.json` has data
- Check keywords match article text exactly

---

## 📚 Full Documentation

See [AUTO-LEARNING-CURATOR.md](AUTO-LEARNING-CURATOR.md) for complete details.

---

**Status:** ✅ Active  
**Auto-Updates:** Yes (3x daily + every 6 hours)  
**Manual Intervention:** None required  
**Result:** 3mpwrApp stays at forefront of disability movement 🚀
