---
layout: default
title: 3mpwr App — User Guide
description: A practical guide to using 3mpwr’s tools and community features
version: 1.0
lastUpdated: 2025-10-05
---

# 3mpwr App — User Guide

> Purpose: Practical tools and community for Persons with Disabilities, Injured Workers, and Allies.

Version: {{ page.version }} • Last updated: {{ page.lastUpdated }}

## Table of contents

- TOC
{:toc}

## Quick Start

1. Install: Open the 3mpwr App on Android, or visit the web app.
2. Sign In: Create an account or log in from the welcome screen.
3. First Launch: Accept Terms to continue (you can reset this in Settings).
4. Setup: Open Settings → set your Display Name; optionally set a Local Profile (name, contact, province) for templates.
5. Accessibility: Use the gear icon (top‑right) for Settings; use the half‑circle icon to toggle High Contrast.

> Tip: The app respects your device’s text size. Increase font size in system Accessibility/Display.

## Onboarding — Your first 7 days

- Private checklist to get oriented; progress is stored locally only.
- Suggested steps: capture basics, add your first Evidence Locker note, tag key contacts, bookmark resources, set reminders, record denial dates, review privacy, and export a backup.
- Quick links jump to common features (Evidence Locker, Resources, Advocacy Hub, Profile, Notifications).
- Privacy: Stays on device unless you choose optional cloud features elsewhere.

## Navigation

- Tabs: Advocacy, Campaigns, Community, Events, Podcasts, Research, Resources, Wellness, Saved, Settings.
- Header: Top‑right shows Settings and a High‑Contrast toggle. Some screens show counters and refresh.
- Back: Use your device back gesture/button; links and buttons move between screens.

### What’s New

- See release notes and recent improvements in the What’s New area.

Recent highlights

- Home: Now marked Beta. You’ll see a short line under Today’s Guide: “Suggestions powered by the Personalization Engine (beta).”


## Advocacy

- Directory: Browse advocates; search by name/bio; pull‑to‑refresh.
- Tools:
  - Self‑Advocacy Coach: Short micro‑lessons to build skills.
  - Policy Made Simple: Plain‑language policy explanations, with Copy/Share/PDF/.doc export.
  - AI Advocate Translator: Simplifies bureaucratic letters into plain English.
  - AI Case Interpreter: Helps interpret case notes/letters.
  - Collective Legal Action Hub: Organize and coordinate.
  - Ally Hub: Quick prompts and links for supporters to coordinate.
  - AI Government Navigator: Navigate government pathways faster.
  - Lawyer Finder: Search advocates by name, bio, or location; filter and browse map/list views.
  - Disability Justice Ratings (beta): Rate services and providers (e.g., hospitals, clinics); see averages and score distribution; submissions are throttled and moderated.
  - Accountability Coach (beta): Generate step‑by‑step plans, detect violations, draft letters, and track responses.
  - Accountability Cases (beta): Review cases created via the coach and recent events.
- Ask an Advocate: Intake form to request support.


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


## Events

- Calendar: Month view with community events, national holidays, disability observances; optional provincial holidays (Settings).
- Add to Calendar: From an event, tap “Add Reminder” (Google Calendar template) or share an ICS fallback.

### Website calendar sync

- ICS feed: The app server exposes an iCalendar feed at `/events.ics` that aggregates upcoming events.
- Example: If your server base is `https://api.example.com`, use `https://api.example.com/events.ics` in your website/CMS calendar.
- Refresh: The feed can be cached by your site/CDN; default server cache is 5 minutes.


## Podcasts & Stories

- Browse: Thumbnails and descriptions.
- Play: Choose YouTube App or Browser (you can set a preference in Settings).
- Save: Bookmark videos to your Saved tab.


### Exercise Hub

- Audience Filters: All, wheelchair, limited‑mobility, sensory‑friendly.
- Remote Playlists: Uses YouTube when configured; falls back to curated list and cached results.
- Favorites: Star videos and open your dedicated Favorites list from the Hub (or via Wellness → Exercise Favorites).

