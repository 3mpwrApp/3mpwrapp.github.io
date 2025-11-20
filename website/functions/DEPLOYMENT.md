# Cloudflare Pages Functions - Deployment Guide

## Quick Start

Your Cloudflare Pages Functions are ready to deploy! This guide will walk you through the setup.

## Prerequisites

- Cloudflare account (free tier works)
- Git repository connected to Cloudflare Pages
- Mobile app configured with endpoint: `https://3mpwrapp.pages.dev/api/submissions`

## Deployment Steps

### 1. Connect Your Repository to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your repository (`3mpwrApp/empowrapp-main`)
4. Configure build settings:
   - **Build command:** Leave empty (static site)
   - **Build output directory:** `/website` (or wherever your static files are)
   - **Root directory:** `/` (or specify if different)

### 2. Deploy

Once connected, Cloudflare Pages will:
- ✅ Automatically detect the `/functions` directory
- ✅ Deploy your API endpoints
- ✅ Make them available at `https://3mpwrapp.pages.dev/api/*`

**First deployment happens automatically on push to main branch.**

### 3. Configure Environment Variables (Optional but Recommended)

#### Option A: Via Dashboard (Easiest)

1. Go to your Pages project → **Settings** → **Environment variables**
2. Add production variables:

```
ADMIN_PASSWORD = your-secure-password-here
NOTIFICATION_WEBHOOK_URL = https://discord.com/api/webhooks/YOUR_WEBHOOK
```

#### Option B: Via Wrangler CLI

```bash
# Set secrets via CLI
wrangler pages secret put ADMIN_PASSWORD
wrangler pages secret put NOTIFICATION_WEBHOOK_URL
```

### 4. Set Up Storage (Choose One or More)

#### Option A: Workers KV (Simple, Recommended for Start)

1. Go to **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name: `submissions-kv`
4. Go back to your Pages project → **Settings** → **Functions** → **KV namespace bindings**
5. Add binding:
   - Variable name: `SUBMISSIONS_KV`
   - KV namespace: `submissions-kv`

#### Option B: D1 Database (For Complex Queries)

```bash
# Create database
wrangler d1 create submissions-db

# This will output a database ID, save it!

# Execute schema
wrangler d1 execute submissions-db --file=./functions/api/submissions.sql --remote

# Add binding via dashboard:
# Pages project → Settings → Functions → D1 database bindings
# Variable name: SUBMISSIONS_DB
# D1 database: submissions-db
```

### 5. Test Your Endpoint

```bash
# Test from command line
curl -X POST https://3mpwrapp.pages.dev/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "data": {
      "id": "evt-test-123",
      "title": "Test Event",
      "description": "This is a test event submission",
      "date": "2025-12-01"
    },
    "submittedBy": {
      "uid": "test-user-123",
      "email": "test@example.com",
      "displayName": "Test User"
    },
    "submittedAt": 1700000000000
  }'

# Expected response:
# {
#   "success": true,
#   "message": "Event 'Test Event' has been submitted for review. Thank you!",
#   "submissionId": "event-evt-test-123-1700000000000",
#   "status": "pending"
# }
```

### 6. Test from Mobile App

Your mobile app is already configured to send to:
```
https://3mpwrapp.pages.dev/api/submissions
```

Just create an event or campaign in the app and click "🚀 Submit to 3mpwr App"!

## Webhook Notifications

### Discord Webhook Setup

1. In your Discord server, go to **Server Settings** → **Integrations** → **Webhooks**
2. Click **New Webhook**
3. Name it "3mpwr Submissions"
4. Copy the webhook URL
5. Add to Cloudflare Pages environment variables:
   ```
   NOTIFICATION_WEBHOOK_URL = https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
   ```

### Slack Webhook Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create a new app or select existing
3. Enable **Incoming Webhooks**
4. Add webhook to workspace
5. Copy the webhook URL
6. Add to Cloudflare Pages environment variables

## View Submissions

### Method 1: Admin Dashboard

Visit: `https://3mpwrapp.pages.dev/admin/submissions`

