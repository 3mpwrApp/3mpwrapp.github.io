# Timezone and Data Sync Fix

## Issues Identified and Resolved

### 1. **Timezone Handling - Firestore UTC vs EST**

**Problem:**
- Firebase/Firestore stores all dates as `Timestamp` objects in UTC
- The app was not properly converting these UTC timestamps to EST (America/New_York timezone)
- Events and campaigns were showing incorrect times or not displaying at all

**Solution:**
- Added `convertUTCtoEST()` utility function in `services/firestoreEventSync.ts`
- This function properly converts UTC dates to EST/EDT (handles daylight saving time)
- Updated `fetchEventUpdates()` to convert all Firestore Timestamps to EST strings
- Updated Cloudflare Worker timezone conversion to use proper `toLocaleString()` with `America/New_York` timezone

**Files Changed:**
- `services/firestoreEventSync.ts` - Added UTC to EST conversion
- `cloudflare-workers/empowrapp-events/src/index.js` - Fixed timezone conversion logic

### 2. **Collection Selection in EAS Preview Builds**

**Problem:**
- Code was using `process.env.NODE_ENV === 'production'` to determine which Firestore collection to query
- However, in EAS builds (including preview builds), `NODE_ENV` is always set to `'production'`
- This caused preview builds to query the production collections instead of preview collections

**Solution:**
- Changed from `process.env.NODE_ENV` to `__DEV__` flag
- `__DEV__` is `true` in development mode and EAS preview builds
- `__DEV__` is `false` in production release builds
- Now correctly queries:
  - `campaigns_preview` / `events_preview` in dev/preview builds
  - `campaigns_production` / `events_production` in production builds

**Files Changed:**
- `app/campaigns/index.tsx` - Line 145: Changed to use `__DEV__`
- `app/events/index.impl.tsx` - Line 134: Changed to use `__DEV__`

### 3. **Date Storage Format in Cloudflare Workers**

**Problem:**
- Workers were storing dates inconsistently
- Timezone offset calculation was incorrect (manual offset math)

**Solution:**
- Store dates in two formats:
  - `date`: Human-readable EST format (e.g., "12/25/2024, 14:30")
  - `dateISO`: ISO 8601 UTC format for sorting/comparison
- Use browser `toLocaleString()` with `America/New_York` timezone for accurate conversion
- This properly handles EST/EDT transitions automatically

**Files Changed:**
- `cloudflare-workers/empowrapp-events/src/index.js`

## Testing Checklist

### EAS Preview Build
- [ ] Run `eas build --profile preview --platform all`
- [ ] Install preview build on device
- [ ] Verify campaigns load from `campaigns_preview` collection
- [ ] Verify events load from `events_preview` collection
- [ ] Check that event times display in EST
- [ ] Create a new campaign and verify it syncs to both preview and production collections

### Production Build
- [ ] Run `eas build --profile production --platform all`
- [ ] Install production build on device
- [ ] Verify campaigns load from `campaigns_production` collection
- [ ] Verify events load from `events_production` collection
- [ ] Check that event times display in EST

### Website (3mpwrapp.pages.dev)
- [ ] Visit https://3mpwrapp.pages.dev/campaigns/
- [ ] Verify campaigns are displaying
- [ ] Visit https://3mpwrapp.pages.dev/events/
- [ ] Verify events are displaying with correct EST times
- [ ] Test `/events.ics` calendar feed download
- [ ] Verify ICS file has correct timezone (America/New_York)

### Local Development
- [ ] Run `npx expo start`
- [ ] Verify campaigns load from `campaigns_preview` collection
- [ ] Verify events load from `events_preview` collection
- [ ] Create a test event with specific time and verify it displays correctly

## Firestore Collections Structure

### Campaigns
- **Production**: `campaigns_production` - Used by production builds and website
- **Preview**: `campaigns_preview` - Used by dev and EAS preview builds

### Events
- **Production**: `events_production` - Used by production builds and website
- **Preview**: `events_preview` - Used by dev and EAS preview builds

## Cloudflare Workers Endpoints

### Events Worker
- `GET /api/events?env=production` - List production events
- `GET /api/events?env=preview` - List preview events
- `POST /api/events` - Create/update event (syncs to both collections)
- `DELETE /api/events/:id` - Delete event (deletes from both collections)
- `GET /events.ics` - Calendar feed (production events only)
- `GET /health` - Health check

### Campaigns Worker
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create/update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /health` - Health check

## Timezone Reference

**App Timezone**: America/New_York (EST/EDT)
- EST: UTC-5 (Standard Time: November - March)
- EDT: UTC-4 (Daylight Time: March - November)

**Firestore Storage**: UTC (all timestamps)
**Display Format**: EST/EDT (converted on read)

## Debugging Tips

### Check current timezone settings:
```javascript
// In app console
console.log(new Date().toString());
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);

// Check Firestore date
const event = await getDoc(doc(db, 'events_preview', 'EVENT_ID'));
console.log(event.data().date.toDate()); // Should be UTC
```

### Verify collection selection:
```javascript
// In campaigns/events screen
console.log('__DEV__:', __DEV__);
console.log('Collection:', __DEV__ ? 'preview' : 'production');
```

### Test Cloudflare Worker timezone:
```bash
# Test event creation
curl -X POST https://3mpwrapp-calendar.workers.dev/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "title": "Test Event",
    "date": "2024-12-25T14:30:00Z",
    "category": "community",
    "status": "published"
  }'

# Should return date in EST format
```

## Common Issues and Solutions

### Issue: Events not showing in app
**Check:**
1. Is `__DEV__` true? (Should query `events_preview`)
2. Are events in Firestore marked as `status: 'published'`?
3. Are events in `category: 'community'`?
4. Check browser console for Firestore errors

### Issue: Times showing incorrectly
**Check:**
1. Verify Firestore Timestamp is being converted with `convertUTCtoEST()`
2. Check if Cloudflare Worker is using `America/New_York` timezone
3. Ensure `toLocaleString()` is being called with correct timezone option

### Issue: Website not showing data
**Check:**
1. Are Cloudflare Workers deployed and running?
2. Test worker endpoints directly: `https://3mpwrapp-calendar.workers.dev/api/events`
3. Check KV storage has data (Cloudflare Dashboard > Workers & Pages > KV)
4. Verify CORS headers are allowing requests

## Deployment Steps

1. **Deploy Cloudflare Workers**:
```bash
cd cloudflare-workers/empowrapp-events
npm run deploy

cd ../empowrapp-campaigns
npm run deploy
```

2. **Publish EAS Update** (for live app without rebuild):
```bash
eas update --channel production --message "Fix timezone and data sync"
```

3. **Build New Binary** (if needed):
```bash
# Preview
eas build --profile preview --platform all

# Production
eas build --profile production --platform all
```

## Related Files

- `services/firestoreEventSync.ts` - Event sync with timezone conversion
- `services/firestoreCampaignSync.ts` - Campaign sync
- `app/campaigns/index.tsx` - Campaigns screen
- `app/events/index.impl.tsx` - Events screen
- `cloudflare-workers/empowrapp-events/src/index.js` - Events worker
- `cloudflare-workers/empowrapp-campaigns/src/index.js` - Campaigns worker
- `firebase/config.ts` - Firebase configuration

## Notes

- All user-created events and campaigns are synced to **both** preview and production collections
- This ensures testing in preview environment doesn't affect production data visibility
- Production website reads from `*_production` collections only
- Preview/dev builds read from `*_preview` collections
- Cloudflare Workers serve data to the website from KV storage (synced from Firestore)
