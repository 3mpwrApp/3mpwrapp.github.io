# 🔐 Firebase Rules Deployment Guide

## Problem
Firebase CLI requires authentication to deploy rules. You have several options to authenticate.

---

## Option 1: Interactive Login (Recommended if you have browser access)

```powershell
# From the project root directory
firebase login

# Then deploy
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔  Deploying firestore.rules
i  firestore.rules file size is 2.5 KB
i  updating rules
✔  Firestore Rules have been successfully deployed.

✔  Deploy complete!
```

---

## Option 2: Non-Interactive Login (CI Token)

If you don't have browser access on this machine:

```powershell
# This opens a browser to get a CI token
firebase login:ci

# Copy the token you receive, then set it as an environment variable
$env:FIREBASE_TOKEN = "your_token_here"

# Now deploy
firebase deploy --only firestore:rules --project empowrapp
```

**Steps:**
1. Run `firebase login:ci`
2. It will display a token or open a browser
3. Copy the token
4. Set environment variable: `$env:FIREBASE_TOKEN = "token"`
5. Deploy with: `firebase deploy --only firestore:rules --project empowrapp`

---

## Option 3: Direct Project Specification

```powershell
firebase deploy --only firestore:rules --project empowrapp
```

This should work if you're already logged in from a previous session.

---

## Option 4: Manual Deployment via Console

If CLI continues to have issues:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `empowrapp`
3. Navigate to: Firestore Database → Rules
4. Paste the contents of `firebase/firestore.rules`
5. Click "Publish"

**To get the rules content:**
```powershell
Get-Content firebase/firestore.rules
```

Then copy the entire content and paste it in the Firebase Console.

---

## Verification

After deployment, verify the rules are active:

```powershell
# This will show you're in the right project
firebase projects:list

# Check current rules (if you have gcloud installed)
gcloud firestore:rules:describe --project=empowrapp
```

---

## Current Status

✅ **Configuration files created:**
- `firebase.json` - Points to firestore.rules location
- `.firebaserc` - Sets default project to "empowrapp"

⏳ **Next step:** Authenticate with Firebase

---

## Files Created
- ✅ `firebase/firestore.rules` - Security rules (ready to deploy)
- ✅ `firebase.json` - Firebase configuration
- ✅ `.firebaserc` - Project alias configuration

---

## What These Rules Do

The deployed rules will:
- ✅ Allow anyone to **read** events
- ✅ Allow **signed-in users** to **create** events in:
  - `events_production` collection
  - `events_preview` collection
- ✅ Allow **event creator or admin** to **edit** events
- ✅ Allow **event creator or admin** to **delete** events
- ✅ Validate all required fields (title, date, status, createdBy)

---

## After Deployment

Once rules are deployed, test the sync:

```powershell
# Create a test event in the app
# It should sync to Firestore automatically

# Verify it appeared in both collections
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production"
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=preview"

# Both should show the new event
```

---

## Troubleshooting

### "Not in a Firebase app directory"
- ✅ Fixed: `firebase.json` is now in place

### "No currently active project"
- ✅ Fixed: `.firebaserc` is now in place

### "Failed to authenticate"
- ⏳ Need to run `firebase login` or set `FIREBASE_TOKEN`
- See Option 1 or Option 2 above

### Permission Denied
- Your Firebase account may not have access to the `empowrapp` project
- Contact project admin to add your account

### Rules not applying
- Wait 1-2 minutes for deployment to propagate
- Refresh the Firebase Console
- Clear local app cache and restart

---

## Quick Deployment Commands Reference

```powershell
# List available projects
firebase projects:list

# Set active project
firebase use empowrapp

# Deploy rules only (fastest)
firebase deploy --only firestore:rules

# Deploy with verbose output
firebase deploy --only firestore:rules --debug

# Deploy storage rules too (if needed)
firebase deploy --only "firestore:rules,storage"

# Deploy everything
firebase deploy

# Get current rules version
firebase rules:list --rules=firestore
```

---

## Success Indicators

✅ You'll know it worked when you see:
```
✔  Deploying firestore.rules
i  firestore.rules file size is 2.5 KB
i  updating rules
✔  Firestore Rules have been successfully deployed.

✔  Deploy complete!
```

Then app events will automatically sync to the website!

---

**Ready to proceed?**
1. Choose authentication option (1, 2, 3, or 4 above)
2. Deploy the rules
3. Run a test from the app
4. Verify event appears on website

Let me know which option you'd like to proceed with!
