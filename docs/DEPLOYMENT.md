# Deployment & Release Process

## Pre-Deployment Checklist

### Code Quality
```bash
# Run all checks
npm run lint
npm test
npx tsc --noEmit
npm run build
```

### Performance
```bash
# Check bundle size
npm run perf:analyze

# Should be < 2.5 MB
```

### Accessibility
```bash
# WCAG 2.2 AAA compliance
npm run wcag:aaa
```

## Versioning

### Semantic Versioning

**Format: MAJOR.MINOR.PATCH**

- **MAJOR:** Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR:** New features (e.g., 1.0.0 → 1.1.0)
- **PATCH:** Bug fixes (e.g., 1.0.0 → 1.0.1)

### Update app.json
```json
{
  "expo": {
    "version": "1.2.3",
    "ios": { "buildNumber": "123" },
    "android": { "versionCode": 123 }
  }
}
```

## Build Process

### EAS Build

**First-Time Setup**
```bash
npm install -g eas-cli
eas init
```

**Build for Development**
```bash
# Creates installable APK/IPA
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

**Build for Production**
```bash
eas build --platform all --profile production
```

### Building Locally

**Android**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease
cd ..

# Output: android/app/build/outputs/apk/release/app-release.apk
```

**iOS**
```bash
# Requires Mac + Xcode
cd ios
xcodebuild -workspace EmpowrApp.xcworkspace \
  -scheme EmpowrApp \
  -configuration Release \
  -archivePath build/EmpowrApp.xcarchive \
  archive

# Output: build/EmpowrApp.xcarchive
```

## Over-the-Air Updates (OTA)

### Why OTA?
- Deploy fixes instantly (no app store review)
- Gradual rollout with feature flags
- Rollback if issues
- Skip major new features

### Publishing Updates

**Update Code Without Store Review**
```bash
# Make changes to code

# Push to production
eas update --channel production

# View deployment
eas update --list

# Rollback if needed
eas update --rollback --channel production
```

### Feature Flag Controlled Rollout

**Deploy Feature Disabled**
```bash
// features/newUI.ts
export const NEW_UI_FEATURE = {
  enabled: false,
  rolloutPercentage: 0,
};
```

**Gradual Rollout**
```bash
# Day 1: Enable for 10% of users
eas update --channel production
# (Update feature flags in config)

# Day 3: Expand to 50% of users

# Day 7: Full rollout (100%)
```

## App Store Deployment

### Android (Google Play)

**First Release**
1. Create signing key
2. Configure Play Console
3. Upload APK/AAB
4. Fill store listing
5. Submit for review (24-48 hours)

**Subsequent Releases**
```bash
# Build & upload
eas build --platform android --profile production
# Upload to Play Console → Review

# Internal Testing
# → Beta Testing  
# → Production
```

### iOS (Apple App Store)

**First Release**
1. Create signing certificate
2. Configure App Store Connect
3. Create TestFlight build
4. Add beta testers
5. Submit for review (24-48 hours)

**Subsequent Releases**
```bash
# Build & upload
eas build --platform ios --profile production
# Upload to App Store Connect → Review

# TestFlight
# → Production
```

## Release Phases

### Phase 1: Development Build
**For Testing Team**
- Includes dev tools
- Sentry staging
- Beta features enabled
- Run: `eas build --profile preview`

### Phase 2: Closed Beta
**For Selected Users (100-1000)**
- All features available
- Minor bugs expected
- Feature flags for testing
- Duration: 2-4 weeks

### Phase 3: Public Beta
**For Public Users (1000-10000)**
- Most features stable
- Continued monitoring
- Fast bug fixes
- Duration: 1-2 weeks

### Phase 4: Production
**For All Users**
- Fully stable
- Performance optimized
- Full support
- Continuous updates

## Monitoring & Alerts

### Error Tracking (Sentry)

**Real-Time Alerts**
```bash
# Set up Sentry project
npm run sentry:init

# Automatically captures:
# - Unhandled exceptions
# - Redux actions
# - Network errors
# - Device metrics
```

### Analytics (Expo & Firebase)

**Usage Metrics**
```typescript
// Track important events
logEvent('campaign-created', {
  campaignId,
  title,
  timestamp: new Date(),
});

logEvent('evidence-uploaded', {
  type: 'photo',
  size: fileSize,
  duration: uploadTime,
});
```

### Performance Monitoring

**Sentry Transactions**
```typescript
const transaction = Sentry.startTransaction({
  name: 'get-campaigns',
  tags: { status: 'success' },
});

// ... fetch data ...

transaction.finish();
// Measures: duration, success rate, errors
```

## Rollback Plan

### If Critical Issue Found

**Step 1: Identify Issue**
- Monitor Sentry
- Check user reports
- Verify reproducibility

**Step 2: Decide on Rollback**
- Can fix via OTA?
- Can disable via feature flag?
- Need new store release?

**Step 3: Rollback**
```bash
# OTA rollback (instant)
eas update --rollback --channel production

# Or disable feature
# Update feature flags, deploy OTA
```

**Step 4: Root Cause Analysis**
- Add tests to prevent regression
- Update documentation
- Post-mortem meeting

## Deployment Schedule

### Weekly Deployments
- **Monday:** Bug fixes from weekend reports
- **Wednesday:** Small features & improvements
- **Friday:** Major features (more testing time)

### Freeze Windows
- ❌ 12-24 hours after release
- ❌ Holiday weeks
- ❌ Major OS updates

### Communication
1. **Internal:** Slack notification
2. **Beta Testers:** Email announcement
3. **Users:** In-app notification (if major)
4. **Public:** GitHub releases page

## Release Notes Template

```markdown
# v1.2.0 - January 15, 2026

## New Features
- [Feature name]: Description
- [Feature name]: Description

## Improvements
- Performance: Reduced bundle by 20KB
- UX: Faster campaign loading
- A11y: Improved color contrast

## Bug Fixes
- Fixed: [issue description]
- Fixed: [issue description]

## Breaking Changes
None in this release.

## Known Issues
- [Known issue]: Workaround

## Dependency Updates
- zod: 3.22.0 → 3.22.4
- firebase: 10.0.0 → 10.1.0

## Contributors
@username @username
```

## Post-Deployment

### Day 1 (Release Day)
- [ ] Monitor Sentry dashboard
- [ ] Check Google Play/App Store stats
- [ ] Read user feedback
- [ ] Be ready for hotfix

### Day 1-7 (First Week)
- [ ] Daily metrics review
- [ ] User feedback analysis
- [ ] Performance tracking
- [ ] Bug triage

### Week 2-4
- [ ] Feature adoption metrics
- [ ] User satisfaction surveys
- [ ] Performance benchmarks
- [ ] Plan next release

## Deployment Checklist

**One Week Before**
- [ ] Code review complete
- [ ] QA testing passed
- [ ] Performance metrics good
- [ ] Security audit passed

**One Day Before**
- [ ] Staging build verified
- [ ] Release notes written
- [ ] Update localization
- [ ] Notify support team

**Release Day**
- [ ] Final production build
- [ ] Deploy to store
- [ ] Monitor first hour
- [ ] Send announcements
- [ ] Mark availability in docs

**After Release**
- [ ] Verify version in stores
- [ ] Test on real devices
- [ ] Monitor crash rates
- [ ] Check user feedback

---

**Last Updated:** January 9, 2026  
**Status:** Production-Ready
