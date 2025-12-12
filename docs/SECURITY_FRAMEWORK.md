# Security Framework - Maximum Protection

## Overview

The 3mpwr App implements a **fortress-grade security framework** that follows OWASP MASVS L2 + R (Resilience against reverse engineering) requirements. This document outlines all security features, their implementation, and how to use them.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Manager                          │
│              (Central Coordinator)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Device    │  │   Runtime   │  │      Network        │  │
│  │  Security   │  │  Protection │  │     Security        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │               │                    │               │
│  ┌──────▼──────┐  ┌─────▼────┐     ┌────────▼────────┐     │
│  │ Root/Jailb  │  │   RASP   │     │ Certificate Pin │     │
│  │ Detection   │  │  Engine  │     │     TLS 1.3     │     │
│  └─────────────┘  └──────────┘     └─────────────────┘     │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Biometric  │  │   Memory    │  │   Anti-Reverse      │  │
│  │    Auth     │  │ Protection  │  │   Engineering       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Security Services

### 1. Security Core (`securityCore.ts`)
Foundation for all security operations.

**Features:**
- Security state management
- Threat level calculation (none → low → medium → high → critical)
- Security event logging
- Policy enforcement
- Device fingerprinting

**Usage:**
```typescript
import { 
  getSecurityState, 
  registerThreat, 
  shouldAllowOperation 
} from '@/services/security';

// Check if operation should be allowed
const { allowed, reason } = shouldAllowOperation('sensitive');
if (!allowed) {
  console.warn('Operation blocked:', reason);
}
```

### 2. Threat Detection (`threatDetection.ts`)
Comprehensive device and runtime threat detection.

**Detects:**
- ✅ Rooted Android devices (su binary, Magisk, root apps)
- ✅ Jailbroken iOS devices (Cydia, sandbox escape, injected dylibs)
- ✅ Emulators/Simulators
- ✅ Attached debuggers (timing-based, stack analysis)
- ✅ Hooking frameworks (Frida, Xposed, Substrate, LSPosed)
- ✅ HTTP proxies (potential MITM)

**Usage:**
```typescript
import { performFullThreatScan } from '@/services/security';

const scan = await performFullThreatScan();
console.log('Risk Score:', scan.riskScore);
console.log('Recommendations:', scan.recommendations);
```

### 3. RASP Engine (`raspEngine.ts`)
Runtime Application Self-Protection with active monitoring.

**Features:**
- Continuous integrity monitoring (every 30 seconds)
- Behavioral anomaly detection
- Rate limiting (API calls, auth attempts)
- Automation detection (screen switching patterns)
- Configurable responses (log, warn, block, wipe, terminate)

**Usage:**
```typescript
import { 
  startRASPMonitoring, 
  trackAPICall,
  canAccessSensitiveScreen 
} from '@/services/security';

// Start monitoring
startRASPMonitoring({
  checkIntervalMs: 30000,
  response: {
    low: 'log',
    medium: 'warn',
    high: 'block',
    critical: 'wipe'
  }
});

// Track API calls for rate limiting
trackAPICall();

// Check before accessing sensitive screens
const { allowed, reason } = canAccessSensitiveScreen('evidence-locker');
```

### 4. Memory Protection (`memoryProtection.ts`)
Protects sensitive data in memory from extraction.

**Features:**
- XOR scrambling of sensitive data
- Automatic memory cleanup
- Periodic re-scrambling (defeats memory scanners)
- Secure string class with auto-expiry
- Wipe on app background

**Usage:**
```typescript
import { 
  SecureString, 
  startMemoryProtection,
  wipeAllProtectedData 
} from '@/services/security';

// Start protection
startMemoryProtection({
  wipeOnBackground: true,
  scrambleInterval: 30000
});

// Store sensitive data
const password = new SecureString('my-secret-password', { maxAge: 60000 });

// Use securely
password.use(value => {
  // value is available here
  authenticate(value);
}); // value goes out of scope

// Manual destruction
password.destroy();
```

### 5. Biometric Authentication (`biometricAuth.ts`)
Hardware-backed biometric authentication.

**Features:**
- Face ID / Touch ID (iOS)
- Fingerprint / Face Unlock (Android)
- Fallback to device passcode
- Lockout after failed attempts
- Biometric-protected storage

**Usage:**
```typescript
import { 
  isBiometricAvailable,
  authenticateWithBiometric,
  storeBiometricProtected 
} from '@/services/security';

// Check availability
if (await isBiometricAvailable()) {
  const result = await authenticateWithBiometric({
    promptMessage: 'Authenticate to view evidence',
    requireConfirmation: true
  });
  
  if (result.success) {
    // Access granted
  }
}

// Store with biometric protection
await storeBiometricProtected('encryption_key', myKey);
```

### 6. Anti-Reverse Engineering (`antiReverseEngineering.ts`)
Protection against code analysis and tampering.

**Features:**
- String obfuscation (XOR encoding)
- Control flow flattening
- Opaque predicates
- Anti-debugging traps
- Function integrity verification
- Protected function wrappers

**Usage:**
```typescript
import { 
  ObfuscatedString,
  obfuscatedExec,
  timingTrap,
  protectedFunction 
} from '@/services/security';

// Obfuscate sensitive strings
const apiKey = new ObfuscatedString('super-secret-key');
const value = apiKey.value; // Decoded at runtime

// Execute with obfuscation
const result = obfuscatedExec(() => {
  return sensitiveOperation();
});

// Detect debugging
if (timingTrap(50)) {
  console.warn('Debugger detected!');
}

// Protect critical functions
const secureAuth = protectedFunction(authenticate, () => {
  console.error('Function tampered!');
});
```

