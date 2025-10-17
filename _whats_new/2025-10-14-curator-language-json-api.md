---
layout: post
title: Daily Content now Available in Multiple Languages and Easy Formats
date: 2025-10-14 18:00:00 +0000
summary: We added language filtering so you can see content in your preferred language, and made the content available in an easy format for apps to use.
---

What's new:

- Filter daily content by language (English and French)
- Content is available in an easy format that apps and websites can use
- Makes it easier to show curated content the way that works best for you

Why it matters:

- See content in your preferred language
- Apps can use our curated content to serve you better
- We're preparing for better multilingual support

Technical notes:

- We intentionally used a zero‑dependency heuristic to keep Actions fast.
- JSON schema: `{ generated, minScore, forced, filterLangs, totalRanked, items:[{title,link,description,score,source,lang}] }`.
- Empty days still respect `FORCE_DAILY` for a Markdown post but skip creating a JSON file with zero items unless forced.

Coming next:

- Potential richer language detection if we add a tiny model or external API (kept optional to avoid latency).
- Front‑end widget to live‑load the JSON feed.

Feedback welcome—open an issue if you’d like additional fields in the JSON.
