# 📋 Campaigns Firestore Auto-Sync Setup Guide

**Status:** ✅ Code Implemented | ⏳ Firestore Rules Required

---

## 🎯 Overview

The campaigns page now fetches data **directly from Firestore REST API** every 30 seconds. This provides real-time updates when users create campaigns in the 3mpwrApp.

**Key Differences from Events:**
- **Events:** Use Cloudflare Worker proxy (5-minute refresh)
- **Campaigns:** Direct Firestore REST API (30-second refresh)

---

## 🚀 Implementation Complete

✅ **Campaigns Page Updated:** `/campaigns/index.md`

**Features Implemented:**
1. ✅ Direct Firestore REST API fetch
2. ✅ Firestore document parsing (handles all field types)
3. ✅ 30-second auto-refresh interval
4. ✅ Real-time sync status display
5. ✅ #3mpwrApp hashtag in campaign sharing
6. ✅ Error handling with setup instructions
7. ✅ Responsive campaign card display

---

## 📡 API Endpoint

```
https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production
```

**Firestore Collection:** `campaigns_production`

---

## 🔒 Required: Firestore Security Rules

**CRITICAL STEP:** You must update Firestore security rules to allow public read access.

### Current Rules (Likely)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default: no public access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Updated Rules (Required)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Campaigns: Public read, authenticated write
    match /campaigns_production/{campaignId} {
      allow read: if true;  // ✅ Public can read campaigns
      allow write: if request.auth != null;  // Only authenticated app users can write
    }
    
    // Events: Public read (if not already set)
    match /events_production/{eventId} {
      allow read: if true;  // ✅ Public can read events
      allow write: if request.auth != null;  // Only authenticated app users can write
    }
    
    // All other collections remain protected
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🛠️ Deployment Steps

### Step 1: Locate Firestore Rules File

Your Firestore rules are in: `firestore.rules` (in your Firebase project directory)

### Step 2: Edit Rules

Open `firestore.rules` and add the public read access for `campaigns_production`:

```javascript
match /campaigns_production/{campaignId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### Step 3: Deploy Rules

Run this command from your Firebase project directory:

```bash
firebase deploy --only firestore:rules
```

### Step 4: Verify Deployment

After deployment, you should see:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/empowrapp/overview
```

### Step 5: Test Website

Visit https://3mpwrapp.pages.dev/campaigns/ and check:
- ✅ No "Connection Issue" error
- ✅ Sync status shows "✅ X active campaigns" or "📭 No active campaigns yet"
- ✅ Console logs show: "✅ Loaded X campaigns from Firestore"

---

## 🧪 Testing the Integration

### Browser Developer Console Test

Open https://3mpwrapp.pages.dev/campaigns/ and check console:

```javascript
// You should see:
🔄 Fetching campaigns from Firestore...
✅ Loaded X campaigns from Firestore
```

### Manual API Test

Test the Firestore endpoint directly:

```bash
curl "https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production"
```

**Expected Response (Empty Collection):**
```json
{}
```

