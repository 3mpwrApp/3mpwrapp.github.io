# 🚀 PRODUCTION MONITORING & ERROR TRACKING SETUP

## Phase 1: Error Tracking (Sentry)

### Setup Instructions

1. **Create Sentry Account** (if not already done)
   - Go to: https://sentry.io/auth/login/
   - Create organization: `3mpwrApp`
   - Create project: `3mpwrapp-website`
   - Select platform: `JavaScript (Browser)`

2. **Get Your DSN (Data Source Name)**
   - After project creation, you'll see a DSN like:
   ```
   https://<key>@<host>/1234567
   ```
   - Copy this for the next steps

3. **Add Sentry to Website**

   **File:** `_includes/monitoring.html`
   
   ```html
   <!-- Sentry Error Tracking -->
   <script>
     // Initialize Sentry
     if (window.location.hostname !== 'localhost') {
       Sentry.init({
         dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your DSN
         environment: '{{ jekyll.environment }}',
         tracesSampleRate: 0.1,
         debug: false,
         attachStacktrace: true,
         
         // Capture user interactions
         integrations: [
           new Sentry.Replay({
             maskAllText: true,
             blockAllMedia: true,
           }),
         ],
         
         // Session replay for debugging
         replaysSessionSampleRate: 0.1,
         replaysOnErrorSampleRate: 1.0,
         
         // Before sending to Sentry
         beforeSend(event, hint) {
           // Filter out 3rd party errors
           if (event.exception) {
             const error = hint.originalException;
             
             // Ignore ads/tracking errors
             if (error.message && (
               error.message.includes('ads') ||
               error.message.includes('tracking') ||
               error.message.includes('analytics')
             )) {
               return null;
             }
           }
           
           return event;
         },
         
         // Don't capture certain errors
         denyUrls: [
           // Browser extensions
           /extensions\//i,
           /^chrome:\/\//i,
         ],
       });
     }
   </script>
   <script src="https://browser.sentry-cdn.com/{{ sentry.version | default: '7.100.0' }}/bundle.min.js"></script>
   ```

4. **Include in _layouts/default.html**

   Add to the `<head>` section:
   ```html
   {% include monitoring.html %}
   ```

---

## Phase 2: Analytics & User Tracking

### Option A: Cloudflare Analytics Engine (FREE, Recommended)

Already enabled on your Cloudflare Pages deployment. Automatically tracks:
- Page views
- Response times
- Status codes
- Bot traffic
- Geographic data

**Access Dashboard:**
- https://dash.cloudflare.com/
- Select your zone (3mpwrapp.pages.dev)
- Analytics → Web Analytics

### Option B: Fathom Analytics (Privacy-First)

Lightweight, privacy-focused alternative to Google Analytics.

1. **Create Account**
   - Go to: https://usefathom.com/
   - Sign up (free tier available)

2. **Create Site**
   - Site URL: https://3mpwrapp.pages.dev
   - Get tracking code

3. **Add Tracking Script**
   - Add to `_includes/monitoring.html`:
   ```html
   <!-- Fathom Analytics (Privacy-First) -->
   <script>
     (function(f,a,t,h,o,m){
       a[h]=a[h]||function(){
         (a[h].q=a[h].q||[]).push(arguments)
       };
       o=f.createElement('script');
       m=f.getElementsByTagName('script')[0];
       o.async=1; o.src=t; o.id='fathom-script';
       m.parentNode.insertBefore(o,m)
     })(document, window, '//cdn.usefathom.com/tracker.js', 'fathom');
     
     fathom('set', 'siteId', 'YOUR_SITE_ID'); // Replace with your Site ID
     fathom('trackPageview');
   </script>
   ```

### Option C: Google Analytics 4 (Most Data)

For comprehensive user behavior analysis.

1. **Create GA4 Property**
   - Go to: https://analytics.google.com/
   - Create new property: `3mpwrApp-Website`
   - Add data stream: Web
   - URL: https://3mpwrapp.pages.dev

2. **Get Measurement ID**
   - Format: `G-XXXXXXXXXX`

3. **Add Tracking Script**
   - Add to `_includes/monitoring.html`:
   ```html
   <!-- Google Analytics 4 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX', {
       'page_path': window.location.pathname,
       'anonymize_ip': true,
     });
   </script>
   ```

---

## Phase 3: Uptime & Performance Monitoring

### Uptime Monitoring (Pingdom / Uptime Robot - FREE)

#### Option A: Uptime Robot (Recommended - FREE)

1. **Create Account**
   - Go to: https://uptimerobot.com/
   - Sign up (free tier: 50 monitors)

