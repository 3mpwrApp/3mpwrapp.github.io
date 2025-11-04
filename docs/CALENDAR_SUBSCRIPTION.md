# Calendar Subscription Feature

## Overview

The 3mpwrApp now supports **auto-updating calendar subscriptions** via webcal:// protocol. Users can subscribe to the events calendar in their native calendar app (Apple Calendar, Google Calendar, Outlook, etc.) and receive automatic updates when new events are added.

## How It Works

### Technical Architecture

1. **Server Endpoint**: `/events.ics` generates a dynamic ICS feed with subscription metadata
2. **Refresh Interval**: Calendar apps check for updates every 24 hours (configurable)
3. **Event Types**: Includes community events, disability observances, health awareness months, and Canadian holidays
4. **Stable UIDs**: Events use deterministic UIDs to prevent duplicates across syncs

### ICS Feed Metadata

The feed includes proper subscription headers:
```
X-WR-CALNAME: 3mpwrApp Events
X-WR-CALDESC: Community events, disability observances, and awareness days
X-WR-TIMEZONE: America/Toronto
REFRESH-INTERVAL;VALUE=DURATION:PT1440M (24 hours)
X-PUBLISHED-TTL: PT1440M
```

## Setup Instructions

### 1. Server Configuration

The server is already configured in `server/index.js`. To deploy:

```bash
cd server
npm install
npm start
```

The server will run on port 8080 by default. Set `PORT` environment variable to change.

### 2. Environment Configuration

Add your server URL to your `.env` file:

```bash
# Calendar subscription feed URL (use your production server URL)
EXPO_PUBLIC_CALENDAR_FEED_URL=https://your-server.com/events.ics

# For local development:
# EXPO_PUBLIC_CALENDAR_FEED_URL=http://localhost:8080/events.ics
```

### 3. Production Deployment

#### Option A: Deploy to Cloudflare Pages/Workers

1. Deploy the server folder to Cloudflare Workers
2. Configure the URL: `https://api.3mpwrapp.pages.dev/events.ics`
3. Update `EXPO_PUBLIC_CALENDAR_FEED_URL` accordingly

#### Option B: Deploy to Heroku/Railway/Render

```bash
# Deploy to your preferred platform
git push heroku main

# Update environment variable
heroku config:set EXPO_PUBLIC_CALENDAR_FEED_URL=https://your-app.herokuapp.com/events.ics
```

#### Option C: Use Existing Server

If you already have the server running (e.g., for notifications), just set the URL:

```bash
EXPO_PUBLIC_CALENDAR_FEED_URL=https://your-existing-server.com/events.ics
```

### 4. Update EAS Build

Update your `eas.json` to include the calendar feed URL:

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_CALENDAR_FEED_URL": "https://your-server.com/events.ics"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_CALENDAR_FEED_URL": "https://your-server.com/events.ics"
      }
    }
  }
}
```

## User Instructions

### How Users Subscribe

1. **In the App**:
   - Open the Events tab
   - Tap the "📲 Subscribe to Calendar" button
   - Tap "Copy URL"
   - Follow platform-specific instructions

2. **iOS/macOS**:
   - Open Calendar app
   - Tap "Calendars" at bottom
   - Tap "Add Calendar" → "Add Subscription Calendar"
   - Paste the URL
   - Tap "Subscribe"

3. **Google Calendar**:
   - Go to calendar.google.com
   - Click "+" next to "Other calendars"
   - Select "From URL"
   - Paste the subscription URL
   - Click "Add calendar"

4. **Outlook**:
   - Right-click "My Calendars"
   - Select "Add Calendar" → "From Internet"
   - Paste the URL
   - Click "OK"

### What Users Get

- **Community Events**: All upcoming 3mpwrApp community events
- **Disability Observances**: International Day of Persons with Disabilities, etc.
- **Health Awareness**: Chronic Pain Awareness Month, Mental Health Week, etc.
- **Canadian Holidays**: Federal and provincial holidays (if enabled in settings)
- **Automatic Updates**: New events appear automatically within 24 hours

## API Endpoints

### GET /events.ics

Returns a subscribable ICS calendar feed.

**Query Parameters**:
- `year` (optional): Filter to specific year (default: current year)
- `observances` (optional): Include disability observances (default: true)
- `holidays` (optional): Include Canadian holidays (default: true)

**Examples**:
```
# Full calendar (recommended for subscriptions)
https://your-server.com/events.ics