## Research

- Filters: Topic and Year; search titles.
- Read & Share: Open the original source or share the article link.


## Resources

- Region: Canada vs province; set your province in Settings.
- Categories: All, Work & Financial, Tools & Downloads, Emergency & Crisis.
- AI Tools: Rights Checker, Appeal Coach, Deadlines + Reminders, Evidence Checklist, Voice‑to‑Case Notes, Template Gallery, Support Directory, and more.
- Save/Open/Share: Save resources, open links, and share.


### Emergency Wallet Card

- Location: Settings → Emergency Wallet Card.
- Purpose: Store key medical info and emergency contacts locally and generate a printable card.
- Quick open: From Resources → Support & Directories → Emergency Info Wallet Card. Note: this entry redirects you to Settings and auto-expands the Emergency Wallet Card section.


### Evidence Locker

- Local notes with tags and attachments; optional Cloud save.
- Gallery View: Toggle to a grid of image thumbnails.
- Videos: Cloud items show a thumbnail (when available) and open in a built‑in player. If the source lacks a thumbnail and the optional server is configured, the app tries to derive one (YouTube supported; ffmpeg fallback when available). Toggle under Settings → Media & Locker.

### Trackers (Meds, Chronic, Rehab)

- Export: CSV and JSON.
- Import Templates: Seed entries from JSON templates for quick setup.

### Medication & Treatment Tracker (beta)

- Add meds: Name, dose, schedule; optional reminder time and refill date.
- Logs: Track side effects and effectiveness (1–5) over time per medication.
- Reminders: One‑tap “Remind daily” schedules the next 7 days at your chosen time; “Refill alert” schedules your refill date.
- Exports: CSV and JSON. Import a JSON template to seed your list quickly.
- Privacy: Data is stored locally unless you export/share.
- Accessibility: Header announces on open; inputs and buttons have labels and larger touch targets.

### Deadlines

- Calendar and List views with reminders.
- Import ICS; Export all as ICS or CSV.

## Wellness

- Tools: Work‑Balance AI, Adaptive Meditation, Grief & Identity support.
- Trackers: Sleep/Energy and Symptom tracking; export CSV/PDF where available.
- Library & Activities: Self‑care and rehab activities.


### Reflections Calendar (beta)

- Views: Grid (month) and List (range). Toggle tap behavior: Details or Editor (remembered per device).
- Quick‑Add: Long‑press a day (grid or list) to show inline mood chips; tap to add instantly. If connected to the optional server, past days are backdated server‑side.
- Details: Tap a day to open a modal with that day’s entries (edit/delete/add) and a quick summary (count + average mood).
- Exports: CSV/JSON with field filters (Mood/Text). One‑tap “Export Week” and “Export Month” CSV.
- Default setting: Change the default tap behavior under Settings → Wellness Preferences.
- Backdating: Enable/disable server‑backdating for past days under Settings → Wellness Preferences.

### Accessible Exercise Hub (beta)

- Browse accessible exercise videos and guides. Filter for wheelchair, limited-mobility, or sensory-friendly routines.
- Favorites: Tap “☆ Favorite” to save exercises; open your list under Favorites.
- Export: “Export Favorites (CSV)” saves a CSV file you can share or import elsewhere.
- Offline-friendly: If YouTube is unavailable, the local curated list appears.

### Daily Energy Coins (beta)

- Purpose: Budget your daily energy for tasks; practice kind pacing.
- How it works: Set a daily coin budget; add a task label and spend coins. Reset at the end of the day. History shows your latest spends.
- Tips: Start small (e.g., 10–12 coins) and adjust based on your day. Use labels like “Dishes” or “Stretch”.
- Accessibility: Clear labels, larger tap areas, and color contrast that respects High Contrast mode.

### Sleep & Energy Tracker (beta)
### Work‑Balance AI (beta)

