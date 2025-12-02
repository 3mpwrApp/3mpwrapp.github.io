# Calendar Integration Guide

## Auto-Sync Events Calendar to Website

This guide explains how to integrate the auto-updating events calendar feed with your website (https://3mpwrapp.pages.dev).

---

## Overview

The 3mpwr App generates an `.ics` calendar feed file that includes:
- ✅ User-created events (from Firestore)
- ✅ Disability awareness days
- ✅ Health observances
- ✅ Canadian holidays
- ✅ Provincial holidays (based on user settings)

**Total: 131+ events** across current and next year.

---

## Step-by-Step Integration

### **Step 1: Verify Firebase Service Account**

The calendar generation script needs access to Firestore to pull user-created events.

1. **Check if service account exists:**
   ```bash
   ls firebase/serviceAccount.json
   ```

2. **If missing, download from Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`empowrapp`)
   - Go to **Project Settings** > **Service Accounts**
   - Click **Generate New Private Key**
   - Save as `firebase/serviceAccount.json`

3. **Add to GitHub Secrets (for automation):**
   - Go to GitHub repo: https://github.com/3mpwrApp/empowrapp-main
   - Settings → Secrets and variables → Actions
   - Add secret: `FIREBASE_SERVICE_ACCOUNT`
   - Paste the entire contents of `serviceAccount.json`

---

### **Step 2: Generate Calendar Feed Locally**

Run the generation script to create the calendar file:

```bash
node scripts/generate-calendar-feed.mjs
```

**Expected output:**
```
🗓️  Generating calendar feed...
📦 Fetched X events from Firestore
📅 Total events: 131+
✅ Calendar feed generated: public/events.ics
📍 Size: ~48 KB
```

This creates `public/events.ics` with all events in iCalendar format.

---

### **Step 3: Deploy to Website**

#### **Option A: Cloudflare Pages (Recommended)**

Your website is hosted at https://3mpwrapp.pages.dev, which uses Cloudflare Pages.

1. **Commit the generated file:**
   ```bash
   git add public/events.ics
   git commit -m "feat: add calendar feed"
   git push origin main
   ```

2. **Cloudflare Pages will automatically deploy** and the file will be available at:
   ```
   https://3mpwrapp.pages.dev/events.ics
   ```

3. **Verify the deployment:**
   - Wait 1-2 minutes for deployment
   - Visit: https://3mpwrapp.pages.dev/events.ics
   - You should see the raw `.ics` file content

#### **Option B: Manual Upload**

If you have direct access to the website hosting:

1. Upload `public/events.ics` to the root directory
2. Ensure it's accessible at `/events.ics`
3. Test: https://3mpwrapp.pages.dev/events.ics

---

### **Step 4: Automate Daily Updates (GitHub Actions)**

The calendar should update daily to include new user-created events.

**Already configured!** The GitHub Action runs:
- ⏰ **Daily at 3 AM UTC** (11 PM EST / 8 PM PST)
- 🔄 **On every push to main** (if calendar script changes)
- 🎯 **Manual trigger** available

**File:** `.github/workflows/update-calendar-feed.yml`

**What it does:**
1. Fetches latest events from Firestore
2. Generates updated `public/events.ics`
3. Commits and pushes the file
4. Cloudflare auto-deploys the update

**Manual trigger:**
- Go to: https://github.com/3mpwrApp/empowrapp-main/actions
- Select "Update Calendar Feed"
- Click "Run workflow"

---

### **Step 5: Test the Calendar Subscription**

#### **iOS (iPhone/iPad)**
1. Open **Calendar** app
2. Tap **Calendars** (bottom center)
3. Tap **Add Calendar**
4. Tap **Add Subscription Calendar**
5. Paste: `https://3mpwrapp.pages.dev/events.ics`
6. Tap **Subscribe**
7. Choose options (name, color, alerts)
8. Tap **Done**

#### **Android (Google Calendar)**
1. Open **Google Calendar** app
2. Tap **☰ Menu** (top left)
3. Tap **Settings**
4. Tap **Add calendar**
5. Tap **From URL**
6. Paste: `https://3mpwrapp.pages.dev/events.ics`
7. Tap **Add calendar**

#### **Desktop (macOS Calendar)**
1. Open **Calendar** app
2. Go to **File** → **New Calendar Subscription**
3. Paste: `https://3mpwrapp.pages.dev/events.ics`
4. Click **Subscribe**

#### **Desktop (Google Calendar Web)**
1. Go to https://calendar.google.com
2. Click **+** next to "Other calendars"
3. Select **From URL**
4. Paste: `https://3mpwrapp.pages.dev/events.ics`
5. Click **Add calendar**

---

### **Step 6: Update App Environment Variable**

The app uses this URL to show users the subscription link.

1. **Check current value:**
   ```bash
   cat .env | grep EXPO_PUBLIC_CALENDAR_FEED_URL
   ```

2. **Should be set to:**
   ```
   EXPO_PUBLIC_CALENDAR_FEED_URL=https://3mpwrapp.pages.dev/events.ics
   ```

3. **If not set, add to `.env`:**
   ```bash
   echo "EXPO_PUBLIC_CALENDAR_FEED_URL=https://3mpwrapp.pages.dev/events.ics" >> .env
   ```

4. **Rebuild and publish update:**
   ```bash
   eas update --channel production --message "Update calendar feed URL"
   ```

---

## How Events Are Stored (For Admin Account)

### **Events Tab (empowrapp08162025@gmail.com)**

When you create an event from your admin account:

1. **Local creation:**
   ```typescript
   const id = `evt-${Date.now()}`;
   const newEvt = { 
     id, 
     title: "Your Event",
     description: "Event details",
     date: "2025-11-15T18:00:00",
     location: "Toronto, ON",
     createdBy: user.uid, // ← Your Firebase UID
     createdAt: Date.now()
   };
   ```

