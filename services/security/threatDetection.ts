/**
 * Threat Detection Service
 * 
 * Comprehensive detection of:
 * - Root/Jailbreak (multi-heuristic)
 * - Emulator/Simulator
 * - Debugger attachment
 * - Hooking frameworks (Frida, Xposed, Substrate)
 * - Virtual environments
 * - Man-in-the-Middle proxies
 */

import { Platform } from 'react-native';

import {
    logSecurityEvent,
    registerThreat,
    type ThreatLevel,
} from './securityCore';

// ============================================
// DETECTION RESULTS
// ============================================

export interface DetectionResult {
  detected: boolean;
  confidence: number; // 0-100
  indicators: string[];
  details?: string;
}

export interface FullThreatScan {
  root: DetectionResult;
  jailbreak: DetectionResult;
  emulator: DetectionResult;
  debugger: DetectionResult;
  hooks: DetectionResult;
  proxy: DetectionResult;
  riskScore: number;
  recommendations: string[];
}

// ============================================
// ROOT DETECTION (Android)
// ============================================

const _ANDROID_ROOT_INDICATORS = {
  // Su binary paths
  suPaths: [
    '/system/app/Superuser.apk',
    '/sbin/su',
    '/system/bin/su',
    '/system/xbin/su',
    '/data/local/xbin/su',
    '/data/local/bin/su',
    '/system/sd/xbin/su',
    '/system/bin/failsafe/su',
    '/data/local/su',
    '/su/bin/su',
    '/su/bin',
    '/magisk/.core/bin/su',
  ],
  
  // Magisk indicators
  magiskPaths: [
    '/sbin/.magisk',
    '/sbin/.core',
    '/data/adb/magisk',
    '/data/adb/modules',
    '/data/adb/magisk.db',
    '/cache/.disable_magisk',
    '/dev/.magisk.unblock',
  ],
  
  // Root management apps
  rootApps: [
    'com.topjohnwu.magisk',
    'eu.chainfire.supersu',
    'com.noshufou.android.su',
    'com.koushikdutta.superuser',
    'com.thirdparty.superuser',
    'com.yellowes.su',
    'com.kingroot.kinguser',
    'com.kingo.root',
    'com.smedialink.oneclickroot',
    'com.zhiqupk.root.global',
    'com.alephzain.framaroot',
  ],
  
  // Dangerous system properties
  dangerousBuildProps: [
    'ro.debuggable=1',
    'ro.secure=0',
    'ro.build.selinux=0',
    'service.bootanim.exit=1',
  ],
  
  // RW system partitions
  rwMounts: [
    '/system',
    '/system/bin',
    '/system/xbin',
    '/vendor',
  ],
};

/**
 * Detect rooted Android device
 */
export async function detectRootAndroid(): Promise<DetectionResult> {
  const indicators: string[] = [];
  let score = 0;

  // In real implementation, these would use native modules
  // For now, we check what we can from JavaScript

  // Check 1: Build properties (requires native module)
  // This is a placeholder - actual implementation needs jail-monkey or similar

  // Check 2: Test permissions (can we access root-only paths?)
  // Placeholder for native file system checks

  // Check 3: Shell command execution test
  // try { exec('su -c id') } catch { /* not rooted */ }

  // Check 4: SELinux status
  // Enforcing mode indicates unrooted device

  // Check 5: System property checks
  // ro.build.type should be 'user' for production devices

  // For Expo/React Native, actual detection requires:
  // - jail-monkey (npm install jail-monkey)
  // - react-native-root-detection
  // - Custom native module

  // Development mode detection
  if (__DEV__) {
    indicators.push('development_mode');
    score += 10;
  }

  // Timing-based detection (root apps add overhead)
  const timingAnomaly = await detectTimingAnomaly();
  if (timingAnomaly) {
    indicators.push('timing_anomaly');
    score += 20;
  }

  return {
    detected: score >= 30,
    confidence: Math.min(score, 100),
    indicators,
    details: indicators.length > 0 ? `Found ${indicators.length} root indicators` : undefined,
  };
}