2. **Create HTTP Monitor**
   - **Name:** 3mpwrApp Homepage
   - **URL:** https://3mpwrapp.pages.dev
   - **Interval:** 5 minutes
   - **Timeout:** 30 seconds
   - **Alert contacts:** Your email

3. **Add More Monitors for Key Pages**
   - Homepage: https://3mpwrapp.pages.dev
   - About: https://3mpwrapp.pages.dev/about
   - Features: https://3mpwrapp.pages.dev/features
   - Blog: https://3mpwrapp.pages.dev/blog
   - Contact: https://3mpwrapp.pages.dev/contact

4. **Setup Alerts**
   - Email notification on down
   - SMS for critical pages (paid)
   - Webhook to Slack (optional)

#### Option B: Healthchecks.io

1. **Create Account**
   - Go to: https://healthchecks.io/
   - Sign up (free tier: 20 checks)

2. **Create Website Check**
   - **URL:** https://3mpwrapp.pages.dev
   - **Period:** 5 minutes
   - **Grace Period:** 1 minute

3. **Get Status Page**
   - Public status page URL: You'll get one
   - Display on contact page or footer

---

## Phase 4: Real-Time Alerts & Notifications

### Setup Slack Integration

1. **Create Slack Workspace** (if needed)
   - Go to: https://slack.com/create

2. **Add Sentry to Slack**
   - In Sentry: Settings → Integrations → Slack
   - Click "Connect Workspace"
   - Select channel: `#alerts` or `#monitoring`

3. **Add Uptime Robot to Slack**
   - In Uptime Robot: Settings → Integrations → Slack
   - Connect and test

4. **Create Alert Channels**
   - `#alerts` - Errors and critical issues
   - `#monitoring` - Performance metrics
   - `#deployments` - Release notifications

### Setup Email Alerts

1. **Sentry Email Notifications**
   - Sentry automatically emails on errors

2. **Uptime Robot Email**
   - Configured during setup

---

## Phase 5: 24-Hour Launch Day Monitoring

### Launch Day Checklist (Oct 24, 4:00 PM UTC)

#### 1 Hour Before Launch (3:00 PM UTC)
- [ ] Verify all monitoring systems operational
- [ ] Check Sentry is receiving test events
- [ ] Confirm Uptime Robot is monitoring
- [ ] Set Slack status: "Monitoring Launch"
- [ ] Have team members in Slack channel

#### At Launch Time (4:00 PM UTC)
- [ ] Deploy to production
- [ ] Check homepage loads in 3 browsers
- [ ] Verify Mastodon post successful
- [ ] Verify Bluesky post successful
- [ ] Verify X/Twitter post successful
- [ ] Check Sentry for any errors
- [ ] Monitor Cloudflare Analytics
- [ ] Check Google Analytics pageviews flowing

#### First 15 Minutes
- [ ] Refresh page 5x from different locations (use VPN)
- [ ] Test all main navigation links
- [ ] Submit contact form
- [ ] Subscribe to newsletter
- [ ] Check forms work in Chrome, Firefox, Safari
- [ ] Verify no 404 errors

#### First Hour (Every 5 minutes)
- [ ] Check Cloudflare Analytics:
  - Requests per minute trending
  - Error rate (should be 0-1%)
  - Response times (should be <500ms p95)
- [ ] Check Sentry dashboard:
  - Any errors reported?
  - Error count trending
  - Most affected pages
- [ ] Monitor social media engagement:
  - Mastodon interactions
  - Bluesky likes/reposts
  - X/Twitter engagement

#### First 6 Hours
- [ ] Review complete Sentry error list
- [ ] Check Google Analytics
  - New sessions count
  - Top landing pages
  - Bounce rate
  - Conversion tracking
- [ ] Review uptime status:
  - No downtime reported?
  - Response times healthy?
- [ ] Check web performance:
  - Page load times
  - Core Web Vitals

#### Full 24 Hours
- [ ] Monitor continuously
- [ ] Document any issues
- [ ] Respond to errors immediately
- [ ] Post status updates to social media
- [ ] Generate post-launch report

---

## Key Metrics to Monitor

### Performance Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Page Load Time (p95) | <2.0s | >3.0s |
| Time to First Paint | <1.5s | >2.0s |
| Cumulative Layout Shift | <0.1 | >0.25 |
| First Input Delay | <100ms | >200ms |

### Error Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Error Rate | <0.5% | >1.0% |
| 4xx Errors | <1% | >2% |
| 5xx Errors | 0% | >0% |
| JavaScript Errors | <10/hour | >25/hour |

### Availability

| Metric | Target | Alert |
|--------|--------|-------|
| Uptime | 99.9% | <99.5% |
| Response Time | <500ms avg | >1000ms |
| First Byte | <200ms | >500ms |

### Engagement

