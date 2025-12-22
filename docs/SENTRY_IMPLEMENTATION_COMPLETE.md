# Sentry Performance Monitoring - Implementation Complete! 🎉

## Summary

Your EmpowrApp now has **enterprise-grade performance monitoring** with Sentry, enabling you to pinpoint problems, track user flows, and optimize based on real data.

## ✅ What's Been Implemented

### 1. Core Performance Infrastructure

**File**: [services/sentryLabeling.ts](../services/sentryLabeling.ts)

**Features Enabled**:
- ✅ Performance tracing (20% sample rate in production)
- ✅ Performance profiling (20% profile rate)
- ✅ React Navigation integration (automatic screen tracking)
- ✅ HTTP client integration (automatic API call tracking)
- ✅ Native crash handling
- ✅ Automatic session tracking
- ✅ Breadcrumbs (up to 100 per event)
- ✅ Custom transactions, spans, and measurements

**New APIs Created**:
- `startTransaction()` - Track custom operations
- `startSpan()` - Measure sub-operations
- `measurePerformance()` - Auto-wrap async operations
- `setMeasurement()` - Record custom metrics
- `captureException()` - Enhanced error capture
- `addBreadcrumb()` - Debug context

### 2. Authentication Flow Tracking

**File**: [context/AuthContext.tsx](../context/AuthContext.tsx)

**Instrumented Operations**:
- ✅ `user_signout` - User sign out performance
- ✅ `refresh_claims` - Token/claims refresh performance
- ✅ `guest_signin` - Anonymous authentication performance

**Metrics Tracked**:
- Sign out duration
- Claims refresh duration
- Guest sign-in duration
- Authentication errors with context
- Success/failure rates

### 3. Evidence Queue Processing

**File**: [services/evidenceQueue.ts](../services/evidenceQueue.ts)

**Instrumented Operations**:
- ✅ `process_evidence_queue` - Complete queue processing
- ✅ `upload_evidence_files` - File upload performance (span)
- ✅ `add_evidence_note` - Note creation performance (span)

**Metrics Tracked**:
- Queue item count
- Files per item
- Upload duration
- Note creation duration
- Total processing time
- Error rates

### 4. Campaigns Service

**File**: [services/campaigns.ts](../services/campaigns.ts)

**Instrumented Operations**:
- ✅ `fetch_campaigns` - Campaign list fetching
- ✅ `campaigns_api_request` - API request performance (span)
- ✅ `fetch_campaign_by_id` - Single campaign fetch

**Metrics Tracked**:
- Campaign count
- API vs fallback usage
- Fetch duration
- API failures
- Cache hit/miss rates

### 5. Podcasts Service

**File**: [services/podcasts.ts](../services/podcasts.ts)

**Instrumented Operations**:
- ✅ `fetch_podcasts` - Podcast fetching with fallback chain

**Metrics Tracked**:
- Podcast count
- Source (API=1, YouTube=2, Cache=3, Local=4)
- Fetch duration
- Fallback usage
- API/YouTube failures

### 6. Resources Service

**File**: [services/resources.ts](../services/resources.ts)

**Instrumented Operations**:
- ✅ `fetch_resources` - Resource fetching with fallback chain

**Metrics Tracked**:
- Resource count
- Source (API=1, Cache=2, Local=3)
- Fetch duration
- Cache hit rate
- API failures

## 📊 What You Can Now Monitor

### Automatic Tracking (No Code Needed)

Sentry automatically tracks:
- 🔄 **Screen Navigation** - Every route change
- 🌐 **API Requests** - All Firebase/Google API calls
- ⚡ **App Startup** - Time from launch to first screen
- 📱 **Screen Renders** - Time to initial display
- 💥 **Crashes** - Native and JS errors with full context

### Manual Tracking (Implemented)

Your code now tracks:
- 🔐 **Authentication** - Sign in, sign out, token refresh
- 📁 **Evidence** - Queue processing, file uploads
- 📢 **Campaigns** - Data fetching, API performance
- 🎙️ **Podcasts** - Multi-source fetching (API→YouTube→Cache→Local)
- 📚 **Resources** - API fetching with cache fallback

### Custom Metrics Available

You can measure:
- Item counts (queue size, campaign count, etc.)
- File sizes (upload sizes in bytes)
- Render times (component performance)
- Cache effectiveness (hit/miss rates)
- Source tracking (API vs cache vs local)

## 📈 Viewing Performance Data

### In Sentry Dashboard

