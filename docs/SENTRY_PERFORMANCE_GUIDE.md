# Sentry Performance Monitoring Guide

## Overview

This guide shows how to use Sentry's Performance Monitoring features in the EmpowrApp to pinpoint performance problems and track key user flows.

## Configuration

Performance monitoring is configured in `services/sentryLabeling.ts` with:

- **Traces Sample Rate**: 100% in dev, 20% in production
- **Profiles Sample Rate**: 100% in dev, 20% in production
- **Automatic instrumentation** for:
  - React Navigation (screen transitions)
  - HTTP requests (Firebase, Google APIs)
  - Native crashes and errors

## Key Features Enabled

### 1. Automatic Performance Tracking

The following are automatically tracked:

- **Screen Navigation**: All route changes via React Navigation
- **HTTP Requests**: All API calls to Firebase and external services
- **App Start Time**: Time from launch to first screen render
- **Time to Initial Display**: Per-screen render performance

### 2. Custom Transaction Tracking

Use these functions to track specific operations:

#### Basic Transaction

```typescript
import { startTransaction, captureException } from '@/services/sentryLabeling';

const transaction = startTransaction('load_evidence_queue', 'task', {
  description: 'Loading user evidence items from storage',
  tags: { feature: 'evidence', user_action: 'view' }
});

try {
  await loadEvidenceFromStorage();
  transaction?.setStatus('ok');
} catch (error) {
  transaction?.setStatus('internal_error');
  captureException(error, { feature: 'evidence' });
} finally {
  transaction?.finish();
}
```

#### Nested Spans (Sub-operations)

```typescript
import { startTransaction, startSpan } from '@/services/sentryLabeling';

const transaction = startTransaction('submit_advocacy_form', 'task');

// Track individual steps
const validationSpan = startSpan(transaction, 'validate_form', 'Form validation');
await validateForm();
validationSpan?.finish();

const uploadSpan = startSpan(transaction, 'upload_evidence', 'Upload files to Firebase');
await uploadEvidenceFiles();
uploadSpan?.finish();

const saveSpan = startSpan(transaction, 'save_to_firestore', 'Save form to database');
await saveToFirestore();
saveSpan?.finish();

transaction?.finish();
```

#### Simplified Performance Measurement

```typescript
import { measurePerformance } from '@/services/sentryLabeling';

// Automatically wraps operation in a transaction
const podcasts = await measurePerformance(
  'fetch_podcasts',
  async () => {
    return await fetchPodcasts();
  },
  {
    op: 'http.client',
    tags: { feature: 'podcasts', cache_hit: 'false' }
  }
);
```

### 3. Custom Metrics

Track specific performance metrics:

```typescript
import { setMeasurement } from '@/services/sentryLabeling';

// Track component render time
const startTime = performance.now();
renderComponent();
const renderTime = performance.now() - startTime;
setMeasurement('evidence_list_render', renderTime, 'millisecond');

// Track data size
setMeasurement('evidence_queue_size', queueItems.length, 'none');
setMeasurement('image_file_size', fileSize, 'byte');
```

## Recommended Implementation Locations

### High-Priority User Flows to Instrument

1. **Evidence Upload** (`services/evidenceQueue.ts`)
   ```typescript
   export async function submitEvidence(item: EvidenceItem) {
     const transaction = startTransaction('submit_evidence', 'task', {
       tags: { evidence_type: item.type }
     });

     try {
       const uploadSpan = startSpan(transaction, 'upload_file', 'Upload to storage');
       await uploadFile(item.file);
       uploadSpan?.finish();

       const saveSpan = startSpan(transaction, 'save_metadata', 'Save to Firestore');
       await saveMetadata(item);
       saveSpan?.finish();

       transaction?.setStatus('ok');
     } catch (error) {
       transaction?.setStatus('internal_error');
       captureException(error, { feature: 'evidence' });
       throw error;
     } finally {
       transaction?.finish();
     }
   }
   ```

2. **Authentication Flow** (`context/AuthContext.tsx`)
   ```typescript
   const loginTransaction = startTransaction('user_login', 'task', {
     tags: { method: 'email' }
   });

   try {
     await signInWithEmailAndPassword(auth, email, password);
     loginTransaction?.setStatus('ok');
   } catch (error) {
     loginTransaction?.setStatus('unauthenticated');
     captureException(error, { feature: 'auth' });
   } finally {
     loginTransaction?.finish();
   }
   ```

3. **Data Fetching** (`services/podcasts.ts`, `services/resources.ts`, etc.)
   ```typescript
   export async function fetchPodcasts() {
     return await measurePerformance(
       'fetch_podcasts',
       async () => {
         const cached = await getCachedPodcasts();
         if (cached) return cached;

         const response = await fetch(PODCASTS_API);
         const data = await response.json();
         await cachePodcasts(data);
         return data;
       },
       {
         op: 'http.client',
         tags: { feature: 'podcasts' }
       }
     );
   }
   ```

