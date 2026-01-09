# Development Setup Guide

## Prerequisites

- **Node.js:** 18+ (recommended 20 LTS)
- **npm:** 10+
- **Git:** For version control
- **Expo CLI:** Global installation
- **iOS:** Mac with Xcode (for iOS development)
- **Android:** Android Studio (for Android development)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd empowrapp-new
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Expo Modules
```bash
npx expo install
```

## Environment Variables

Create `.env.local` in project root:

```bash
# Authentication
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain

# Data Policy (BYOC - Bring Your Own Cloud)
EXPO_PUBLIC_DATA_POLICY=hybrid_byoc  # or strict_byoc

# External APIs
EXPO_PUBLIC_YT_API_KEY=your-youtube-api-key
EXPO_PUBLIC_ADVOCATE_API=https://api.advocates.com

# Monitoring
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# CDN
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.3mpwrapp.com

# Feature Flags
EXPO_PUBLIC_FF_COLLECTIVE_EVIDENCE=true
EXPO_PUBLIC_FF_AI_COACH=false
```

## Development Workflows

### Starting Development Server

**Default (LAN)**
```bash
npm start
```

**Tunnel (For remote testing)**
```bash
npm run start:tunnel
```

**With Firebase**
```bash
npm run start:firebase
```

**With Dev Client**
```bash
npm run start:devclient
```

### Building for Platforms

**iOS Simulator**
```bash
npm run ios
```

**Android Emulator**
```bash
npm run android
```

**Web**
```bash
npm run web
```

### Cleaning & Resetting

**Clear Metro Cache**
```bash
npm run metro:clear
```

**Clean Install** (Windows)
```bash
npm run clean:win
```

**Reset Project**
```bash
npm run reset-project
```

## Code Quality

### Linting
```bash
npm run lint          # Run ESLint
npm run lint:ci       # Strict mode (no warnings)
```

### Type Checking
```bash
npx tsc --noEmit      # Quick check
npm run typecheck:strict  # Strict mode
```

### Testing

**Run All Tests**
```bash
npm test
```

**Watch Mode**
```bash
npm run test:watch
```

**Specific Test File**
```bash
npm test -- validation.test.ts
```

**Coverage Report**
```bash
npm test -- --coverage
```

### Stress Testing
```bash
npm run test:stress   # 120s timeout stress test
```

### WCAG Accessibility Testing
```bash
npm run wcag:aaa      # Full WCAG 2.2 AAA audit
npm run wcag:aaa:strict  # Strict mode
```

## Internationalization (i18n)

### Check i18n Status
```bash
npm run i18n:progress     # Translation progress
npm run i18n:report       # Missing translations
npm run i18n:coverage     # Coverage report
```

### Fill Missing Translations
```bash
npm run i18n:fill         # Add placeholders
npm run i18n:seed         # Seed missing values
```

### Validate i18n
```bash
npm run i18n:validate     # Check JSON syntax
npm run i18n:test         # Full validation suite
```

## Database & Backend

### Firestore Rules

**Deploy Rules**
```bash
npm run rules:deploy      # Deploy firestore rules
npm run rules:deploy:storage  # Deploy storage rules
```

**Validate Rules**
```bash
firebase emulator:start   # Run local emulator
```

### Admin Tasks

**List Users**
```bash
npm run admin:users       # List all users
```

**Set Admin Claim**
```bash
npm run admin:set "user-id"  # Make user admin
```

**Send FCM Notification**
```bash
npm run admin:fcm         # Send test notification
```

**Export Collection**
```bash
npm run admin:export campaigns  # Export data
```

## Performance & Analytics

### Bundle Analysis
```bash
npm run perf:breakdown    # Show bundle breakdown
npm run perf:budget       # Check against budget
npm run perf:max-file     # Find largest files
npm run perf:analyze      # Custom analysis
```

### Analytics
```bash
npm run analytics:scan    # Scan analytics usage
npm run analytics:pii     # Detect PII in analytics
npm run analytics:report  # Full report
```

### Reading Level
```bash
npm run read:level        # Analyze text complexity
```

## Validation & Checks

### Structure Validation
```bash
npm run validate:structure         # Check folder structure
npm run validate:structure:verbose # Detailed report
npm run validate:structure:report  # Save to file
```

### Security Validation
```bash
npm run security:validate         # Check security
npm run security:test             # Run security tests
npm run security:all              # Full audit
```

### BYOC Validation
```bash
npm run byoc:test         # Test BYOC mode
npm run byoc:validate     # Validate BYOC setup
```

## Debugging

### React DevTools
```bash
# Attach debugger to running app
npx react-native log-ios    # iOS logs
npx react-native log-android # Android logs
```

### Expo Doctor
```bash
npx expo doctor   # Check environment setup
```

### View Logs
```bash
# In development server
# Press 'j' for logs (iOS)
# Press 'a' for logs (Android)
```

### Performance Profiling
```tsx
// In component
import { useRenderPerformance } from '../utils/optimization';

export function MyComponent() {
  useRenderPerformance('MyComponent', 50); // Warn if >50ms
  return <View>...</View>;
}
```

## E2E Testing

### Run Maestro Tests
```bash
npm run test:e2e:maestro

# Run specific test
maestro test e2e/maestro/auth-flow.yaml
```

### Run Espresso Tests (Android)
```bash
npm run test:e2e:espresso
```

## Building for Release

### EAS Build

**Development Build**
```bash
npm run devclient:build:android
npm run devclient:build:ios
```

**Production Build**
```bash
eas build --platform all
```

### EAS Update (OTA)
```bash
# Publish update to production
eas update --channel production

# View updates
eas update --list
```

### Rebuilding for Specific Device
```bash
npm run rebuild:android   # Clean rebuild for Android
npm run rebuild:ios       # Clean rebuild for iOS
```

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear all caches
npm run metro:clear

# Or manually
rm -rf ~/.metro-cache
rm -rf .expo
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npx expo install
```

### Type Errors
```bash
# Reinstall types
npm install --save-dev @types/react-native

# Clear TypeScript cache
rm -rf .tsc-cache
npx tsc --noEmit
```

### Firebase Issues
```bash
# Verify config
npm run validate

# Check rules syntax
npm run rules:deploy --dry-run
```

### Build Issues
```bash
# iOS
cd ios
pod install
cd ..

# Android
./gradlew clean
```

## IDE Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier - Code formatter
- React Native Tools
- Firebase Explorer
- Zod Schema Explorer

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Common Tasks

### Adding a New Dependency
```bash
npm install package-name
npx expo install  # Ensure expo compatibility
npm run lint      # Check for issues
```

### Creating a New Screen
1. Create file in `app/(tabs)/name.tsx`
2. Use `ResponsiveScreenWrapper` for layout
3. Add to tab navigator in `app/_layout.tsx`
4. Create tests in `__tests__/screens/`

### Adding Translations
1. Add key to `locales/en/common.json`
2. Add to other languages
3. Use in component: `const { t } = useTranslation(); t('key')`
4. Run `npm run i18n:validate`

### Adding Validations
1. Define Zod schema in `types/validation.ts`
2. Use `useFormValidation` hook
3. Apply to form component
4. Add tests in `__tests__/validation.test.ts`

---

**Last Updated:** January 9, 2026  
**Status:** Current