1. **Navigate to Performance Tab**
   - URL: `https://sentry.io/organizations/YOUR_ORG/performance/`
   - See all transactions with P50, P75, P95, P99 metrics

2. **Filter by Feature**
   - `feature:evidence` - Evidence-related operations
   - `feature:auth` - Authentication flows
   - `feature:campaigns` - Campaign operations
   - `feature:podcasts` - Podcast fetching
   - `feature:resources` - Resource fetching

3. **Drill into Specific Transactions**
   - Click any transaction to see:
     - Span breakdown (which parts are slow)
     - Breadcrumbs (what user did before)
     - Tags and context
     - Related errors

4. **Search Examples**
   ```
   transaction:process_evidence_queue
   transaction:fetch_* feature:podcasts
   http.status_code:>=400
   feature:auth AND status:internal_error
   ```

### Sample Queries

**Find slow operations**:
```
transaction.duration:>2s
```

**Track authentication issues**:
```
feature:auth status:unauthenticated
```

**Monitor evidence uploads**:
```
transaction:process_evidence_queue
```

**API failure rates**:
```
transaction:fetch_* status:internal_error
```

## 🎯 Performance Targets

Based on implementation, aim for:

| Operation | Target (P95) | Alert Threshold |
|-----------|--------------|-----------------|
| Evidence Queue Processing | < 3s | > 5s |
| Authentication (Sign In/Out) | < 2s | > 3s |
| Data Fetching (API) | < 1s | > 2s |
| Screen Navigation | < 500ms | > 1s |
| File Upload (per file) | < 5s | > 10s |

## 🚨 Next: Set Up Alerts

**File**: [SENTRY_ALERTS_SETUP.md](SENTRY_ALERTS_SETUP.md)

### Quick Start (3 Essential Alerts)

Set these up first for immediate value:

1. **Slow Evidence Queue**
   - Transaction: `process_evidence_queue`
   - Threshold: P95 > 5 seconds
   - Time: 10 minutes

2. **High Error Rate**
   - All errors
   - Threshold: > 100 errors/hour
   - Time: 1 hour

3. **Low Crash-Free Sessions**
   - Crash-free rate
   - Threshold: < 99%
   - Time: 1 hour

**Time to setup**: ~15 minutes
**Expected value**: Immediate visibility into critical issues

See [SENTRY_ALERTS_SETUP.md](SENTRY_ALERTS_SETUP.md) for detailed instructions.

## 📚 Documentation Reference

### Quick Access

1. **[SENTRY_PERFORMANCE_GUIDE.md](SENTRY_PERFORMANCE_GUIDE.md)**
   - Complete guide with examples
   - Implementation patterns
   - Best practices

2. **[SENTRY_QUICK_REFERENCE.md](SENTRY_QUICK_REFERENCE.md)**
   - Quick code snippets
   - Common patterns
   - API reference

3. **[SENTRY_SETUP_SUMMARY.md](SENTRY_SETUP_SUMMARY.md)**
   - Configuration details
   - What's enabled
   - How to use

4. **[SENTRY_ACTIVATION_CHECKLIST.md](SENTRY_ACTIVATION_CHECKLIST.md)**
   - Verification steps
   - Next actions
   - Success metrics

5. **[SENTRY_ALERTS_SETUP.md](SENTRY_ALERTS_SETUP.md)**
   - Alert configuration guide
   - Recommended alerts
   - Testing instructions

## 🔧 Environment Setup Required

### 1. Sentry DSN

Add to your `.env`:
```env
EXPO_PUBLIC_SENTRY_DSN=https://your-key@o0000000.ingest.sentry.io/0000000
```

### 2. Enable Analytics

Performance data only sends when users have analytics enabled in privacy settings.

**Privacy-First Approach**:
- ✅ Respects user preferences
- ✅ No PII sent (emails, names filtered)
- ✅ GDPR compliant
- ✅ User IDs anonymized

### 3. Development Build

Sentry native modules require a development build (not Expo Go):

```bash
# Android
npm run android

# iOS
npm run ios
```

## 🎨 Sample Data You'll See

### Transactions

After deployment, you'll see:

| Transaction | What It Tracks | Tags |
|-------------|----------------|------|
| `process_evidence_queue` | Evidence upload queue processing | `feature:evidence` |
| `fetch_campaigns` | Campaign data fetching | `feature:campaigns` |
| `fetch_podcasts` | Podcast data fetching | `feature:podcasts` |
| `fetch_resources` | Resource data fetching | `feature:resources` |
| `user_signout` | Sign out operation | `feature:auth`, `action:signout` |
| `refresh_claims` | Token refresh | `feature:auth`, `action:refresh_claims` |
| `guest_signin` | Guest authentication | `feature:auth`, `action:guest_signin` |