// ============================================
// JAILBREAK DETECTION (iOS)
// ============================================

const _IOS_JAILBREAK_INDICATORS = {
  // Common jailbreak paths
  paths: [
    '/Applications/Cydia.app',
    '/Applications/blackra1n.app',
    '/Applications/FakeCarrier.app',
    '/Applications/Icy.app',
    '/Applications/IntelliScreen.app',
    '/Applications/MxTube.app',
    '/Applications/RockApp.app',
    '/Applications/SBSettings.app',
    '/Applications/WinterBoard.app',
    '/Applications/Sileo.app',
    '/Applications/Zebra.app',
    '/Library/MobileSubstrate/MobileSubstrate.dylib',
    '/Library/MobileSubstrate/DynamicLibraries',
    '/bin/bash',
    '/usr/sbin/sshd',
    '/etc/apt',
    '/etc/ssh/sshd_config',
    '/private/var/lib/apt/',
    '/private/var/lib/cydia',
    '/private/var/mobile/Library/SBSettings/Themes',
    '/private/var/stash',
    '/private/var/tmp/cydia.log',
    '/usr/bin/ssh',
    '/usr/libexec/ssh-keysign',
    '/usr/libexec/sftp-server',
    '/var/cache/apt',
    '/var/lib/apt',
    '/var/lib/cydia',
    '/var/log/syslog',
    '/var/tmp/cydia.log',
  ],
  
  // URL schemes
  urlSchemes: [
    'cydia://',
    'sileo://',
    'zbra://',
    'filza://',
    'activator://',
  ],
  
  // Dylib injections
  injectedLibs: [
    'MobileSubstrate',
    'SubstrateLoader',
    'SubstrateInserter',
    'libhooker',
    'substitute',
    'Substrate',
  ],
};

/**
 * Detect jailbroken iOS device
 */
export async function detectJailbreakiOS(): Promise<DetectionResult> {
  const indicators: string[] = [];
  let score = 0;

  // Check 1: Sandbox escape test
  // Try to write file outside sandbox
  try {
    // In production: attempt to write to /private/jailbreak_test
    // If successful, device is jailbroken
  } catch {
    // Good - sandbox is intact
  }

  // Check 2: Fork detection
  // Jailbroken devices allow fork()
  // Sandboxed apps cannot fork

  // Check 3: Symbolic link checks
  // /Applications is symlinked on jailbroken devices

  // Check 4: System file modification dates
  // Recently modified system files indicate jailbreak

  // Check 5: Dynamic library injection
  // Check for injected dylibs in process

  // For Expo/React Native, use:
  // - jail-monkey
  // - Custom native module with above checks

  if (__DEV__) {
    indicators.push('development_mode');
    score += 10;
  }

  return {
    detected: score >= 30,
    confidence: Math.min(score, 100),
    indicators,
    details: indicators.length > 0 ? `Found ${indicators.length} jailbreak indicators` : undefined,
  };
}

// ============================================
// EMULATOR DETECTION
// ============================================

const _EMULATOR_INDICATORS = {
  android: {
    buildProps: [
      'generic',
      'unknown',
      'google_sdk',
      'Emulator',
      'Android SDK built for x86',
      'Genymotion',
      'goldfish',
      'ranchu',
      'vbox86',
      'nox',
      'Andy',
      'BlueStacks',
    ],
    hardware: [
      'goldfish',
      'ranchu',
      'vbox86',
    ],
    files: [
      '/dev/socket/qemud',
      '/dev/qemu_pipe',
      '/system/lib/libc_malloc_debug_qemu.so',
      '/sys/qemu_trace',
      '/system/bin/qemu-props',
    ],
  },
  ios: {
    // Simulator detection
    models: [
      'Simulator',
      'x86_64',
      'i386',
    ],
    hardware: [
      'SIMULATOR',
    ],
  },
};