# Only 2025 events
https://your-server.com/events.ics?year=2025

# Without holidays
https://your-server.com/events.ics?holidays=false

# Community events only
https://your-server.com/events.ics?observances=false&holidays=false
```

**Response Headers**:
```
Content-Type: text/calendar; charset=utf-8
Content-Disposition: inline; filename="3mpwrapp-events.ics"
Cache-Control: public, max-age=3600
Access-Control-Allow-Origin: *
```

## Testing

### Test the Feed

1. **Direct Browser Access**:
   ```bash
   curl https://your-server.com/events.ics
   ```
   Should return valid ICS data starting with `BEGIN:VCALENDAR`

2. **Validate ICS Format**:
   Use online validator: https://icalendar.org/validator.html

3. **Test Subscription**:
   - Add to your personal calendar
   - Wait 24 hours
   - Add a new event in the app
   - Verify it appears in your calendar

### Local Development Testing

```bash
# Start local server
cd server
npm start

# In another terminal, test the endpoint
curl http://localhost:8080/events.ics

# Set environment variable for app
export EXPO_PUBLIC_CALENDAR_FEED_URL=http://localhost:8080/events.ics

# Start Expo
npx expo start
```

## Troubleshooting

### Calendar Not Updating

1. **Check Refresh Interval**: Some calendar apps ignore the 24-hour suggestion
2. **Manual Refresh**: In calendar app, tap the calendar name and tap "Refresh"
3. **Check URL**: Ensure EXPO_PUBLIC_CALENDAR_FEED_URL is correctly set
4. **Server Status**: Verify server is running and accessible

### Events Duplicating

- Ensure UIDs are stable (based on date + title)
- Check that `subscribable: true` is passed to `buildICSMany()`
- Clear and re-subscribe to the calendar

### No Events Appearing

1. **Verify Feed**: Check the feed URL in browser
2. **Check Filters**: Ensure you're not filtering out events via query params
3. **Timezone**: Verify timezone settings (default: America/Toronto)
4. **Date Range**: Some calendar apps only show future events

## Advanced Configuration

### Custom Refresh Interval

Modify in `server/index.js`:

```javascript
const ics = (await import('../services/ics.js')).buildICSMany(allEvents, {
  calendarName: '3mpwrApp Events',
  refreshInterval: 720, // 12 hours instead of 24
  timezone: 'America/Toronto',
  subscribable: true,
});
```

### Per-User Subscriptions

To create user-specific calendar feeds:

```javascript
// In server/index.js, add new endpoint:
app.get('/events/:userId.ics', async (req, res) => {
  const { userId } = req.params;
  // Filter events based on user preferences
  const userEvents = await getUserEvents(userId);
  const ics = buildICSMany(userEvents, { subscribable: true });
  res.send(ics);
});
```

### Provincial Filtering

Filter events by province:

```javascript
// Query: /events.ics?province=ON
const province = req.query.province;
if (province) {
  const { generateProvincialHolidays } = await import('../data/holidays-ca.js');
  const provincialHolidays = generateProvincialHolidays(year, province);
  allEvents = allEvents.concat(provincialHolidays.map(e => ({ ... })));
}
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **CORS**: Already configured with `Access-Control-Allow-Origin: *`
3. **HTTPS**: Always use HTTPS in production for privacy
4. **Authentication**: For private calendars, add authentication middleware
5. **Caching**: 1-hour cache prevents excessive server load

## Future Enhancements

- [ ] User-specific event filtering (province, interests)
- [ ] Push notifications when calendar updates
- [ ] Analytics on subscription adoption
- [ ] Multi-language calendar names
- [ ] Integration with Firebase for personalized feeds
- [ ] QR code for easy subscription
- [ ] Deep link support (webcal:// protocol handler)

## Related Files

- `services/ics.ts` - ICS generation with subscription metadata
- `server/index.js` - Calendar feed endpoint
- `app/events/index.impl.tsx` - UI for subscribing
- `utils/eventsExport.ts` - Single-event ICS exports
- `data/disability-observances.js` - Observance data
- `data/health-awareness-months.js` - Awareness events
- `data/holidays-ca.js` - Canadian holidays

## Support

For issues with calendar subscriptions:
1. Check server logs for errors
2. Validate ICS format
3. Test with multiple calendar apps
4. File an issue on GitHub with:
   - Calendar app name/version
   - Platform (iOS/Android/Web)
   - Feed URL (if public)
   - Error message or screenshot
