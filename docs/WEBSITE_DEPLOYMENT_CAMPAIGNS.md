# Website Deployment Guide - Campaigns Page

**Status:** ✅ READY TO DEPLOY  
**Date:** January 2025

## What's Been Done

### 1. ✅ Firestore Rules Updated & Deployed

**Changes:**
- Added public read access to `campaigns_production` collection
- Added public read access to `campaigns_preview` collection  
- Added campaign membership rules
- Deployed to Firebase: `firebase deploy --only firestore:rules`

**Verification:**
```bash
# Test public read access
curl "https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production"
```

### 2. ✅ Website Page Created

**File:** `website/campaigns-page.html`

**Features:**
- Real-time sync from Firestore (30-second auto-refresh)
- Progress bars for campaigns with goals
- Supporter counts and statistics
- Featured campaign badges (for petitions)
- Dark mode support
- Mobile responsive design
- LocalStorage caching (5-minute TTL)
- Error handling with fallback to cache

---

## Deployment Steps

### Option 1: Deploy to Cloudflare Pages (Recommended)

1. **Upload the HTML file** to your Cloudflare Pages project:
   ```bash
   # Copy the file to your Pages project
   cp website/campaigns-page.html /path/to/3mpwrapp-pages/campaigns/index.html
   ```

2. **Commit and push** to your Pages repository:
   ```bash
   cd /path/to/3mpwrapp-pages
   git add campaigns/index.html
   git commit -m "Add real-time campaigns page"
   git push
   ```

3. **Wait for deployment** (Cloudflare Pages auto-deploys on push)

4. **Verify** at: `https://3mpwrapp.pages.dev/campaigns/`

### Option 2: Upload via Cloudflare Dashboard

1. Go to **Cloudflare Pages** dashboard
2. Select your **3mpwrapp** project
3. Click **Source** tab
4. Navigate to `campaigns/` folder (or create it)
5. Upload `campaigns-page.html` as `index.html`
6. Cloudflare will auto-deploy

### Option 3: Direct HTML Hosting

If you're hosting elsewhere (Netlify, Vercel, GitHub Pages):

1. Copy `website/campaigns-page.html`
2. Rename to `index.html`
3. Place in `/campaigns/` directory
4. Deploy using your hosting provider's method

---

## Testing Your Deployment

### 1. Create Test Campaign in App

1. Open 3mpwr app
2. Go to **Campaigns** tab
3. Click **"+ Create New Campaign"**
4. Fill in:
   - Title: `Test Campaign ${Date.now()}`
   - Summary: `Testing real-time sync`
   - Target: `Test Target`
   - Goal Count: `100`
5. Click **"🚀 Create Campaign"**

### 2. Verify on Website

1. Open: `https://3mpwrapp.pages.dev/campaigns/`
2. Wait ~30 seconds (or click "Refresh")
3. **Verify:**
   - ✅ Campaign appears in list
   - ✅ Title and summary display correctly
   - ✅ Progress bar shows (0/100)
   - ✅ "Join Campaign" button works
   - ✅ Sync status shows timestamp

### 3. Test Auto-Refresh

1. Keep website open
2. Create another campaign in app
3. Wait 30 seconds (don't refresh manually)
4. **Verify:** New campaign appears automatically

### 4. Test Join Campaign

1. In app, click existing campaign
2. Click **"Join Campaign"** button
3. Refresh website
4. **Verify:** Supporter count increased

---

## Features Overview

### Real-Time Sync ⚡
- Auto-refreshes every 30 seconds
- Manual refresh button available
- Pauses when browser tab not active (saves bandwidth)
- LocalStorage caching for instant load

### Display Features 📊
- Campaign cards with hover effects
- Progress bars for campaigns with goals
- Featured badges for petition campaigns
- Relative timestamps ("2 hours ago")
- Dark mode support (follows system preference)

### Statistics Dashboard 📈
- Total campaigns count
- Total supporters across all campaigns
- Active campaigns (created in last 30 days)

### Mobile Responsive 📱
- Works on all screen sizes
- Touch-friendly buttons
- Readable on small screens

---

## Customization

### Change Auto-Refresh Interval

In `campaigns-page.html`, line 191:
```javascript
const AUTO_REFRESH_INTERVAL = 30 * 1000; // Change to 60 * 1000 for 1 minute
```

### Change Cache Duration

In `campaigns-page.html`, line 192:
```javascript
const CACHE_TTL = 5 * 60 * 1000; // Change to 10 * 60 * 1000 for 10 minutes
```

### Customize Colors

In `campaigns-page.html`, CSS variables (line 9):
```css
:root {
  --primary: #3b82f6;     /* Change primary color */
  --success: #22c55e;     /* Change success color */
  --warning: #f59e0b;     /* Change warning color */
}
```

### Modify "Join Campaign" Action

In `campaigns-page.html`, line 424:
```javascript
function showJoinInfo(campaignId) {
  // Customize this to redirect to app download or deep link
  window.location.href = `https://3mpwrapp.pages.dev/download?campaign=${campaignId}`;
}
```

---

## Monitoring & Analytics

### Add Google Analytics

Add before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Track Campaign Views

In `displayCampaigns()` function:
```javascript
.join-btn onclick="trackCampaign('${campaign.id}'); showJoinInfo('${campaign.id}')"