- Purpose: Combine recent pain, sleep/energy, and mood to suggest pacing-friendly work/rest blocks for the day.
- How it works: Pick your current mood, add optional notes, and tap “Plan my day.” The plan uses your latest Sleep & Energy and Symptom entries when available.
- Actions: Copy the generated plan to share with a manager or keep for yourself.
- Privacy: Reads local trackers if present; nothing is uploaded.

### Self‑Care Library (beta)
### Rehab Games (beta)

- Simple, accessible mini‑games to encourage gentle movement and physio‑style exercises.
- Actions: Tap to log Reach & Tap, Breath Pacing, and Sit‑to‑Stand reps; points accrue automatically.
- Export: “Export Progress (CSV)” shares your recent session history.
- Accessibility: Clear button labels and large tap targets.

### Diet & Nutrition Guides (beta)
 
- Browse curated recipes and tips; filter by tags; mark items as Favorites.
- Actions: Tap a tag chip to filter; “☆ Favorite/★ Favorited” toggles saved items.
- Export: “Export Favorites (CSV)” saves a CSV of your favorites.
### Sleep Reframe (beta)

- Gentle reframes and routines to reduce sleep pressure and improve rest quality.

### CBT Mini‑Games (beta)

- Quick grounding games (e.g., 5‑4‑3‑2‑1 senses) to shift attention and calm.

### DBT Skill Matcher (beta)

- Pick your current state to see suggested DBT skills (like TIPP or paced breathing).

### Opposite Action Companion (beta)

- Walk through steps to pick a small, safe opposite action when urges are unhelpful.

### Radical Acceptance (beta)

- Brief guide to accept reality as it is while taking the next kind action.

### Acceptance & Function (beta)

- Track acceptance and daily function (0–10); review recent entries.

### Distress Tolerance (beta)

- TIPP-based tips to reduce crisis intensity; adapt to your body.

### Belief Strength Meter (beta)

- Rate belief strength (0–100) before/after a reframe and observe change.

### Adaptive Meditation (beta)

- Short, adaptive audio meditations; export link list as CSV.

### Dream Tracker & Interpreter (beta)

- Log dreams; see a lightweight interpretation to reflect on themes.

### Ambience Sync AI (beta)

- Suggests in‑app ambience based on mood trends: palette, soundscape, and brightness.
- Actions: Tap “Apply in app” (no OS changes; in‑app accents only in this beta).
- Privacy: Uses local mood data if available; otherwise suggests a calming default.

### Grief + Identity Support (beta)

- Curated reading and community links for identity changes and loss after injury.
- Actions: Export Resources (CSV); “Suggest a Resource” opens email.
- Accessibility: Clear link labels and larger tap targets.

- Curated list of accessible audio practices, gentle movement, and easy‑read guides.
- Actions: Tap to open links; Export Resources (CSV) to save/share the catalog; “Suggest a Resource” opens email.
- Accessibility: Links and buttons have clear labels; large tap targets.

### Micro‑Movement Coach (beta)

- Gentle, chair‑friendly movement prompts. Tap Next to cycle through ideas. Always stop if uncomfortable.
- Accessibility: Clear labels and large buttons.

### AI Pacing Partner (beta)

- Log activities with minutes; basic pacing suggestions and optional overexertion reminder.
- Export: Tap Export Activities (CSV) to save/share a CSV of recent logs.

### Rehab Progress Tracker (beta)

- Track rehab metrics like walking distance, grip strength, and pain‑reduced days. Keep brief notes.
- Views: Local (on‑device) and Cloud (optional, when signed in). Export JSON; import a JSON template.

### Return‑to‑Work Planner (beta)

- Plan RTW goals with supports and steps; mark goals done. Stored in your account when signed in.


- Add entries: Date, sleep hours, sleep quality (1–5), energy (1–5), notes, and tags.
- Filters: Optional start/end date, minimum sleep hours, and tag contains.
- Quick tags: Tap chips like “insomnia”, “nap”, “fatigue”, “pain”, “stress” to toggle tags.
- Summary: Auto‑generated, plain‑text summary with averages and a concise medical/legal statement.
- Exports: Share text, Copy to clipboard, Export CSV (text), Export CSV File (download), Export as PDF, and Export as .doc.
- Privacy & Safety: Respect Privacy Gate when Wellness Lock is enabled; data is stored locally unless you export/share.