- Password protected (if `ADMIN_PASSWORD` is set)
- Shows all submissions in a nice UI
- **Note:** Currently shows static content. Enhance with KV/D1 queries for live data.

### Method 2: Wrangler CLI (if using KV)

```bash
# List all submissions
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID

# Get specific submission
wrangler kv:key get "submission:event:evt-123:1234567890" --namespace-id=YOUR_KV_NAMESPACE_ID

# Get all keys (paginated)
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID --prefix="submission:"
```

### Method 3: Wrangler CLI (if using D1)

```bash
# Query all pending submissions
wrangler d1 execute submissions-db --remote \
  --command "SELECT * FROM submissions WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 20"

# Query by type
wrangler d1 execute submissions-db --remote \
  --command "SELECT * FROM submissions WHERE type = 'event' ORDER BY submitted_at DESC LIMIT 20"

# Count submissions
wrangler d1 execute submissions-db --remote \
  --command "SELECT type, status, COUNT(*) as count FROM submissions GROUP BY type, status"
```

### Method 4: Cloudflare Dashboard

1. Go to **Workers & Pages** → **KV** (or **D1**)
2. Select your namespace/database
3. Browse or query data directly

## Monitoring & Logs

### Real-time Logs

```bash
# Tail logs for your Pages project
wrangler pages deployment tail
```

### Analytics

1. Go to your Pages project in Cloudflare Dashboard
2. Click **Analytics** tab
3. View:
   - Request volume
   - Error rates
   - Response times
   - Top endpoints

## Production Checklist

- [ ] Repository connected to Cloudflare Pages
- [ ] Functions automatically detected and deployed
- [ ] Environment variables configured (`ADMIN_PASSWORD`, `NOTIFICATION_WEBHOOK_URL`)
- [ ] Storage method chosen (KV, D1, or webhook)
- [ ] Test submission from mobile app successful
- [ ] Webhook notifications working (if configured)
- [ ] CORS headers configured correctly (restrict `*` to your domain in production)
- [ ] Admin dashboard accessible
- [ ] Monitoring and alerts set up

## Security Hardening (Production)

### 1. Restrict CORS

Edit `/functions/api/submissions.ts`:

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Replace * with your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

### 2. Add Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Example: Limit to 10 submissions per user per hour
// Use KV to track submission counts by user
```

### 3. Add Firebase Token Verification

Currently, the endpoint trusts the `submittedBy.uid` field. For production:

```typescript
// Verify Firebase ID token
import { getAuth } from 'firebase-admin/auth';
// Verify token in request header
// Match uid from token with submittedBy.uid
```

### 4. Enable DDoS Protection

Cloudflare provides automatic DDoS protection. Enable additional security:
1. Go to **Security** → **Settings**
2. Enable **DDoS Protection**
3. Set security level to **High** for API endpoints

## Troubleshooting

### Functions Not Deploying

- Check that `/functions` directory is at repository root
- Verify TypeScript files are valid (no syntax errors)
- Check deployment logs in Cloudflare Dashboard

### 404 on API Endpoint

- Ensure deployment completed successfully
- Check that file is at `/functions/api/submissions.ts`
- Verify Pages project is not set to serve from subdirectory

### CORS Errors

- Check browser console for specific CORS error
- Verify CORS headers in `submissions.ts`
- Ensure OPTIONS preflight is handled

### Submissions Not Storing

- Check that KV/D1 binding is configured correctly
- Verify binding variable names match code (`SUBMISSIONS_KV`, `SUBMISSIONS_DB`)
- Check Cloudflare dashboard for errors in bindings

## Next Steps

1. **Enhanced Admin Dashboard**: Add API endpoints to fetch submissions and display in admin UI
2. **Approval Workflow**: Add approve/reject buttons that update Firestore
3. **Email Notifications**: Send email to submitters when approved/rejected
4. **Analytics**: Track submission trends and popular event types
5. **Moderation Tools**: Add bulk actions, filters, and search

## Support & Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Workers KV Docs](https://developers.cloudflare.com/kv/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## Questions?

Check the `/functions/README.md` for detailed API documentation and examples.
