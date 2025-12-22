# Sentry Performance Monitoring - Setup Summary

## ✅ What's Been Configured

### 1. Performance Monitoring Features Enabled

Location: [services/sentryLabeling.ts](../services/sentryLabeling.ts)

#### Enabled Features:
- ✅ **Automatic Performance Tracing** (`tracesSampleRate: 0.2` in production, `1.0` in dev)
- ✅ **Performance Profiling** (`profilesSampleRate: 0.2` in production, `1.0` in dev)
- ✅ **Auto Session Tracking** - Track app sessions and crashes
- ✅ **Auto Performance Tracing** - Automatically track React Navigation
- ✅ **Native Crash Handling** - Capture native crashes on iOS/Android
- ✅ **React Navigation Integration** - Track screen transitions and time-to-display
- ✅ **HTTP Client Integration** - Track all API calls to Firebase and Google APIs
- ✅ **Breadcrumbs** - Capture up to 100 breadcrumbs for debugging context
- ✅ **Stack Traces** - Attach stack traces to all events

#### Configuration Highlights:

```typescript
// Automatic instrumentation
enableAutoSessionTracking: true
enableAutoPerformanceTracing: true
enableNative: true
enableNativeCrashHandling: true

// Profiling
profilesSampleRate: 0.2 // 20% in production

// Integrations
- reactNavigationIntegration() // Screen transitions
- httpClientIntegration() // API calls

// Trace propagation
- Firebase: firebaseio.com, googleapis.com
- Local APIs: /api/ paths
```

### 2. New Performance Tracking APIs

All exported from [services/sentryLabeling.ts](../services/sentryLabeling.ts):

#### Core Functions:
- `startTransaction(name, op, options)` - Start tracking an operation
- `startSpan(parent, operation, description)` - Track sub-operations
- `measurePerformance(name, fn, options)` - Auto-wrap async operations
- `setMeasurement(name, value, unit)` - Custom metrics
- `captureException(error, context)` - Enhanced error capture
- `addBreadcrumb(message, category, level, data)` - Debug context

### 3. Example Implementation

Added performance tracking to Evidence Queue: [services/evidenceQueue.ts](../services/evidenceQueue.ts)

**What's tracked:**
- Total queue processing time
- Individual file upload performance
- Note creation time
- Queue item count
- File count per item
- Error rates and types

**Example output in Sentry:**
```
Transaction: process_evidence_queue (2.3s)
├─ upload_evidence_files (1.8s)
│  └─ Files uploaded: 3
├─ add_evidence_note (0.4s)
└─ queue_items_count: 5
```

## 📊 What You Can Track Now

### Automatically Tracked:
1. **Screen Navigation** - Every route change via React Navigation
2. **API Calls** - All Firebase, Google API requests
3. **App Startup Time** - Time from launch to first screen
4. **Screen Render Times** - Time to initial display per screen
5. **Network Requests** - Latency, status codes, failures
6. **Crashes & Errors** - Native and JS errors with context

### Manually Trackable:
1. **Form Submissions** - Validation, upload, save times
2. **File Uploads** - Individual file performance
3. **Data Loading** - Cache hits, API fetches
4. **User Actions** - Button clicks, swipes, gestures
5. **Background Tasks** - Queue processing, sync operations
6. **Custom Metrics** - Any measurement you need

## 🎯 How to Use

### Option 1: Automatic Wrapper (Easiest)

```typescript
import { measurePerformance } from '@/services/sentryLabeling';

const data = await measurePerformance('fetch_data', async () => {
  return await fetchData();
}, { op: 'http.client', tags: { feature: 'podcasts' } });
```

### Option 2: Manual Transaction (More Control)

```typescript
import { startTransaction, captureException } from '@/services/sentryLabeling';

const transaction = startTransaction('submit_form', 'task', {
  tags: { feature: 'advocacy' }
});

try {
  await submitForm();
  transaction?.setStatus('ok');
} catch (error) {
  transaction?.setStatus('internal_error');
  captureException(error);
  throw error;
} finally {
  transaction?.finish();
}
```

### Option 3: Multi-Step with Spans (Most Detailed)

```typescript
import { startTransaction, startSpan } from '@/services/sentryLabeling';

const transaction = startTransaction('process_data', 'task');

const fetchSpan = startSpan(transaction, 'fetch_data');
await fetchData();
fetchSpan?.finish();

const processSpan = startSpan(transaction, 'process_data');
await processData();
processSpan?.finish();

transaction?.finish();
```

## 📚 Documentation

1. **Full Guide**: [SENTRY_PERFORMANCE_GUIDE.md](SENTRY_PERFORMANCE_GUIDE.md)
   - Detailed explanations
   - Complete examples
   - Best practices
   - Recommended implementation locations

