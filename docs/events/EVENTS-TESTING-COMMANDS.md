# Quick Test Commands for Events Calendar

## 🧪 Copy-Paste Testing Commands

Replace `YOUR_WORKER_URL` with your actual Cloudflare Worker URL.

### Test 1: Check API Endpoint (JSON)
```powershell
# PowerShell
Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/api/events?env=production" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

```bash
# Bash/Terminal
curl https://YOUR_WORKER_URL/api/events?env=production | jq
```

**Expected**: JSON with events array and lastFetch timestamp

---

### Test 2: Check ICS Feed (Calendar Format)
```powershell
# PowerShell
Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/events.ics?env=production" | Select-Object -ExpandProperty Content
```

```bash
# Bash/Terminal
curl https://YOUR_WORKER_URL/events.ics?env=production
```

**Expected**: Text starting with `BEGIN:VCALENDAR`

---

### Test 3: Check Health Endpoint
```powershell
# PowerShell
Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/health" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

```bash
# Bash/Terminal
curl https://YOUR_WORKER_URL/health
```

**Expected**: `{"status":"healthy","timestamp":...}`

---

### Test 4: Check CORS Headers
```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/api/events?env=production").Headers
```

```bash
# Bash/Terminal
curl -I https://YOUR_WORKER_URL/api/events?env=production
```

**Expected Headers:**
- `Access-Control-Allow-Origin: *` (or your domain)
- `Content-Type: application/json`
- `Cache-Control: ...`

---

### Test 5: Validate ICS Format
```powershell
# PowerShell - Save to file and open
Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/events.ics?env=production" -OutFile "test-events.ics"
# Then open test-events.ics with your calendar app
```

```bash
# Bash - Validate structure
curl https://YOUR_WORKER_URL/events.ics?env=production | grep -E "BEGIN:VCALENDAR|VERSION|BEGIN:VEVENT|END:VEVENT|END:VCALENDAR"
```

**Expected**: Valid iCalendar structure

---

### Test 6: Check Response Time
```powershell
# PowerShell
Measure-Command { Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/api/events?env=production" }
```

```bash
# Bash
time curl https://YOUR_WORKER_URL/api/events?env=production
```

**Expected**: < 500ms (usually < 100ms with Cloudflare)

---

### Test 7: Test from Website (Browser Console)
Open your events page and paste in browser console (F12):

```javascript
// Test API endpoint
fetch('https://YOUR_WORKER_URL/api/events?env=production')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Events loaded:', data.events.length);
    console.log('📅 Events:', data.events);
  })
  .catch(err => console.error('❌ Error:', err));

// Test CORS
fetch('https://YOUR_WORKER_URL/api/events?env=production', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => {
    console.log('✅ CORS works!');
    console.log('Headers:', r.headers);
  })
  .catch(err => console.error('❌ CORS error:', err));
```

---

### Test 8: Subscribe to Calendar (Quick Test)
```
1. Copy this URL:
   https://YOUR_WORKER_URL/events.ics?env=production

2. iPhone: Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar → Paste URL

3. Android/Google Calendar: 
   - Go to calendar.google.com
   - Left sidebar → Other calendars → + → From URL → Paste URL
   
4. Mac: Calendar → File → New Calendar Subscription → Paste URL

5. Windows/Outlook: Calendar → Add Calendar → Subscribe from web → Paste URL
```

---

## 🐛 Debugging Commands

### Check Firestore Events (via REST API)
```bash
# If you have Firebase REST API access
curl "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/events_production"
```

### Check Cloudflare Worker Logs
```
1. Go to Cloudflare Dashboard
2. Workers & Pages → Your Worker
3. Click "Logs" tab
4. Filter by "error" or "status:500"
```

### Test Local Server (if running Jekyll)
```powershell
# Start Jekyll server
bundle exec jekyll serve

# Then test in browser
http://localhost:4000/events/

# Check console for errors
```

---

## ✅ Success Indicators

Run through this checklist:

- [ ] API endpoint returns JSON with events array
- [ ] ICS feed returns valid calendar format
- [ ] Health check returns "healthy"
- [ ] CORS headers present in response
- [ ] Response time < 500ms
- [ ] No errors in browser console
- [ ] Events display on website
- [ ] Calendar subscription works
- [ ] Auto-refresh works (wait 5 min, check console)
- [ ] Test event created in app appears within 5 min

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Failed to fetch" error
```javascript
// Check CORS in browser console
fetch('https://YOUR_WORKER_URL/api/events?env=production')
  .then(r => console.log('Status:', r.status, 'Headers:', r.headers))
  .catch(e => console.error('Error:', e.message));
```

**Fix**: Add CORS headers in Worker

---

### Issue: Empty events array
```bash
# Check Firestore directly
curl "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/events_production"
```

**Fix**: Create test event in app or check Firestore rules

---

### Issue: Calendar subscription fails
```bash
# Validate ICS format
curl https://YOUR_WORKER_URL/events.ics?env=production | head -20
```

**Fix**: Ensure Content-Type is `text/calendar` and format is valid

---

### Issue: Slow response time
```powershell
# Test multiple times
1..5 | ForEach-Object {
  Measure-Command { Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/api/events?env=production" } | Select-Object TotalMilliseconds
}
```

**Fix**: Check Cloudflare KV cache is working

---

## 📋 Pre-Deployment Checklist

Before going live, run these tests:

```powershell
# PowerShell - Run all tests
Write-Host "🧪 Testing Events Calendar Integration..." -ForegroundColor Cyan

# Test 1: API
$api = Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/api/events?env=production"
if ($api.StatusCode -eq 200) { Write-Host "✅ API works" -ForegroundColor Green } else { Write-Host "❌ API failed" -ForegroundColor Red }

# Test 2: ICS
$ics = Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/events.ics?env=production"
if ($ics.StatusCode -eq 200 -and $ics.Content -like "*BEGIN:VCALENDAR*") { Write-Host "✅ ICS feed works" -ForegroundColor Green } else { Write-Host "❌ ICS failed" -ForegroundColor Red }

# Test 3: Health
$health = Invoke-WebRequest -Uri "https://YOUR_WORKER_URL/health"
if ($health.StatusCode -eq 200) { Write-Host "✅ Health check works" -ForegroundColor Green } else { Write-Host "❌ Health check failed" -ForegroundColor Red }

Write-Host "`n🎉 All tests passed! Ready to deploy." -ForegroundColor Green
```

---

## 🔗 Quick Reference Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Firebase Console**: https://console.firebase.google.com/
- **Your Website**: https://3mpwrapp.pages.dev/events/
- **ICS Validator**: https://icalendar.org/validator.html

---

**Save this file** for quick reference when testing!

Replace `YOUR_WORKER_URL` with your actual URL and run these commands to verify everything works.