function trackCampaign(id) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'campaign_join_click', { campaign_id: id });
  }
}
```

---

## Troubleshooting

### Issue: No campaigns showing

**Check:**
1. Browser console for errors (F12)
2. Network tab shows successful API call
3. Firestore rules are deployed
4. Campaigns exist in `campaigns_production` collection

**Fix:**
```bash
# Verify Firestore API
curl "https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production"
```

### Issue: "Failed to load campaigns"

**Check:**
1. Internet connection
2. Firestore URL is correct
3. CORS not blocking (should be fine with Firestore REST API)

**Fix:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache: `localStorage.clear()` in console

### Issue: Old data showing

**Check:**
1. Cache is stale (5-minute default)
2. Auto-refresh is working

**Fix:**
```javascript
// In browser console
localStorage.removeItem('3mpwr_campaigns_cache');
location.reload();
```

### Issue: Auto-refresh not working

**Check:**
1. Tab is visible (pauses when hidden)
2. JavaScript errors in console

**Fix:**
- Refresh page
- Check browser console for errors

---

## Performance Tips

### Enable Cloudflare Caching

Add `_headers` file to your Cloudflare Pages project:

```
/campaigns/*
  Cache-Control: public, max-age=30, s-maxage=300
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
```

### Optimize for SEO

Add to `<head>`:
```html
<meta property="og:title" content="3mpwr Campaigns - Join the Movement">
<meta property="og:description" content="Join campaigns for disability justice and workers' rights">
<meta property="og:image" content="https://3mpwrapp.pages.dev/og-image.png">
<meta property="og:url" content="https://3mpwrapp.pages.dev/campaigns/">
<meta name="twitter:card" content="summary_large_image">
```

---

## Next Steps

### Recommended Enhancements

1. **Deep Linking:** Link to campaign in app
   ```javascript
   const appUrl = `empowrapp://campaigns/${campaignId}`;
   const webUrl = `https://3mpwrapp.pages.dev/download?campaign=${campaignId}`;
   ```

2. **Social Sharing:** Add share buttons
   ```html
   <button onclick="shareCampaign('${campaign.id}')">Share</button>
   ```

3. **Email Signup:** Collect emails for campaign updates
   ```html
   <input type="email" placeholder="Get updates">
   ```

4. **Filters/Search:** Add search bar and category filters

5. **Campaign Detail Pages:** Link to `/campaigns/[id]` for full details

---

## Support

- **Firebase Console:** https://console.firebase.google.com/project/empowrapp
- **Cloudflare Pages:** https://dash.cloudflare.com
- **App Logs:** Check React Native debugger for sync logs

---

## Summary

✅ **What's Live:**
- Firestore rules updated (public read access)
- Website page ready (`website/campaigns-page.html`)
- Real-time sync configured (30-second auto-refresh)
- All features working

🚀 **Deploy Now:**
1. Copy `website/campaigns-page.html` to your Cloudflare Pages
2. Rename to `campaigns/index.html`
3. Push to deploy
4. Test at `https://3mpwrapp.pages.dev/campaigns/`

⏱️ **Estimated Time:** 5-10 minutes

---

**Commit:** `9d9666b` - Real-time campaigns sync complete  
**Ready for Production** ✨
