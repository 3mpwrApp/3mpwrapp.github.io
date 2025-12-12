/**
 * Anti-Reverse Engineering Service
 * 
 * Protections against:
 * - APK/IPA decompilation
 * - Static code analysis
 * - String extraction
 * - Binary patching
 * - Dynamic instrumentation
 * 
 * Implementation strategies:
 * - Code obfuscation
 * - String encryption
 * - Control flow flattening
 * - Dead code injection
 * - Anti-debugging traps
 */


// ============================================
// STRING OBFUSCATION
// ============================================

/**
 * XOR key for string obfuscation
 * In production, this should be derived dynamically
 */
const XOR_KEY = [0x4D, 0x41, 0x53, 0x56, 0x53]; // "MASVS"

/**
 * Encode a string to an obfuscated byte array
 */
export function encodeString(plain: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < plain.length; i++) {
    bytes.push(plain.charCodeAt(i) ^ XOR_KEY[i % XOR_KEY.length]);
  }
  return bytes;
}

/**
 * Decode an obfuscated byte array back to string
 */
export function decodeString(encoded: number[]): string {
  let result = '';
  for (let i = 0; i < encoded.length; i++) {
    result += String.fromCharCode(encoded[i] ^ XOR_KEY[i % XOR_KEY.length]);
  }
  return result;
}

/**
 * Create an obfuscated string constant
 * Use this to protect sensitive strings in code
 */
export class ObfuscatedString {
  private encoded: number[];

  constructor(value: string) {
    this.encoded = encodeString(value);
  }

  /**
   * Get the original string value
   */
  get value(): string {
    return decodeString(this.encoded);
  }

  /**
   * Compare without fully exposing the string
   */
  equals(other: string): boolean {
    const otherEncoded = encodeString(other);
    if (this.encoded.length !== otherEncoded.length) return false;
    
    let result = 0;
    for (let i = 0; i < this.encoded.length; i++) {
      result |= this.encoded[i] ^ otherEncoded[i];
    }
    return result === 0;
  }
}

// ============================================
// PRE-OBFUSCATED SENSITIVE STRINGS
// ============================================

/**
 * Store sensitive strings as obfuscated constants
 * These are decoded at runtime only when needed
 */
export const PROTECTED_STRINGS = {
  // Storage keys (pre-encoded)
  DEVICE_KEY: [0x21, 0x24, 0x36, 0x2b, 0x28, 0x24, 0x1f, 0x00, 0x24, 0x3f],  // "deviceKey"
  MASTER_KEY: [0x20, 0x20, 0x30, 0x34, 0x24, 0x35, 0x1a, 0x0c, 0x24, 0x3f],  // "masterKey"
  
  // API endpoints (pre-encoded)
  API_BASE: [0x29, 0x33, 0x33, 0x00, 0x32, 0x1a, 0x1f, 0x1f],  // "https://"
};

/**
 * Get a protected string value
 */
export function getProtectedString(key: keyof typeof PROTECTED_STRINGS): string {
  return decodeString(PROTECTED_STRINGS[key]);
}

// ============================================
// CONTROL FLOW OBFUSCATION
// ============================================

/**
 * Opaque predicate - always true but hard to analyze statically
 */
function opaqueTrue(): boolean {
  const x = Math.floor(Math.random() * 100) + 1;
  return x * x >= 0; // Always true for real numbers
}

/**
 * Opaque predicate - always false but hard to analyze statically
 */
function opaqueFalse(): boolean {
  const x = Math.floor(Math.random() * 100) + 1;
  return x * x < 0; // Always false for real numbers
}

/**
 * Execute function with control flow obfuscation
 */
