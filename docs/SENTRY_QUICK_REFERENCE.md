# Sentry Performance Monitoring - Quick Reference

## Import Statement

```typescript
import {
  startTransaction,
  startSpan,
  setMeasurement,
  captureException,
  measurePerformance,
  addBreadcrumb,
} from '@/services/sentryLabeling';
```

## Quick Patterns

### 1. Simple Operation Tracking

```typescript
const transaction = startTransaction('operation_name', 'task');
try {
  await doWork();
  transaction?.setStatus('ok');
} catch (error) {
  transaction?.setStatus('internal_error');
  captureException(error);
  throw error;
} finally {
  transaction?.finish();
}
```

### 2. Auto-Wrapped Operation (Easiest)

```typescript
await measurePerformance('fetch_data', async () => {
  return await fetchData();
}, { op: 'http.client', tags: { feature: 'podcasts' } });
```

### 3. Multi-Step Operation with Spans

```typescript
const transaction = startTransaction('complex_task', 'task');

const step1 = startSpan(transaction, 'step_1', 'Description');
await doStep1();
step1?.finish();

const step2 = startSpan(transaction, 'step_2', 'Description');
await doStep2();
step2?.finish();

transaction?.finish();
```

### 4. Track Custom Metrics

```typescript
setMeasurement('items_processed', count, 'none');
setMeasurement('file_size', bytes, 'byte');
setMeasurement('render_time', ms, 'millisecond');
```

### 5. Error Capture with Context

```typescript
captureException(error, {
  feature: 'evidence',
  severity: 'error',
  tags: { user_action: 'upload' },
  extra: { file_count: 3 }
});
```

### 6. Add Debugging Breadcrumbs

```typescript
addBreadcrumb('User clicked submit', 'user.action', 'info', {
  form_id: 'advocacy_form',
  has_files: true
});
```

## Operation Types

- `'navigation'` - Screen/route changes
- `'task'` - User actions, background jobs
- `'http.client'` - API calls, network requests
- `'db.query'` - Database operations
- `'custom'` - Anything else

## Transaction Statuses

- `'ok'` - Success
- `'cancelled'` - User cancelled
- `'unknown'` - Default
- `'invalid_argument'` - Bad input
- `'deadline_exceeded'` - Timeout
- `'not_found'` - Resource missing
- `'already_exists'` - Duplicate
- `'permission_denied'` - Auth failure
- `'unauthenticated'` - Not logged in
- `'resource_exhausted'` - Quota/rate limit
- `'failed_precondition'` - Precondition failed
- `'aborted'` - Conflict
- `'out_of_range'` - Invalid range
- `'unimplemented'` - Not implemented
- `'internal_error'` - Internal failure
- `'unavailable'` - Service down
- `'data_loss'` - Data corruption

## Measurement Units

- `'millisecond'` - Time measurements (default)
- `'second'` - Time in seconds
- `'byte'` - File sizes, data sizes
- `'none'` - Counts, percentages, ratios

## Common Use Cases

### Upload Flow

```typescript
const transaction = startTransaction('upload_files', 'task', {
  tags: { feature: 'evidence', file_count: files.length.toString() }
});

for (const file of files) {
  const uploadSpan = startSpan(transaction, 'upload_file', file.name);
  await uploadFile(file);
  uploadSpan?.finish();
}

transaction?.setStatus('ok');
transaction?.finish();
```

### Form Submission

```typescript
const handleSubmit = async () => {
  const transaction = startTransaction('submit_form', 'task', {
    tags: { feature: 'advocacy', form_type: 'appeal' }
  });

  try {
    const validationSpan = startSpan(transaction, 'validate');
    await validateForm(formData);
    validationSpan?.finish();

    const submitSpan = startSpan(transaction, 'submit_to_api');
    await submitToAPI(formData);
    submitSpan?.finish();

    transaction?.setStatus('ok');
  } catch (error) {
    transaction?.setStatus('internal_error');
    captureException(error, { feature: 'advocacy' });
    throw error;
  } finally {
    transaction?.finish();
  }
};
```

### Data Fetching with Cache

```typescript
export async function fetchPodcasts() {
  return await measurePerformance(
    'fetch_podcasts',
    async () => {
      const cached = await getCache();
      if (cached) {
        addBreadcrumb('Cache hit', 'cache', 'info');
        return cached;
      }

      addBreadcrumb('Cache miss, fetching from API', 'cache', 'info');
      const data = await fetchFromAPI();
      await saveCache(data);
      return data;
    },
    {
      op: 'http.client',
      tags: { feature: 'podcasts' }
    }
  );
}
```

### Screen Render Tracking

```typescript
useEffect(() => {
  const startTime = performance.now();

  return () => {
    const renderTime = performance.now() - startTime;
    setMeasurement('screen_render_time', renderTime, 'millisecond');
  };
}, []);
```

## Tips

1. **Always finish transactions** - Use `finally` blocks
2. **Name consistently** - Use snake_case: `submit_evidence`, `fetch_podcasts`
3. **Add context** - Tags help filter and search in Sentry
4. **Don't over-instrument** - Focus on user-facing operations
5. **Set meaningful statuses** - Helps identify error types
6. **Measure what matters** - File sizes, item counts, render times

## Viewing in Sentry

1. **Performance Tab** → View all transactions
2. **Filter by feature** → Use tags like `feature:evidence`
3. **Click transaction** → See breakdown of spans
4. **Compare over time** → Track performance trends
5. **Set alerts** → Get notified of slow operations

## Privacy Note

Sentry automatically filters PII:
- ✅ User IDs (anonymized)
- ❌ Emails (never sent)
- ❌ Names (never sent)
- ❌ Phone numbers (never sent)
- ✅ Feature tags (safe)
- ✅ Performance metrics (safe)
