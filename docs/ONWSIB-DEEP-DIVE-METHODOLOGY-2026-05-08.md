---
title: "ONWSIB Deep-Dive Method Note | 3mpwrApp Research"
description: "Short methodology appendix for the 2020-2026 ONWSIB deep-dive review"
layout: page
date: 2026-05-08
---

# ONWSIB Deep-Dive Method Note

This appendix explains the short local follow-up pass used for the ONWSIB archive after the 2020-2026 scrape was reconciled.

## Scope

- Dataset: 463 ONWSIB decisions from 2020-2026
- Coverage check: local counts matched observed CanLII browse counts for each year in scope
- Source files: local JSON outputs in `data/tribunal-decisions/`

## What The Deep-Dive Did

- Ran in sidecar mode against local files only
- Made no additional API calls
- Applied rule-based outcome detection to the reconciled archive
- Used `predMinConfidence = 0.55` to keep the threshold conservative

## Result

- 12 high-confidence outcome reads in the current archive
- 6 additional cases queued for manual review
- Year-level gains came from 2022 (+2) and 2023 (+1); other years held steady

## Year Summary

| Year | Total decisions | Known before | Known after | Net gain |
| --- | ---: | ---: | ---: | ---: |
| 2021 | 49 | 2 | 2 | 0 |
| 2022 | 149 | 0 | 2 | 2 |
| 2023 | 120 | 0 | 1 | 1 |
| 2024 | 73 | 0 | 0 | 0 |
| 2025 | 64 | 3 | 3 | 0 |
| 2026 | 8 | 4 | 4 | 0 |

## What This Note Does Not Claim

- It does not create an official ONWSIB success rate.
- It does not replace manual reading of difficult files.
- It does not change the core public-record limitation: most ONWSIB outcomes remain unresolved in published materials.

## Primary Files

- Summary JSON: [onwsib-deep-dive-summary.json](/data/tribunal-decisions/onwsib-deep-dive-summary.json)
- Manual-review queue: [onwsib-manual-review-queue-top100.json](/data/tribunal-decisions/onwsib-manual-review-queue-top100.json)

Use this note as a methodology appendix for ONWSIB-only content. For worker-facing posts, the safest summary remains: the archive is reconciled, the deep-dive is local-only, and public outcome completeness is still limited.