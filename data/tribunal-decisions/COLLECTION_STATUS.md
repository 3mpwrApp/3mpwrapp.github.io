# ONWSIAT Data Collection Status
**Last Updated:** 2026-04-13 13:46 (after first quota hit)

## 📊 Current Progress

| Year | Collected | Expected | Progress | Status | File Size |
|------|-----------|----------|----------|--------|-----------|
| 2020 | 796 | ~2,074 | 38% | 🔄 In Progress | 0.42 MB |
| 2021 | 0 | ~2,050 | 0% | ⏸️ Queued | - |
| 2022 | 0 | ~2,094 | 0% | ⏸️ Queued | - |
| 2023 | 704 | ~1,984 | 35% | ⚠️ Incomplete | 4.04 MB (historical) |
| 2024 | 1,971 | ~1,985 | 99% | ✅ Complete | 1.05 MB |
| 2025 | 1,522 | ~1,562 | 97% | ✅ Complete | 0.81 MB |
| 2026 | 146 | ~148 | 99% | ✅ Complete | 0.14 MB |
| **TOTAL** | **5,139** | **~10,561** | **49%** | 🔄 **In Progress** | **6.46 MB** |

## 🔧 Bugs Fixed (2026-04-13)

### Critical Bug #1: Shared Progress File
- **Problem:** All years used same `.ultra-slow-progress.json` 
- **Impact:** Starting year 2021 would continue from 2020's progress
- **Fix:** Year-specific progress files: `.ultra-slow-progress-{database}-{year}.json`

### Critical Bug #2: Double-Counting
- **Problem:** Analysis loaded 2024-2026 from BOTH historical + individual files
- **Impact:** Reported 7,871 cases instead of actual 4,343 (80% inflation)
- **Fix:** Track which years in historical file, skip duplicate loading

### Critical Bug #3: Incorrect Year Filtering
- **Problem:** Assumed historical file contains 2020-2023, actually has 2023-2026
- **Fix:** Removed hardcoded filters, accept whatever years exist

## 📦 Backups Created

All 2024-2026 data backed up before collection:
```
BACKUP-20260413-131259-onwsiat-2024-ultra-slow.json (1.05 MB)
BACKUP-20260413-131259-onwsiat-2025-ultra-slow.json (0.81 MB)
BACKUP-20260413-131259-onwsiat-2026-ultra-slow.json (0.14 MB)
BACKUP-20260413-131259-onwsiat-historical-20260404.json (4.04 MB)
```

## 🚀 Collection Plan

### Daily Collection Workflow

**After 8 PM ET (Quota Resets):**
```powershell
cd "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
.\scripts\collect-all-years.ps1
```

This automated script will:
1. Resume 2020 from case #797 (1,278 cases remaining)
2. Start 2021 collection (2,050 cases needed)
3. Start 2022 collection (2,094 cases needed)
4. Start 2023 collection (1,984 cases needed)

### Estimated Timeline

| Day | Action | API Calls | Cases Collected | Running Total |
|-----|--------|-----------|-----------------|---------------|
| **Day 1** (Today) | 2020 started | 797 | 796 (2020) | 796 |
| **Day 2** (Apr 14) | 2020 continues | 1,200 | +1,200 (2020) | 1,996 |
| **Day 3** (Apr 15) | 2020 finishes + 2021 starts | 1,200 | +78 (2020) + 1,122 (2021) | 3,196 |
| **Day 4** (Apr 16) | 2021 continues | 1,200 | +1,200 (2021) | 4,396 |
| **Day 5** (Apr 17) | 2021 finishes + 2022 starts | 1,200 | +728 (2021) + 472 (2022) | 5,596 |
| **Day 6** (Apr 18) | 2022 continues | 1,200 | +1,200 (2022) | 6,796 |
| **Day 7** (Apr 19) | 2022 finishes + 2023 starts | 1,200 | +422 (2022) + 778 (2023) | 7,996 |
| **Day 8** (Apr 20) | 2023 continues | 1,200 | +1,200 (2023) | 9,196 |
| **Day 9** (Apr 21) | 2023 finishes | 1,200 | +6 (2023) | ~9,202 |

**Estimated Completion:** ~9 days (April 21, 2026)

## 🎯 Next Steps

1. **Tonight (After 8 PM ET):** Run `.\scripts\collect-all-years.ps1`
2. **Daily for ~9 days:** Re-run script after quota resets
3. **After completion:** Run analysis with full dataset
4. **Blog post:** Write comprehensive 2020-2026 analysis

## 📝 Files Reference

**Collection Script:** `scripts/collect-ultra-slow.js`
**Analysis Script:** `scripts/analyze-onwsiat-comprehensive.js`
**Automation Script:** `scripts/collect-all-years.ps1`
**Progress Files:** `data/tribunal-decisions/.ultra-slow-progress-onwsiat-{year}.json`
**Output Files:** `data/tribunal-decisions/onwsiat-{year}-ultra-slow.json`

## ⚙️ Configuration

- **API Quota:** 1,200 calls/day (resets midnight UTC / 8 PM ET)
- **Delay Between Calls:** 2 seconds
- **Max Runtime:** ~40 minutes per 1,200 calls
- **Progress:** Auto-saved after each case
- **Resume:** Automatic from saved progress
