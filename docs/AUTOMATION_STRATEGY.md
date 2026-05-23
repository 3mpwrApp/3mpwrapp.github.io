# 3mpwrApp Automation Strategy & Free Tier Workarounds

**Date Created:** May 23, 2026  
**Last Updated:** May 23, 2026  
**Status:** ACTIVE Implementation Plan  
**Philosophy:** Automate relentlessly so humans can focus on impact, not maintenance  

---

## 🎯 Core Automation Principles

1. **Automate Security** - Vulnerabilities fixed without human intervention
2. **Automate Quality** - Tests run on every commit, catch bugs early
3. **Automate Deployment** - Code ships safely without manual steps
4. **Automate Monitoring** - Know about problems before users complain
5. **Automate Communication** - Community stays informed without constant updates

**Goal:** Reduce founder workload from 40 hours/week to 10 hours/week through automation.

---

## ✅ ALREADY AUTOMATED (Keep These Running)

### 1. Security Updates ✅
**Tool:** Dependabot (GitHub)  
**Status:** ✅ **RE-ENABLED** (May 23, 2026)  
**What it does:**
- Scans npm packages weekly (Monday 9 AM)
- Scans Ruby gems weekly (Monday 9 AM)
- Auto-creates PRs for security updates
- Limits: 10 PRs for npm, 5 PRs for bundler

**Cost:** FREE  
**Maintenance:** Review PRs once/week (~15 minutes)

---

### 2. Git Hooks (Pre-commit Quality) ✅
**Tool:** Husky  
**Status:** ✅ ACTIVE  
**What it does:**
- Runs organization check (scripts in proper folders)
- Runs accessibility checks (if relevant files changed)
- Prevents broken commits

**Cost:** FREE  
**Maintenance:** None (runs automatically on git commit)

---

### 3. Jekyll Auto-Build ✅
**Tool:** GitHub Pages / Cloudflare Pages  
**Status:** ✅ ACTIVE  
**What it does:**
- Builds website on every push to `main`
- Deploys automatically
- Invalidates cache

**Cost:** FREE (Cloudflare Pages: 500 builds/month)  
**Maintenance:** None

---

### 4. Mobile App Builds ✅
**Tool:** Expo EAS  
**Status:** ✅ ACTIVE (30 builds/month free tier)  
**What it does:**
- Builds iOS/Android on demand
- Handles code signing
- Distributes to TestFlight/Play Store

**Cost:** FREE (30 builds/month)  
**Maintenance:** Manual trigger, but automated build process

---

## 🚀 NEW AUTOMATIONS TO IMPLEMENT

### 5. Dead Man's Switch (Founder Incapacity Detection) 🔴 CRITICAL

**Problem:** If founder disappears, no one knows to activate succession plan  
**Solution:** Automated inactivity detection

**Implementation Option A: Email-Based (RECOMMENDED)**

```bash
# GitHub Action: Check for inactivity
# File: .github/workflows/dead-mans-switch.yml

name: Dead Man's Switch
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9 AM

jobs:
  check-activity:
    runs-on: ubuntu-latest
    steps:
      - name: Check last commit by founder
        run: |
          LAST_COMMIT_DATE=$(git log --author="empowrapp08162025@gmail.com" -1 --format=%ct)
          CURRENT_DATE=$(date +%s)
          DAYS_INACTIVE=$(( ($CURRENT_DATE - $LAST_COMMIT_DATE) / 86400 ))
          
          if [ $DAYS_INACTIVE -gt 60 ]; then
            echo "WARNING: $DAYS_INACTIVE days inactive"
            # Send email alert to Emergency Council
          fi
          
          if [ $DAYS_INACTIVE -gt 90 ]; then
            echo "CRITICAL: Activating succession plan"
            # Trigger emergency protocol
          fi
```

**Implementation Option B: Heartbeat Service (BETTER)**

**Tool:** Dead Man's Snitch (https://deadmanssnitch.com/)  
**Cost:** FREE (1 snitch on free tier, $10/month for 5 snitches)  
**How it works:**
1. You manually "check in" every 30 days (visit a URL or send email)
2. If you don't check in, Emergency Council is notified
3. After 90 days, public succession trigger activates

**Setup (5 minutes):**
```bash
1. Create account at deadmanssnitch.com
2. Create snitch with 30-day interval
3. Add Emergency Council emails as alert recipients
4. Set up recurring calendar reminder to check in
```

