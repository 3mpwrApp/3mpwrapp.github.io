---
title: 3mpwr App — User Guide
description: A practical guide to using 3mpwr’s tools and community features
version: 1.0
lastUpdated: 2025-09-07
---

# 3mpwr App — User Guide

> Purpose: Practical tools and community for injured workers and persons with disabilities.

## Quick Start

1. Install: Open the 3mpwr App on Android, or visit the web app.
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

### Direct Messages (beta)

- Start a DM: Community → Direct Messages → enter the other user’s ID → Start.
- Threads: Your recent 1‑1 chats appear in the list; tap to open and send messages.
- Safety: Users you’ve blocked cannot DM you; your DM list hides messages from blocked users.
- Notes: This early beta uses user IDs for discovery. Profile search and richer chat features are planned.

### Safety & Blocking

- Block a user: Community → Safety & Blocking → enter their user ID → Block.
- Unblock: From the same screen, tap Unblock next to their ID.
- Effect: Hides content and DMs from blocked users. Coming soon: one‑tap block from posts, report tools, and moderation.

![Community Threads](images/community-threads.png "Channel threads and compose")

## Events

- Calendar: Month view with community events, national holidays, disability observances; optional provincial holidays (Settings).
- Add to Calendar: From an event, tap “Add Reminder” (Google Calendar template) or share an ICS fallback.

### Website calendar sync

- ICS feed: The app server exposes an iCalendar feed at `/events.ics` that aggregates upcoming events.
- Example: If your server base is `https://api.example.com`, use `https://api.example.com/events.ics` in your website/CMS calendar.
- Refresh: The feed can be cached by your site/CDN; default server cache is 5 minutes.

![Events Calendar](images/events-month.png "Month view with events and filters")

## Podcasts & Stories

- Browse: Thumbnails and descriptions.
- Play: Choose YouTube App or Browser (you can set a preference in Settings).
- Save: Bookmark videos to your Saved tab.

![Podcasts](images/podcasts.png "Videos list with thumbnails and bookmarks")

### Exercise Hub

- Audience Filters: All, wheelchair, limited‑mobility, sensory‑friendly.
- Remote Playlists: Uses YouTube when configured; falls back to curated list and cached results.
- Favorites: Star videos and open your dedicated Favorites list from the Hub (or via Wellness → Exercise Favorites).

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

### Emergency Wallet Card

- Location: Settings → Emergency Wallet Card.
- Purpose: Store key medical info and emergency contacts locally and generate a printable card.
- Quick open: From Resources → Support & Directories → Emergency Info Wallet Card. Note: this entry redirects you to Settings and auto-expands the Emergency Wallet Card section.

![Emergency Wallet Card](images/emergency-wallet-card.png "Emergency Wallet Card form with fields for medical info and contacts")

### Evidence Locker

- Local notes with tags and attachments; optional Cloud save.
- Gallery View: Toggle to a grid of image thumbnails.
- Videos: Cloud items show a thumbnail (when available) and open in a built‑in player. If the source lacks a thumbnail and the optional server is configured, the app tries to derive one (YouTube supported; ffmpeg fallback when available). Toggle under Settings → Media & Locker.

### Trackers (Meds, Chronic, Rehab)

- Export: CSV and JSON.
- Import Templates: Seed entries from JSON templates for quick setup.

### Deadlines

- Calendar and List views with reminders.
- Import ICS; Export all as ICS or CSV.

## Wellness

- Tools: Work‑Balance AI, Adaptive Meditation, Grief & Identity support.
- Trackers: Sleep/Energy and Symptom tracking; export CSV/PDF where available.
- Library & Activities: Self‑care and rehab activities.

![Wellness Tracker](images/wellness-tracker.png "Symptom tracker with export")

### Reflections Calendar

- Views: Grid (month) and List (range). Toggle tap behavior: Details or Editor (remembered per device).
- Quick‑Add: Long‑press a day (grid or list) to show inline mood chips; tap to add instantly. If connected to the optional server, past days are backdated server‑side.
- Details: Tap a day to open a modal with that day’s entries (edit/delete/add) and a quick summary (count + average mood).
- Exports: CSV/JSON with field filters (Mood/Text). One‑tap “Export Week” and “Export Month” CSV.
- Default setting: Change the default tap behavior under Settings → Wellness Preferences.
- Backdating: Enable/disable server‑backdating for past days under Settings → Wellness Preferences.

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

![Settings](images/settings.png "Settings showing Accessibility, Language, Notifications, and Emergency Wallet Card")

### Socials & Website

- Find quick links under About → Socials & Website.
- Current links: X (Twitter) @3mpwrapp, Instagram @3mpwrapp, Facebook @3mpwrapp, Website https://3mpwrapp.github.io/

## How Do I…

- Save an item: Tap the bookmark icon on a card/detail; find it later under Saved.
- Share: Open detail → Share; choose your app from the OS sheet.
- Add an event to calendar: Event detail → “Add Reminder”. If blocked, share the ICS and open in your Calendar app.
- Turn on High Contrast: Tap the half‑circle icon (top‑right).
- Back up & restore: Settings → Privacy & Backups → Export/Import Backup.
- Reset Terms: Settings → Terms & Policies → “Require re‑acceptance”.
- Collaborate on a campaign: Campaign detail → “Open Campaign Room” → add tasks/notes → Export CSV.
- DM someone privately: Community → Direct Messages → enter their user ID → Start.
- Block a user: Community → Safety & Blocking → enter ID → Block.

## Accessibility

- Screen reader: Announces page titles and loaded counts; headers use accessible roles.
- High Contrast: App‑wide palette for readability.
- Touch Targets: Larger tap areas and accessible labels.
- Text Scaling: Respects system font size.

> Tip: Turn on system “Bold Text” or “High Contrast” to further improve readability.

### Coming soon badges

- Some screens and buttons may show a subtle “Coming soon” label to signal features that are in development.
- Feedback welcome: Use About → Contact to send suggestions.

Where you’ll see “Coming soon” today

- Community → Media Studio, Mutual Aid, Mutual Chat, Beta Testers Chat, and Compose Post cards show “Coming soon”.
- Community → Safety & Blocking notes future one-tap block and report tools.
- Wellness: Some advanced tools are in development; labels appear on their entries when applicable.
- Admin/Docs: Certain admin utilities and docs may still be placeholders; they won’t affect normal use.

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

1. VS Code extension

- Install “Markdown PDF” by yzane.
- Open this file → Command Palette → “Markdown PDF: Export (pdf)”.

2. Print to PDF (browser)

- Use a Markdown preview (VS Code or web), then File → Print → Save as PDF.

3. CLI (Node)

- `npm i -g md-to-pdf`
- `md-to-pdf docs/user-guide.md`

> Tip: Set paper size to Letter or A4; enable background graphics for the header line.
