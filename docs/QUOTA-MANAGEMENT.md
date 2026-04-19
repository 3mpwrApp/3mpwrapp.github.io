# 🚫 CanLII API Quota Management

## What Happened

**CanLII API daily quota exceeded** at case 464/3,149 (14.7%) for HRTO 2025.

## Why This Happened

**Total API calls today:**
- HRTO 2020-2024: 6,039 cases ✅ Complete
- HRTO 2025: 463 cases (stopped at 14.7%)
- **Total**: ~6,502 API requests

**CanLII free tier quota**: ~5,000-10,000 requests/day

## ✅ Your Progress is Safe

All completed cases are saved:
- `onhrt-2020-complete.json` (37 cases)
- `onhrt-2021-complete.json` (792 cases)
- `onhrt-2022-complete.json` (1,473 cases)
- `onhrt-2023-complete.json` (1,821 cases)
- `onhrt-2024-complete.json` (1,916 cases)
- `.progress-onhrt-2025.json` (463 completed, tracking resume point)

## ⏰ When Quota Resets

**CanLII quota resets**:
- At **midnight UTC** (8:00 PM EDT / 5:00 PM PDT)
- OR **24 hours** after first API call today

## 🔧 Scrapers Now Have Quota Detection

**Enhanced all 3 scrapers:**
- `scrape-hrto-comprehensive-2020-2026.js` ✅
- `scrape-onsbt-comprehensive-2020-2026.js` ✅  
- `scrape-onwsib-comprehensive-2020-2026.js` ✅

**What they do now:**
- ✅ Detect `QUOTA_EXCEEDED` errors
- ✅ Save progress automatically
- ✅ Save partial results to `-PARTIAL.json` file
- ✅ Exit gracefully with helpful instructions
- ✅ Auto-resume when re-run (no manual configuration needed)

---

## 🚀 Recommended Next Steps

### **Option 1: Resume HRTO Tomorrow** ⏰ Wait for reset

```bash
# Tomorrow (after quota resets):
cd scripts
node scrape-hrto-comprehensive-2020-2026.js
```

**What happens:**
- Automatically resumes at case 464
- Continues until quota or completion
- 2025 has ~2,686 cases remaining
- At 15s/case, needs ~11 hours (spread over 2-3 days)

---

### **Option 2: Start ONSBT Now** ⭐ RECOMMENDED

```bash
# Start ONSBT (ODSP appeals) fresh tomorrow:
cd scripts
node scrape-onsbt-comprehensive-2020-2026.js
```

**Why this is better:**
- ONSBT likely has **fewer cases per year** than HRTO
- Can complete **entire years** within daily quota
- HRTO 2025-2026 can finish later (already have 2020-2024 complete)
- Gets you critical **ODSP denial data** sooner

**Expected ONSBT volume:**
- 2020-2024: ~500-2,000 cases/year
- Total: ~3,500-10,000 cases (fits in 2-3 days of quota)

---

### **Option 3: Start ONWSIB After ONSBT** 📊 Big dataset

```bash
# After ONSBT completes:
cd scripts
node scrape-onwsib-comprehensive-2020-2026.js
```

**Why later:**
- ONWSIB is **largest dataset** (first-level WSIB decisions)
- May have 1,000-5,000 cases/year
- Will take 1-2 weeks of quota spread across days
- Better to complete smaller datasets first

---

## 📅 Suggested Collection Schedule

**Week 1 (This Week):**
- ✅ HRTO 2020-2024 complete (6,039 cases)
- ⏸️ HRTO 2025 paused (463/3,149 - 14.7%)

**Week 2:**
- ✅ ONSBT 2020 (start fresh, ~500-2k cases)
- ✅ ONSBT 2021-2024 (continue based on quota)

**Week 3-4:**
- ✅ ONSBT complete (all years)
- ✅ Start ONWSIB 2020

**Week 5-7:**
- ✅ ONWSIB 2020-2024 (spread across days)

**Week 8:**
- ✅ Resume HRTO 2025-2026 (finish remaining)

**Week 9:**
- ✅ Start BC WCAT/HRT

---

## 💡 Quota Management Tips

### **Daily Limits**
- Free tier: ~5,000-10,000 requests/day
- Each case = 1 API request
- Plan for ~3,500-8,000 cases/day max

### **Multi-Day Collections**
- Large years (3,000+ cases) need 2-3 days
- Scraper auto-resumes with `.progress-*.json` files
- No manual intervention needed

### **Strategic Approach**
1. Collect **small datasets first** (ONSBT)
2. Establish **daily quota baseline** (how many cases/day)
3. Plan **large datasets** (ONWSIB, HRTO 2025) over multiple days
4. Run **overnight** to maximize quota usage

### **Progress Tracking**
```bash
# Check progress files:
ls data/tribunal-decisions/.progress-*.json

# See what's been collected:
ls data/tribunal-decisions/*.json

# Check partial results:
ls data/tribunal-decisions/*-PARTIAL.json
```

---

## 🎯 What This Gives You

**When ONSBT completes:**
- ✅ ODSP denial patterns
- ✅ Medical evidence standards
- ✅ Disability definition interpretation
- ✅ Benefits appeal outcomes

**When ONWSIB completes:**
- ✅ First-level WSIB denial rates
- ✅ Pre-existing at source (compare to 13.31% at WSIAT)
- ✅ Critical question: Does appeal rate improve outcomes?

**When HRTO 2025-2026 completes:**
- ✅ Full 7-year HRTO dataset (2020-2026)
- ✅ ~8,000-10,000 total cases
- ✅ Richest keyword metadata

---

## 📝 Commands Summary

```bash
# Check current status
cd data/tribunal-decisions
ls -la .progress-*.json
cat .progress-onhrt-2025.json | head -20

# Resume HRTO tomorrow
cd scripts
node scrape-hrto-comprehensive-2020-2026.js

# OR start ONSBT (recommended)
node scrape-onsbt-comprehensive-2020-2026.js

# Later: ONWSIB
node scrape-onwsib-comprehensive-2020-2026.js
```

---

## ✨ Bottom Line

**You're not blocked** - just hit a daily API limit. Progress is saved, scrapers enhanced with quota detection, ready to resume tomorrow.

**Recommended**: Start ONSBT tomorrow for faster completion of ODSP data while HRTO quota recovers.
