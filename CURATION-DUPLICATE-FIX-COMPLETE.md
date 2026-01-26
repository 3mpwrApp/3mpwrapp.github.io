# Curation Duplicate News Fix - COMPLETE ✅

**Date:** January 21, 2026  
**Status:** Fixed and Deployed  
**Commit:** 85de5039

## Problem Identified

Curation was showing duplicate news articles repeatedly, despite implementing "fixes" that weren't working.

### Root Cause

**CRITICAL DISCOVERY:** All duplicate detection code was added to the **WRONG FILE**.

- ❌ **File Edited:** `scripts/agent-curation-production.js`
- ✅ **File Actually Used:** `scripts/curator-core.js`
- **Workflow:** `.github/workflows/content-curator.yml` line 96 calls `node scripts/curator-core.js`

The workflow never executed any of the duplicate detection code because it was in a file that wasn't being called.

## Solution Implemented

Applied all necessary fixes to the **ACTUAL production curation engine** (`curator-core.js`):

### 1. Feed URL Tracking
```javascript
// In fetchFeed() method
const itemsWithFeedUrl = items.map(item => ({ ...item, feedUrl }));
```
Every item now tracks which feed it came from, enabling identification of Disability Bulletin articles.

### 2. Disability Bulletin Priority Scoring
```javascript
// In calculateScore() method
if (item.feedUrl && item.feedUrl.includes('feeds.blogger.com/feeds/362411661072793873')) {
  return 5.0; // Automatic maximum score
}
```
The Disability Bulletin always gets the highest possible score (5.0).

### 3. Disability Bulletin Bypass Filter
```javascript
// In filterPreviouslyPosted() method
const isDisabilityBulletin = item.feedUrl && 
  item.feedUrl.includes('feeds.blogger.com/feeds/362411661072793873');

if (isDisabilityBulletin) {
  return true; // Always allow DB through, even if previously posted
}
```
Disability Bulletin can appear in every curation post (as requested), while other articles are filtered if previously posted.

### 4. Featured Section in Output
```javascript
// In generateMarkdown() method
// Separate DB items from others
const disabilityBulletinItems = [];
const otherItems = [];

// Display DB first with special highlighting
if (disabilityBulletinItems.length > 0) {
  lines.push('## 🌟 Featured: The Disability Bulletin');
  // ... DB content ...
  lines.push('---');
}

// Then display other stories
lines.push('## Additional Stories');
```
The Disability Bulletin now appears in a prominent featured section at the top of every curation post.

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `scripts/curator-core.js` | ✅ Feed URL tracking<br>✅ DB priority scoring (5.0)<br>✅ DB bypass filter<br>✅ Featured section layout | **PRODUCTION** |
| `scripts/agent-curation-production.js` | ⚠️ Has duplicate code (not used) | Needs cleanup |

## What This Fixes

### ✅ Duplicate News Issue
- **Before:** Same articles appearing in multiple curation posts
- **After:** Each article (except DB) only appears once in 7-day window
- **Mechanism:** `filterPreviouslyPosted()` checks last 7 days of posts

### ✅ Disability Bulletin Not Featured
- **Before:** DB treated like any other article
- **After:** DB gets automatic 5.0 score, featured section, appears every time
- **Mechanism:** Feed URL detection + special handling in scoring, filtering, and markdown generation

### ✅ DB Can Repeat
- **Before:** DB would be filtered out if posted before
- **After:** DB bypasses duplicate filter, can appear in every post
- **User Requirement:** "the only one that should be repeated every single time is the disability bulletin"

## Production Schedule

The curation workflow runs **3 times daily**:
- **9:00 AM UTC** (4 AM EST)
- **3:00 PM UTC** (10 AM EST)
- **9:00 PM UTC** (4 PM EST)

Next run will use the corrected `curator-core.js` engine.

## Verification

To verify the fix is working:

1. **Check next curation post** (at 9 AM, 3 PM, or 9 PM UTC)
2. **Look for:**
   - 🌟 Featured section at top with Disability Bulletin
   - No duplicate articles from previous 7 days
   - DB appearing even if it was in previous posts
   - Articles scored below 2.5 filtered out

## Technical Details

### Disability Bulletin Feed
- **URL:** `https://feeds.blogger.com/feeds/362411661072793873/posts/default`
- **Identifier:** Feed URL contains `362411661072793873`
- **Score:** Always 5.0 (maximum)
- **Frequency:** Can appear in every curation post

### Duplicate Detection Window
- **Days Checked:** 7 days back
- **Mechanism:** Extracts URLs from markdown `[Source](url)` links in previous posts
- **Exception:** Disability Bulletin bypasses this check

### Feed Configuration
- **Total Feeds:** 20 (down from 27)
- **Focus:** Disability community, vulnerable communities, policy
- **Removed:** Mainstream news (CBC, Global News, etc.)
- **Config File:** `_data/curator.json`

## Cleanup Needed

The file `scripts/agent-curation-production.js` contains duplicate detection code that is NOT being used. Options:

1. **Delete it** if it has no other purpose
2. **Document it** if it's for future use
3. **Merge relevant parts** into curator-core.js if needed

## Related Commits

| Commit | Date | Description | Status |
|--------|------|-------------|--------|
| 85de5039 | Jan 21 | **CRITICAL FIX: curator-core.js** | ✅ **ACTIVE** |
| f5122fee | Jan 21 | Updated agent-curation-production.js | ❌ Wrong file |
| 14c2f4e4 | Jan 21 | Added duplicate detection to agent-curation-production.js | ❌ Wrong file |

## Success Criteria

- [x] Duplicate detection active in production engine
- [x] Disability Bulletin gets priority scoring (5.0)
- [x] DB can appear in every post (bypasses filter)
- [x] DB featured prominently at top of posts
- [x] Other articles properly deduplicated
- [x] Code committed and pushed to production
- [ ] Verify next curation run (wait for 9 AM/3 PM/9 PM UTC)

## Monitoring

Watch the next few curation runs to confirm:
1. No duplicate articles (except DB)
2. Disability Bulletin appears at top in featured section
3. Only disability/vulnerable community news (no mainstream)
4. Articles score >= 2.5 (workflow minimum)

---

**Status:** ✅ **FIXED AND DEPLOYED**  
**Next Action:** Monitor next curation run for verification