### Measurements

Custom metrics you'll see:

| Measurement | Unit | What It Tracks |
|-------------|------|----------------|
| `queue_items_count` | none | Items in evidence queue |
| `campaigns_count` | none | Number of campaigns fetched |
| `podcasts_count` | none | Number of podcasts fetched |
| `resources_count` | none | Number of resources fetched |
| `podcasts_source` | none | 1=API, 2=YouTube, 3=Cache, 4=Local |
| `resources_source` | none | 1=API, 2=Cache, 3=Local |

### Breadcrumbs

Debugging context you'll see:

```
User initiating sign out
→ Sign out successful
→ Auth state changed
```

```
Starting podcast fetch
→ Attempting to fetch from API
→ API fetch failed, trying YouTube
→ Fetched 30 podcasts from YouTube
```

```
Fetching campaigns from API
→ Fetched 15 campaigns
→ Cache updated
```

## 🏆 Success Criteria

You'll know it's working when:

1. ✅ Sentry console shows: `[Sentry] initialized`
2. ✅ Performance tab shows transactions after app usage
3. ✅ Transactions have span breakdowns
4. ✅ Custom measurements appear in transaction details
5. ✅ Breadcrumbs provide debugging context
6. ✅ Errors have automatic feature labels

## 🚀 What to Do Next

### Week 1: Baseline & Verification

- [ ] Deploy to production
- [ ] Verify Sentry receives data
- [ ] Check Performance tab has transactions
- [ ] Review automatic tracking (screens, API calls)
- [ ] Identify slowest operations

### Week 2: Alerts & Monitoring

- [ ] Set up 3 essential alerts (see above)
- [ ] Configure Slack notifications
- [ ] Test alert triggers
- [ ] Document alert playbooks

### Week 3-4: Expand Coverage

- [ ] Add tracking to advocacy forms (optional)
- [ ] Add tracking to additional user flows
- [ ] Create custom dashboards
- [ ] Review and adjust thresholds

### Ongoing: Optimize

- [ ] Weekly: Review triggered alerts
- [ ] Weekly: Check slowest transactions
- [ ] Monthly: Optimize bottlenecks
- [ ] Monthly: Adjust alert thresholds
- [ ] Quarterly: Review and update tracking

## 💡 Pro Tips

1. **Start Simple**: Focus on critical user flows first
2. **Tag Everything**: Tags make filtering and searching easy
3. **Use Breadcrumbs**: They're invaluable for debugging
4. **Set Realistic Thresholds**: Start high, adjust down
5. **Document Playbooks**: For each alert, document how to investigate
6. **Review Regularly**: Weekly alert reviews catch trends early

## 🐛 Troubleshooting

### No Data in Sentry?

1. Check `EXPO_PUBLIC_SENTRY_DSN` is in `.env`
2. Verify analytics enabled in app settings
3. Remember: production samples only 20% (dev = 100%)
4. Check console for `[Sentry] initialized` message

### Transactions Not Appearing?

1. Verify user has analytics enabled
2. Check environment (production vs development)
3. Confirm sample rate (20% in prod)
4. Look for errors in console

### Missing Context?

1. Tags added when starting transaction
2. Breadcrumbs added before errors
3. Measurements set during operation
4. Check `beforeSend` isn't filtering data

## 📞 Support Resources

- **Internal Docs**: See [docs/](../docs/) folder
- **Sentry Docs**: https://docs.sentry.io/platforms/react-native/
- **Performance Guide**: https://docs.sentry.io/platforms/react-native/performance/
- **API Reference**: https://docs.sentry.io/platforms/react-native/enriching-events/

---

## 🎉 Congratulations!

Your EmpowrApp now has **production-grade performance monitoring**!

You can now:
- ✅ Pinpoint performance bottlenecks
- ✅ Track critical user flows
- ✅ Monitor API health
- ✅ Detect issues before users report them
- ✅ Optimize based on real data
- ✅ Set up proactive alerts

**Next Step**: Deploy and watch the data flow in! 🚀

---

**Implementation Date**: Setup completed with full performance tracking
**Coverage**: Authentication, Evidence, Campaigns, Podcasts, Resources
**Documentation**: Complete guides and references available
**Ready for**: Production deployment and monitoring
