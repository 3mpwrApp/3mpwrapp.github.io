# ⚡ Quick Start - Deploy in 3 Steps

Your Cloudflare Pages API is ready! Follow these 3 simple steps:

## Step 1: Push to Git (1 minute)

```bash
git add functions/
git commit -m "Add Cloudflare Pages API for submissions"
git push origin main
```

## Step 2: Verify Deployment (2 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Find your project: **3mpwrapp**
4. Check deployment status - should show "Deployed successfully"
5. Your endpoint is now live at: `https://3mpwrapp.pages.dev/api/submissions`

## Step 3: Test It! (1 minute)

### From Mobile App:
1. Open 3mpwr app
2. Create a test event or campaign
3. Click "🚀 Submit to 3mpwr App"
4. You should see: "✅ Submitted for review!"

### From Command Line:
```bash
curl -X POST https://3mpwrapp.pages.dev/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "data": {
      "id": "evt-test",
      "title": "Test Event",
      "description": "Testing the API",
      "date": "2025-12-01"
    },
    "submittedBy": {
      "uid": "test-user",
      "email": "test@example.com"
    },
    "submittedAt": 1700000000000
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Event 'Test Event' has been submitted for review. Thank you!",
  "submissionId": "event-evt-test-1700000000000",
  "status": "pending"
}
```

---

## ✅ Done!

Your API is live and working! The mobile app can now submit events and campaigns.

## Optional: Add Storage (5 minutes)

Want to store submissions for review?

### Option 1: Workers KV (Simplest)
1. Dashboard → Workers & Pages → KV
2. Create namespace: `submissions-kv`
3. Your project → Settings → Functions → KV bindings
4. Add: `SUBMISSIONS_KV` → `submissions-kv`

### Option 2: D1 Database (For queries)
```bash
wrangler d1 create submissions-db
wrangler d1 execute submissions-db --file=./functions/api/submissions.sql --remote
```
Then add binding in dashboard.

## Optional: Get Notifications (2 minutes)

1. Create Discord webhook in your server
2. Dashboard → Your project → Settings → Environment variables
3. Add: `NOTIFICATION_WEBHOOK_URL` = `https://discord.com/api/webhooks/...`

Now you'll get instant notifications when users submit content!

---

## 📚 Full Documentation

- **`SETUP_COMPLETE.md`** - Complete setup overview
- **`README.md`** - API documentation
- **`DEPLOYMENT.md`** - Detailed deployment guide

## 🎉 That's It!

Your Cloudflare Pages API is production-ready with just these 3 steps.

Questions? Check `DEPLOYMENT.md` for troubleshooting.