2. **Firestore storage:**
   - Collection: `events`
   - Document ID: `evt-1730876400000`
   - Fields:
     - `title`, `description`, `date`, `location`
     - `createdBy`: Your Firebase UID
     - `createdAt`: Unix timestamp
     - `isVirtual`, `asl`, `captions`, `stepFree`, `sensorySpace`

3. **Calendar feed inclusion:**
   - Next day at 3 AM UTC, GitHub Action runs
   - Script fetches all events from Firestore
   - Generates updated `events.ics` file
   - Your event appears in everyone's subscribed calendar

### **Campaigns Tab (empowrapp08162025@gmail.com)**

When you create a campaign from your admin account:

1. **Local creation:**
   ```typescript
   const c = {
     id: `camp-${Date.now()}`,
     title: "Your Campaign",
     summary: "Campaign description",
     target: "Government agency",
     goalCount: 1000,
     contactEmail: "empowrapp08162025@gmail.com",
     createdBy: user.uid, // ← Your Firebase UID
     createdAt: Date.now()
   };
   ```

2. **Firestore storage:**
   - Collection: `campaigns`
   - Document ID: `camp-1730876400000`
   - Fields:
     - `title`, `summary`, `target`, `goalCount`, `contactEmail`
     - `createdBy`: Your Firebase UID
     - `createdAt`: Unix timestamp
     - `membersCount`: 0 (increments when users join)

3. **Access control:**
   - **You (super admin)**: Can edit/delete ANY campaign
   - **Regular users**: Can only edit/delete their own campaigns
   - **All users**: Can join and share campaigns

---

## Verification Checklist

✅ **Calendar Feed Generation**
```bash
node scripts/generate-calendar-feed.mjs
# Should output: "✅ Calendar feed generated"
```

✅ **File Exists**
```bash
ls -lh public/events.ics
# Should show ~48 KB file
```

✅ **Firestore Events Included**
```bash
node scripts/generate-calendar-feed.mjs | grep "Firestore events"
# Should show count > 0 if you've created events
```

✅ **Website Accessible**
```bash
curl -I https://3mpwrapp.pages.dev/events.ics
# Should return: HTTP/2 200
```

✅ **GitHub Action Runs**
- Visit: https://github.com/3mpwrApp/empowrapp-main/actions/workflows/update-calendar-feed.yml
- Should show successful runs (green checkmarks)

✅ **Admin Events Stored**
- Open Firebase Console → Firestore Database
- Check `events` collection
- Should see documents with `createdBy` = your UID

✅ **Admin Campaigns Stored**
- Open Firebase Console → Firestore Database
- Check `campaigns` collection
- Should see documents with `createdBy` = your UID

---

## Troubleshooting

### Calendar feed shows 0 Firestore events

**Problem:** Script can't access Firestore
**Solution:**
1. Verify `firebase/serviceAccount.json` exists
2. Check file permissions: `chmod 600 firebase/serviceAccount.json`
3. Re-download service account from Firebase Console

### Website returns 404 for events.ics

**Problem:** File not deployed to Cloudflare Pages
**Solution:**
1. Check if `public/events.ics` is in git: `git status`
2. Commit and push: `git add public/events.ics && git commit -m "add calendar" && git push`
3. Wait 2-3 minutes for Cloudflare deployment
4. Check Cloudflare Pages dashboard for build status

### GitHub Action fails

**Problem:** Missing `FIREBASE_SERVICE_ACCOUNT` secret
**Solution:**
1. Go to GitHub repo settings → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT`
3. Paste contents of `firebase/serviceAccount.json`
4. Re-run the action manually

### Events don't appear in calendar app

**Problem:** Calendar app caching or subscription issue
**Solution:**
1. Remove and re-add subscription in calendar app
2. Check feed URL is exactly: `https://3mpwrapp.pages.dev/events.ics`
3. Some apps take 24-48 hours to auto-refresh
4. Force refresh: remove subscription → wait 1 minute → re-add

### Admin events not saving to Firestore

**Problem:** Firebase authentication or permissions
**Solution:**
1. Check you're logged in: `empowrapp08162025@gmail.com`
2. Check Firestore rules allow writes to `events` and `campaigns`
3. Check network connectivity in app
4. View app logs for Firestore errors

---

## Summary

**Calendar Integration Status:**
- ✅ Generation script: `scripts/generate-calendar-feed.mjs`
- ✅ Auto-update workflow: `.github/workflows/update-calendar-feed.yml`
- ✅ Daily updates: 3 AM UTC
- ✅ Includes: 131+ events (user events + observances + holidays)
- ✅ Website URL: `https://3mpwrapp.pages.dev/events.ics`

**Admin Account Storage:**
- ✅ Events: Store to Firestore `events` collection with `createdBy` field
- ✅ Campaigns: Store to Firestore `campaigns` collection with `createdBy` field
- ✅ Super admin: Only `empowrapp08162025@gmail.com` has full edit/delete access
- ✅ Creator permissions: Users can edit/delete their own content

**Next Actions:**
1. Run `node scripts/generate-calendar-feed.mjs` once locally
2. Commit and push `public/events.ics`
3. Verify calendar feed is accessible at https://3mpwrapp.pages.dev/events.ics
4. Test subscription in your calendar app
5. GitHub Actions will auto-update daily from now on

---

## Support

If you encounter issues:
1. Check GitHub Actions logs: https://github.com/3mpwrApp/empowrapp-main/actions
2. Check Cloudflare Pages dashboard for deployment status
3. Verify Firebase Console → Firestore Database has your events/campaigns
4. Review app logs when creating events/campaigns from your admin account
