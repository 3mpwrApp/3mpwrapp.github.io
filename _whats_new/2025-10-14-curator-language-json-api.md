---
layout: post
title: Curator gains language filtering & JSON API
date: 2025-10-14 18:00:00 +0000
summary: Daily curator now outputs JSON and supports basic language filtering.
---

We expanded the automated daily curator with two new capabilities:

- Language filtering via a lightweight heuristic (English / French) using `FILTER_LANGS` env (e.g. `en,fr`).
- Public JSON feed at `/curation-latest.json` (enable with `WRITE_JSON=1`) containing the scored items, source, language tag, and metadata.

Why it matters:

- Lets the front‑end (or external tools) render curated items without parsing Markdown.
- Enables future UI toggles for language preference.

Technical notes:

- We intentionally used a zero‑dependency heuristic to keep Actions fast.
- JSON schema: `{ generated, minScore, forced, filterLangs, totalRanked, items:[{title,link,description,score,source,lang}] }`.
- Empty days still respect `FORCE_DAILY` for a Markdown post but skip creating a JSON file with zero items unless forced.

Coming next:

- Potential richer language detection if we add a tiny model or external API (kept optional to avoid latency).
- Front‑end widget to live‑load the JSON feed.

Feedback welcome—open an issue if you’d like additional fields in the JSON.
