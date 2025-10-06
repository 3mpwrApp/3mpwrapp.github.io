---
layout: default
title: Events
permalink: /events/
---

# Events

The website calendar will become available during Beta Testers Phase 1 (Closed Internal Testing) — announcement coming soon.

About the feed

- The app exposes a text/calendar (ICS) feed built from the events service.
- The feed has a 5‑minute cache window on the server to balance freshness and performance.
- You can paste the ICS URL into most CMS calendar widgets or subscribe in Google Calendar.

Ways we can integrate it here

- Embed the ICS directly in a calendar widget (CMS-dependent).
- Render accessible event cards during CI by fetching the ICS (or a JSON mirror) and generating static HTML.
- Client-side fetch from the API (if CORS permits), with a static fallback for reliability.

When the URL is ready, we’ll wire the integration and publish the calendar on this page.
