# Submissions API - KV Storage & D1 Database Setup

## ✅ Current Status

- **API Endpoint**: ✅ Live at `https://3mpwrapp.ca/api/submissions`
- **Discord Webhook**: ✅ Configured (receiving notifications)
- **KV Namespace**: ✅ Created (`SUBMISSIONS_KV`)
- **D1 Database**: ✅ Created and schema applied (`3mpwrapp-submissions`)
- **Cloudflare Bindings**: ⏳ **NEEDS CONFIGURATION** (see below)

---

## 🔧 Required: Configure Cloudflare Pages Bindings

The KV namespace and D1 database exist but need to be bound to the Pages Function.

### Step 1: Add KV Binding

1. Go to **Cloudflare Dashboard**: https://dash.cloudflare.com
2. Navigate to: **Pages** → **3mpwrapp** → **Settings** → **Functions**
3. Scroll to **KV namespace bindings**
4. Click **Add binding**
5. Enter:
   - **Variable name**: `SUBMISSIONS_KV`
   - **KV namespace**: Select `SUBMISSIONS_KV` from dropdown
6. Click **Save**

### Step 2: Add D1 Binding

1. In the same **Functions** settings page
2. Scroll to **D1 database bindings**
3. Click **Add binding**
4. Enter:
   - **Variable name**: `SUBMISSIONS_DB`
   - **D1 database**: Select `3mpwrapp-submissions` from dropdown
5. Click **Save**

### Step 3: Redeploy (Automatic)

Cloudflare Pages will automatically redeploy when you save the bindings.

---

## 📊 What Each Storage Does

### Discord Webhook (Already Working)
- ✅ **Instant notifications** when submissions arrive
- ✅ Shows submission details in Discord
- ✅ No configuration needed - already working!

### KV Storage (Needs binding)
- 📦 **Persistent storage** of all submissions
- 🔍 **Quick retrieval** by submission ID
- 💾 **Backup** of all submissions
- 📋 **List recent submissions** via wrangler CLI

### D1 Database (Needs binding)
- 🗄️ **SQL queries** for advanced filtering
- 📊 **Analytics** on submission counts, types, dates
- ✅ **Status tracking** (pending/approved/rejected)
- 👤 **Admin review workflow** support

---

## ✅ Verify Setup After Binding

Once you've added the bindings in Cloudflare Dashboard, test:

```powershell
# Test submission with all storage
$body = @{
    type = 'event'
    data = @{
        id = "storage-test-$(Get-Random)"
        title = 'Testing KV and D1 Storage'
        description = 'This should be stored in KV and D1'
        date = '2026-02-15T18:00:00-05:00'
    }
    submittedBy = @{
        uid = 'storage-test'
        email = 'test@3mpwrapp.com'
        displayName = 'Storage Test'
    }
    submittedAt = [long](Get-Date -UFormat %s) * 1000
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri 'https://3mpwrapp.ca/api/submissions' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body
```

**Expected:**
1. ✅ Success response from API
2. ✅ Discord notification
3. ✅ Entry in KV storage
4. ✅ Row in D1 database

---

## 📋 View Stored Submissions

### View in KV

```powershell
# List all submissions
wrangler kv key list --namespace-id 315e554862a7471aad5cf4e96b61dcec --prefix "submission:"

# Get specific submission
wrangler kv key get --namespace-id 315e554862a7471aad5cf4e96b61dcec "submission:event:EVENT_ID:TIMESTAMP"
```

### Query D1 Database

```powershell
# List recent submissions
wrangler d1 execute "3mpwrapp-submissions" --remote --command="SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 10"

# Count by type
wrangler d1 execute "3mpwrapp-submissions" --remote --command="SELECT type, COUNT(*) as count FROM submissions GROUP BY type"

# List pending submissions
wrangler d1 execute "3mpwrapp-submissions" --remote --command="SELECT * FROM submissions WHERE status = 'pending'"

# Approve a submission
wrangler d1 execute "3mpwrapp-submissions" --remote --command="UPDATE submissions SET status = 'approved', reviewed_at = unixepoch() WHERE id = 'SUBMISSION_ID'"
```

---

## 🎯 Storage Details

### KV Namespace
- **ID**: `315e554862a7471aad5cf4e96b61dcec`
- **Name**: `SUBMISSIONS_KV`
- **Variable**: `SUBMISSIONS_KV`

### D1 Database
- **UUID**: `5b7620e9-2af1-4b08-b2db-8ee432c2dd36`
- **Name**: `3mpwrapp-submissions`
- **Variable**: `SUBMISSIONS_DB`
- **Tables**: `submissions`
- **Schema**: `functions/api/submissions.sql`

### Environment Variable
- **Discord Webhook**: `NOTIFICATION_WEBHOOK_URL` (already configured)

---

## 📁 Database Schema

The `submissions` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Unique submission ID (PRIMARY KEY) |
| `type` | TEXT | 'event' or 'campaign' |
| `data` | TEXT | JSON of submission data |
| `submitted_by_uid` | TEXT | User ID |
| `submitted_by_email` | TEXT | User email (optional) |
| `submitted_by_name` | TEXT | User display name (optional) |
| `submitted_at` | INTEGER | Unix timestamp |
| `status` | TEXT | 'pending', 'approved', or 'rejected' |
| `reviewed_at` | INTEGER | Review timestamp |
| `reviewed_by` | TEXT | Admin who reviewed |
| `reviewer_notes` | TEXT | Review notes |
| `created_at` | INTEGER | Row creation time |
| `updated_at` | INTEGER | Last update time |

Indexes on: `type`, `status`, `submitted_by_uid`, `submitted_at`, `(type, status)`

---

## 🚀 Next Steps

1. ✅ **Configure KV binding** in Cloudflare Dashboard (5 minutes)
2. ✅ **Configure D1 binding** in Cloudflare Dashboard (5 minutes)
3. ✅ **Test submission** to verify all 3 storage methods work
4. 📊 **Query D1** to see stored submissions
5. 🎨 **(Future)** Build admin dashboard to manage submissions

---

## 📞 Support

**Files:**
- API: `functions/api/submissions.js`
- Schema: `functions/api/submissions.sql`

**Resources:**
- Cloudflare Dashboard: https://dash.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

**Status:**
- API: ✅ Live and working
- Discord: ✅ Notifications working
- KV: ⏳ Awaiting binding configuration
- D1: ⏳ Awaiting binding configuration
