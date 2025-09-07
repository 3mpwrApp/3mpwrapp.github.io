---
title: Empowr App — User Guide
description: A practical guide to using Empowr’s tools and community features
version: 1.0
lastUpdated: 2025-09-07
---

# Empowr App — User Guide

> Purpose: Practical tools and community for injured workers and persons with disabilities.

## Quick Start

1. Install: Open the Empowr app on iOS/Android, or visit the web app.
2. Sign In: Create an account or log in from the welcome screen.
3. First Launch: Accept Terms to continue (you can reset this in Settings).
4. Setup: Open Settings → set your Display Name; optionally set a Local Profile (name, contact, province) for templates.
5. Accessibility: Use the gear icon (top‑right) for Settings; use the half‑circle icon to toggle High Contrast.

> Tip: The app respects your device’s text size. Increase font size in system Accessibility/Display.

## Navigation

- Tabs: Advocacy, Campaigns, Community, Events, Podcasts, Research, Resources, Wellness, Saved, Settings.
- Header: Top‑right shows Settings and a High‑Contrast toggle. Some screens show counters and refresh.
- Back: Use your device back gesture/button; links and buttons move between screens.

![Home Header](images/home-header.png "Top bar with brand, Settings, and High‑Contrast")

## Advocacy

- Directory: Browse advocates; search by name/bio; pull‑to‑refresh.
- Tools:
  - Self‑Advocacy Coach: Short micro‑lessons to build skills.
  - Policy Made Simple: Plain‑language policy explanations.
  - AI Advocate Translator: Simplifies bureaucratic letters into plain English.
  - AI Case Interpreter: Helps interpret case notes/letters.
  - Collective Legal Action Hub: Organize and coordinate.
  - AI Government Navigator: Navigate government pathways faster.
- Ask an Advocate: Intake form to request support.

![Advocacy Directory](images/advocacy-directory.png "Advocacy directory with search and tools")

## Campaigns

- Browse & Search: Community campaigns and your created ones.
- Create: Add Title, Summary, optional Target/Goal/Contact.
- Support: Tap “Support” to add your name to supporters.
- Save & Share: Save to favorites; share with friends.
- Join/Leave: Toggle to show your support.
- Campaign Room:
  - Tasks: Add/check shared tasks (realtime).
  - Notes: Shared notes synced across members.
  - Export: Download CSV of tasks.

![Campaigns List](images/campaigns-list.png "Campaigns list with Create box and search")
![Campaign Room](images/campaign-room.png "Shared tasks and notes with export")

## Community

- Channels: Province/topic channels.
- Threads: Post new threads, view and add comments.
- Offline Queue: Posts and replies queue locally; syncs on reconnect.

![Community Threads](images/community-threads.png "Channel threads and compose")

## Events

- Calendar: Month view with community events, national holidays, disability observances; optional provincial holidays (Settings).
- Add to Calendar: From an event, tap “Add Reminder” (Google Calendar template) or share an ICS fallback.

![Events Calendar](images/events-month.png "Month view with events and filters")

## Podcasts & Stories

- Browse: Thumbnails and descriptions.
- Play: Choose YouTube App or Browser (you can set a preference in Settings).
- Save: Bookmark videos to your Saved tab.

![Podcasts](images/podcasts.png "Videos list with thumbnails and bookmarks")

## Research

- Filters: Topic and Year; search titles.
- Read & Share: Open the original source or share the article link.

![Research](images/research.png "Research list with filters")

## Resources

- Region: Canada vs province; set your province in Settings.
- Categories: All, Work & Financial, Tools & Downloads, Emergency & Crisis.
- AI Tools: Rights Checker, Appeal Coach, Deadlines + Reminders, Evidence Checklist, Voice‑to‑Case Notes, Template Gallery, Support Directory, and more.
- Save/Open/Share: Save resources, open links, and share.

![Resources](images/resources.png "Resources grouped by region with category chips")

## Wellness

- Tools: Work‑Balance AI, Adaptive Meditation, Grief & Identity support.
- Trackers: Sleep/Energy and Symptom tracking; export CSV/PDF where available.
- Library & Activities: Self‑care and rehab activities.

![Wellness Tracker](images/wellness-tracker.png "Symptom tracker with export")

## Saved

- Collections: Your saved Podcasts, Resources, and Campaigns.
- Quick Access: Tap any item to open its details.

![Saved](images/saved.png "Saved items grouped by type")

## Settings

- Profile: Display Name and profile photo.
- Local Profile: Name/contact/province for templates (local only).
- Privacy & Backups:
  - Passcode & Wellness Lock.
  - Export/Import local backups.
  - Clear local data from device.
- Terms & Policies: View Terms; “Require re‑acceptance” to be re‑prompted next launch.

![Settings](images/settings.png "Profile, Local Profile, Privacy, and Terms")

## How Do I…

- Save an item: Tap the bookmark icon on a card/detail; find it later under Saved.
- Share: Open detail → Share; choose your app from the OS sheet.
- Add an event to calendar: Event detail → “Add Reminder”. If blocked, share the ICS and open in your Calendar app.
- Turn on High Contrast: Tap the half‑circle icon (top‑right).
- Back up & restore: Settings → Privacy & Backups → Export/Import Backup.
- Reset Terms: Settings → Terms & Policies → “Require re‑acceptance”.
- Collaborate on a campaign: Campaign detail → “Open Campaign Room” → add tasks/notes → Export CSV.

## Accessibility

- Screen reader: Announces page titles and loaded counts; headers use accessible roles.
- High Contrast: App‑wide palette for readability.
- Touch Targets: Larger tap areas and accessible labels.
- Text Scaling: Respects system font size.

> Tip: Turn on system “Bold Text” or “High Contrast” to further improve readability.

## Offline & Sync

- Offline: Clear indicators when offline; lists cache locally.
- Sync: Campaign Rooms and Community sync in realtime; queued actions flush automatically.

## Privacy & Safety

- Data: Favorites and Local Profile are stored on your device; profile photos upload to secure storage.
- Terms: You must accept Terms to use the app; revisit anytime in Settings.
- Passcode: Optional passcode and Wellness Lock for shared devices.

---

## Screenshots (placeholders)

Add PNG/JPG screenshots to `docs/images/` with these filenames or update the image links above:

- `images/home-header.png`
- `images/advocacy-directory.png`
- `images/campaigns-list.png`
- `images/campaign-room.png`
- `images/community-threads.png`
- `images/events-month.png`
- `images/podcasts.png`
- `images/research.png`
- `images/resources.png`
- `images/wellness-tracker.png`
- `images/saved.png`
- `images/settings.png`

> Tip: On iOS/Android, enable system “Guided Access”/“Screen pinning” while capturing if needed.

---

## Export to PDF

Choose one of the following:

1) VS Code extension

- Install “Markdown PDF” by yzane.
- Open this file → Command Palette → “Markdown PDF: Export (pdf)”.

2) Print to PDF (browser)

- Use a Markdown preview (VS Code or web), then File → Print → Save as PDF.

3) CLI (Node)

- `npm i -g md-to-pdf`
- `md-to-pdf docs/user-guide.md`

> Tip: Set paper size to Letter or A4; enable background graphics for the header line.

