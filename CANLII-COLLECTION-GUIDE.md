# CanLII Collection - Quick Start Guide

**⚠️ API Limitations Notice:** CanLII API is designed for human researchers browsing cases, not bulk data extraction. Intentional restrictions include: no explicit outcome fields in metadata, CAPTCHA protection for web scraping, request throttling, daily caps, and IP blocking after excessive requests. **This is NOT a CanLII issue—it's intentional API access restrictions to protect their servers.** To get 100% accurate outcomes, we'd need to manually read each case individually. Our scripts collect metadata and infer outcomes from keywords where possible.

## 🚀 Tonight's Collection (After 8 PM ET)

```powershell
cd d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main
node scripts/collect-tonight.js
```

**What this does:**
- ✅ Collects Ontario 2024-2026 decisions (~1,500 cases)
- ✅ Skips search API (saves 200+ calls)
- ✅ Skips already-collected cases
- ✅ Completes in 30-40 minutes
- ✅ Well within daily quota

---

## 📅 7-Day Collection Schedule

### **Day 1 - Tonight** (Ontario Recent)
```powershell
node scripts/collect-tonight.js
```
- Target: 1,200-1,500 cases (2024-2026)
- Time: 30-40 min
- Quote usage: ~1,500 calls

### **Day 2** (Ontario Historical)
```powershell
node scripts/scrape-direct.js --database=onwsiat --years=2021,2022,2023
```
- Target: 2,000-2,500 cases (2021-2023)
- Time: 50-60 min
- Quota usage: ~2,500 calls

### **Day 3** (Ontario Old)
```powershell
node scripts/scrape-direct.js --database=onwsiat --years=2018,2019,2020
```
- Target: 2,000-2,500 cases
- Time: 50-60 min

### **Day 4** (Quebec)
```powershell
node scripts/scrape-direct.js --database=qctat --years=2020,2021,2022,2023,2024,2025,2026
```
- Target: 1,500-2,000 cases
- Time: 40-50 min

### **Day 5** (British Columbia)
```powershell
node scripts/scrape-direct.js --database=bcwcat --years=2020,2021,2022,2023,2024,2025,2026
```
- Target: 1,500-2,000 cases
- Time: 40-50 min

### **Day 6** (Alberta + Saskatchewan)
```powershell
node scripts/scrape-direct.js --database=abwcac --years=2020,2021,2022,2023,2024,2025,2026
node scripts/scrape-direct.js --database=skwcab --years=2020,2021,2022,2023,2024,2025,2026
```
- Target: 1,000-1,500 cases
- Time: 30-40 min

### **Day 7** (Remaining provinces)
```powershash
node scripts/scrape-direct.js --database=mbwcat --years=2020,2021,2022,2023,2024,2025,2026
node scripts/scrape-direct.js --database=nswcat --years=2020,2021,2022,2023,2024,2025,2026
node scripts/scrape-direct.js --database=nbwcat --years=2020,2021,2022,2023,2024,2025,2026
```
- Target: 500-1,000 cases
- Time: 20-30 min

---

## 🔧 Alternative Approaches

### Option A: Search-Based (Use if direct enumeration fails)
```powershell
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new
node scripts/scrape-canlii-tribunals-v5-enhanced.js
```
**Note:** Set `RECENT_ONLY=true` in code to avoid quota exhaustion

### Option B: Smart Dedupe (Re-run existing searches)
```powershell
node scripts/scrape-smart-dedupe.js
```
**When to use:** If you have partial collections and want to fill gaps

### Option C: Manual Year-by-Year
```powershell
node scripts/scrape-direct.js --database=onwsiat --years=2026
node scripts/scrape-direct.js --database=onwsiat --years=2025
# etc.
```
**When to use:** Maximum control, stopping/resuming between years

---

## 📊 After Collection

### Verify Data Quality
```powershell
node scripts/analyze-patterns.mjs onwsiat-direct-*.json
```

Expected output:
- Outcome detection: 85-90%
- Quality scores: 60-90
- Medical evidence: Present in 70%+

### Generate Templates
```powershell
node scripts/generate-templates.mjs
```

Produces:
- `templates/ontario-ptsd-winning-strategies.json`
- `templates/ontario-chronic-pain-patterns.json`
- `templates/ontario-wcat-reasonings.json`

### Deploy to Thunder Bay Pilot
```powershell
node scripts/sync-data-to-public.mjs
```

---

## 🆘 Troubleshooting

### "API quota exceeded"
**Solution:** Wait until 8 PM ET (midnight UTC) for quota reset

### "404 errors for all case IDs"
**Solution:** Database abbreviation wrong. Check CanLII docs for correct abbreviation

### "Collected 0 cases"
**Solution:** Run with `--years=2026` first to verify API access works

### Still hitting quota with direct enumeration?
**Solution:** Contact api@canlii.org for academic/research quota increase

---

## 📈 Success Metrics

After 7 days, you should have:
- ✅ 12,000-15,000 Canada-wide decisions
- ✅ 6,000-8,000 Ontario cases (2018-2026)
- ✅ 85-90% outcome detection rate
- ✅ Geographic coverage: 10+ provinces/territories
- ✅ Quality scores: 60-90 average
- ✅ Ready for Thunder Bay pilot launch

---

## 🔗 Key Files

- **Tonight's script:** `scripts/collect-tonight.js`
- **Direct scraper:** `scripts/scrape-direct.js`
- **Smart dedupe:** `scripts/scrape-smart-dedupe.js`
- **7-day scheduler:** `scripts/multi-day-scheduler.js`
- **Pattern analysis:** `scripts/analyze-patterns.mjs`
- **Data export:** `data/tribunal-decisions/`

---

**Questions? Check:**
- `HEARTBEAT.md` - Automation patterns
- `README.md` - Project overview
- `QUICK-REFERENCE.md` - Command cheatsheet
