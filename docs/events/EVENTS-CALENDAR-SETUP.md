# Events Calendar Real-Time Sync Setup Guide

## ✅ What We've Done

Your events page has been updated to integrate with the real-time calendar sync system! Here's what's now live:

### 🎯 Updated Features

1. **Live Event Display**: JavaScript now fetches from Cloudflare Worker API endpoint
2. **ICS Calendar Feed**: Full subscription instructions for all major calendar apps
3. **Comprehensive Troubleshooting**: Detailed help for common sync issues
4. **Updated UI**: All "Coming Soon" messages replaced with live status
5. **Quick Reference Card**: Shows actual calendar feed URL and stats

## 🔧 What You Need to Configure

### Step 1: Replace Placeholder URL

Throughout the events page, you'll find this placeholder:
```
https://your-worker.workers.dev/events.ics?env=production
```

**Find and replace with your actual Cloudflare Worker URL.**

#### Where to Update:

1. **JavaScript API Endpoint** (Line ~106):
   ```javascript
   const response = await fetch('https://your-worker.workers.dev/api/events?env=production');
   ```
   
2. **Calendar Feed URL Display** (Multiple locations):
   ```html
   https://your-worker.workers.dev/events.ics?env=production
   ```

3. **Quick Reference Card** (Near bottom of page)

4. **Troubleshooting Links** (In troubleshooting section)

### Step 2: Find Your Cloudflare Worker URL

Your Cloudflare Worker URL should look like:
```
https://<worker-name>.<account-subdomain>.workers.dev
```

**To find it:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Select your events worker
4. Copy the **URL** shown at the top

### Step 3: Global Find & Replace

Use VS Code's find and replace:
1. Press `Ctrl+Shift+H` (Windows) or `Cmd+Shift+H` (Mac)
2. **Find**: `https://your-worker.workers.dev`
3. **Replace**: `https://your-actual-worker-url.workers.dev`
4. Click "Replace All" in `events/index.md`

## 📋 API Endpoints Your Worker Should Support

Based on the documentation you provided, ensure your Cloudflare Worker has these endpoints:

### 1. Events API (JSON)
```
GET /api/events?env=production
GET /api/events?env=preview
```

**Expected Response:**
```json
{
  "events": [
    {
      "id": "evt-12345",
      "title": "Community Meeting",
      "description": "...",
      "date": "2025-01-15T10:00:00.000Z",
      "location": "123 Main St",
      "isVirtual": false,
      "asl": true,
      "captions": true,
      "stepFree": true,
      "sensorySpace": false,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z",
      "createdBy": "user-uid-123"
    }
  ],
  "lastFetch": 1704110400000
}
```

### 2. ICS Calendar Feed
```
GET /events.ics?env=production
GET /events.ics?env=preview
```