**Expected Response (With Campaigns):**
```json
{
  "documents": [
    {
      "name": "projects/empowrapp/databases/(default)/documents/campaigns_production/campaignId123",
      "fields": {
        "title": {
          "stringValue": "Fight for Fair WSIB Appeals"
        },
        "summary": {
          "stringValue": "Demand faster appeal processes..."
        },
        "organizer": {
          "stringValue": "Ontario Injured Workers"
        }
      },
      "createTime": "2025-01-01T00:00:00.000000Z",
      "updateTime": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

## 📊 Firestore Document Format

The website automatically parses Firestore's REST API format.

### Firestore REST API Format

```json
{
  "fields": {
    "title": { "stringValue": "Campaign Title" },
    "summary": { "stringValue": "Description..." },
    "goal": { "stringValue": "1000 signatures" },
    "progress": { "integerValue": "75" },
    "organizer": { "stringValue": "John Doe" },
    "tags": {
      "arrayValue": {
        "values": [
          { "stringValue": "WSIB" },
          { "stringValue": "Workers Rights" }
        ]
      }
    },
    "icon": { "stringValue": "📣" },
    "shareLink": { "stringValue": "https://..." }
  }
}
```

### Parsed JavaScript Object

The `parseCampaignDocument()` function converts this to:

```javascript
{
  id: "campaignId123",
  title: "Campaign Title",
  summary: "Description...",
  goal: "1000 signatures",
  progress: 75,
  organizer: "John Doe",
  tags: ["WSIB", "Workers Rights"],
  icon: "📣",
  shareLink: "https://..."
}
```

---

## 🔄 Auto-Refresh Behavior

- **Interval:** 30 seconds (vs 5 minutes for events)
- **Status Display:** Updates in real-time
- **Last Updated:** Shows timestamp of last successful fetch
- **Silent Failures:** Errors logged to console, user sees previous data

---

## 🎨 Campaign Card Display

Each campaign displays:
- 📣 **Icon & Title** (large, bold)
- 📝 **Summary** (if provided)
- 🎯 **Goal** with progress bar (if provided)
- 👤 **Organizer** name
- 🏷️ **Tags** (color-coded chips)
- 💪 **Join Campaign** button (deep links to app)
- 📢 **Share** button (includes #3mpwrApp hashtag)

---

## 🔗 Campaign Schema (Expected Fields)

When creating campaigns in the app, these fields are displayed on the website:

| Field | Type | Required | Display |
|-------|------|----------|---------|
| `id` | string | ✅ | Document ID (auto-generated) |
| `title` | string | ✅ | Campaign heading |
| `summary` | string | ❌ | Campaign description |
| `goal` | string | ❌ | Target (e.g., "1000 signatures") |
| `progress` | number | ❌ | Percentage (0-100) |
| `organizer` | string | ❌ | Creator name |
| `tags` | array | ❌ | Category tags |
| `icon` | string | ❌ | Emoji icon (default: 📣) |
| `shareLink` | string | ❌ | Deep link to campaign |

---

## 🚨 Troubleshooting

### Error: "Connection Issue"

**Possible Causes:**
1. ❌ Firestore rules not deployed
2. ❌ Collection name mismatch (must be `campaigns_production`)
3. ❌ Network/CORS issue
4. ✅ No campaigns exist yet (this is normal!)

**Solution:**
1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Verify collection name in Firestore Console
3. Check browser console for detailed error messages
4. Test API endpoint manually with curl

### Error: "HTTP 403 Forbidden"

**Cause:** Firestore rules don't allow public read access

**Solution:**
```javascript
match /campaigns_production/{campaignId} {
  allow read: if true;  // Add this line
}
```

Then deploy: `firebase deploy --only firestore:rules`

### No Campaigns Showing

**This is expected if:**
- ✅ App hasn't launched yet
- ✅ No users have created campaigns
- ✅ All campaigns are marked as "private" in the app

**To test:**
1. Manually add a test campaign to Firestore
2. Check Firestore Console: `campaigns_production` collection
3. Verify document has required fields (`id`, `title`)

---

## 🎯 Next Steps

1. ✅ **Update Firestore rules** (see above)
2. ✅ **Deploy rules:** `firebase deploy --only firestore:rules`
3. ✅ **Test website:** Visit `/campaigns/` and verify no errors
4. ✅ **Create test campaign** (optional, for visual testing)
5. ✅ **Monitor sync status** in browser console

---

## 📚 Related Documentation

- **Events Auto-Sync:** `/events/` (uses Cloudflare Worker)
- **Hashtag Tracking:** `/HASHTAG-TRACKING.md`
- **Firestore Security Rules:** [Firebase Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- **Firestore REST API:** [API Reference](https://firebase.google.com/docs/firestore/use-rest-api)

---

## ✅ Summary

**What's Implemented:**
- ✅ Direct Firestore REST API integration
- ✅ 30-second auto-refresh
- ✅ Firestore document parsing
- ✅ Campaign card rendering
- ✅ #3mpwrApp hashtag in shares
- ✅ Error handling with instructions

**What You Need to Do:**
1. Update `firestore.rules` to allow public read for `campaigns_production`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Test at https://3mpwrapp.pages.dev/campaigns/

**Expected Result:**
- Website fetches campaigns from Firestore every 30 seconds
- Users can browse campaigns without downloading app
- "Join Campaign" deep links to app
- Share function includes #3mpwrApp for tracking

---

**🎉 Once rules are deployed, campaigns will auto-sync in real-time!**
