# Calendar Feed with Firestore Integration

## Overview

The calendar feed at `https://3mpwrapp.pages.dev/events.ics` now includes **all user-created events** from Firestore, along with health observances, disability awareness days, and holidays.

---

## What's Included

The calendar feed automatically combines:

1. **User-Created Events** - All events created by users and admins in the Events tab
2. **Health Awareness Months** - 50+ observances (Mental Health Month, Diabetes Month, etc.)
3. **Disability Awareness Days** - International observances and awareness days
4. **Canadian Holidays** - Statutory holidays (New Year's, Canada Day, Thanksgiving, etc.)
5. **Static Community Events** - Hardcoded special events

---

## How It Works

### Automatic Updates

The calendar feed is automatically regenerated **daily at 3 AM UTC** via GitHub Actions:

```yaml
schedule:
  - cron: '0 3 * * *'  # Daily at 3 AM UTC
```

This means:
- ✅ New user-created events appear in the calendar feed within 24 hours
- ✅ Deleted events are removed from the feed within 24 hours
- ✅ No manual intervention needed

### Manual Regeneration

To manually regenerate the calendar feed:

1. **With Firestore access** (requires service account):
   ```bash
   # Set service account path
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
   
   # Or place it at firebase/serviceAccount.json
   
   # Generate feed
   node scripts/generate-calendar-feed.mjs
   ```

2. **Without Firestore access** (static events only):
   ```bash
   # Script will warn and skip Firestore events
   node scripts/generate-calendar-feed.mjs
   ```

---

## Setup (For Admins)

### GitHub Actions Setup

To enable automatic calendar updates, you need to add a Firebase service account to GitHub Secrets:

1. **Get Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON content from the service account file
   - Click "Add secret"

3. **Verify Workflow:**
   - Go to Actions tab in GitHub
   - You should see "Update Calendar Feed" workflow
   - It will run automatically daily at 3 AM UTC
   - You can also trigger it manually via "Run workflow" button

---

## How User Events Appear

### Event Creation Flow

1. User creates an event in the Events tab
2. Event is saved to Firestore `events` collection
3. Within 24 hours, GitHub Actions runs the calendar update script
4. Script fetches all events from Firestore
5. Generates new `public/events.ics` file
6. Commits and pushes the updated calendar feed
7. Users subscribed to the calendar see the new event

### Event Deletion Flow

1. User/admin deletes an event
2. Event is removed from Firestore
3. Within 24 hours, calendar regenerates without that event
4. Users see the event removed from their calendar

---

## Permissions & Privacy

### Who Can Create Events?
- ✅ **Any logged-in user** can create events
- ✅ **Super admin** (empowrapp08162025@gmail.com) has full access
- ✅ **Event creators** can edit/delete their own events
- ✅ **Regular admins** can edit/delete any event

### What Gets Published?
- ✅ All events in Firestore `events` collection appear in the feed
- ✅ Event details: title, description, date, location
- ❌ Creator identity is **NOT** published (privacy-friendly)
- ❌ Internal metadata (createdBy, createdAt) is **NOT** published

### Data Security
- Service account credentials are stored securely in GitHub Secrets
- Service account file is never committed to Git
- Temporary service account file is deleted after each workflow run
- Only read access to Firestore `events` collection is needed

---

## Subscribing to the Calendar

Users can subscribe to the calendar feed in their calendar app:

### Apple Calendar (iOS/macOS)
1. Open Calendar app
2. File → New Calendar Subscription
3. Enter: `https://3mpwrapp.pages.dev/events.ics`
4. Click Subscribe
5. Choose update frequency (recommended: Daily)

### Google Calendar
1. Open Google Calendar (web)
2. Click "+" next to "Other calendars"
3. Select "From URL"
4. Enter: `https://3mpwrapp.pages.dev/events.ics`
5. Click "Add calendar"
6. Auto-updates every 24 hours

### Outlook
1. Open Outlook (web or desktop)
2. Calendar → Add calendar → Subscribe from web
3. Enter: `https://3mpwrapp.pages.dev/events.ics`
4. Name it "3mpwr Events"
5. Click Import

---

## Troubleshooting

### Calendar feed not updating?

**Check GitHub Actions:**
1. Go to your repo's Actions tab
2. Look for failed "Update Calendar Feed" workflows
3. Check logs for errors

**Common issues:**
- Missing `FIREBASE_SERVICE_ACCOUNT` secret
- Invalid service account JSON
- Firestore read permissions not set

### Events not appearing?

**Verify in Firestore:**
1. Go to Firebase Console
2. Firestore Database
3. Check `events` collection
4. Confirm event exists with valid `date` field

**Check date format:**
- Events must have a `date` field
- Format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`
- Invalid dates are skipped

### Manual regeneration not working?

**If "Service account not found" error:**
```bash
# Option 1: Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccount.json"
node scripts/generate-calendar-feed.mjs

# Option 2: Place file in firebase/ directory
cp serviceAccount.json firebase/serviceAccount.json
node scripts/generate-calendar-feed.mjs
```

**If "Permission denied" error:**
- Service account needs Firestore read permissions
- Check Firebase IAM & Admin → Service Accounts
- Ensure "Cloud Datastore User" or "Firebase Admin" role

---

## Statistics

Current calendar feed includes:
- **131+ events** (50+ health observances + holidays + user events)
- **Covers 2025 and 2026**
- **Auto-updates daily**
- **~48 KB file size**
- **Refreshes every 24 hours** for subscribed users

---

## Technical Details

### Script: `scripts/generate-calendar-feed.mjs`

**Features:**
- ES module syntax for modern Node.js
- Async Firebase Admin SDK integration
- Graceful fallback if Firestore unavailable
- Combines multiple event sources
- Generates valid ICS (iCalendar) format
- Proper timezone handling (America/Toronto)

**Event Sources:**
1. `fetchFirestoreEvents()` - User-created events from Firestore
2. `generateHealthAwareness()` - 50+ health awareness months
3. `generateDisabilityObservances()` - Disability awareness days
4. `generateCanadianHolidays()` - Canadian statutory holidays
5. `staticEvents` - Hardcoded community events

**Output:**
- File: `public/events.ics`
- Format: iCalendar (RFC 5545)
- Encoding: UTF-8
- Refresh: 24 hours (PT24H)

---

## Future Enhancements

Potential improvements:
- [ ] Filter by event type (health, disability, holidays, user events)
- [ ] Regional calendar variants (US, Canada, International)
- [ ] Custom subscription URLs with user preferences
- [ ] Event reminders via push notifications
- [ ] Export individual events to calendar
- [ ] Recurring events support
- [ ] Multi-timezone support

---

## Support

For issues or questions:
- Check GitHub Actions logs for workflow errors
- Review Firestore console for data integrity
- Contact: empowrapp08162025@gmail.com

---

**Last Updated:** November 5, 2025