### Resilience Points (beta)

- Purpose: Build resilience by celebrating small, healthy actions. Earn points for steps like facing a fear, attending therapy, practicing grounding, or paced breathing.
- How it works: Open Wellness → Resilience Points. Tap an action card to add its points to your total; your current “Points” total is shown at the top.
- Tips: Start with the easiest actions on low-energy days. Small steps count; consistency matters more than totals.
- Accessibility: Clear labels and large tap targets. Works with High Contrast and text scaling.
- Privacy: Points are stored on your device; nothing is uploaded.

## Saved

- Collections: Your saved Podcasts, Resources, and Campaigns.
- Quick Access: Tap any item to open its details.


## Settings

- Profile: Display Name and profile photo.
- Local Profile: Name/contact/province for templates (local only).
- Privacy & Backups:
  - Passcode & Wellness Lock.
  - Export/Import local backups.
  - Clear local data from device.
- Terms & Policies: View Terms; “Require re‑acceptance” to be re‑prompted next launch.


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

- Community: Safety & Blocking mentions upcoming one‑tap block, report tools, and moderation flows. Direct Messages remain “beta”.
- Wellness hub: Some future tools are still being built; labels will indicate “Coming soon”.
- Research: History Timeline, Case/File Wait‑Times, and Master Index may be labeled “Coming soon”.
- Resources: Some experimental AI tools and planners are staged (cards will show “Coming soon”).
- Admin/Docs: Certain admin utilities and docs may still be placeholders; they won’t affect normal use.

Beta today

- Advocacy: AI Advocate Translator, AI Case Interpreter, AI Government Navigator, Policy Made Simple, Lawyer Finder, Ratings, Ally Hub, Collective Legal Action Hub, Accountability Coach, and Accountability Cases are available as Beta.
- Community: Media Studio, Mutual Aid Engine, Mutual Chat, Beta Testers Chat, Compose Post, and Direct Messages are available as Beta.
- Wellness: AI Companion, Work‑Balance AI, Ambience Sync AI, Grief + Identity Support, Self‑Care Library, Rehab Games, Diet & Nutrition Guides, Symptom & Pain Tracker, Sleep & Energy Tracker, Pain Forecast, Reflections Calendar, Accessible Exercise Hub, Daily Energy Coins, and Daily Planner are available as Beta.
  - Also in Beta: Sleep Reframe, CBT Mini‑Games, DBT Skill Matcher, Opposite Action, Radical Acceptance, Acceptance & Function, Distress Tolerance, Belief Strength Meter, Adaptive Meditation, and Dream Tracker & Interpreter.
- Resources: Evidence Locker, Chronic Tracker, Medication & Treatment Tracker, Appeal Coach, Claims Navigator, Denial Decoder, Prepare to Appeal, and Doctor Visit Prep are available as Beta.
  - Resources → Trackers & Planners: Deadline Calculator + Reminders, Rehab Progress Tracker, and Return‑to‑Work Planner are available as Beta.
  - Wellness: Also in Beta — Micro‑Movement Coach and AI Pacing Partner.

## Troubleshooting

- Sharing not available on Web: The app falls back to saving in cache and a confirmation alert.
- Image picker denied: Grant Photos permission in your device settings.
- Upload errors: Items queue automatically; process the queue when back online.

## Contact & Feedback

- Send feedback from Settings or community channels. For privacy concerns, review the in‑app Privacy policy and contact support.

## Offline & Sync

- Offline: Clear indicators when offline; lists cache locally.
- Sync: Campaign Rooms and Community sync in realtime; queued actions flush automatically.

## Privacy & Safety

- Data: Favorites and Local Profile are stored on your device; profile photos upload to secure storage.
- Terms: You must accept Terms to use the app; revisit anytime in Settings.
- Passcode: Optional passcode and Wellness Lock for shared devices.

---

<!-- End of guide -->
