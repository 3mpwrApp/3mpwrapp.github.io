# Cloudflare Pages Functions - 3mpwr App

This directory contains serverless functions that run on Cloudflare Pages.

## API Endpoints

### POST /api/submissions

Receives event and campaign submissions from the mobile app.

**Endpoint:** `https://3mpwrapp.pages.dev/api/submissions`

**Request Body:**
```json
{
  "type": "event" | "campaign",
  "data": {
    "id": "evt-1234567890",
    "title": "Community Event",
    "description": "Event description...",
    // ... additional fields
  },
  "submittedBy": {
    "uid": "user-uid",
    "email": "user@example.com",
    "displayName": "User Name"
  },
  "submittedAt": 1234567890000
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Event 'Community Event' has been submitted for review. Thank you!",
  "submissionId": "event-evt-1234567890-1234567890000",
  "status": "pending"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid submission type. Must be 'event' or 'campaign'"
}
```

## Deployment

### Automatic Deployment

Functions in this directory are **automatically deployed** when you push to your Cloudflare Pages project's connected Git repository.

### Manual Deployment

If you need to deploy manually:

```bash
# Install Wrangler CLI (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy Pages project
wrangler pages deploy <OUTPUT_DIRECTORY>
```

## Environment Setup

### 1. Optional: KV Namespace for Submissions Storage

If you want to store submissions in Workers KV:

```bash
# Create KV namespace
wrangler kv:namespace create SUBMISSIONS_KV

# Add binding to wrangler.toml (if using Workers)
# Or configure in Cloudflare Pages dashboard:
# Settings > Functions > KV namespace bindings
```

### 2. Optional: D1 Database for Submissions

If you want to use a D1 database:

```bash
# Create D1 database
wrangler d1 create submissions-db

# Execute schema
wrangler d1 execute submissions-db --file=./functions/api/submissions.sql

# Add binding in Cloudflare Pages dashboard:
# Settings > Functions > D1 database bindings
# Binding name: SUBMISSIONS_DB
```

### 3. Optional: Notification Webhook

To receive notifications when new submissions arrive, set environment variables:

**Via Cloudflare Pages Dashboard:**
1. Go to your Pages project → Settings → Environment variables
2. Add variables:
   - `NOTIFICATION_WEBHOOK_URL` - Discord/Slack webhook URL
   - `ADMIN_EMAIL` - Admin email for notifications

**Example Discord Webhook:**
```
https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

**Example Slack Webhook:**
```
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Storage Options

Choose one or more storage methods:

### Option 1: Workers KV (Simple, Fast)
- Best for: Small to medium volume
- Stores submissions as key-value pairs
- Quick to set up
- Limited query capabilities

### Option 2: D1 Database (Structured, Queryable)
- Best for: Complex queries and reporting
- Full SQL database
- Easy to filter, sort, and analyze submissions
- Requires schema setup

### Option 3: Webhook Only (Forward to Another Service)
- Best for: Integration with existing systems
- No storage in Cloudflare
- Forward submissions to your own API/database
- Set `NOTIFICATION_WEBHOOK_URL` to your endpoint

### Option 4: Multiple Methods (Recommended)
- Use KV or D1 for storage
- Use webhook for instant notifications
- Redundancy and flexibility

## Testing Locally

```bash
# Install dependencies (if any)
npm install

# Run Wrangler dev server
wrangler pages dev . --port 8788

# Test the endpoint
curl -X POST http://localhost:8788/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "data": {
      "id": "evt-test",
      "title": "Test Event",
      "description": "Testing submission",
      "date": "2025-12-01"
    },
    "submittedBy": {
      "uid": "test-user",
      "email": "test@example.com"
    },
    "submittedAt": 1234567890000
  }'
```

## Viewing Submissions

### Via Workers KV CLI
```bash
# List all submission keys
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID

# Get a specific submission
wrangler kv:key get "submission:event:evt-123:1234567890" --namespace-id=YOUR_KV_NAMESPACE_ID
```

### Via D1 CLI
```bash
# Query pending submissions
wrangler d1 execute submissions-db --command "SELECT * FROM submissions WHERE status = 'pending' ORDER BY submitted_at DESC LIMIT 10"

# Query submissions by type
wrangler d1 execute submissions-db --command "SELECT * FROM submissions WHERE type = 'event' ORDER BY submitted_at DESC LIMIT 10"
```

### Via Cloudflare Dashboard
1. Go to Workers & Pages → D1 (or KV)
2. Select your database/namespace
3. Browse or query data

## Admin Dashboard (Future Enhancement)

Consider building an admin dashboard at `/admin/submissions` to:
- View all pending submissions
- Approve/reject submissions
- Bulk import approved submissions to Firestore
- View submission analytics

## Security Considerations

1. **CORS**: Currently set to allow all origins (`*`). In production, restrict to your app's domain.
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse.
3. **Authentication**: Current implementation trusts `submittedBy.uid`. Consider adding Firebase token verification.
4. **Validation**: Current validation is basic. Add more thorough checks as needed.

## Next Steps

1. Deploy this function to Cloudflare Pages
2. Choose a storage method (KV, D1, or webhook)
3. Configure environment variables
4. Test with the mobile app
5. Build an admin dashboard to review submissions
6. Set up automated approval/publishing workflow

## Support

For issues or questions:
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Cloudflare Functions Docs: https://developers.cloudflare.com/pages/functions/
- D1 Database Docs: https://developers.cloudflare.com/d1/
