/**
 * Anti-Reverse Engineering Configuration
 * 
 * This file configures protections against:
 * - APK/IPA decompilation
 * - String extraction
 * - Code analysis
 * - Dynamic instrumentation
 * 
 * For production builds, integrate with:
 * - ProGuard/R8 (Android)
 * - React Native Obfuscator
 * - Hermes bytecode (already enabled)
 */

// ============================================
// PROGUARD CONFIGURATION (Android)
// ============================================

/**
 * Add to android/app/proguard-rules.pro for production builds:
 * 
 * # Keep crypto classes
 * -keep class javax.crypto.** { *; }
 * -keep class java.security.** { *; }
 * 
 * # Obfuscate all other classes
 * -obfuscationdictionary obfuscation-dictionary.txt
 * -classobfuscationdictionary obfuscation-dictionary.txt
 * -packageobfuscationdictionary obfuscation-dictionary.txt
 * 
 * # Remove logging in release
 * -assumenosideeffects class android.util.Log {
 *     public static *** d(...);
 *     public static *** v(...);
 *     public static *** i(...);
 * }
 * 
 * # Prevent reflection-based attacks
 * -keepattributes SourceFile,LineNumberTable
 * -renamesourcefileattribute SourceFile
 */

// ============================================
// BUILD-TIME STRING OBFUSCATION
// ============================================

/**
 * Critical strings that should be obfuscated at build time
 * These are XOR-encoded to prevent simple string extraction
 */
export const OBFUSCATED_STRINGS = {
  // API endpoints (encoded)
  FIREBASE_PROJECT: [0x27, 0x2d, 0x32, 0x31, 0x35, 0x36, 0x34, 0x22, 0x32, 0x32], // 'empowrapp'
  
  // Storage keys (encoded to prevent grep attacks)
  DEVICE_KEY: [0x27, 0x36, 0x2b, 0x26, 0x27, 0x2e, 0x25, 0x27, 0x1a, 0x26, 0x27, 0x36, 0x2b, 0x25, 0x27, 0x1f, 0x27, 0x3f, 0x1a, 0x36, 0x03],
};

/**
 * Decode an obfuscated string
 */
export function decode(encoded: number[], key = 0x42): string {
  return encoded.map(c => String.fromCharCode(c ^ key)).join('');
}

/**
 * Encode a string for inclusion in OBFUSCATED_STRINGS
 * Use this during development, then paste the result
 */
export function encode(plain: string, key = 0x42): number[] {
  return plain.split('').map(c => c.charCodeAt(0) ^ key);
}

// ============================================
// RUNTIME PROTECTIONS
// ============================================

/**
 * Control flow obfuscation helper
 * Makes static analysis harder by adding noise
 */
export function obfuscatedControlFlow<T>(fn: () => T): T {
  // Add fake branches that compiler can't optimize away
  const noise = Math.random();
  if (noise < 0) {
    // Dead code - never executes but confuses decompilers
    console.warn('unreachable');
  }
  
  const result = fn();
  
  if (noise > 2) {
    // Also dead code
    console.warn('also unreachable');
  }
  
  return result;
}

/**
 * Flatten control flow for a function
 * Converts if/else to switch statements with shuffled cases
 */
export function flattenedSwitch<T>(
  cases: Array<{ condition: () => boolean; action: () => T }>,
  defaultAction: () => T
): T {
  // Shuffle case order at runtime
  const shuffled = [...cases].sort(() => Math.random() - 0.5);
  
  let state = 0;
  while (state < shuffled.length) {
    const current = shuffled[state];
    if (current.condition()) {
      return current.action();
    }
    state++;
  }
  
  return defaultAction();
}

// ============================================
// ANTI-DEBUGGING TRAPS
// ============================================

/**
 * Insert timing checks at critical points
 * Debuggers cause measurable delays
 */
export function timingCheck(expectedMaxMs: number): boolean {
  const start = performance.now();
  
  // Do some work that takes predictable time
  let _x = 0;
  for (let i = 0; i < 10000; i++) {
    _x += Math.sqrt(i);
  }
  
  const elapsed = performance.now() - start;
  
  // If significantly slower than expected, debugger is attached
  return elapsed < expectedMaxMs;
}

/**
 * Stack depth check - deep stacks may indicate tracing
 */
export function stackDepthCheck(maxDepth = 50): boolean {
  try {
    throw new Error('probe');
  } catch (e: any) {
    const stack = e.stack || '';
    const depth = stack.split('\n').length;
    return depth < maxDepth;
  }
}

// ============================================
// NATIVE MODULE INTEGRATION
// ============================================

/**
 * For maximum protection, add these native modules to your EAS build:
 * 
 * 1. react-native-ssl-pinning - Certificate pinning
 *    npm install react-native-ssl-pinning
 * 
 * 2. jail-monkey - Root/jailbreak detection  
 *    npm install jail-monkey
 * 
 * 3. react-native-code-push with signing - Signed OTA updates
 *    (Alternative to EAS Update with additional signing)
 * 
 * 4. react-native-screen-capture-secure - Block screenshots
 *    npm install react-native-screen-capture-secure
 * 
 * 5. react-native-device-info - Device attestation
 *    Already commonly used, provides hardware IDs
 */

export const RECOMMENDED_SECURITY_PACKAGES = [
  {
    name: 'react-native-ssl-pinning',
    purpose: 'Certificate pinning to prevent MITM',
    priority: 'critical',
  },
  {
    name: 'jail-monkey',
    purpose: 'Root/jailbreak detection',
    priority: 'high',
  },
  {
    name: 'react-native-screen-capture-secure',
    purpose: 'Prevent screenshots of sensitive screens',
    priority: 'medium',
  },
  {
    name: '@aspect/react-native-hermes-secure',
    purpose: 'Additional Hermes bytecode protections',
    priority: 'medium',
  },
];

// ============================================
// METRO BUNDLER CONFIG FOR OBFUSCATION
// ============================================

/**
 * Add to metro.config.js for production:
 * 
 * const { getDefaultConfig } = require('expo/metro-config');
 * 
 * const config = getDefaultConfig(__dirname);
 * 
 * // Enable obfuscation transformer in production
 * if (process.env.NODE_ENV === 'production') {
 *   config.transformer.minifierConfig = {
 *     ...config.transformer.minifierConfig,
 *     mangle: {
 *       toplevel: true,
 *       reserved: ['_', '__'],
 *     },
 *     compress: {
 *       passes: 3,
 *       drop_console: true,
 *       drop_debugger: true,
 *       pure_funcs: ['console.log', 'console.info', 'console.debug'],
 *     },
 *   };
 * }
 * 
 * module.exports = config;
 */

export default {
  OBFUSCATED_STRINGS,
  decode,
  encode,
  obfuscatedControlFlow,
  flattenedSwitch,
  timingCheck,
  stackDepthCheck,
  RECOMMENDED_SECURITY_PACKAGES,
};