**Free Tier Workaround:**
- Use Cron Job monitoring service (cron-job.org)
- Set up daily/weekly job that pings a URL
- If job doesn't run for 90 days, assume inactivity

**Status:** 🔴 **NOT IMPLEMENTED** (Priority 1)  
**Time to implement:** 30 minutes  
**Action:** Choose Option B (Dead Man's Snitch), set up this week

---

### 6. Automated Broken Link Checking 🟡 MEDIUM PRIORITY

**Problem:** 1,300+ broken links, manual checking is tedious  
**Solution:** Weekly automated scan + auto-fix where possible

**Tool:** Lychee (already have config: `lychee.toml`)  
**Cost:** FREE (runs in GitHub Actions)  
**Frequency:** Weekly (Saturday 3 AM)

**Implementation:**

```yaml
# File: .github/workflows/check-links-weekly.yml
name: Weekly Broken Link Check
on:
  schedule:
    - cron: '0 3 * * 6'  # Every Saturday 3 AM
  workflow_dispatch:  # Manual trigger

jobs:
  check-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lychee Link Checker
        uses: lycheeverse/lychee-action@v2
        with:
          args: --config lychee.toml '**/*.md' '**/*.html'
          output: broken-links-report.md
      
      - name: Create GitHub Issue if links broken
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔗 Broken Links Detected',
              body: 'See broken-links-report.md for details',
              labels: ['maintenance', 'automated']
            })
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: broken-links-report
          path: broken-links-report.md
```

**Free Tier Workaround:**
- GitHub Actions: 2,000 minutes/month (resets June 1)
- This job uses ~5 minutes/week = 20 minutes/month
- Well within free tier

**Status:** ⚠️ **PARTIALLY IMPLEMENTED** (manual script exists, needs automation)  
**Time to implement:** 15 minutes (copy/paste workflow above)  
**Action:** Add this workflow file, test manually, schedule weekly

---

### 7. Automated Uptime Monitoring 🟡 MEDIUM PRIORITY

**Problem:** Don't know if website is down until users complain  
**Solution:** Monitor from outside, alert immediately

**Tool Option A: UptimeRobot (RECOMMENDED)**
**Cost:** FREE (50 monitors, 5-minute checks)  
**Setup:**
1. Create account at uptimerobot.com
2. Add monitors:
   - https://3mpwrapp.ca (main site)
   - https://3mpwrapp.ca/api/health (API endpoint if exists)
   - https://app.3mpwrapp.ca (PWA if separate)
3. Set alert email to empowrapp08162025@gmail.com
4. Optional: Add Discord webhook for instant alerts

**Alternative (if you want more control):**
```yaml
# GitHub Action: Uptime Check
name: Uptime Monitor
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes

jobs:
  check-uptime:
    runs-on: ubuntu-latest
    steps:
      - name: Check website
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://3mpwrapp.ca)
          if [ $STATUS -ne 200 ]; then
            echo "ERROR: Site returned $STATUS"
            # Send alert
            exit 1
          fi
```

**⚠️ WARNING:** This uses 96 Actions minutes/day = 2,880 minutes/month (exceeds free tier!)  
**Solution:** Use UptimeRobot instead (free, external)

**Status:** 🔴 **NOT IMPLEMENTED**  
**Time to implement:** 10 minutes  
**Action:** Sign up for UptimeRobot today, add monitors

---

### 8. Automated Analytics Reporting 🟡 MEDIUM PRIORITY

**Problem:** No visibility into what users actually do  
**Solution:** Privacy-respecting analytics + weekly summary email

**Tool:** Plausible Analytics (RECOMMENDED) or Fathom  
**Cost:**
- Plausible: $9/month (10K pageviews/month), FREE for open source if you self-host
- Fathom: $14/month (100K pageviews/month)
- Google Analytics: FREE but privacy concerns

**Self-Hosted Plausible (FREE but requires maintenance):**
```bash
# Docker Compose setup (15 minutes)
git clone https://github.com/plausible/hosting
cd hosting
docker-compose up -d
# Point analytics.3mpwrapp.ca to your server
```

**Simpler Alternative: Cloudflare Web Analytics (FREE)**
- Built into Cloudflare Pages (already using)
- Zero setup, privacy-respecting
- Basic stats (pageviews, referrers, countries)
- Go to Cloudflare dashboard → Web Analytics → Enable

**Weekly Report Automation:**
```yaml
# GitHub Action: Weekly Analytics Summary
name: Weekly Analytics Report
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9 AM

jobs:
  analytics-report:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch Cloudflare analytics
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        run: |
          # Fetch last 7 days stats via Cloudflare API
          # Generate markdown report
          # Email to founder
```

**Status:** 🔴 **NOT IMPLEMENTED**  
**Time to implement:** 20 minutes (enable Cloudflare Analytics) + 1 hour (automate report)  
**Action:** Enable Cloudflare Web Analytics immediately (it's free and one-click)

---

### 9. Automated Content Freshness Checks 🟢 LOW PRIORITY

**Problem:** Old content becomes stale (e.g., "Last updated: 2025" in 2026)  
**Solution:** Auto-detect outdated pages

```yaml
# GitHub Action: Content Freshness Audit
name: Check Content Age
on:
  schedule:
    - cron: '0 9 1 * *'  # First day of month, 9 AM

jobs:
  check-freshness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Find stale content
        run: |
          # Find markdown files not updated in 6+ months
          find . -name "*.md" -type f -mtime +180 > stale-content.txt
          
          # Create GitHub issue with list
          if [ -s stale-content.txt ]; then
            # Issue creation logic
          fi
```

**Status:** 🟢 **NICE TO HAVE** (defer until other automations working)  
**Time to implement:** 30 minutes  
**Action:** Add to backlog, implement after Q3 2026

---

### 10. Automated Dependency Updates (Beyond Security) 🟢 LOW PRIORITY

**Problem:** Dependencies become outdated (not just insecure, but old)  
**Solution:** Monthly update PRs for latest stable versions

**Tool:** Renovate Bot (alternative to Dependabot)  
**Cost:** FREE  
**Advantage:** More configurable than Dependabot

**Setup:**
```json
// File: renovate.json
{
  "extends": ["config:base"],
  "schedule": ["before 9am on the first day of the month"],
  "labels": ["dependencies", "automated"],
  "automerge": false,
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true
    }
  ]
}
```

**Status:** 🟢 **NICE TO HAVE** (Dependabot is good enough for now)  
**Time to implement:** 20 minutes  
**Action:** Defer until team grows (one person can't review all update PRs)

---

## 🆓 FREE TIER WORKAROUNDS & OPTIMIZATION

### **Problem 1: GitHub Actions (2,000 min/month limit, already exhausted)**

**Current Usage:**
- You have ~45 workflow files
- Many are disabled (`.yml.disabled`)
- Some run on every commit (expensive)

**Solutions:**

#### A. Prioritize Critical Workflows Only
**Keep running (essential):**
- Security scans (Dependabot) ✅
- Website deployment (Cloudflare Pages) ✅
- Pre-commit hooks (Husky, doesn't use Actions) ✅

**Disable (non-essential until June 1 reset):**
- Social media posting workflows
- Daily scrapers
- Campaign promos
- Lighthouse tests
- Content curation

#### B. Optimize Workflow Triggers
Instead of:
```yaml
on: [push, pull_request]  # Runs on EVERY commit = expensive
```

Do:
```yaml
on:
  push:
    branches: [main]  # Only on main branch
    paths:
      - 'src/**'  # Only if source files changed
      - '!docs/**'  # Ignore doc changes
```

#### C. Use Workflow Concurrency
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancel old runs if new commit pushed
```

#### D. Move Long-Running Jobs Off GitHub Actions

**Alternative: Self-Hosted Runner (FREE)**
- Run GitHub Actions on your own computer
- Unlimited minutes
- Setup: https://github.com/actions/runner
- Caveat: Your computer must be on

**Alternative: Cron Jobs on Free Hosting**
- Cloudflare Workers (100K requests/day free)
- Vercel Cron Jobs (free tier)
- PythonAnywhere (free tier with daily tasks)

**Example - Move daily scraper to Cloudflare Worker:**
```javascript
// File: cloudflare-worker-cron.js
export default {
  async scheduled(event, env, ctx) {
    // Run your scraper logic here
    // Triggered by Cloudflare Cron (free)
  }
}
```

**Status:** ⚠️ **NEEDS IMMEDIATE ACTION**  
**Action Steps:**
1. Review all workflows, disable non-critical ones
2. Wait for June 1 reset (2,000 minutes refill)
3. Re-enable workflows with optimized triggers
4. Consider self-hosted runner for heavy jobs

---

### **Problem 2: Firebase (Free Tier Limits)**

**Free Tier Allowances:**
- Firestore reads: 50,000/day
- Firestore writes: 20,000/day
- Cloud Functions: 125K invocations/month
- Hosting: 10 GB storage, 360 MB/day transfer
- Authentication: Unlimited

**Optimization Strategies:**

#### A. Implement Aggressive Caching
```typescript
// Before: Reads Firestore on every page load
const data = await getDoc(doc(db, 'collection', 'docId'));

// After: Cache for 1 hour
const cachedData = sessionStorage.getItem('data');
if (cachedData && Date.now() - cachedData.timestamp < 3600000) {
  return JSON.parse(cachedData.value);
}
const data = await getDoc(doc(db, 'collection', 'docId'));
sessionStorage.setItem('data', JSON.stringify({
  value: data,
  timestamp: Date.now()
}));
```

#### B. Use Firestore Offline Persistence
```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .then(() => console.log('Offline persistence enabled'))
  .catch((err) => console.error('Persistence failed', err));

// Now Firestore automatically uses cache, reducing reads
```

#### C. Bundle Writes (Batch Operations)
```typescript
// Before: 10 separate writes = 10 quota units
for (let i = 0; i < 10; i++) {
  await setDoc(doc(db, 'items', i.toString()), { data: i });
}

// After: 1 batch write = 10 quota units (same), but faster and atomic
const batch = writeBatch(db);
for (let i = 0; i < 10; i++) {
  batch.set(doc(db, 'items', i.toString()), { data: i });
}
await batch.commit();
```

#### D. Monitor Usage (Set Up Alerts)
```bash
# Firebase Console → Usage & Billing → Set up alerts
# Alert at 50%, 75%, 90% of free tier
# Email: empowrapp08162025@gmail.com
```

**Status:** ⚠️ **NEEDS MONITORING**  
**Action:** Set up Firebase usage alerts TODAY (10 minutes)

---

### **Problem 3: Cloudflare Pages (500 builds/month limit)**

**Current Usage:** Unknown, but if deploying multiple times/day, could hit limit

**Optimization:**

#### A. Reduce Build Frequency
```yaml
# Only build on main branch (not every PR)
on:
  push:
    branches: [main]
```

#### B. Use Preview Branches Wisely
Cloudflare Pages: 500 builds total (main + preview branches)  
Solution: Disable preview builds for non-critical branches

#### C. Alternative: Cloudflare Workers Sites (Unlimited)
If you exceed 500 builds, switch to Workers Sites:
```bash
npm install -g @cloudflare/wrangler
wrangler init
wrangler publish  # Deploy via CLI, doesn't count against Pages quota
```

**Status:** 🟢 **MONITOR ONLY** (likely not hitting limit yet)  
**Action:** Check Cloudflare dashboard monthly

---

### **Problem 4: Expo EAS (30 builds/month limit)**

**Current Usage:** Development builds are expensive (each iOS + Android = 2 builds)

**Optimization:**

#### A. Use Development Builds Sparingly
```bash
# Only build when absolutely necessary
# Use Expo Go for dev (doesn't count against quota)
npx expo start

# Production builds only (fewer per month)
eas build --platform all --profile production
```

#### B. Local Builds (FREE but complex setup)
```bash
# Build locally on your Mac (for iOS)
eas build --platform ios --local

# Build locally on Windows/Linux (for Android)
eas build --platform android --local
```

**Caveat:** Requires Xcode (iOS) or Android Studio (Android) installed locally

#### C. Upgrade to Paid Tier (If Needed)
Expo EAS: $29/month for unlimited builds (once app is revenue-generating)

**Status:** 🟢 **FINE FOR NOW** (30 builds/month is enough for beta)  
**Action:** Monitor usage, upgrade after app store launch if needed

---

## 📅 Implementation Timeline

### **Week 1 (May 24-31): Critical Security & Monitoring**

**Day 1-2 (Sat-Sun):**
- [ ] ✅ Set up Dead Man's Snitch (30 min) - PRIORITY 1
- [ ] ✅ Enable Cloudflare Web Analytics (5 min)
- [ ] ✅ Set up UptimeRobot monitoring (10 min)
- [ ] ✅ Configure Firebase usage alerts (10 min)

**Day 3-4 (Mon-Tue):**
- [ ] Review GitHub Actions workflows, disable non-critical ones
- [ ] Optimize workflow triggers (add path filters, concurrency)
- [ ] Document which workflows are essential vs. nice-to-have

**Day 5-7 (Wed-Fri):**
- [ ] Test automated broken link checker (manual run)
- [ ] Schedule weekly broken link workflow
- [ ] Verify Dependabot PRs are coming through

### **Week 2 (June 1-7): Automation Expansion**

**Day 1 (June 1 - Actions reset):**
- [ ] Re-enable critical workflows now that quota refilled
- [ ] Monitor Actions usage throughout month

**Day 2-4:**
- [ ] Set up weekly analytics email report
- [ ] Create automation dashboard (simple markdown file listing all automations)

**Day 5-7:**
- [ ] Test succession plan drill (Emergency Council mock activation)
- [ ] Document all automated systems for volunteers

### **Week 3-4 (June 8-21): Maintenance Mode**

- [ ] Review automation effectiveness (are things breaking less?)
- [ ] Adjust schedules based on actual usage
- [ ] Train 1-2 volunteers on automation system

---

## 📊 Success Metrics

**How we'll know automation is working:**

### Before (May 2026):
- **Founder time:** 40 hours/week
- **Security updates:** Manual (7 weeks of debt accumulated)
- **Broken links:** Manual checking (1,300+ unfixed)
- **Downtime detection:** User complaints
- **Deployment:** Manual verification

### After (July 2026):
- **Founder time:** 15 hours/week (62.5% reduction) 🎯
- **Security updates:** Automated weekly PRs
- **Broken links:** Auto-detected weekly, < 50 at any time
- **Downtime detection:** Automated alerts within 5 minutes
- **Deployment:** Fully automated, zero manual steps

---

## 🛡️ Automation Safety Checklist

**Before automating anything, ensure:**

✅ There's a manual override (can turn it off if it goes wrong)  
✅ Failures are logged (know what broke and when)  
✅ Alerts go to the right people (not into the void)  
✅ Documentation exists (someone else can fix it)  
✅ It's testable (can verify it works without breaking production)  

---

## 🔧 Automation Maintenance Schedule

### Daily (Automated):
- Uptime checks (UptimeRobot)
- Security scans (Dependabot checks daily)
- Website deployment (on git push)

### Weekly (Automated):
- Broken link checks (Saturday 3 AM)
- Analytics summary email (Monday 9 AM)
- Dead Man's Switch check (Monday 9 AM)

### Monthly (Automated):
- Content freshness audit (1st of month)
- Firebase usage review (automatic alerts)
- Cloudflare build quota check (manual dashboard review)

### Quarterly (Manual):
- Succession plan drill (test Emergency Council)
- Automation effectiveness review (are we saving time?)
- Update this document (new automations, retired ones)

---

## ✅ Quick Reference: All Automations

| Automation | Tool | Cost | Status | Priority |
|------------|------|------|--------|----------|
| Security updates | Dependabot | FREE | ✅ Active | CRITICAL |
| Pre-commit checks | Husky | FREE | ✅ Active | HIGH |
| Website deployment | Cloudflare Pages | FREE | ✅ Active | CRITICAL |
| Mobile app builds | Expo EAS | FREE (30/mo) | ✅ Active | HIGH |
| Dead Man's Switch | Dead Man's Snitch | $10/mo | 🔴 TODO | CRITICAL |
| Uptime monitoring | UptimeRobot | FREE | 🔴 TODO | HIGH |
| Broken links | Lychee + Actions | FREE | ⚠️ Partial | MEDIUM |
| Analytics | Cloudflare | FREE | 🔴 TODO | MEDIUM |
| Content freshness | Custom script | FREE | 🟢 Later | LOW |
| Dependency updates | Renovate | FREE | 🟢 Later | LOW |

---

## 💬 Questions?

**"What if automation breaks?"**  
→ All automations have manual overrides. Worst case: you do things manually like you do now.

**"What if I can't monitor all these alerts?"**  
→ Start with top 3 (Dead Man's Switch, Uptime, Security). Add more as you get volunteers.

**"What if free tiers aren't enough?"**  
→ Documented upgrade paths + fundraising goals in `/support` page.

**"Who maintains the automations?"**  
→ Initially you. Goal: Train 1-2 volunteers by July 2026 to share load.

---

**This document is your automation roadmap. Implement Week 1 items first, then build from there.**

📧 Questions? empowrapp08162025@gmail.com