2. **Quick Reference**: [SENTRY_QUICK_REFERENCE.md](SENTRY_QUICK_REFERENCE.md)
   - Common patterns
   - Quick copy-paste snippets
   - Transaction statuses
   - Measurement units

## 🔍 Viewing Performance Data

### In Sentry Dashboard:

1. **Navigate to Performance Tab**
   - See all transactions
   - View P50, P75, P95, P99 percentiles
   - Identify slowest operations

2. **Filter by Feature**
   - Use tags: `feature:evidence`, `feature:advocacy`, etc.
   - Group by operation type
   - Compare across versions

3. **Drill into Transactions**
   - See span breakdown
   - Identify bottlenecks
   - View related errors

4. **Set Up Alerts**
   - Alert on slow transactions (e.g., > 2s)
   - Track error rates
   - Monitor performance degradation

### Example Queries:

```
transaction:process_evidence_queue
transaction:submit_* feature:advocacy
http.status_code:>=400
```

## 🎨 Sample Metrics You'll See

### Transaction Performance:
- `process_evidence_queue` - Queue processing time
- `fetch_podcasts` - Podcast fetch time
- `submit_advocacy_form` - Form submission time
- `user_login` - Authentication time

### Custom Measurements:
- `queue_items_count` - Items in queue
- `files_count` - Files uploaded
- `screen_render_time` - Component render time
- `upload_size` - File size in bytes

### Spans (Sub-operations):
- `upload_evidence_files` - File upload step
- `add_evidence_note` - Note creation step
- `validate_form` - Form validation step
- `save_to_firestore` - Database save step

## 🔐 Privacy & Security

All performance monitoring respects user privacy:

- ✅ **No PII Sent** - Emails, names, phone numbers filtered
- ✅ **User Consent Required** - Only when `analyticsEnabled` is true
- ✅ **Automatic Filtering** - PII removed via `beforeSend` hook
- ✅ **Anonymized IDs** - User IDs are hashed
- ✅ **GDPR Compliant** - Respects privacy settings

## 🚀 Next Steps

### 1. Add to Critical Flows

Recommended locations to instrument:

- [ ] **Authentication** - `context/AuthContext.tsx`
  - Login/logout transactions
  - Token refresh performance

- [ ] **Advocacy Forms** - `screens/advocacy/*`
  - Form submission flows
  - File upload tracking

- [ ] **Campaigns** - `services/campaigns.ts`
  - Action submissions
  - Campaign data fetching

- [ ] **Resources** - `services/resources.ts`
  - Resource fetching
  - Cache performance

- [ ] **Podcasts** - `services/podcasts.ts`
  - Podcast fetching
  - Audio loading

### 2. Monitor & Optimize

1. **Watch Sentry Dashboard** for slow transactions
2. **Identify Bottlenecks** using span breakdown
3. **Optimize** based on real user data
4. **Set Alerts** for performance regressions

### 3. Add Custom Metrics

Based on your specific needs:
- User engagement metrics
- Feature usage tracking
- Error recovery rates
- Offline sync performance

## ⚙️ Configuration Options

### Adjust Sample Rates

In [services/sentryLabeling.ts](../services/sentryLabeling.ts):

```typescript
// Increase for more data (costs more)
tracesSampleRate: 0.5, // 50% of transactions

// Decrease for less data (costs less)
tracesSampleRate: 0.1, // 10% of transactions
```

### Add Custom Integrations

```typescript
integrations: [
  Sentry.reactNavigationIntegration(),
  Sentry.httpClientIntegration(),
  // Add more integrations here
],
```

### Modify Trace Targets

```typescript
tracePropagationTargets: [
  'localhost',
  /^https:\/\/your-api\.com/,
  // Add your API endpoints
],
```

## 🐛 Troubleshooting

### No data in Sentry?

1. Check `EXPO_PUBLIC_SENTRY_DSN` is set in `.env`
2. Verify analytics are enabled in app settings
3. Remember production samples 20% (not 100%)
4. Check Sentry initialization: `isSentryEnabled()` should return `true`

### Transactions not finishing?

1. Always call `transaction?.finish()` in `finally` block
2. Ensure spans finish before parent transaction
3. Check for uncaught errors preventing finish

### Missing context?

1. Add tags when starting transaction
2. Use `addBreadcrumb()` for debugging context
3. Set measurements for custom metrics

## 📞 Support

- **Sentry Docs**: https://docs.sentry.io/platforms/react-native/
- **Performance Guide**: [SENTRY_PERFORMANCE_GUIDE.md](SENTRY_PERFORMANCE_GUIDE.md)
- **Quick Reference**: [SENTRY_QUICK_REFERENCE.md](SENTRY_QUICK_REFERENCE.md)

---

**Setup completed!** 🎉

Your app now has enterprise-grade performance monitoring with Sentry. Start tracking critical user flows and optimize based on real data.
