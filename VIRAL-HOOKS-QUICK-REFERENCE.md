# 🔥 Viral Hooks System - Quick Reference

**Version:** 2025.12.04  
**Auto-Updates:** Every 30 days based on analytics  
**Platforms:** Mastodon, Bluesky

---

## 🎯 Purpose

Create scroll-stopping social media content that:
1. **Grabs attention** in crowded feeds
2. **Resonates emotionally** with the disability community
3. **Drives engagement** (clicks, reposts, replies)
4. **Auto-optimizes** based on performance data

---

## 📁 File Structure

```
scripts/
├── viral-hooks-config.js      # Hook library & content strategies
├── viral-hooks-analytics.js   # Performance tracking & rotation
├── daily-feature-generator.js # Uses hooks for feature posts
├── weekly-update-generator.js # Uses hooks for recap posts
└── social-post.js             # Uses hooks for daily news

.github/workflows/
└── viral-hooks-analytics.yml  # Monthly auto-optimization
```

---

## 🧠 Target Audience Pain Points

| Pain Point | Hook Strategy |
|------------|---------------|
| System bureaucracy fatigue | Empowerment hooks ("Fight back") |
| Feeling alone/misunderstood | Validation hooks ("You're not alone") |
| Energy management struggles | Curiosity hooks about spoon theory |
| Legal/benefits confusion | Number-based hooks ("22 templates") |
| Invisible disability invalidation | Bold statement hooks |
| Gaslighting by employers | Accountability hooks |
| Decision paralysis (brain fog) | Simple, clear solution hooks |

---

## 📅 Monthly Theme Calendar

| Month | Theme | Focus Areas |
|-------|-------|-------------|
| January | New Year, New Rights | Benefits, legal, policy |
| February | Heart Health & Self-Love | Wellness, self-care |
| March | Disability Awareness | Community, advocacy |
| April | Neurodiversity | Cognitive accessibility |
| May | Mental Health Awareness | Mood tracker, crisis resources |
| June | Intersectional Pride | LGBTQ+, accessibility |
| July | Disability Pride Month | Community, celebration |
| August | Back to School/Work | Accommodations, legal tools |
| September | Pain Awareness | Spoon theory, energy |
| October | Disability Employment | Workplace rights |
| November | Injured Workers | WSIB, evidence, appeals |
| December | Year in Review | Wellness, achievements |

---

## 💡 Hook Types & When to Use

### 1. **Question Hooks** (Curiosity)
```
"Why doesn't anyone build apps FOR us?"
"What if your app could tell you when you'll have energy?"
```
**Best for:** New features, unique value propositions

### 2. **Statement Hooks** (Bold)
```
"Your employer is legally required to accommodate you."
"Disability tech built by disabled people. Zero catch."
```
**Best for:** Advocacy content, empowerment

### 3. **Number Hooks** (Credibility)
```
"22 letter templates that have won accommodations"
"7 days. 12 updates. Your feedback built this."
```
**Best for:** Weekly recaps, feature lists

### 4. **Validation Hooks** (Emotional)
```
"You're not alone in navigating this system."
"You're not lazy. You're managing a body that doesn't cooperate."
```
**Best for:** Community posts, mental health content

### 5. **FOMO Hooks** (Urgency)
```
"Beta's open. Only during Phase 1."
"Most people don't know they can appeal within 30 days."
```
**Best for:** Beta signups, time-sensitive content

---

## 🔄 How Analytics Rotation Works

1. **Every hook usage is tracked** with engagement metrics
2. **Every 30 days**, analytics runs automatically
3. **High performers** (5%+ engagement) get weight boost (up to 2x)
4. **Underperformers** (<1% engagement) get demoted
5. **Retiring hooks** (weight < 0.5) eventually phase out
6. **New hooks can be added** anytime - they start at weight 1.0

---

## 📊 Performance Thresholds

| Category | Engagement Rate | Action |
|----------|-----------------|--------|
| ⭐ High Performer | > 5% | Weight × 1.2 |
| ✅ Average | 1-5% | No change |
| ⚠️ Underperformer | < 1% | Weight × 0.7 |
| ❌ Retiring | Weight < 0.5 | Phase out |

---

## 🛠️ Manual Commands

```bash
# Test viral hooks output
node -e "const vh = require('./scripts/viral-hooks-config.js'); console.log(vh.getRandomHook('Beta Program'));"

# Run analytics check
node scripts/viral-hooks-analytics.js

# Generate feature post with hooks
node scripts/daily-feature-generator.js

# Generate weekly recap with hooks
node scripts/weekly-update-generator.js
```

---

## 📝 Adding New Hooks

Edit `scripts/viral-hooks-config.js`:

```javascript
// In FEATURE_SPOTLIGHT_HOOKS object:
'Your Category': {
  hooks: [
    "Hook 1...",
    "Hook 2...",
    "Hook 3..."
  ],
  cta: ['Call to action 1', 'Call to action 2'],
  emotion: 'validation' // or empowerment, curiosity, urgency
}
```

---

## 🎨 Platform-Specific Formatting

| Platform | Max Length | Hashtag Style | Best Times (UTC) |
|----------|------------|---------------|------------------|
| Mastodon | 500 chars | 5 inline | 9:00, 14:00, 20:00 |
| Bluesky | 300 chars | 2 minimal | 10:00, 15:00, 21:00 |

---

## 📈 Success Metrics to Watch

- **Engagement rate** (clicks + reposts + replies / impressions)
- **Click-through rate** to blog
- **Repost rate** (virality indicator)
- **Reply rate** (community building)
- **Follower growth** per post type

---

## 🚀 Quick Wins

1. ✅ **Always lead with the hook** - First line matters most
2. ✅ **Use power words** - "finally", "secret", "free", numbers
3. ✅ **Keep it concise** - Shorter = more engagement
4. ✅ **Add emotion** - Validation resonates strongly
5. ✅ **End with CTA** - Tell people what to do next

---

**Questions?** Check the code comments or run `node scripts/viral-hooks-analytics.js` for a status report.