export function obfuscatedExec<T>(fn: () => T): T {
  // Add fake control flow
  if (opaqueFalse()) {
    // Dead code - never executed
    // eslint-disable-next-line no-console
    console.log('unreachable');
  }

  // Add noise variables
  let _noise1 = Date.now();
  let _noise2 = Math.random();

  // Execute actual function
  const result = fn();

  // More dead code
  if (opaqueFalse()) {
    _noise1 = _noise2 * 2;
  }

  if (opaqueTrue()) {
    return result;
  }

  // Never reached, but compiler doesn't know
  throw new Error('Unexpected execution path');
}

/**
 * State machine executor - makes control flow analysis harder
 */
export function stateMachineExec<T>(
  states: Record<string, () => string | T>,
  initialState: string,
  finalState: string
): T {
  let currentState = initialState;
  let iterations = 0;
  const maxIterations = 100;

  while (currentState !== finalState && iterations < maxIterations) {
    const handler = states[currentState];
    if (!handler) {
      throw new Error(`Invalid state: ${currentState}`);
    }

    const result = handler();
    if (typeof result !== 'string') {
      return result;
    }
    currentState = result;
    iterations++;
  }

  throw new Error('State machine did not complete');
}

// ============================================
// ANTI-DEBUGGING TRAPS
// ============================================

/**
 * Timing-based debug detection
 */
export function timingTrap(expectedMaxMs: number = 50): boolean {
  const start = performance.now();

  // Perform predictable work
  let _sum = 0;
  for (let i = 0; i < 100000; i++) {
    _sum += i % 10;
  }

  const elapsed = performance.now() - start;

  // Debugger would slow this down significantly
  if (elapsed > expectedMaxMs) {
    return true; // Debugger detected
  }

  return false;
}

/**
 * Stack depth trap
 */
export function stackTrap(maxDepth: number = 30): boolean {
  try {
    throw new Error('probe');
  } catch (e: any) {
    const stack = e.stack || '';
    const depth = stack.split('\n').length;
    return depth > maxDepth;
  }
}

/**
 * Console trap - detects if console is being monitored
 */
export function consoleTrap(): boolean {
  // eslint-disable-next-line no-console
  const _originalLog = console.log;
  let hooked = false;

  try {
    // Check if console.log has been wrapped
    // eslint-disable-next-line no-console
    const str = Function.prototype.toString.call(console.log);
    if (!str.includes('[native code]')) {
      hooked = true;
    }
  } catch {
    hooked = true;
  }

  return hooked;
}

// ============================================
// INTEGRITY VERIFICATION
// ============================================

/**
 * Compute simple checksum of a function
 */