**Expected Response:**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events Calendar//EN
BEGIN:VEVENT
UID:evt-12345
DTSTAMP:20250101T120000Z
DTSTART:20250115T100000Z
SUMMARY:Community Meeting
DESCRIPTION:Join us for our monthly meeting
LOCATION:123 Main St
END:VEVENT
END:VCALENDAR
```

### 3. Health Check (Optional)
```
GET /health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": 1704110400000
}
```

## 🔐 CORS Configuration

Your Cloudflare Worker needs CORS headers for the website to access it:

```javascript
const headers = {
  'Access-Control-Allow-Origin': 'https://3mpwrapp.pages.dev',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
```

**For development**, you can use `'Access-Control-Allow-Origin': '*'` but restrict it to your domain in production.

## 🧪 Testing Checklist

### Test 1: API Endpoint
```bash
curl https://your-worker.workers.dev/api/events?env=production
```
✅ Should return JSON with events array

### Test 2: ICS Feed
```bash
curl https://your-worker.workers.dev/events.ics?env=production
```
✅ Should return valid iCalendar format starting with `BEGIN:VCALENDAR`

### Test 3: Website Display
1. Open your website at `/events/`
2. Check browser console (F12) for errors
3. Events should load within 5 seconds
4. No "Loading..." message should persist

### Test 4: Calendar Subscription
1. Copy ICS URL: `https://your-worker.workers.dev/events.ics?env=production`
2. Add to your calendar app (iPhone, Google Calendar, etc.)
3. Verify events appear
4. Wait 1-24 hours for full sync

## 🚨 Troubleshooting

### Events page shows "Connection Issue"

**Check:**
1. ✅ Cloudflare Worker is deployed and running
2. ✅ Worker URL is correct in `events/index.md`
3. ✅ CORS headers are configured
4. ✅ Firestore has events in `events_production` collection
5. ✅ Browser console for specific error messages

### Calendar subscription fails

**Check:**
1. ✅ ICS endpoint returns valid iCalendar format
2. ✅ URL is HTTPS (required by calendar apps)
3. ✅ No authentication required for ICS endpoint
4. ✅ Content-Type header is `text/calendar`

### Events appear on website but not in subscribed calendar

**This is normal!** Calendar apps can take 1-24 hours to sync. The website updates every 5 minutes, but:
- **iOS/macOS**: Updates every few hours
- **Google Calendar**: Up to 24 hours
- **Outlook**: Hourly to daily

**Force refresh:**
- iOS: Settings → Calendar → Accounts → Refresh
- macOS: Calendar → View → Refresh All
- Google Calendar: Wait 24 hours (no manual refresh available)

## 📊 Expected Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Website load time | < 5 seconds | Events fetched from Cloudflare Worker |
| API response time | < 100ms | Cloudflare KV cache globally distributed |
| Calendar sync time | 1-24 hours | Depends on calendar app refresh rate |
| Website update frequency | Every 5 minutes | Auto-refresh via setInterval |
| ICS feed refresh | Hourly | Cloudflare KV cache TTL |

## 🔄 Data Flow

```
User creates event in app
        ↓
Firestore (instant)
        ↓
Cloudflare Worker API (< 1 hour via KV cache)
        ↓
Website (5 minute refresh)
        ↓
ICS Feed (hourly refresh)
        ↓
Calendar Apps (1-24 hour sync)
```

## 📝 Environment Variables

Ensure your Cloudflare Worker has these environment variables set:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_SERVICE_ACCOUNT=<service-account-json>
```

Check: **Cloudflare Dashboard → Workers → Your Worker → Settings → Variables**

## 🎯 Next Steps

1. ✅ **Replace Worker URL**: Find & replace `your-worker.workers.dev` with your actual URL
2. ✅ **Test API Endpoints**: Use curl or browser to verify responses
3. ✅ **Deploy Website**: Push changes to GitHub (auto-deploys to Cloudflare Pages)
4. ✅ **Test Calendar Subscription**: Subscribe to ICS feed from your phone
5. ✅ **Create Test Event**: Create an event in the app and verify it appears
6. ✅ **Monitor Performance**: Check Cloudflare Worker analytics for errors

## 📞 Support

If you encounter issues:

1. **Check Cloudflare Worker Logs**: Dashboard → Workers → Your Worker → Logs
2. **Check Browser Console**: F12 → Console tab for JavaScript errors
3. **Verify Firestore Data**: Firebase Console → Firestore → `events_production`
4. **Test Endpoints Directly**: Use curl or Postman to test API responses

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Events page loads without errors
- ✅ Events display in neat cards with accessibility badges
- ✅ Auto-refresh works (page updates every 5 minutes without reload)
- ✅ ICS URL opens in browser and shows calendar data
- ✅ Calendar subscription works on your device
- ✅ Events created in app appear on website within 5 minutes

## 📚 Related Documentation

- `REAL_TIME_EVENTS_SYNC.md` - App-side sync documentation
- `WEBSITE_EVENTS_AUTO_SYNC.md` - Detailed website integration guide
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/

---

**Last Updated**: November 6, 2025  
**Status**: Ready for production once Worker URL is configured
