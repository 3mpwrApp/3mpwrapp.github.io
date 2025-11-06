# ✅ Cloudflare Worker Deployment Guide - Verification & Testing

> Step-by-step guide to deploy and verify your enhanced Cloudflare Worker with Firestore integration

---

## 📋 Pre-Deployment Checklist

Before you deploy, make sure you have:

- ✅ Cloudflare account with Workers enabled
- ✅ Wrangler CLI installed: `npm install -g wrangler`
- ✅ Firebase service account key (JSON)
- ✅ Firebase project URL
- ✅ Admin access to both Firestore and Cloudflare

**Check your setup:**

```powershell
# Verify wrangler is installed
wrangler --version

# Verify you're in server directory
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new\server
ls wrangler.toml worker.js package.json
```

---

## 🔑 Step 1: Set Up Cloudflare Credentials

### 1A. Login to Cloudflare

```powershell
wrangler login
```

This opens your browser. Sign in with your Cloudflare account.

**What you should see:**
```
✓ Successfully logged in with Cloudflare!
```

### 1B. Verify Login

```powershell
wrangler whoami
```

**Expected output:**
```
Account
└─ name: your@email.com
│
└─ Account ID: abc123...
└─ type: free
```

---

## 🔐 Step 2: Create KV Namespaces

The Worker uses Cloudflare KV to cache Firestore data.

### 2A. Create Production Namespace

```powershell
wrangler kv:namespace create "calendar_cache_prod"
```

**Look for this output:**
```
✓ Created namespace with id: 12345678901234567890abcd
✓ Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "CALENDAR_CACHE"
id = "12345678901234567890abcd"
preview_id = "..."
```

**Copy the ID** (e.g., `12345678901234567890abcd`)

### 2B. Create Preview Namespace

```powershell
wrangler kv:namespace create "calendar_cache_prod" --preview
```

**Copy this ID too** - you'll need both.

### 2C. Update wrangler.toml

Open `server/wrangler.toml` and update the KV section:

```toml
[[kv_namespaces]]
binding = "CALENDAR_CACHE"
id = "PROD_ID_FROM_STEP_2A"           # Paste production ID
preview_id = "PREVIEW_ID_FROM_STEP_2B"  # Paste preview ID
```

**Verify it looks like:**
```toml
[[kv_namespaces]]
binding = "CALENDAR_CACHE"
id = "12345678901234567890abcd"
preview_id = "0987654321fedcba"
```

---

## 🔒 Step 3: Store Firebase Credentials

The Worker needs your Firebase service account key.

### 3A. Get Firebase Service Account Key

1. Go to **Firebase Console** → Your Project
2. Click **⚙️ Settings** (gear icon) → **Project Settings**
3. Click **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file (keep it safe!)

### 3B. Store as Wrangler Secret

```powershell
# Interactive prompt
wrangler secret put FIREBASE_SERVICE_ACCOUNT
```

This opens an editor or waits for input. Paste the **entire JSON content** from your Firebase key file:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "firebase-adminsdk-...",
  ...
}
```

Then press **Ctrl+D** to submit (or Ctrl+Z on Windows).

**You should see:**
```
✓ Successfully created secret FIREBASE_SERVICE_ACCOUNT
```

### 3C. Store Firebase Database URL

```powershell
wrangler secret put FIREBASE_DATABASE_URL
```

Enter your Firebase database URL (from Firebase Settings):
```
https://your-project.firebaseio.com
```

Press **Ctrl+D** to submit.

**Verify secrets were saved:**

```powershell
wrangler secret list
```

You should see:
```
FIREBASE_DATABASE_URL
FIREBASE_SERVICE_ACCOUNT
```

---

## 📤 Step 4: Deploy Worker

### 4A. Deploy from Command Line

```powershell
cd server
wrangler deploy
```

**You'll see progress:**
```
 ▲ [WARNING] nodejs_compat flag is not set. This Worker may not work correctly.
 ✔ Compiled successfully...
 ✓ Published your Worker to https://3mpwrapp-calendar.3mpwrapp08162025.workers.dev
 ✓ Deployment ID: 12345abc...
```

**Success!** Your Worker is live 🎉

### 4B. Check Deployment Status

```powershell
wrangler deployments list
```

Shows your recent deployments:
```
ID           Created On           Author
12345abc...  2025-11-06 21:15 UTC your@email.com