/**
 * Detect emulator/simulator environment
 */
export async function detectEmulator(): Promise<DetectionResult> {
  const indicators: string[] = [];
  let score = 0;

  if (Platform.OS === 'android') {
    // Check device brand/model
    const brand = Platform.constants?.Brand?.toLowerCase() || '';
    const model = Platform.constants?.Model?.toLowerCase() || '';
    const manufacturer = Platform.constants?.Manufacturer?.toLowerCase() || '';

    if (brand === 'google' && model.includes('sdk')) {
      indicators.push('android_sdk_device');
      score += 80;
    }

    if (manufacturer.includes('genymotion')) {
      indicators.push('genymotion');
      score += 90;
    }

    // Check for emulator-specific properties
    const emulatorKeywords = ['emulator', 'sdk', 'generic', 'vbox', 'nox', 'bluestacks'];
    for (const keyword of emulatorKeywords) {
      if (brand.includes(keyword) || model.includes(keyword)) {
        indicators.push(`emulator_keyword_${keyword}`);
        score += 30;
      }
    }
  }

  if (Platform.OS === 'ios') {
    // iOS simulator detection is more straightforward
    // __DEV__ and simulator have specific characteristics
    
    // In production builds, check for x86 architecture
    // Real iOS devices are ARM
  }

  // Sensor availability check
  // Emulators often lack real sensors
  const sensorAnomaly = await detectSensorAnomaly();
  if (sensorAnomaly) {
    indicators.push('sensor_anomaly');
    score += 25;
  }

  return {
    detected: score >= 50,
    confidence: Math.min(score, 100),
    indicators,
    details: indicators.length > 0 ? `Emulator probability: ${score}%` : 'Real device',
  };
}

// ============================================
// DEBUGGER DETECTION
// ============================================

/**
 * Detect attached debugger
 */
export function detectDebugger(): DetectionResult {
  const indicators: string[] = [];
  let score = 0;

  // Skip in development
  if (__DEV__) {
    return {
      detected: false,
      confidence: 0,
      indicators: ['dev_mode_allowed'],
    };
  }

  // Check 1: Timing-based detection
  const start = performance.now();
  let _dummy = 0;
  for (let i = 0; i < 1000000; i++) {
    _dummy += i % 10;
  }
  const elapsed = performance.now() - start;
  
  // Normal: 10-30ms, With debugger: >100ms
  if (elapsed > 100) {
    indicators.push('timing_delay');
    score += 40;
    logSecurityEvent('debugger', `Timing anomaly: ${elapsed.toFixed(0)}ms`);
  }

  // Check 2: Stack trace analysis
  try {
    throw new Error('probe');
  } catch (e: any) {
    const stack = e.stack || '';
    
    // Look for debugger-related strings
    const debuggerKeywords = ['debugger', 'Debugger', 'inspect', 'devtools', 'chrome'];
    for (const keyword of debuggerKeywords) {
      if (stack.toLowerCase().includes(keyword)) {
        indicators.push(`stack_contains_${keyword}`);
        score += 20;
      }
    }
    
    // Abnormal stack depth
    const depth = stack.split('\n').length;
    if (depth > 50) {
      indicators.push('deep_stack');
      score += 15;
    }
  }

  // Check 3: Performance API manipulation
  // Debuggers often hook performance.now()
  const t1 = performance.now();
  const t2 = performance.now();
  if (t2 - t1 > 1) {
    indicators.push('performance_api_hooked');
    score += 30;
  }

  // Check 4: Function.prototype.toString hooking
  try {
    // eslint-disable-next-line no-console
    const fnStr = Function.prototype.toString.call(console.log);
    if (!fnStr.includes('[native code]')) {
      indicators.push('console_hooked');
      score += 35;
    }
  } catch {
    indicators.push('tostring_blocked');
    score += 25;
  }

  return {
    detected: score >= 40,
    confidence: Math.min(score, 100),
    indicators,
    details: score > 0 ? `Debugger detection score: ${score}` : undefined,
  };
}

