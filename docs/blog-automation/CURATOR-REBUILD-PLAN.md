# 🔄 CURATOR SYSTEM REBUILD PLAN

**Current State:** 2 conflicting workflows + duplicate scripts + inconsistent configuration  
**Target State:** 1 unified, clean, well-architected curator system  
**Timeline:** Today (Oct 18)  
**Complexity:** Medium - Well-scoped rebuild

---

## ❌ Current Problems

### Problem 1: Duplicate Workflows
- **daily-curator.yml** - Runs at 1 PM Toronto time (17:00 & 18:00 UTC)
- **daily-curation.yml** - Runs at 9:00 AM UTC daily
- **Result:** Posts may be created twice, conflicting schedules, confusing for users

### Problem 2: Inconsistent Architecture
- `daily-curator.yml`: Uses environment variables (MIN_SCORE, FORCE_DAILY, etc.)
- `daily-curation.yml`: Uses GitHub inputs and has 10+ optional steps
- **Result:** Different behaviors, different configurations, hard to maintain

### Problem 3: Untested Optional Steps
- `daily-curation.yml` has many optional steps that fail silently:
  - `automate-whats-new.js` - optional
  - `generate-3mpwrapp-articles.js` - optional
  - `share-to-social.js` - optional
  - `content-categorizer.js` - optional
  - `keyword-alerts.js` - optional
  - `build-search-index.js` - optional
- **Result:** Unclear what actually runs, unreliable output

### Problem 4: Redundant Scripts
- Post scripts duplicated: `post-mastodon.js` vs `post-to-mastodon.js`
- Multiple curator versions: `daily-curator.js` vs `unified-curation-engine.js`
- **Result:** Maintenance nightmare, unclear which to use

### Problem 5: No Clear Error Handling
- Both workflows use `continue-on-error: true` heavily
- No clear indication of failures
- No systematic error reporting

---

## ✅ Rebuild Plan: 5-Part Architecture

### PART 1: Consolidate Workflows

**Delete these files:**
- `.github/workflows/daily-curator.yml` (OLD - 1 PM Toronto)
- `.github/workflows/weekly-curator.yml` (if unused)

**Keep and enhance:**
- `.github/workflows/daily-curation.yml` - Rename to `.github/workflows/curator.yml` (cleaner name)

**New unified workflow:**
- Single schedule: 9:00 AM UTC (consistent)
- Flags: `force_publish`, `debug_mode`, `min_score`, `bluesky_thread`
- Runs on: schedule + manual dispatch
- Posts to: Mastodon → Bluesky → X (in order, with error handling)

---

### PART 2: Clean Script Architecture

**Core Scripts (REQUIRED):**
1. `scripts/curator-core.js` - NEW unified curator engine
   - Replaces: `daily-curator.js` + `unified-curation-engine.js`
   - Single source of truth for curation
   - Clear inputs/outputs
   - Comprehensive logging

2. `scripts/social-post.js` - NEW unified posting engine
   - Replaces: `post-to-mastodon.js`, `post-to-x.js`, `post-to-bluesky.js`
   - Handles all 3 platforms
   - Systematic error reporting
   - Retry logic

3. `scripts/curator-config.js` - NEW configuration manager
   - Replaces: Manual `_data/curator.json` loading
   - Environment variable override support
   - Validation and defaults
   - Clear documentation

**Optional Scripts (can keep for now):**
- `build-search-index.js` - If working, keep
- `content-categorizer.js` - If working, keep  
- Others - Mark as deprecated

---

### PART 3: Configuration System

**File: `_data/curator.json`** (Enhanced)
```json
{
  "version": "2.0",
  "schedule": {
    "timezone": "UTC",
    "time": "09:00",
    "description": "9:00 AM UTC (5:00 AM EST, 6:00 AM EDT)"
  },
  "curation": {
    "minScore": 2.5,
    "maxItems": 25,
    "languages": ["en", "fr"],
    "rssFeeds": [...],
    "scoring": {...}
  },
  "posting": {
    "enabled": true,
    "platforms": {
      "mastodon": {
        "enabled": true,
        "visibility": "public"
      },
      "bluesky": {
        "enabled": true,
        "threadFormat": false
      },
      "x": {
        "enabled": true,
        "replySettings": "everyone"
      }
    }
  }
}
```

