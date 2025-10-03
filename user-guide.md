---
layout: default
title: User Guide
---

# 3mpowr App – User Guide

> Note: Feature availability may vary by platform (iOS, Android, Web). Some items that require device capabilities are not supported on the Web (e.g., native Share Sheets, Image Picker). Where relevant, we note platform-specific behavior and alternatives.

## Table of Contents
- TOC
{:toc}

## Getting Started
- **First Launch**: You'll be prompted to accept the Terms. You can use Guest Mode without an account.
- **Navigation**: Bottom tabs take you to the main areas: Home, Campaigns, Community, Resources, Wellness, Advocacy, Settings, What's New.
- **Accessibility**: The app targets WCAG AAA contrast with dynamic text scaling. Screen reader labels and roles are applied throughout. Use the Accessibility toggle in Settings to explore more.

## Onboarding
### Your first 7 days
- **Purpose**: A private checklist to get oriented without sharing data. Tracks progress locally only.
- **Actions**:
  - Mark steps complete like capturing your basics, adding your first Evidence Locker note, tagging key contacts, bookmarking resources, setting reminders, recording denial dates, reviewing privacy settings, and more.
  - Quick links jump to common features (Evidence Locker, Resources, Advocacy Hub, Profile, Notifications).
- **Data & Privacy**: Stored on your device with optional persistence via AsyncStorage; not uploaded unless you explicitly choose cloud features elsewhere.

## Home
- Curated cards surface timely content, links, or reminders tailored to your context.
- Search bar with chips helps filter content quickly.
- **Analytics**: Basic anonymous event counts to understand usage; PII is redacted and schemas are enforced.

## Community
- Threads and chat for peer support with presence indicators.
- **Moderation**: Community policies apply. Admin tools exist to intervene.
- **Privacy**: Avoid sharing personal info; use Evidence Locker for sensitive documents.

## Resources
- Browse and bookmark resources by topic or jurisdiction.
- **Prepare to Appeal (Jurisdiction-aware)**:
  - Pick your province/territory and program (e.g., CPP-D, EI). You'll see deadlines and an official guidance link.
  - Export plan: Send steps to your Evidence Locker to keep privately.
  - **Data Sources**: Links to official websites; always verify current deadlines.
- **Evidence Locker**:
  - **Add Notes**: Text with optional tags (call, letter, medical, decision, payment, email).
  - **Attach Files/Photos**: Pick documents or select photos. Upload to Cloud when signed-in.
  - **Encrypted Notes**: Local encrypted store for sensitive notes; export/import with passphrase.
  - **Key Rotation**: Rotate device key and re-encrypt your local data.
  - **Queue**: If uploads fail (offline), items are queued for retry. You can process the queue later.
  - **Cloud List & Delete**: Load paginated cloud items and delete selected items.
  - **Export Options**:
    - Share summary text, export CSV, or export encrypted notes (passphrase required).
    - Import encrypted notes via document picker.
  - **Accessibility**: Each action uses proper roles and hints; progress is announced.

## Advocacy
- **Advocacy Hub**: Find advocates, get analytics about usage (anonymous), and filter by region or specialty.
- **Ally Hub**: Quick actions for supporters.
- **Lawyer Finder**: Filter and search professionals; open maps, websites, or email.

## Wellness
- Wellness tab includes trackers and tools (e.g., mood insights) to help self-manage over time.
- **Nudges**: Optional, configurable prompts to track entries and celebrate streaks.

## Campaigns
- Create or join campaigns that coordinate actions across the community.
- **Analytics** tracks engagement counts only; sensitive fields are never logged.

## Settings
- **Account**: Sign in/out, Guest Mode, admin indicators if applicable.
- **Notifications**: Toggle quiet hours, throttling, and templates (local/remote push on native platforms).
- **Accessibility**: Contrast, text scaling, and screen reader optimizations.
- **Privacy & Security**: Review encryption notes and suggestions for stronger passphrases.

## What's New
- Release notes and changelog cards showing recent improvements and bug fixes.

---

# Components Reference
Below are the major components you'll interact with; developers can find source in the `components/` folder.

- **A11yPressable**: Pressable button with screen reader role/labels and large touch targets.
- **UploadProgress**: Shows upload and queue progress with percentage and type.
- **SearchBar**: Input with chips to filter content across hubs.
- **Card**: Shared card layout for hubs.
- **TermsGate**: Ensures Terms are accepted on first run.
- **AdminGuard**: Renders admin-only sections based on auth claims.
- **ProvincePicker**: Helper for jurisdictional flows.
- **ProgressBar**: Lightweight progress indicator for file operations.
- **NotificationPreferences**: Manage in-app and push notification settings.

---

# Privacy & Security
- Evidence Locker encryption uses AES with device-stored keys and passphrase-based export/import.
- Exported files are encrypted; keep your passphrase safe—there's no recovery.
- Analytics registry enforces schemas and redacts PII. Sensitive fields or free text are never logged.

# Accessibility
- **Roles**: Components map RN accessibility roles to web ARIA when on Web.
- **Announcements**: Focus and live-region announcements guide screen reader users.
- **Color & Contrast**: Palette is AAA-compliant; avoid relying on color alone.

# Troubleshooting
- **Sharing not available on Web**: The app falls back to cache save and a confirmation alert.
- **Image picker denied**: Grant Photos permission in your device settings.
- **Upload errors**: Items are queued automatically; process the queue when back online.

# Contact & Feedback
- Send feedback from Settings or community channels.
- For privacy concerns, consult the in-app Privacy policy and contact support.