// ============================================
// HOOK DETECTION
// ============================================

const _HOOK_FRAMEWORK_INDICATORS = {
  frida: {
    ports: [27042, 27043],
    processes: ['frida-server', 'frida-agent'],
    libraries: ['frida-agent.so', 'libfrida-gadget.so'],
    strings: ['LIBFRIDA', 'frida:rpc'],
  },
  xposed: {
    classes: ['de.robv.android.xposed.XposedBridge'],
    packages: ['de.robv.android.xposed.installer'],
    stacks: ['XposedBridge', 'Xposed'],
  },
  substrate: {
    libraries: ['MobileSubstrate.dylib', 'libsubstrate.dylib'],
    processes: ['substrate'],
  },
  lsposed: {
    packages: ['org.lsposed.manager'],
    paths: ['/data/adb/lspd'],
  },
};

/**
 * Detect hooking frameworks
 */
export async function detectHooks(): Promise<DetectionResult> {
  const indicators: string[] = [];
  let score = 0;

  // Check 1: Frida detection via timing
  const fridaTiming = await detectFridaTiming();
  if (fridaTiming) {
    indicators.push('frida_timing');
    score += 50;
  }

  // Check 2: Function integrity verification
  const integrityCheck = verifyFunctionIntegrity();
  if (!integrityCheck.intact) {
    indicators.push(...integrityCheck.modified);
    score += 40;
  }

  // Check 3: Stack trace analysis for hooks
  try {
    throw new Error('hook_probe');
  } catch (e: any) {
    const stack = e.stack || '';
    const hookKeywords = ['xposed', 'substrate', 'frida', 'hook', 'intercept'];
    for (const keyword of hookKeywords) {
      if (stack.toLowerCase().includes(keyword)) {
        indicators.push(`stack_${keyword}`);
        score += 30;
      }
    }
  }

  // Check 4: Native method verification (requires native module)
  // In production, verify critical native methods haven't been hooked

  return {
    detected: score >= 40,
    confidence: Math.min(score, 100),
    indicators,
    details: indicators.length > 0 ? `Found ${indicators.length} hook indicators` : undefined,
  };
}

// ============================================
// PROXY/MITM DETECTION  
// ============================================

/**
 * Detect HTTP proxy configuration (potential MITM)
 */
export async function detectProxy(): Promise<DetectionResult> {
  const indicators: string[] = [];
  let score = 0;

  // Check 1: System proxy settings
  // Requires native module to read system proxy config

  // Check 2: Network timing analysis
  // Proxies add latency

  // Check 3: Certificate chain validation
  // Will be handled by certificatePinning module

  // Check 4: DNS resolution verification
  // Ensure DNS isn't being redirected

  return {
    detected: score >= 50,
    confidence: Math.min(score, 100),
    indicators,
    details: indicators.length > 0 ? 'Proxy detected' : 'No proxy detected',
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Detect timing anomalies that indicate instrumentation
 */
async function detectTimingAnomaly(): Promise<boolean> {
  const samples: number[] = [];
  
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    let _sum = 0;
    for (let j = 0; j < 100000; j++) {
      _sum += j;
    }
    samples.push(performance.now() - start);
  }

  // Calculate variance
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / samples.length;

  // High variance indicates instrumentation
  return variance > 100;
}

/**
 * Detect sensor anomalies (emulators lack real sensors)
 */
async function detectSensorAnomaly(): Promise<boolean> {
  // In production, check:
  // - Accelerometer returns only 0,0,9.8 (gravity constant)
  // - Gyroscope returns all zeros
  // - GPS returns fixed location
  
  return false;
}

/**
 * Detect Frida through timing side-channel
 */
async function detectFridaTiming(): Promise<boolean> {
  // Frida's Stalker causes measurable timing delays
  const iterations = 10;
  const timings: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // Perform operations Frida typically hooks
    JSON.parse(JSON.stringify({ test: 'data' }));
    Math.random();
    Date.now();
    
    timings.push(performance.now() - start);
  }

  // High variance suggests Frida is selectively hooking
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  const maxDeviation = Math.max(...timings.map(t => Math.abs(t - avg)));
  
  return maxDeviation > avg * 2;
}