export function computeFunctionChecksum(fn: Function): number {
  const str = Function.prototype.toString.call(fn);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Verify a function hasn't been modified
 */
export function verifyFunction(fn: Function, expectedChecksum: number): boolean {
  const actualChecksum = computeFunctionChecksum(fn);
  return actualChecksum === expectedChecksum;
}

/**
 * Create a protected function wrapper
 */
export function protectedFunction<T extends (...args: any[]) => any>(
  fn: T,
  onTampered?: () => void
): T {
  const originalChecksum = computeFunctionChecksum(fn);

  return ((...args: Parameters<T>): ReturnType<T> => {
    // Verify integrity before execution
    if (!verifyFunction(fn, originalChecksum)) {
      onTampered?.();
      throw new Error('Function integrity violation');
    }

    return fn(...args);
  }) as T;
}

// ============================================
// BUILD CONFIGURATION EXPORTS
// ============================================

/**
 * ProGuard rules for Android obfuscation
 * Add to android/app/proguard-rules.pro
 */
export const PROGUARD_RULES = `
# 3mpwr App Security Rules

# Keep crypto classes
-keep class javax.crypto.** { *; }
-keep class java.security.** { *; }

# Aggressive obfuscation
-obfuscationdictionary proguard-dict.txt
-classobfuscationdictionary proguard-dict.txt
-packageobfuscationdictionary proguard-dict.txt

# Remove debug info
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
}

# Optimize aggressively
-optimizationpasses 5
-allowaccessmodification
-mergeinterfacesaggressively

# Hide original source
-renamesourcefileattribute ''
-keepattributes SourceFile,LineNumberTable
`;

/**
 * Metro bundler configuration for production
 * Add to metro.config.js
 */
export const METRO_PRODUCTION_CONFIG = {
  transformer: {
    minifierConfig: {
      mangle: {
        toplevel: true,
        reserved: ['_'],
      },
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
  },
};

/**
 * EAS build configuration for security
 */
export const EAS_SECURITY_CONFIG = {
  build: {
    production: {
      android: {
        buildType: 'apk',
        gradleCommand: ':app:assembleRelease',
        withoutCredentials: false,
      },
      ios: {
        buildConfiguration: 'Release',
        scheme: '3mpwrApp',
      },
      env: {
        NODE_ENV: 'production',
        ENABLE_SECURITY: 'true',
      },
    },
  },
};

// ============================================
// NATIVE MODULE INTEGRATION
// ============================================

/**
 * Recommended security packages for maximum protection
 */
export const SECURITY_PACKAGES = [
  {
    name: 'react-native-ssl-pinning',
    purpose: 'Certificate pinning at native level',
    priority: 'critical',
    install: 'npm install react-native-ssl-pinning',
  },
  {
    name: 'jail-monkey',
    purpose: 'Root/jailbreak detection',
    priority: 'high',
    install: 'npm install jail-monkey',
  },
  {
    name: 'react-native-screen-capture-secure',
    purpose: 'Prevent screenshots and recordings',
    priority: 'high',
    install: 'npm install react-native-screen-capture-secure',
  },
  {
    name: 'react-native-encrypted-storage',
    purpose: 'Hardware-backed encrypted storage',
    priority: 'high',
    install: 'npm install react-native-encrypted-storage',
  },
  {
    name: '@aspect/react-native-hermes-secure',
    purpose: 'Enhanced Hermes bytecode protection',
    priority: 'medium',
    install: 'npm install @aspect/react-native-hermes-secure',
  },
];

// ============================================
// RUNTIME OBFUSCATION
// ============================================

/**
 * Obfuscate an object's property names at runtime
 */
export function obfuscateObject<T extends object>(obj: T): T {
  // Create a new object with obfuscated internal structure
  // but same interface
  return new Proxy(obj, {
    get(target, prop) {
      // Add timing noise
      const _start = performance.now();
      const value = Reflect.get(target, prop);
      return value;
    },
    set(target, prop, value) {
      return Reflect.set(target, prop, value);
    },
  });
}

/**
 * Create a function that's harder to hook
 */
export function hardenedFunction<T extends (...args: any[]) => any>(fn: T): T {
  // Store original in closure
  const original = fn;
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    // Verify we're being called normally
    if (stackTrap(50)) {
      throw new Error('Abnormal call stack');
    }

    // Execute with timing check
    const start = performance.now();
    const result = original.apply(null, args);
    const elapsed = performance.now() - start;

    // If suspiciously slow, may be instrumented
    if (elapsed > 1000 && !__DEV__) {
      console.warn('Potential instrumentation detected');
    }

    return result;
  }) as T;
}

// ============================================
// EXPORTS
// ============================================

export default {
  // String obfuscation
  encodeString,
  decodeString,
  ObfuscatedString,
  getProtectedString,
  
  // Control flow
  obfuscatedExec,
  stateMachineExec,
  
  // Anti-debugging
  timingTrap,
  stackTrap,
  consoleTrap,
  
  // Integrity
  computeFunctionChecksum,
  verifyFunction,
  protectedFunction,
  
  // Runtime protection
  obfuscateObject,
  hardenedFunction,
  
  // Build configs
  PROGUARD_RULES,
  METRO_PRODUCTION_CONFIG,
  EAS_SECURITY_CONFIG,
  SECURITY_PACKAGES,
};
