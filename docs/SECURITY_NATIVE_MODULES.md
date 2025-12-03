# Security Native Modules - Implementation Guide

## Current Status

The security modules `react-native-ssl-pinning` and `jail-monkey` are **NOT** currently in `package.json`. The current implementation uses **placeholder detection** with graceful degradation.

## Why Placeholders?

1. **Expo Go Compatibility**: Native modules cannot run in Expo Go development mode
2. **EAS Build Integration**: These modules must be bundled into the native binary at EAS build time
3. **Graceful Degradation**: App continues to function safely without these modules

## Implementation Path

### Option A: Add Native Modules (Full Production Security)

```bash
# Step 1: Install the packages
npm install react-native-ssl-pinning jail-monkey

# Step 2: Update eas.json to include native build plugins (if needed)
# Most are auto-linked by React Native 0.60+

# Step 3: Build with EAS
npx eas build --profile production --platform all
```

### Option B: Keep Placeholders (Current State)

The current implementation:
- ✅ Works in Expo Go
- ✅ Works in EAS dev-client builds
- ✅ Logs warnings for security audits
- ⚠️ Does not provide actual root/jailbreak detection
- ⚠️ Does not provide certificate pinning

## Current Security Implementation

### `services/security/deviceSecurity.ts`
```typescript
// Current placeholder implementation
private async checkAndroidRoot(): Promise<boolean> {
  logger.warn('Android root detection (placeholder implementation)');
  return false; // Always returns false - PLACEHOLDER
}

private async checkIOSJailbreak(): Promise<boolean> {
  logger.warn('iOS jailbreak detection (placeholder implementation)');  
  return false; // Always returns false - PLACEHOLDER
}
```

## Full Implementation with jail-monkey

Once `jail-monkey` is installed:

```typescript
import JailMonkey from 'jail-monkey';

private async checkAndroidRoot(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  
  try {
    return JailMonkey.isJailBroken();
  } catch (error) {
    logger.error('Root detection failed:', error);
    return false;
  }
}

private async checkIOSJailbreak(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  
  try {
    return JailMonkey.isJailBroken();
  } catch (error) {
    logger.error('Jailbreak detection failed:', error);
    return false;
  }
}

private async detectEmulator(): Promise<boolean> {
  try {
    return !JailMonkey.isOnExternalStorage();
  } catch (error) {
    return false;
  }
}

private async detectDebugging(): Promise<boolean> {
  try {
    return JailMonkey.isDebuggedMode() || __DEV__;
  } catch (error) {
    return false;
  }
}
```

## Full Implementation with SSL Pinning

Once `react-native-ssl-pinning` is installed:

```typescript
import { fetch as pinnedFetch } from 'react-native-ssl-pinning';

// In your API client
async function secureFetch(url: string, options: RequestInit) {
  const sslPinningOptions = {
    ...options,
    sslPinning: {
      certs: ['your_cert_name'] // .cer files in android/app/src/main/assets/
    },
    timeoutInterval: 30000,
  };
  
  return pinnedFetch(url, sslPinningOptions);
}
```

## Certificate Setup for SSL Pinning

### Android
Place certificate files in:
```
android/app/src/main/assets/
├── your_api_cert.cer
└── firebase_cert.cer
```

### iOS
Add certificates to Xcode project and include in bundle.

## Recommended Production Setup

```json
// package.json additions
{
  "dependencies": {
    "jail-monkey": "^2.6.0",
    "react-native-ssl-pinning": "^1.5.8"
  }
}
```

## Risk Assessment Without These Modules

| Check | Current State | Risk Level |
|-------|--------------|------------|
| Root Detection | Placeholder (always false) | Medium |
| Jailbreak Detection | Placeholder (always false) | Medium |
| Emulator Detection | Placeholder (always false) | Low |
| Debug Detection | Working (checks `__DEV__`) | ✅ OK |
| Certificate Pinning | Not implemented | High |
| Biometric Auth | Working (expo-local-auth) | ✅ OK |

## When to Implement

- **Development**: Keep placeholders for Expo Go compatibility
- **Beta Testing**: Consider adding for EAS builds
- **Production**: Strongly recommended for security-sensitive data

## Notes

- jail-monkey is actively maintained (last update: 2023)
- react-native-ssl-pinning may have issues with RN 0.71+ - verify compatibility
- Alternative: `react-native-cert-pinner` for newer React Native versions
- Consider `expo-device` for basic emulator detection (already installed)

---

**Last Updated**: Session continuation
**Status**: Documented for future implementation
