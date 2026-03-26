# 🧪 Quick Test Guide - Campaigns & Events Real-Time Sync

**Test Date:** November 8, 2025

---

## ⚡ Quick 5-Minute Test

### 1️⃣ Test Campaigns Page (2 minutes)

**Open:** https://3mpwrapp.pages.dev/campaigns/

**✅ What to Check:**
- [ ] Page loads within 3 seconds
- [ ] You see either:
  - "🚀 Campaigns Coming Soon!" (if no campaigns exist)
  - OR campaign cards with titles, descriptions, progress bars
- [ ] No JavaScript errors in browser console (F12)
- [ ] Page is mobile-responsive (resize browser)

**🔗 Test API Directly:**
```bash
curl https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns
```
Should return:
```json
{
  "campaigns": []
}
```
OR a list of campaign objects

---

### 2️⃣ Test Events Page (2 minutes)

**Open:** https://3mpwrapp.pages.dev/events/

**✅ What to Check:**
- [ ] Page loads within 3 seconds
- [ ] You see either:
  - "📅 No Events Yet" (if no events exist)
  - OR event cards with dates, locations, accessibility badges
- [ ] No JavaScript errors in browser console (F12)
- [ ] Page is mobile-responsive (resize browser)

**🔗 Test API Directly:**
```bash
curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production
```
Should return:
```json
{
  "events": []
}
```
OR a list of event objects

---

### 3️⃣ Test ICS Calendar Feed (1 minute)

**Open in Browser:** https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production

**✅ What to Check:**
- [ ] Browser downloads or displays .ics file
- [ ] File contains `BEGIN:VCALENDAR` and `END:VCALENDAR`
- [ ] File includes built-in events (disability awareness days, etc.)
- [ ] File is valid iCalendar format

**🔗 Test via Command Line:**
```bash
curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production
```

---

## 🔥 Advanced Testing

### Test with Real Data

**Create a Test Campaign in App:**
1. Open 3mpwrApp (once app is live)
2. Create a new campaign
3. Mark as "Public"
4. Save
5. Wait 5 minutes
6. Refresh https://3mpwrapp.pages.dev/campaigns/
7. Campaign should appear!

**Create a Test Event in App:**
1. Open 3mpwrApp (once app is live)
2. Create a new event
3. Mark as "Public"
4. Save
5. Wait 5 minutes
6. Refresh https://3mpwrapp.pages.dev/events/
7. Event should appear!

---

## 🐛 Common Issues & Fixes

### Issue: "Loading campaigns..." never finishes

**Possible Causes:**
- API endpoint is down
- CORS error
- Network issue

**How to Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check if API is accessible: `curl https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns`
4. If API returns data but page doesn't load, check JavaScript console for errors

---

### Issue: Events page shows "Connection Issue"

**Possible Causes:**
- API endpoint is down
- Firestore connection issue
- Cloudflare Worker error

**How to Fix:**
1. Check API directly: `curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=production`
2. If API returns 500 error, check Cloudflare Workers logs
3. Verify Firestore is accessible (check Firebase Console)

---

### Issue: Calendar feed not working

**Possible Causes:**
- Wrong URL
- Calendar app cache issue
- Feed format error

**How to Fix:**
1. Verify URL: `https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics?env=production`
2. Test in browser first (should download .ics file)
3. Force refresh in calendar app
4. Remove and re-add subscription

---

## 📊 Expected Performance

| Metric | Target | Actual |
|--------|--------|--------|
| **Page Load Time** | < 3 seconds | _test_ |
| **API Response Time** | < 1 second | _test_ |
| **Update Frequency** | Every 5 minutes | ✅ |
| **Mobile Responsive** | Yes | ✅ |
| **CORS Enabled** | Yes | ✅ |

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Both pages load without errors
- [ ] API endpoints return valid JSON
- [ ] ICS feed returns valid iCalendar format
- [ ] Mobile responsive design works
- [ ] No JavaScript console errors
- [ ] Auto-refresh works (wait 5 minutes, check console)
- [ ] Error handling shows user-friendly messages
- [ ] "Join Campaign" button works
- [ ] "Share" button works
- [ ] RSVP links work (if present)

---

## 🚀 Deployment Steps

1. **Commit Changes:**
   ```bash
   git add campaigns/index.md events/index.md
   git commit -m "feat: Enable real-time sync for campaigns and events pages"
   git push origin main
   ```

2. **Cloudflare Pages Auto-Deploy:**
   - Cloudflare Pages will automatically detect the push
   - Build and deploy within 2-5 minutes
   - Check deployment status at Cloudflare Pages dashboard

3. **Verify Production:**
   - Visit https://3mpwrapp.pages.dev/campaigns/
   - Visit https://3mpwrapp.pages.dev/events/
   - Test API endpoints
   - Test ICS feed

4. **Monitor:**
   - Check Cloudflare Workers analytics
   - Monitor API usage
   - Watch for errors in Cloudflare Workers logs

---

## 📞 Support

**Issues?** Email: empowrapp08162025@gmail.com

**Documentation:** See `CAMPAIGNS-EVENTS-REALTIME-SYNC-SETUP.md` for full details

---

**✅ Test Completed!**

Date: _____________  
Tested By: _____________  
Status: _____________  
Notes: _____________