| Metric | Target |
|--------|--------|
| Session Duration | >2 min |
| Pages per Session | >2 |
| Bounce Rate | <40% |
| New vs Returning | 70% / 30% |

---

## Monitoring Dashboard (Custom)

**Create a personal monitoring dashboard:**

1. **Bookmark these:**
   - Sentry: https://sentry.io/organizations/3mpwrapp/
   - Cloudflare: https://dash.cloudflare.com/
   - Google Analytics: https://analytics.google.com/
   - Uptime Robot: https://uptimerobot.com/
   - GitHub Actions: https://github.com/3mpowrApp/3mpwrapp.github.io/actions

2. **Browser Tab Organization:**
   - Tab 1: Sentry Errors
   - Tab 2: Cloudflare Analytics
   - Tab 3: Uptime Robot Status
   - Tab 4: Google Analytics Real-Time
   - Tab 5: GitHub Actions
   - Tab 6: Social Media Posts

---

## Incident Response Procedures

### If Website is Down

1. **Immediate (0-5 min)**
   - Check Cloudflare dashboard
   - Check GitHub Actions for failed deployments
   - Check Uptime Robot alert details
   - Announce in Slack `#alerts`

2. **Quick Fix (5-15 min)**
   - Check recent commits
   - Revert if needed: `git revert HEAD`
   - Redeploy manually
   - Verify recovery

3. **Investigation (15-60 min)**
   - Review error logs
   - Check GitHub Actions workflow
   - Document root cause
   - Notify team

### If High Error Rate

1. **Identify**
   - Go to Sentry
   - Check most common errors
   - Identify affected pages/features

2. **Triage**
   - Is it affecting core functionality?
   - How many users impacted?
   - Critical or non-critical?

3. **Respond**
   - For critical: Start hotfix
   - For non-critical: Log for next release
   - Notify team in Slack

### If Performance Degradation

1. **Identify**
   - Check Cloudflare Analytics
   - Review response times
   - Check specific pages affected

2. **Investigate**
   - Check for network issues
   - Review recent changes
   - Check origin server health

3. **Remediate**
   - Clear Cloudflare cache (if needed)
   - Optimize heavy pages
   - Reduce request size

---

## Post-Launch Monitoring Schedule

### Daily Checks
- 9:00 AM UTC: Verify daily curation posts successful
- 12:00 PM UTC: Review error logs in Sentry
- 6:00 PM UTC: Check Google Analytics metrics
- 11:00 PM UTC: Review uptime status

### Weekly Checks
- Monday: Review performance trends
- Wednesday: Social media engagement analysis
- Friday: Complete metrics review + team briefing

### Monthly Checks
- Full performance audit
- Trend analysis
- Capacity planning
- Quarterly goal review

---

## Estimated Costs

| Service | Free Tier | Recommended |
|---------|-----------|------------|
| Sentry | 5,000 events/month | $29/month (100K events) |
| Fathom | 100K pageviews/month | $14/month |
| Google Analytics | Unlimited | Free |
| Uptime Robot | 50 monitors | Free or $10/month |
| Slack | Unlimited (limited history) | Free or $8/user/month |
| Cloudflare Pages | Unlimited requests | Free |

**Total Monthly:** $0-50 (depending on choices)

---

## Implementation Timeline

### Phase 1 (Today)
- [ ] Create Sentry project & get DSN
- [ ] Create Uptime Robot account
- [ ] Setup Slack workspace & channels

### Phase 2 (Oct 19)
- [ ] Add Sentry to website
- [ ] Add analytics of choice
- [ ] Test monitoring systems
- [ ] Create dashboard bookmarks

### Phase 3 (Oct 20)
- [ ] Integrate Slack notifications
- [ ] Final verification
- [ ] Team training
- [ ] Documentation review

### Phase 4 (Oct 23)
- [ ] Final pre-launch checks
- [ ] Team briefing
- [ ] On-call schedule setup

### Phase 5 (Oct 24)
- [ ] Active 24-hour monitoring
- [ ] Real-time incident response
- [ ] Documentation
- [ ] Post-launch report

---

## Quick Start: Essential Monitoring (Today)

If time is limited, focus on these 3 items:

1. **Sentry Setup** (15 min)
   - Create project
   - Get DSN
   - Add script to head

2. **Uptime Robot** (10 min)
   - Create account
   - Add 3 monitors
   - Setup email alerts

3. **Slack Integration** (10 min)
   - Connect Sentry → Slack
   - Connect Uptime Robot → Slack
   - Create `#alerts` channel

**Total time: 35 minutes**

This gives you error tracking, uptime monitoring, and real-time alerts.

---

*Document Created: October 18, 2025*  
*Last Updated: October 18, 2025*  
*Next Review: October 24, 2025 (Launch Day)*
