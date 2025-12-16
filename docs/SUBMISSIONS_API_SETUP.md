# 3mpwr App Submissions API Setup Guide

This guide explains how to configure Cloudflare to receive event and campaign submissions from the 3mpwr App.

## Overview

When users submit events or campaigns in the app, submissions are sent to:
```
POST https://3mpwrapp.pages.dev/api/submissions
```

The API can store submissions in:
- **KV Namespace** (recommended) - Simple key-value storage
- **D1 Database** (optional) - SQLite database for advanced queries
- **Discord Webhook** (recommended) - Get notified of new submissions

---

## Quick Setup

### Prerequisites

1. **Install Wrangler CLI**
   ```powershell
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```powershell
   wrangler login
   ```

### Run Setup Script

```powershell
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new
.\scripts\setup-submissions-api.ps1
```

The script will:
1. Create a KV namespace for storing submissions
2. Create a D1 database (optional)
3. Prompt for Discord webhook URL (optional)
4. Show you what to configure in Cloudflare Dashboard

---

## Manual Setup

### Step 1: Create KV Namespace

```powershell
wrangler kv:namespace create "SUBMISSIONS_KV"
```

Copy the namespace ID from the output.

### Step 2: Add KV Binding in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to: **Pages → 3mpwrapp → Settings → Functions**
3. Under **KV namespace bindings**, click **Add binding**:
   - **Variable name**: `SUBMISSIONS_KV`
   - **KV namespace**: Select the namespace you created

### Step 3: (Optional) Create D1 Database

```powershell
# Create database
wrangler d1 create "3mpwrapp-submissions"

# Apply schema
wrangler d1 execute "3mpwrapp-submissions" --file="website\functions\api\submissions.sql"
```

Add D1 binding in Cloudflare Dashboard:
- **Variable name**: `SUBMISSIONS_DB`
- **D1 database**: Select `3mpwrapp-submissions`

### Step 4: (Recommended) Set Up Discord Notifications

1. Create a Discord webhook in your server:
   - Go to Server Settings → Integrations → Webhooks
   - Click "New Webhook" → Copy URL

2. Add environment variable in Cloudflare:
   - Go to **Pages → 3mpwrapp → Settings → Environment Variables**
   - Add variable:
     - **Name**: `NOTIFICATION_WEBHOOK_URL`
     - **Value**: Your Discord webhook URL

### Step 5: Redeploy

Push a commit or retry deployment in Cloudflare Dashboard to apply changes.

---

## Testing the API

### Test with PowerShell

```powershell
# Test event submission
$body = @{
    type = "event"
    data = @{
        id = "test-event-$(Get-Random)"
        title = "Test Event"
        description = "This is a test event submission"
        date = "2025-12-20T18:00:00-05:00"
        location = "Test Location"
        isVirtual = $false
    }
    submittedBy = @{
        uid = "test-user-123"
        email = "test@example.com"
        displayName = "Test User"
    }
    submittedAt = [long](Get-Date -UFormat %s) * 1000
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "https://3mpwrapp.pages.dev/api/submissions" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test with curl

```bash
curl -X POST https://3mpwrapp.pages.dev/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "data": {
      "id": "test-event-1",
      "title": "Test Event",
      "description": "Test description",
      "date": "2025-12-20T18:00:00-05:00"
    },
    "submittedBy": {
      "uid": "test-user",
      "email": "test@example.com"
    },
    "submittedAt": 1734652800000
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Event \"Test Event\" has been submitted for review. Thank you!",
  "submissionId": "event-test-event-1-1734652800000",
  "status": "pending"
}
```

---

## Reviewing Submissions

### Via KV (if using KV storage)

```powershell
# List all submissions
wrangler kv:key list --namespace-id YOUR_KV_ID --prefix "submission:"

# Get a specific submission
wrangler kv:key get --namespace-id YOUR_KV_ID "submission:event:test-1:1734652800000"
```

### Via D1 (if using D1 database)

```powershell
# List pending submissions
wrangler d1 execute "3mpwrapp-submissions" --command "SELECT * FROM submissions WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 10"

# Approve a submission
wrangler d1 execute "3mpwrapp-submissions" --command "UPDATE submissions SET status = 'approved', reviewed_at = unixepoch() WHERE id = 'event-test-1-1734652800000'"
```

---

## Submission Data Format

### Event Submission

```typescript
{
  type: 'event',
  data: {
    id: string,           // Unique ID (auto-generated)
    title: string,        // Event title (required)
    description: string,  // Event description (required)
    date: string,         // ISO date string (required)
    time?: string,        // Time string
    duration?: number,    // Duration in minutes
    location?: string,    // Physical location
    isVirtual?: boolean,  // Virtual event flag
    virtualLink?: string, // Zoom/Meet link
    asl?: boolean,        // ASL interpretation
    captions?: boolean,   // Closed captions
    stepFree?: boolean,   // Wheelchair accessible
    sensorySpace?: boolean,
    energyCost?: 'low' | 'medium' | 'high',
    requiresRSVP?: boolean,
    rsvpDetails?: string,
    organizer?: string,
    organizerContact?: string,
    category?: string,
    tags?: string[]
  },
  submittedBy: {
    uid: string,          // User ID (required)
    email?: string,       // User email
    displayName?: string  // User display name
  },
  submittedAt: number     // Timestamp in milliseconds (required)
}
```

### Campaign Submission

```typescript
{
  type: 'campaign',
  data: {
    id: string,           // Unique ID (auto-generated)
    title: string,        // Campaign title (required)
    summary: string,      // Short summary (required)
    description: string,  // Full description
    target: string,       // Target audience/goal (required)
    goalCount?: number,   // Signature/action goal
    contactEmail?: string,
    websiteUrl?: string,
    petitionUrl?: string,
    category?: string,
    tags?: string[]
  },
  submittedBy: {
    uid: string,          // User ID (required)
    email?: string,       // User email
    displayName?: string  // User display name
  },
  submittedAt: number     // Timestamp in milliseconds (required)
}
```

---

## Troubleshooting

### "Failed to store in KV"
- Verify KV namespace binding is correctly configured
- Check the namespace ID matches your created namespace

### "Failed to store in D1"
- Verify D1 database binding is correctly configured
- Ensure the schema was applied correctly

### Discord notifications not working
- Verify the webhook URL is correct
- Check that the webhook hasn't been deleted
- Verify the environment variable is set correctly

### CORS errors
- The API includes CORS headers for all origins
- If issues persist, check browser console for specific error

---

## Files Reference

| File | Purpose |
|------|---------|
| `website/functions/api/submissions.ts` | API endpoint handler |
| `website/functions/api/submissions.sql` | D1 database schema |
| `website/wrangler.toml` | Cloudflare bindings config |
| `scripts/setup-submissions-api.ps1` | Setup automation script |
| `services/submitTo3mpwr.ts` | App-side submission service |

---

## Support

If you encounter issues, check:
1. Cloudflare Dashboard logs
2. Browser Network tab for API responses
3. App console logs for submission errors