---

### PART 4: Output Structure

**Organized outputs:**
```
_curation/
  ├── YYYY-MM-DD-curated.md (curated items)
  └── YYYY-MM-DD-metadata.json (score/source data)

_posts/
  └── YYYY-MM-DD-daily-curation.md (blog post)

public/
  ├── curation-latest.json (API endpoint)
  ├── curation-archive.json (historical)
  └── curation-metadata.json (scoring data)
```

---

### PART 5: Error Handling & Logging

**Structured error handling:**
1. Curation fails → Stop entire workflow (critical)
2. Single platform posting fails → Log but continue others
3. Optional step fails → Log as warning, continue

**Output to GitHub:**
- `GITHUB_STEP_SUMMARY` for user visibility
- JSON logs for debugging
- Success/failure status per platform

---

## 🛠️ REBUILD TASKS (In Order)

### Task 1: Create Core Curator Engine
- File: `scripts/curator-core.js`
- Lines: ~300-400
- Features: RSS parsing, scoring, deduplication, JSON output
- Status: ✅ Based on existing code
- Time: 30 minutes

### Task 2: Create Unified Social Poster
- File: `scripts/social-post.js`
- Lines: ~200-300
- Platforms: Mastodon, Bluesky, X
- Error handling: Proper try/catch + reporting
- Time: 30 minutes

### Task 3: Create Configuration Manager
- File: `scripts/curator-config.js`
- Lines: ~100-150
- Validation and defaults
- Environment variable support
- Time: 15 minutes

### Task 4: Create Unified Workflow
- File: `.github/workflows/curator.yml`
- Based on: Best of both existing workflows
- Clean, readable, well-commented
- Time: 20 minutes

### Task 5: Delete Old Files
- Remove: `daily-curator.yml`
- Remove: `daily-curator.js` (old version)
- Keep: Other specialized scripts if useful
- Time: 5 minutes

### Task 6: Update Documentation
- File: `CURATOR-REBUILD-COMPLETE.md`
- Document the architecture
- Usage instructions
- Migration notes
- Time: 15 minutes

---

## 📊 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Number of workflows | 2 | 1 | -50% complexity |
| Duplicate scripts | 6+ | 0 | -100% |
| Lines of config | Scattered | Unified | Centralized |
| Error visibility | Low | High | Better debugging |
| Schedule conflicts | Yes | No | Eliminated |
| Maintenance burden | High | Low | Easier to update |
| Time to add platform | 1 hour | 10 min | 6x faster |
| Test coverage | None | High | Improved |

---

## 🚀 Rebuild Steps - Let's Do This

**Ready to proceed with complete rebuild?**

**YES:** I'll create all 6 new files systematically
**Changes:**
1. Create 3 new core scripts (curator-core.js, social-post.js, curator-config.js)
2. Create unified workflow (curator.yml)
3. Update curator.json configuration
4. Create documentation
5. Delete old daily-curator.yml
6. Test and commit

**Total time estimate:** 2-3 hours  
**Launch impact:** Improves reliability before Oct 24

Ready to proceed? Type "yes" or "proceed" and I'll start the rebuild!

---

**Next Steps:**
1. ✅ You confirm approval to proceed
2. ✅ I create all new files with clean architecture
3. ✅ I test the unified workflow
4. ✅ I commit to git with clear messages
5. ✅ System ready for Oct 24 launch with 100% confidence

---

## Context Summary

**Current Issues:**
- 2 workflows running at different times causing duplicate posts
- 6+ duplicate/redundant scripts
- Inconsistent error handling
- Complex and hard to maintain
- Unclear which scripts are actually used

**Solution:**
- 1 unified workflow (9 AM UTC)
- 3 core scripts (curator, social, config)
- Centralized configuration
- Clear error handling
- Easy to maintain and extend

Let me know when you're ready to proceed with the rebuild! 🚀