4. **Form Submissions** (`screens/advocacy`, `screens/wellness`, etc.)
   ```typescript
   const handleSubmit = async () => {
     const transaction = startTransaction('advocacy_form_submit', 'task');

     try {
       await submitAdvocacyForm(formData);
       transaction?.setStatus('ok');
       addBreadcrumb('Form submitted successfully', 'user.action', 'info');
     } catch (error) {
       transaction?.setStatus('internal_error');
       captureException(error, { feature: 'advocacy', severity: 'error' });
     } finally {
       transaction?.finish();
     }
   };
   ```

## Viewing Performance Data in Sentry

Once instrumented, you can:

1. **View Transaction Performance**
   - Go to Sentry → Performance → Transactions
   - See P50, P75, P95, P99 response times
   - Identify slow operations

2. **Analyze Specific Issues**
   - Click on any transaction to see breakdown
   - View spans and identify bottlenecks
   - See which HTTP requests are slow

3. **Set Performance Alerts**
   - Create alerts for slow transactions (e.g., > 2s)
   - Get notified when performance degrades
   - Track trends over time

4. **Use Distributed Tracing**
   - See full request flow from client → Firebase → backend
   - Identify where time is spent
   - Pinpoint network vs processing delays

## Best Practices

1. **Name transactions clearly**: Use descriptive names like `submit_evidence` not `task_1`
2. **Add context with tags**: Include feature, user action, cache status, etc.
3. **Don't over-instrument**: Focus on user-facing operations (< 100 custom transactions)
4. **Use spans for sub-operations**: Break down complex operations into measurable steps
5. **Set appropriate statuses**: Use `ok`, `internal_error`, `unauthenticated`, etc.
6. **Leverage automatic instrumentation**: Don't manually track what's already tracked

## Privacy Considerations

All performance monitoring respects user privacy:

- ✅ No PII is sent (emails, names, phone numbers filtered)
- ✅ Only sends data when user has analytics enabled
- ✅ Automatic labeling helps organize without exposing sensitive data
- ✅ Breadcrumbs sanitized to remove sensitive information

## Troubleshooting

### Performance data not appearing

1. Check that Sentry is initialized: `isSentryEnabled()` should return `true`
2. Verify `EXPO_PUBLIC_SENTRY_DSN` is set in `.env`
3. Confirm analytics are enabled in user privacy settings
4. Remember: production samples 20% of transactions (dev samples 100%)

### Transactions not finishing

- Always call `transaction?.finish()` in a `finally` block
- Ensure spans are finished before parent transaction
- Check for uncaught errors that prevent finish call

### Missing context in transactions

- Add tags early: `startTransaction('name', 'op', { tags: {...} })`
- Use breadcrumbs for debugging context
- Set measurements for custom metrics

## Example: Complete Implementation

```typescript
// services/campaigns.ts
import {
  measurePerformance,
  startTransaction,
  startSpan,
  setMeasurement,
  captureException
} from './sentryLabeling';

export async function submitCampaignAction(
  campaignId: string,
  action: CampaignAction
) {
  const transaction = startTransaction('submit_campaign_action', 'task', {
    description: 'User submitting action for campaign',
    tags: {
      feature: 'campaigns',
      campaign_id: campaignId,
      action_type: action.type
    }
  });

  try {
    // Step 1: Validate
    const validateSpan = startSpan(transaction, 'validate', 'Validate action data');
    const isValid = await validateAction(action);
    validateSpan?.finish();

    if (!isValid) {
      transaction?.setStatus('invalid_argument');
      throw new Error('Invalid action data');
    }

    // Step 2: Upload files if any
    if (action.files?.length > 0) {
      const uploadSpan = startSpan(transaction, 'upload_files', 'Upload action files');
      setMeasurement('files_count', action.files.length, 'none');

      const totalSize = action.files.reduce((sum, f) => sum + f.size, 0);
      setMeasurement('upload_size', totalSize, 'byte');

      await uploadFiles(action.files);
      uploadSpan?.finish();
    }

    // Step 3: Save to Firestore
    const saveSpan = startSpan(transaction, 'save_firestore', 'Save to database');
    await saveActionToFirestore(campaignId, action);
    saveSpan?.finish();

    // Step 4: Update local cache
    const cacheSpan = startSpan(transaction, 'update_cache', 'Update local cache');
    await updateCampaignCache(campaignId, action);
    cacheSpan?.finish();

    transaction?.setStatus('ok');
    return { success: true };

  } catch (error) {
    transaction?.setStatus('internal_error');
    captureException(error as Error, {
      feature: 'campaigns',
      severity: 'error',
      tags: { campaign_id: campaignId }
    });
    throw error;
  } finally {
    transaction?.finish();
  }
}
```

## Next Steps

1. Add performance tracking to critical user flows (evidence, auth, campaigns)
2. Monitor Sentry dashboard for slow transactions
3. Set up performance alerts for key operations
4. Iterate and optimize based on real user data
