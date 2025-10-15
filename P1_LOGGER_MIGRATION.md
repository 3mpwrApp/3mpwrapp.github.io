# P1-5: Logger Migration Progress

## Summary
Replacing all console.log/warn calls with centralized logger utility for production-safe logging.

## Files Completed ✅

### Core App Files
- ✅ `app/_layout.tsx` - 3 console.warn → logger.log/logger.debug
- ✅ `utils/logger.ts` - **Created** (centralized logger with dev/prod modes)

### Services
- ✅ `services/youtube.ts` - 2 console.warn → logger.warn
- ✅ `services/worlddata.ts` - 1 console.warn → logger.warn
- ✅ `services/stt.ts` - 1 console.warn → logger.warn

### Store
- ✅ `store/settings.tsx` - 2 console.warn → logger.warn
- ✅ `store/jurisdiction.tsx` - 2 console.warn → logger.warn

## Files Pending (High Priority) 🔶

### Services (Security & Core)
- 🔶 `services/telemetry.ts` - 1 console.warn
- 🔶 `services/expoPush.ts` - 1 console.warn
- 🔶 `services/analyticsClient.ts` - 2 console.warn
- 🔶 `services/analytics.ts` - 1 console.warn
- 🔶 `services/costGuard.ts` - 1 console.warn

### Security Services (10 files)
- 🔶 `services/security/tamperDetection.ts` - 4 console.warn + 1 console.log
- 🔶 `services/security/securityManager.ts` - 3 console.warn
- 🔶 `services/security/permissions.ts` - 4 console.warn
- 🔶 `services/security/networkSecurity.ts` - 2 console.warn
- 🔶 `services/security/encryption.ts` - 3 console.warn
- 🔶 `services/security/deviceSecurity.ts` - 6 console.warn
- 🔶 `services/security/appIntegrity.ts` - 6 console.warn

### Hooks
- 🔶 `hooks/useA11y.ts` - 7 console.warn

### Context
- 🔶 `context/NeurodivergentContext.tsx` - 2 console.warn
- 🔶 `context/MotorAccessibilityContext.tsx` - 3 console.warn
- 🔶 `context/IndigenousLanguageContext.tsx` - 2 console.warn
- 🔶 `context/DyslexiaContext.tsx` - 2 console.warn

### Components
- 🔶 `components/ExternalLink.tsx` - 1 console.warn
- 🔶 `components/EmergencyWalletCard.tsx` - 1 console.warn

### Utils
- 🔶 `utils/linking.ts` - 1 console.warn
- 🔶 `utils/i18nA11y.ts` - 1 console.warn
- 🔶 `utils/contrastChecker.ts` - 1 console.warn

### App Screens
- 🔶 `app/(tabs)/settings/cultural-safety.tsx` - 2 console.warn
- 🔶 `app/(tabs)/settings/advanced-security.tsx` - 1 console.warn
- 🔶 `app/(tabs)/settings/advanced-accessibility.tsx` - 2 console.warn
- 🔶 `app/(tabs)/podcasts/index.tsx` - 1 console.warn
- 🔶 `app/(tabs)/podcasts/[id].tsx` - 1 console.warn

### i18n
- 🔶 `i18n/index.tsx` - 1 console.warn

## Low Priority (Scripts & Tests) 📋
- Scripts (gen-jurisdictions-map.js, export-collection.js, etc.) - Keep as-is (script output)
- Tests - Keep as-is (test debugging)
- WCAG audit scripts - Keep as-is (audit output)

## Benefits
✅ Production apps won't spam console with debug logs
✅ Centralized control over logging behavior
✅ Future-ready for Sentry integration
✅ Cleaner production bundles
✅ Better UX (no performance impact from logging in prod)

## Next Steps
1. Update all security/* services (critical for production)
2. Update hooks and context providers
3. Update remaining app screens
4. Run full test suite to ensure no breaking changes
5. Test in production build mode

## Logger API Reference
```typescript
import { logger } from '../utils/logger';

logger.log(...args);     // Dev only - informational
logger.warn(...args);    // Dev only - warnings
logger.error(...args);   // Always logged - errors (future: Sentry)
logger.debug(...args);   // Dev only - verbose debugging
```

---

**Total Progress: 7/50+ files (~14% complete)**
**Estimated Time Remaining: 3-4 hours**
