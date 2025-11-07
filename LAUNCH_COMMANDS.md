# 🚀 LAUNCH COMMANDS - Copy & Paste Ready

**Status**: Everything ready, just execute these commands in order

---

## Command 1: Navigate to Project

```powershell
cd "d:\1-EmpowrApp\empowrapp-new\empowrapp-new"
```

**What it does**: Moves terminal to project directory  
**Expected**: Prompt changes to show project path

---

## Command 2: Authenticate with Firebase

Choose **ONE** option below:

### Option A: Browser Login (Recommended)
```powershell
firebase login
```

**What it does**:
- Opens browser to Google login
- Asks for Firebase permission
- Returns to terminal when done

**You'll see**:
```
✔ Logged in as: your-email@gmail.com
```

---

### Option B: No Local Server (Alternative)
```powershell
firebase login:ci --no-localhost
```

**What it does**:
- Shows a URL to open in browser
- Shows a code to paste back
- Copy/paste method

**Steps**:
1. Copy the URL shown
2. Open in browser
3. Allow permissions
4. Copy the code displayed
5. Paste back into terminal
6. Press Enter

**You'll see**:
```
✔ Access token created
✔ Logged in as: your-email@gmail.com
```

---

## Command 3: Deploy Firestore Rules

```powershell
firebase deploy --only firestore:rules
```

**What it does**:
- Uploads Firestore rules to Firebase
- Rules become active
- Event sync now enabled

**Expected output**:
```
=== Deploying to 'empowrapp' ...

i  deploying firestore
✔ firestore.rules file size is 2.5 KB
i  updating rules
✔  Firestore Rules have been successfully deployed.

✔  Deploy complete!
```

**Time**: ~30 seconds

---

## Command 4: Verify Deployment

```powershell
firebase rules:list --rules=firestore
```

**What it does**: Shows the deployed rules version

**Expected output**:
```
Rules for the firestore ruleset have been deployed.
```

---

## Command 5: Test the API

```powershell
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=3"
```

**What it does**: Gets first 3 events from Worker API

**Expected output**: JSON with 3 event objects

---

## TESTING FLOW (Do This After Deployment)

### Step 1: Create Event in App

1. Open app on phone/emulator
2. Go to **Events** tab
3. Tap **+ Create Event**
4. Fill in:
   - **Title**: "Test Event Nov 6"
   - **Date**: Today's date
   - **Location**: "Test Location"
5. Tap **Save**

**You should see**: "✅ Event synced to website"

---

### Step 2: Verify on API

```powershell
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=1"
```

**Look for**: Your test event in the response (should be at the top)

---

### Step 3: Verify on Website

Open: https://3mpwrapp.pages.dev/events/

**Look for**: Your test event in the calendar

**Wait time**: 1-5 minutes (due to cache)

---

### Step 4: Test Edit

1. In app, find your test event
2. Tap **Edit**
3. Change title to: "Test Event Nov 6 - EDITED"
4. Tap **Save**

**On website**: Title should update within 5 minutes

---

### Step 5: Test Delete

1. In app, find your test event
2. Tap **Delete**
3. Confirm deletion

**On website**: Event should disappear within 5 minutes

---

## IF SOMETHING GOES WRONG

### Authentication Failed

```powershell
# Try again
firebase login
```

or

```powershell
# Try the non-localhost option
firebase login:ci --no-localhost
```

---

### Deploy Failed

```powershell
# Check if you're in the right directory
pwd

# Should show: D:\1-EmpowrApp\empowrapp-new\empowrapp-new

# If wrong, navigate:
cd "d:\1-EmpowrApp\empowrapp-new\empowrapp-new"

# Try deploy again
firebase deploy --only firestore:rules
```

---

### Rules Not Updating

```powershell
# Rollback to previous version
firebase rules:rollback --rules=firestore

# Try deploying again
firebase deploy --only firestore:rules
```

---

### Event Not Appearing on Website

```powershell
# Check Worker is working
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health"

# Should show: "firebaseConnected": true

# Clear cache and try API again
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=1" -H "Cache-Control: no-cache"

# Wait a few minutes for cache to expire
# Website caches for 5 minutes
```

---

## FULL COMMAND SEQUENCE (Copy All)

```powershell
# 1. Navigate to project
cd "d:\1-EmpowrApp\empowrapp-new\empowrapp-new"

# 2. Authenticate (browser will open)
firebase login

# 3. Deploy rules (30 seconds)
firebase deploy --only firestore:rules

# 4. Verify deployment
firebase rules:list --rules=firestore

# 5. Test API
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=3"
```

**Total time**: ~5 minutes

---

## WHAT HAPPENS AUTOMATICALLY AFTER DEPLOY

✅ **Immediately**:
- Rules become active
- Signed-in users can create events
- Creators can edit/delete events

✅ **When You Create Event**:
- Event saved locally instantly
- Event syncs to Firestore (2-5 sec)
- Both collections updated
- App shows "synced" message

✅ **On Website**:
- Worker queries Firestore
- Cache refreshed (or on next query)
- Website shows new event (within 5 min)

✅ **When You Edit Event**:
- Change updates in Firestore
- Both collections updated
- Website shows updated event (within 5 min)

✅ **When You Delete Event**:
- Event removed from Firestore
- Both collections updated
- Website event disappears (within 5 min)

---

## SUCCESS INDICATORS

✅ Command 2 (Authentication) shows:
```
✔ Logged in as: [your-email]
```

✅ Command 3 (Deploy) shows:
```
✔  Firestore Rules have been successfully deployed.
```

✅ Command 4 (Verify) shows:
```
Rules for the firestore ruleset have been deployed.
```

✅ Command 5 (Test API) shows:
```json
{
  "events": [
    {
      "id": "...",
      "title": "...",
      ...
    }
  ]
}
```

✅ After creating event, you see:
```
✅ Event synced to website
```

---

## READY TO START?

Follow these commands in order:

1. `cd "d:\1-EmpowrApp\empowrapp-new\empowrapp-new"`
2. `firebase login`
3. `firebase deploy --only firestore:rules`
4. `firebase rules:list --rules=firestore`
5. `curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=3"`

**Then test in the app and on the website.**

You're about 10 minutes away from 🎉 LAUNCH!

---

## STILL HAVE QUESTIONS?

Read these files in this order:

1. `README_DEPLOYMENT.md` - Quick reference (you read this)
2. `ACTION_PLAN.md` - Detailed steps
3. `DEPLOYMENT_STATUS.md` - Status & timeline
4. `FIREBASE_DEPLOYMENT_GUIDE.md` - Troubleshooting

---

**Time to launch**: ~10 minutes  
**Complexity**: Very Low  
**Risk**: Very Low (rollback is 1 command)  

**Status**: 🟢 Ready to execute!
