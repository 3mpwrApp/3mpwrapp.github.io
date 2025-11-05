# Calendar Feed Setup Guide

## Overview
The 3mpwr App provides an auto-updating calendar subscription feature that allows users to subscribe to all events (community events, disability observances, holidays, and health awareness days) in their personal calendar apps.

## How It Works

### 1. Calendar Feed Generation
- **Script**: `scripts/generate-calendar-feed.mjs`
- **Output**: `public/events.ics`
- **Format**: ICS (iCalendar standard format)
- **Contents**: 
  - Community events from `data/events.ts`
  - Disability observances (World Braille Day, Autism Awareness Day, etc.)
  - Canadian national holidays
  - Health awareness events

### 2. Hosting the Feed
The generated `events.ics` file must be hosted at a publicly accessible URL:

**Default URL**: `https://3mpwrapp.pages.dev/events.ics`

#### Setup Options:

**Option A: Cloudflare Pages (Recommended)**
1. Generate the calendar feed:
   ```bash
   node scripts/generate-calendar-feed.mjs
   ```
2. Copy `public/events.ics` to your website's public directory
3. Deploy to Cloudflare Pages
4. The file will be accessible at `https://3mpwrapp.pages.dev/events.ics`

**Option B: GitHub Pages**
1. Generate the calendar feed
2. Add `public/events.ics` to your GitHub Pages repository
3. Enable GitHub Pages in repository settings
4. Update `EXPO_PUBLIC_CALENDAR_FEED_URL` to point to your GitHub Pages URL

**Option C: Custom Server**
1. Generate the calendar feed
2. Host the file on your server
3. Ensure CORS headers are set properly:
   ```
   Access-Control-Allow-Origin: *
   Content-Type: text/calendar
   ```
4. Update `EXPO_PUBLIC_CALENDAR_FEED_URL` environment variable

### 3. Keeping Feed Updated

#### Manual Updates
Run the script whenever you add new events:
```bash
node scripts/generate-calendar-feed.mjs
```

#### Automated Updates (Recommended)
Set up a GitHub Action to regenerate the feed daily:

```yaml
# .github/workflows/generate-calendar.yml
name: Generate Calendar Feed

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: node scripts/generate-calendar-feed.mjs
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages publish public --project-name=3mpwrapp
```

## User Instructions

Once the feed is hosted, users can subscribe by:

### iOS (Apple Calendar)
1. Open the Calendar app
2. Tap "Calendars" at the bottom
3. Tap "Add Calendar"
4. Tap "Add Subscription Calendar"
5. Enter: `https://3mpwrapp.pages.dev/events.ics`
6. Tap "Subscribe"
7. Customize name and color if desired
8. Tap "Add"

### Android (Google Calendar)
1. Open Google Calendar app or web
2. Tap ☰ menu
3. Tap "Settings"
4. Tap "Add calendar"
5. Tap "From URL"
6. Enter: `https://3mpwrapp.pages.dev/events.ics`
7. Tap "Add calendar"

### Outlook
1. Open Outlook Calendar
2. Select "Add Calendar" → "Subscribe from web"
3. Enter: `https://3mpwrapp.pages.dev/events.ics`
4. Name the calendar "3mpwr Events"
5. Click "Import"

### Other Calendar Apps
Most calendar applications support ICS subscriptions. Look for options like:
- "Subscribe to calendar"
- "Add calendar from URL"
- "Import from web"
- "ICS subscription"

## Admin Access & CRUD Operations

### Creating Events
1. Navigate to Events tab
2. Tap "Create Event" button
3. Fill in event details:
   - Title (minimum 3 characters)
   - Description (minimum 5 characters)
   - Date (format: YYYY-MM-DD HH:MM)
   - Location (optional)
   - Accessibility features (Virtual, ASL, Captions, Step-free, Sensory space)
4. Tap "Add Event"
5. Event appears immediately in local list
6. Event syncs to Firestore for other users

### Editing/Deleting Events
**Admin permissions required**

To enable admin access:
1. Check `context/AuthContext.tsx` for `isAdmin` logic
2. By default, admin status is determined by:
   - Email domain check
   - Firestore user role field
   - Environment variable flag

**For event creators or admins:**
1. Navigate to event detail page
2. Admin buttons appear at top:
   - ✏️ Edit button
   - 🗑️ Delete button
3. Edit: Update fields and save
4. Delete: Confirm deletion (permanent)

### Creating Campaigns
1. Navigate to Campaigns tab
2. Fill in "Create Campaign" form:
   - Title
   - Summary
   - Target (optional)
   - Goal count (optional)
   - Contact email (optional)
3. Tap "Create Campaign"
4. Campaign syncs to Firestore

### Editing/Deleting Campaigns
**Admin permissions required**

Same admin access rules as events. Buttons appear on campaign detail page.

## Troubleshooting

### Calendar feed not loading
1. **Check URL accessibility**: Open `https://3mpwrapp.pages.dev/events.ics` in a browser
2. **Verify CORS headers**: Calendar apps need proper CORS configuration
3. **Check file format**: Ensure ICS file is valid (use ICS validator)
4. **Clear cache**: Some calendar apps cache subscriptions for 24 hours

### Events not persisting
1. **Check Firestore connection**: Verify Firebase configuration in `google-services.json`
2. **Check authentication**: User must be logged in (or guest mode enabled)
3. **Check network**: Events save locally first, then sync to Firestore
4. **Check console**: Look for error messages in app logs

### Admin buttons not showing
1. **Verify admin status**: Check `useAuth().isAdmin` value
2. **Update admin configuration**: Edit `context/AuthContext.tsx`
3. **Add admin role in Firestore**: Set `users/{uid}/isAdmin: true`

## Environment Variables

```env
# Calendar feed URL (defaults to https://3mpwrapp.pages.dev/events.ics)
EXPO_PUBLIC_CALENDAR_FEED_URL=https://your-custom-domain.com/events.ics
```

## Technical Details

### ICS Format
- **Version**: 2.0
- **Standard**: RFC 5545 (iCalendar)
- **Refresh interval**: 24 hours (PT24H)
- **Timezone**: America/Toronto
- **Method**: PUBLISH

### Event Types Included
- Community events (user-created)
- Disability awareness days (World Braille Day, Autism Awareness Day, etc.)
- Canadian statutory holidays
- Health awareness months/days
- Provincial holidays (based on user settings)

### Feed Updates
- Static file regenerated by script
- Does not update in real-time
- Recommend daily regeneration via automation
- Users' calendars refresh every 24 hours (or per their app settings)

## Support

For issues or questions:
- Email: empowrapp08162025@gmail.com
- Website: https://3mpwrapp.pages.dev
- GitHub: [3mpwrApp/empowrapp-main](https://github.com/3mpwrApp/empowrapp-main)
