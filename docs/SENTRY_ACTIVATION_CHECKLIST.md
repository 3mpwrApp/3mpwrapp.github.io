# Sentry Performance Monitoring - Activation Checklist

## ✅ Completed Setup

### 1. Package Installation
- [x] @sentry/react-native v7.2.0 installed

### 2. Performance Features Configured
- [x] Performance monitoring enabled in `services/sentryLabeling.ts`
- [x] Traces sample rate: 20% production, 100% dev
- [x] Profiling sample rate: 20% production, 100% dev
- [x] React Navigation integration enabled
- [x] HTTP client integration enabled
- [x] Automatic session tracking enabled
- [x] Native crash handling enabled
- [x] Breadcrumbs enabled (max 100)

### 3. Performance APIs Created
- [x] `startTransaction()` - Start performance transaction
- [x] `startSpan()` - Track sub-operations
- [x] `measurePerformance()` - Auto-wrap operations
- [x] `setMeasurement()` - Custom metrics
- [x] Enhanced `captureException()` with context
- [x] `addBreadcrumb()` for debugging

### 4. Example Implementation
- [x] Evidence queue processing instrumented
- [x] File upload tracking
- [x] Queue metrics (item count, file count)
- [x] Error tracking with context

### 5. Documentation Created
- [x] Full Performance Guide (`SENTRY_PERFORMANCE_GUIDE.md`)
- [x] Quick Reference Card (`SENTRY_QUICK_REFERENCE.md`)
- [x] Setup Summary (`SENTRY_SETUP_SUMMARY.md`)
- [x] This Activation Checklist

## 🎯 Ready to Use

### Verify Setup Works

Run this in your app to test:

```typescript
import { isSentryEnabled, measurePerformance } from '@/services/sentryLabeling';

// Check if Sentry is initialized
console.log('Sentry enabled:', isSentryEnabled());

// Test performance tracking
await measurePerformance('test_operation', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Test operation completed');
}, { tags: { test: 'true' } });
```

### Environment Setup

Make sure you have:

1. **Sentry DSN configured** in `.env`:
   ```env
   EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project
   ```

2. **Analytics enabled** in app privacy settings
   - Users must have analytics enabled for data to be sent
   - Respects user privacy preferences

3. **Development build** (not Expo Go)
   - Sentry native modules require development build
   - Run: `expo run:android` or `expo run:ios`

## 🚀 Next Actions

### Immediate (Do Now)

1. **Test in Development**
   ```bash
   npm run start:devclient
   ```
   - Check console for "[Sentry] initialized" message
   - Trigger evidence queue processing
   - Check Sentry dashboard for transaction data

2. **Verify Dashboard Access**
   - Log into Sentry.io
   - Navigate to Performance tab
   - Look for transactions appearing

### Short-term (This Week)

3. **Instrument Critical Flows**
   - [ ] Add to authentication flow (`context/AuthContext.tsx`)
   - [ ] Add to advocacy form submissions
   - [ ] Add to campaign actions
   - [ ] Add to resource/podcast fetching

4. **Set Up Alerts**
   - Create alert for slow transactions (> 2s)
   - Create alert for high error rates
   - Create alert for memory issues

### Medium-term (This Month)

5. **Monitor & Optimize**
   - Review performance data weekly
   - Identify slowest operations
   - Optimize based on real user data
   - Track improvements over time

6. **Expand Coverage**
   - Add to remaining user flows
   - Track custom metrics (user engagement, feature usage)
   - Implement advanced profiling

## 📊 Expected Results

After activation, you'll see in Sentry:

### Transactions (Automatically)
- Screen navigation times
- API request performance
- App startup time
- Screen render times

### Transactions (Manual - After Instrumentation)
- `process_evidence_queue` - Evidence upload performance
- `submit_advocacy_form` - Form submission time
- `fetch_podcasts` - Data fetching speed
- `user_login` - Authentication performance

### Metrics & Measurements
- Queue item counts
- File upload sizes
- Processing times
- Error rates by feature

### Error Context
- Automatic feature labeling
- Stack traces with source maps
- Breadcrumbs showing user journey
- Device and platform context

## 🎓 Learning Resources

### Internal Docs
1. **[SENTRY_PERFORMANCE_GUIDE.md](SENTRY_PERFORMANCE_GUIDE.md)**
   - Complete guide with examples
   - Best practices
   - Implementation patterns

2. **[SENTRY_QUICK_REFERENCE.md](SENTRY_QUICK_REFERENCE.md)**
   - Quick copy-paste snippets
   - Common patterns
   - API reference

3. **[SENTRY_SETUP_SUMMARY.md](SENTRY_SETUP_SUMMARY.md)**
   - What's configured
   - How to use
   - Next steps

### External Resources
- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Performance Monitoring Guide](https://docs.sentry.io/platforms/react-native/performance/)
- [Best Practices](https://docs.sentry.io/platforms/react-native/best-practices/)

## 🔍 Monitoring Strategy

### Week 1: Baseline
- Observe automatic tracking
- Identify slowest operations
- Note common error patterns

### Week 2-3: Instrumentation
- Add tracking to 3-5 critical flows
- Focus on user-facing operations
- Test and verify data quality

### Week 4+: Optimization
- Analyze performance data
- Identify bottlenecks
- Implement optimizations
- Measure improvements

## 🎯 Success Metrics

Track these over time:

1. **Performance**
   - P95 transaction times < 2s
   - Screen render times < 1s
   - API calls < 500ms average

2. **Reliability**
   - Error rate < 1%
   - Crash-free sessions > 99.5%
   - Zero critical errors

3. **User Experience**
   - App startup < 3s
   - Evidence upload success rate > 99%
   - Form submission reliability > 99%

## ⚡ Quick Commands

```bash
# Start development build
npm run start:devclient

# Run Android
npm run android

# Run iOS
npm run ios

# Check for TypeScript errors
npm run typecheck:strict

# Run tests
npm test
```

## 🐛 Common Issues & Fixes

### Issue: "Sentry not initialized"
**Fix**: Check `.env` has `EXPO_PUBLIC_SENTRY_DSN` set

### Issue: No data in Sentry dashboard
**Fix**:
1. Verify analytics enabled in app settings
2. Check production sample rate (only 20% sent)
3. Use development mode for 100% sampling

### Issue: Transactions not finishing
**Fix**: Always use `try/finally` and call `transaction?.finish()`

### Issue: Missing context in errors
**Fix**: Add tags and breadcrumbs before errors occur

## ✨ Pro Tips

1. **Use descriptive names**: `submit_advocacy_form` not `form_1`
2. **Add tags early**: Context helps debugging later
3. **Don't over-instrument**: Focus on user-facing operations
4. **Leverage automatic tracking**: Don't duplicate what's automatic
5. **Set meaningful statuses**: Helps categorize issues
6. **Use measurePerformance()**: Easiest way to track operations

## 🎉 You're Ready!

Your Sentry Performance Monitoring is fully configured and ready to use. Start tracking, monitoring, and optimizing your app's performance!

**Questions?** Check the [SENTRY_PERFORMANCE_GUIDE.md](SENTRY_PERFORMANCE_GUIDE.md) for detailed answers.

---

**Last Updated**: Setup completed with all performance features enabled
**Next Review**: After first week of production data collection
