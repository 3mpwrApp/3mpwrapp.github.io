# Data Sync Guide: App ↔ Website

This guide explains how to keep events and campaigns synchronized between the 3mpwr mobile app and the website (https://3mpwrapp.pages.dev).

## 🎯 Overview

Both the app and website share the same data for:
- **Events** - Community events, rallies, workshops
- **Campaigns** - Advocacy campaigns and petitions

## 📂 Data Sources

### Source of Truth
All data is defined in TypeScript files:
- `data/events.ts` - Events calendar data
- `data/campaigns.ts` - Campaigns and petitions data

### Public API Files
Static JSON files hosted on Cloudflare Pages:
- `public/api/events.json` - JSON version of events data
- `public/api/campaigns.json` - JSON version of campaigns data

## 🔄 Sync Workflow

### 1. Update Data
Edit the source TypeScript files:

```bash
# Edit events
code data/events.ts

# Edit campaigns
code data/campaigns.ts
```

### 2. Run Sync Script
After making changes, run the sync command:

```bash
npm run sync:data
```

This script:
- ✅ Reads TypeScript data files
- ✅ Converts to clean JSON format
- ✅ Writes to `public/api/*.json`
- ✅ Validates JSON structure

### 3. Commit & Deploy
```bash
git add data/ public/api/
git commit -m "feat: update events and campaigns data"
git push
```

### 4. Deploy to Cloudflare Pages
Your Cloudflare Pages site will automatically rebuild when you push to main.

## 🌐 Website Integration

### Fetch Events
```javascript
// On your website
const response = await fetch('https://3mpwrapp.pages.dev/api/events.json');
const events = await response.json();

// Display events
events.forEach(event => {
  console.log(`${event.title} - ${event.date}`);
});
```

### Fetch Campaigns
```javascript
const response = await fetch('https://3mpwrapp.pages.dev/api/campaigns.json');
const campaigns = await response.json();

campaigns.forEach(campaign => {
  console.log(`${campaign.title}: ${campaign.summary}`);
});
```

## 📱 App Integration

The app already fetches from these endpoints! See:
- `services/events.ts` - Fetches events with fallback
- `services/campaigns.ts` - Fetches campaigns with fallback

## 🔧 Backend Server API

If you're running the Node.js server (`server/index.js`), it provides additional endpoints:

### Dynamic JSON API
- `GET /api/events` - Returns events as JSON
- `GET /api/campaigns` - Returns campaigns as JSON

### iCalendar Feed
- `GET /events.ics` - Returns events as iCalendar format (for Google Calendar, Apple Calendar, etc.)

## 🚀 Quick Start

### Add a New Event
1. Open `data/events.ts`
2. Add new event object:
```typescript
{
  id: "evt7",
  title: "New Workshop",
  description: "Description here",
  date: "2025-11-15 18:00",
  location: "Community Center",
  isVirtual: false,
  stepFree: true,
  captions: true
}
```
3. Run `npm run sync:data`
4. Commit and push

### Add a New Campaign
1. Open `data/campaigns.ts`
2. Add new campaign:
```typescript
{
  id: "c4",
  title: "New Campaign Title",
  summary: "Campaign description and goals."
}
```
3. Run `npm run sync:data`
4. Commit and push

## ✅ Testing

### Test Local Sync
```bash
npm run sync:data
```

### Test JSON Output
```bash
# View generated events JSON
cat public/api/events.json

# View generated campaigns JSON
cat public/api/campaigns.json
```

### Test Website Fetch
```bash
# After deploying to Cloudflare Pages
curl https://3mpwrapp.pages.dev/api/events.json
curl https://3mpwrapp.pages.dev/api/campaigns.json
```

## 📝 Data Schema

### Event Schema
```typescript
{
  id: string;          // Unique identifier
  title: string;       // Event name
  description: string; // Event description
  date: string;        // ISO format or "YYYY-MM-DD HH:MM"
  location?: string;   // Physical location
  isVirtual?: boolean; // Online event flag
  asl?: boolean;       // ASL interpretation available
  captions?: boolean;  // Closed captions available
  stepFree?: boolean;  // Wheelchair accessible
  sensorySpace?: boolean; // Sensory-friendly space
}
```

### Campaign Schema
```typescript
{
  id: string;    // Unique identifier
  title: string; // Campaign name
  summary: string; // Brief description
}
```

## 🔐 Security Notes

- ✅ All files are static JSON - no sensitive data
- ✅ CORS enabled for website access
- ✅ Cached for 5 minutes (300s)
- ✅ All data is public-facing

## 🐛 Troubleshooting

### Sync script fails
- Check TypeScript syntax in source files
- Ensure `data/events.ts` and `data/campaigns.ts` exist
- Check for trailing commas or syntax errors

### Website can't fetch data
- Verify files exist in `public/api/` directory
- Check Cloudflare Pages build logs
- Verify CORS headers are set

### App shows outdated data
- App uses local fallback if fetch fails
- Check `EXPO_PUBLIC_API_BASE` environment variable
- Clear app cache and rebuild

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review commit history for examples
3. Check GitHub issues
4. Contact development team

---

**Last Updated:** October 30, 2025