View the status of your deployments using `wrangler deployments view <deployment-id>`
```

---

## ✅ Step 5: Verify Deployment

### 5A. Test Health Check

```powershell
$url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/health"
curl $url | ConvertFrom-Json | Format-Table
```

**Expected response:**
```
ok          : True
service     : 3mpwrApp Calendar Worker
timestamp   : 2025-11-06T21:00:00Z
firebaseConnected : True
cacheAvailable    : True
```

**What the fields mean:**
- `ok: true` → Worker is running ✅
- `firebaseConnected: true` → Firebase credentials work ✅
- `cacheAvailable: true` → KV is working ✅

### 5B. Test Events List Endpoint

```powershell
# Get first 5 events
$url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=5"
curl $url | ConvertFrom-Json | ForEach-Object {
  Write-Host "Total events: $($_.pagination.total)"
  $_.events | ForEach-Object {
    Write-Host "- $($_.title) on $($_.date)"
  }
}
```

**Expected response:**
```json
{
  "events": [
    {
      "id": "evt-001",
      "title": "Community Event",
      "date": "2025-11-15T19:00:00Z",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 42,
    "pages": 9
  }
}
```

**If you see:**
- ✅ Events listed → Firestore working ✅
- ✅ `total` > 0 → Events found in database ✅
- ❌ Empty array? → Check Firestore has `status: "published"` events

### 5C. Test Calendar Feed (ICS)

```powershell
# Get calendar feed
$url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics"
$response = curl -i $url

# Show headers (proves format is correct)
$response | Select-String "Content-Type"
```

**Expected header:**
```
Content-Type: text/calendar; charset=utf-8
```

### 5D. Test Specific Event

```powershell
# Replace EVENT_ID with an actual event ID from Step 5B
$eventId = "evt-001"  # Use an ID from the events list
$url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events/$eventId"
curl $url | ConvertFrom-Json | Format-Table -Property title, date, category
```

**Expected response:**
```
title                           date                    category
-----                           ----                    --------
Community Event                 2025-11-15T19:00:00Z    community
```

---

## 🔍 Step 6: View Worker Logs

To see what the Worker is doing:

```powershell
# View real-time logs
wrangler tail

# This shows:
# - Requests to Worker
# - Response times
# - Errors (if any)
# - Cache hits
```

**Example output:**
```
2025-11-06T21:15:10.123Z  GET /health 200 (2ms)
2025-11-06T21:15:12.456Z  GET /api/events 200 (45ms) [CACHE HIT]
2025-11-06T21:15:15.789Z  GET /events.ics 200 (120ms) [FROM FIRESTORE]
```

**Stop logging:** Press `Ctrl+C`

---

## 🧪 Step 7: Integration Testing

### 7A. Test Filtering

```powershell
# Filter by category
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&limit=3"

# Test response has only community events
$response = curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" | ConvertFrom-Json
$response.events | ForEach-Object { Write-Host "$($_.title) - $($_.category)" }
```

### 7B. Test Pagination

```powershell
# Get page 1
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=10&page=1"

# Get page 2 
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=10&page=2"

# Results should be different
```

### 7C. Test Sorting

```powershell
# Sort by date ascending (oldest first)
$asc = curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=date&dir=asc&limit=3" | ConvertFrom-Json
Write-Host "Ascending (oldest first):"
$asc.events | ForEach-Object { Write-Host $_.date }

# Sort by date descending (newest first)
$desc = curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=date&dir=desc&limit=3" | ConvertFrom-Json
Write-Host "`nDescending (newest first):"
$desc.events | ForEach-Object { Write-Host $_.date }
```

### 7D. Test Caching

```powershell
# First request (should be slower - from Firestore)
$start = Get-Date
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events" > $null
$time1 = ((Get-Date) - $start).TotalMilliseconds
Write-Host "First request: ${time1}ms"

# Second request (should be faster - from cache)
$start = Get-Date
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events" > $null
$time2 = ((Get-Date) - $start).TotalMilliseconds
Write-Host "Second request: ${time2}ms (should be faster)"
```

---

## 🐛 Troubleshooting

### Issue: "Firebase credentials not valid"

**Error in logs:**
```
FirebaseError: Invalid service account
```

**Solution:**
```powershell
# Re-set the credentials
wrangler secret delete FIREBASE_SERVICE_ACCOUNT
wrangler secret put FIREBASE_SERVICE_ACCOUNT
# Paste your Firebase JSON key again
```

### Issue: "No events returned"

**Check 1: Firestore has events**
- Go to Firebase Console → Firestore
- Verify documents exist in `events` collection
- Check events have `status: "published"`

**Check 2: View Worker logs**
```powershell
wrangler tail --search "error"
```

**Check 3: Test Firestore connection directly**
```powershell
# Create a test script to verify Firebase works
```

### Issue: "KV namespace error"

**Error:**
```
Error: Failed to bind KV namespace
```

**Solution:**
```powershell
# Verify KV namespace IDs in wrangler.toml
wrangler kv:namespace list

# Redeploy
wrangler deploy
```

### Issue: "Cache not working"

**Check headers:**
```powershell
curl -i "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events" | Select-String "Cache-Control"

# Should show:
# Cache-Control: public, max-age=300
```

---

## 🚀 Step 8: Going Live

### 8A. Set Custom Domain (Optional)

To use your own domain (e.g., `api.3mpwrapp.com`):

1. **Add to `wrangler.toml`:**
```toml
routes = [
  { pattern = "api.3mpwrapp.com/*", zone_name = "3mpwrapp.com" }
]
```

2. **Add DNS record in Cloudflare:**
   - Type: CNAME
   - Name: `api`
   - Content: `empowrapp-calendar.empowrapp08162025.workers.dev`

3. **Redeploy:**
```powershell
wrangler deploy
```

Now use: `https://api.3mpwrapp.com/api/events`

### 8B. Update App Configuration

Update your app to use the Worker URL:

**File: `.env`**
```
EXPO_PUBLIC_CALENDAR_FEED_URL=https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
```

Or if using custom domain:
```
EXPO_PUBLIC_CALENDAR_FEED_URL=https://api.3mpwrapp.com/events.ics
```

### 8C. Enable Calendar Subscriptions

In your website/app, users can now:

```
Subscribe to: https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
```

---

## 📊 Monitoring

### Monitor Performance

```powershell
# View Worker metrics
# In Cloudflare Dashboard → Workers → 3mpwrapp-calendar → Analytics
```

### Monitor Errors

```powershell
# View only errors in logs
wrangler tail --status error

# Example error log:
# 2025-11-06T21:15:10.123Z [ERROR] Firebase connection timeout
```

### Set Up Alerts

```powershell
# Check health periodically
$url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/health"
while ($true) {
  try {
    $response = curl -s $url | ConvertFrom-Json
    if ($response.ok) {
      Write-Host "$(Get-Date): ✅ Worker healthy"
    } else {
      Write-Host "$(Get-Date): ❌ Worker unhealthy"
    }
  } catch {
    Write-Host "$(Get-Date): ❌ Error: $_"
  }
  Start-Sleep -Seconds 300  # Check every 5 minutes
}
```

---

## ✅ Final Verification Checklist

- ✅ Worker deployed successfully
- ✅ Health endpoint returns `ok: true`
- ✅ Events list shows events from Firestore
- ✅ ICS feed format is correct
- ✅ Individual event endpoints work
- ✅ Filtering by category works
- ✅ Pagination works
- ✅ Sorting works
- ✅ Caching headers present
- ✅ Logs show no errors
- ✅ CORS headers working
- ✅ Database credentials secure

---

## 🎉 Deployment Complete!

Your Worker is now:
- ✅ Live on `https://empowrapp-calendar.empowrapp08162025.workers.dev`
- ✅ Connected to Firestore
- ✅ Caching with KV Namespace
- ✅ Ready for production

---

## 📞 Next Steps

1. **Update your app** to use the Worker endpoints
2. **Test calendar subscriptions** in Google Calendar, Outlook, Apple Calendar
3. **Monitor performance** via logs and metrics
4. **Set custom domain** (optional) for cleaner URLs
5. **Enable cache warming** for high-traffic deployments

---

## 📚 Reference

- **Worker URL**: https://empowrapp-calendar.empowrapp08162025.workers.dev
- **API Docs**: `server/CLOUDFLARE_API_REFERENCE.md`
- **Setup Guide**: `server/CLOUDFLARE_WORKER_SETUP.md`
- **Wrangler Docs**: https://developers.cloudflare.com/wrangler/

---

**Version**: 2.0 | **Last Updated**: November 6, 2025 | **Status**: Production Ready ✅