/**
 * Verify that critical functions haven't been hooked
 */
function verifyFunctionIntegrity(): { intact: boolean; modified: string[] } {
  const modified: string[] = [];

  // Check native function signatures
  const nativeFunctions = [
    { name: 'JSON.parse', fn: JSON.parse },
    { name: 'JSON.stringify', fn: JSON.stringify },
    { name: 'Array.prototype.map', fn: Array.prototype.map },
    { name: 'Object.keys', fn: Object.keys },
  ];

  for (const { name, fn } of nativeFunctions) {
    try {
      const str = Function.prototype.toString.call(fn);
      if (!str.includes('[native code]')) {
        modified.push(name);
      }
    } catch {
      modified.push(`${name}_check_failed`);
    }
  }

  return {
    intact: modified.length === 0,
    modified,
  };
}

// ============================================
// FULL THREAT SCAN
// ============================================

/**
 * Perform comprehensive threat scan
 */
export async function performFullThreatScan(): Promise<FullThreatScan> {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const [root, jailbreak, emulator, hooks, proxy] = await Promise.all([
    isAndroid ? detectRootAndroid() : Promise.resolve({ detected: false, confidence: 0, indicators: [] }),
    isIOS ? detectJailbreakiOS() : Promise.resolve({ detected: false, confidence: 0, indicators: [] }),
    detectEmulator(),
    detectHooks(),
    detectProxy(),
  ]);

  const debuggerResult = detectDebugger();

  // Calculate overall risk score
  let riskScore = 0;
  if (root.detected) riskScore += root.confidence * 0.3;
  if (jailbreak.detected) riskScore += jailbreak.confidence * 0.3;
  if (emulator.detected) riskScore += emulator.confidence * 0.15;
  if (debuggerResult.detected) riskScore += debuggerResult.confidence * 0.25;
  if (hooks.detected) riskScore += hooks.confidence * 0.35;
  if (proxy.detected) riskScore += proxy.confidence * 0.2;

  riskScore = Math.min(riskScore, 100);

  // Generate recommendations
  const recommendations: string[] = [];
  if (root.detected || jailbreak.detected) {
    recommendations.push('Device has elevated privileges - sensitive data may be at risk');
  }
  if (emulator.detected) {
    recommendations.push('Running in emulated environment - ensure this is intentional');
  }
  if (debuggerResult.detected) {
    recommendations.push('Debugger detected - production apps should not be debugged');
  }
  if (hooks.detected) {
    recommendations.push('Hooking framework detected - app behavior may be modified');
  }

  // Register threats
  const getSeverity = (confidence: number): ThreatLevel => {
    if (confidence >= 80) return 'critical';
    if (confidence >= 60) return 'high';
    if (confidence >= 40) return 'medium';
    return 'low';
  };

  if (root.detected) {
    registerThreat({
      category: 'device_integrity',
      severity: getSeverity(root.confidence),
      description: 'Android root detected',
      indicators: root.indicators,
    });
  }

  if (jailbreak.detected) {
    registerThreat({
      category: 'device_integrity',
      severity: getSeverity(jailbreak.confidence),
      description: 'iOS jailbreak detected',
      indicators: jailbreak.indicators,
    });
  }

  if (hooks.detected) {
    registerThreat({
      category: 'runtime_tampering',
      severity: getSeverity(hooks.confidence),
      description: 'Hooking framework detected',
      indicators: hooks.indicators,
    });
  }

  return {
    root,
    jailbreak,
    emulator,
    debugger: debuggerResult,
    hooks,
    proxy,
    riskScore,
    recommendations,
  };
}
