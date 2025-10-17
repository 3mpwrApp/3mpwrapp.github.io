---
layout: post
title: Curator Improvements – Forced Daily Posts & Debugging
date: 2025-10-14 13:05:00 +0000
summary: Added environment overrides (MIN_SCORE, FORCE_DAILY, DEBUG_CURATOR), optional forced daily post placeholder, and suppression of empty curation files.
---

We improved the automated daily curator workflow to increase reliability and transparency:

### ✅ What Changed
- Added env overrides: `MIN_SCORE`, `FORCE_DAILY`, `DEBUG_CURATOR`.
- Forced daily post allowed (placeholder when no qualifying items) to maintain cadence.
- Suppressed creation of empty `_curation` review files.
- Added debug sample output to inspect top scored candidate items.
- Lowered default run threshold for manual runs (MIN_SCORE=0.5 in workflow) to produce more content.

### 🔧 How to Use
Trigger the workflow manually (Actions > Daily Curator) and it will:
1. Respect the time gate (Toronto 13:00) on schedule; manual dispatch still checks current hour.
2. Use the injected env variables to adjust curator behavior.
3. Skip Mastodon post gracefully if secrets absent.

### 🧪 Debug Mode
`DEBUG_CURATOR=1` logs a JSON sample of the highest scoring items before filtering. Use this to tune `minScore` in `_data/curator.json`.

### 📂 Less Noise
No more empty `_curation/YYYY-MM-DD-curation.md` files when nothing qualifies.

---
Need further tuning (e.g., per-source boosting, language filtering, or multi-region schedules)? Open an issue or send feedback.