## Security Initialization

Security is automatically initialized when the app starts via `SecurityInit` component in `_layout.tsx`:

```typescript
import { initializeSecurity } from '@/services/security';

await initializeSecurity({
  enableTamperDetection: true,
  enableRootJailbreakCheck: true,
  enableIntegrityValidation: true,
  enableSecureStorage: true,
  enableRASP: true,
  enableMemoryProtection: true,
  enableBiometric: true,
  allowDebugging: __DEV__,
  raspCheckIntervalMs: 30000,
});
```

## Security Policies

### Default Policy
```typescript
{
  allowRootedDevices: false,      // Block on rooted devices
  allowDebugger: __DEV__,         // Only in development
  allowEmulator: __DEV__,         // Only in development
  requireBiometric: false,        // User configurable
  maxAuthAttempts: 5,             // Before lockout
  lockoutDurationMs: 15 * 60000,  // 15 minutes
  dataWipeOnThreat: false,        // Opt-in feature
}
```

### Sensitive Screens
These screens trigger enhanced security checks:
- `evidence-locker`
- `crisis-plan`
- `emergency-wallet`
- `medical-records`
- `safety-plan`
- `document-vault`

## Encryption

The app uses AES-256-GCM encryption with:
- PBKDF2 key derivation (310,000 iterations - OWASP 2024)
- Hardware-backed key storage (expo-secure-store)
- Unique IV per encryption operation
- HMAC-SHA256 integrity verification

## Production Build Security

### ProGuard (Android)
Add to `android/app/proguard-rules.pro`:
```
-obfuscationdictionary proguard-dict.txt
-classobfuscationdictionary proguard-dict.txt
-assumenosideeffects class android.util.Log { *; }
-optimizationpasses 5
```

### Metro Bundler
For production, enable:
- Console stripping (`drop_console: true`)
- Debugger stripping (`drop_debugger: true`)
- Aggressive minification

### Recommended Native Modules
For maximum protection in EAS production builds:

| Package | Purpose | Priority |
|---------|---------|----------|
| `react-native-ssl-pinning` | Certificate pinning | Critical |
| `jail-monkey` | Root/jailbreak detection | High |
| `react-native-screen-capture-secure` | Prevent screenshots | High |
| `react-native-encrypted-storage` | Hardware encryption | High |

## Threat Response Matrix

| Threat Level | Response | Actions |
|--------------|----------|---------|
| None | - | Normal operation |
| Low | Log | Record event, continue |
| Medium | Warn | Alert user, log |
| High | Block | Disable sensitive features |
| Critical | Wipe | Emergency data wipe, block |

## API Reference

### Core Functions
```typescript
// Initialization
initializeSecurity(config?: SecurityConfig): Promise<boolean>

// Status
getSecurityStatus(): SecurityStatus
getSecurityState(): SecurityState

// Operations
shouldAllowOperation(type: 'sensitive' | 'normal'): { allowed: boolean; reason?: string }
canAccessSensitiveScreen(screen: string): { allowed: boolean; reason?: string }

// RASP
startRASPMonitoring(config?: RASPConfig): void
stopRASPMonitoring(): void
trackAPICall(): void
trackScreenSwitch(screen: string): void
trackAuthAttempt(success: boolean): void

// Memory
startMemoryProtection(config?: MemoryConfig): void
wipeAllProtectedData(): void
SecureString(value: string, options?: { maxAge?: number }): SecureString

// Biometric
isBiometricAvailable(): Promise<boolean>
authenticateWithBiometric(config?: BiometricConfig): Promise<BiometricAuthResult>
```

## Security Logging

Security events are logged (without PII) for monitoring:
```typescript
logSecurityEvent('RASP', 'Violation detected', { severity: 'high' });
```

## Testing Security

In development mode (`__DEV__`):
- Debugger detection is skipped
- Root/jailbreak detection is relaxed
- RASP responses are logged only

For production testing, build with `NODE_ENV=production`.

## Compliance

This security implementation follows:
- **OWASP MASVS L2** - Standard Security
- **OWASP MASVS-R** - Resilience against reverse engineering
- **GDPR** - Data minimization, secure storage
- **SOC 2** - Access control, encryption

---

## Files Reference

| File | Purpose |
|------|---------|
| `security/index.ts` | Main export |
| `security/securityManager.ts` | Central coordinator |
| `security/securityCore.ts` | State management |
| `security/threatDetection.ts` | Threat scanning |
| `security/raspEngine.ts` | Runtime protection |
| `security/memoryProtection.ts` | Memory security |
| `security/biometricAuth.ts` | Biometric auth |
| `security/antiReverseEngineering.ts` | Anti-RE measures |
| `security/encryption.ts` | AES-256 encryption |
| `security/networkSecurity.ts` | TLS & pinning |
| `security/deviceSecurity.ts` | Device validation |
| `security/tamperDetection.ts` | Tamper monitoring |
| `security/appIntegrity.ts` | App integrity |
| `security/inputValidation.ts` | Input sanitization |
| `security/permissions.ts` | Permission control |

---

*Last updated: December 2024*
*Security Framework Version: 2.0 - Maximum Protection*
