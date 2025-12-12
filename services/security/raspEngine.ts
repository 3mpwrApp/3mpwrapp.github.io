/**
 * RASP Engine - Runtime Application Self-Protection
 * 
 * Active defense system that monitors and responds to threats in real-time.
 * 
 * Features:
 * - Continuous threat monitoring
 * - Behavioral anomaly detection
 * - Automated threat response
 * - Rate limiting protection
 * - Function integrity verification
 * - Anti-automation detection
 */

import { AppState, type AppStateStatus } from 'react-native';

import { logError } from '../../utils/errorLogger';

import { wipeAllProtectedData } from './memoryProtection';
import {
    getSecurityState,
    logSecurityEvent,
    registerThreat,
    setBlocked,
    type ThreatLevel,
} from './securityCore';
import { detectDebugger, detectHooks } from './threatDetection';

// ============================================
// TYPES
// ============================================

export type RASPAction = 'log' | 'warn' | 'block' | 'wipe' | 'terminate';

export type ViolationType = 
  | 'root_detected'
  | 'debugger_attached'
  | 'hook_detected'
  | 'integrity_violation'
  | 'rate_limit_exceeded'
  | 'automation_detected'
  | 'brute_force'
  | 'ssl_bypass'
  | 'screen_recording'
  | 'memory_tampering';

export interface RASPConfig {
  enabled: boolean;
  checkIntervalMs: number;
  response: {
    low: RASPAction;
    medium: RASPAction;
    high: RASPAction;
    critical: RASPAction;
  };
  thresholds: {
    apiCallsPerMinute: number;
    screenSwitchesPerTenSec: number;
    authAttemptsPerMinute: number;
    errorRatePercent: number;
  };
  sensitiveScreens: string[];
  enableBehavioralAnalysis: boolean;
  enableIntegrityChecks: boolean;
}

export interface RASPViolation {
  id: string;
  type: ViolationType;
  severity: ThreatLevel;
  timestamp: number;
  details: string;
  action: RASPAction;
  blocked: boolean;
}

interface BehaviorMetrics {
  apiCalls: number[];          // Timestamps
  screenSwitches: number[];    // Timestamps
  authAttempts: { time: number; success: boolean }[];
  errors: number[];            // Timestamps
  inputPatterns: {
    lastInputTime: number;
    inputCount: number;
    avgInterval: number;
  };
}

// ============================================
// STATE
// ============================================

const DEFAULT_CONFIG: RASPConfig = {
  enabled: true,
  checkIntervalMs: 30000,  // 30 seconds
  response: {
    low: 'log',
    medium: 'warn',
    high: 'block',
    critical: 'wipe',
  },
  thresholds: {
    apiCallsPerMinute: 120,
    screenSwitchesPerTenSec: 15,
    authAttemptsPerMinute: 10,
    errorRatePercent: 30,
  },
  sensitiveScreens: [
    'evidence-locker',
    'crisis-plan',
    'emergency-wallet',
    'medical-records',
    'safety-plan',
    'document-vault',
  ],
  enableBehavioralAnalysis: true,
  enableIntegrityChecks: true,
};

let config: RASPConfig = { ...DEFAULT_CONFIG };
let monitoring = false;
let monitorInterval: ReturnType<typeof setInterval> | null = null;
let appStateListener: { remove: () => void } | null = null;

const violations: RASPViolation[] = [];
const metrics: BehaviorMetrics = {
  apiCalls: [],
  screenSwitches: [],
  authAttempts: [],
  errors: [],
  inputPatterns: {
    lastInputTime: 0,
    inputCount: 0,
    avgInterval: 0,
  },
};

// Track blocked operations
const blockedOperations = new Set<string>();

// ============================================
// CORE RASP FUNCTIONS
// ============================================

/**
 * Start RASP monitoring
 */
export function startRASPMonitoring(customConfig?: Partial<RASPConfig>): void {
  if (monitoring) return;

  if (customConfig) {
    config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  if (!config.enabled) return;

  monitoring = true;

  // Start periodic security checks
  monitorInterval = setInterval(performSecurityScan, config.checkIntervalMs);

  // Monitor app state changes
  appStateListener = AppState.addEventListener('change', handleAppStateChange);

  // Initial scan
  performSecurityScan();

  logSecurityEvent('RASP', 'RASP monitoring started');
}

/**
 * Stop RASP monitoring
 */
export function stopRASPMonitoring(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }

  if (appStateListener) {
    appStateListener.remove();
    appStateListener = null;
  }

  monitoring = false;
  logSecurityEvent('RASP', 'RASP monitoring stopped');
}

/**
 * Handle app state changes
 */
function handleAppStateChange(state: AppStateStatus): void {
  if (state === 'active') {
    // App became active - run immediate security check
    performSecurityScan();
  }
}

/**
 * Perform comprehensive security scan
 */
async function performSecurityScan(): Promise<void> {
  if (!monitoring) return;

  try {
    // Skip intensive checks in dev mode
    if (__DEV__) {
      return;
    }

    // Check 1: Debugger detection
    const debuggerResult = detectDebugger();
    if (debuggerResult.detected) {
      handleViolation({
        type: 'debugger_attached',
        severity: 'high',
        details: `Debugger indicators: ${debuggerResult.indicators.join(', ')}`,
      });
    }

    // Check 2: Hook detection
    const hookResult = await detectHooks();
    if (hookResult.detected) {
      handleViolation({
        type: 'hook_detected',
        severity: 'critical',
        details: `Hooking framework detected: ${hookResult.indicators.join(', ')}`,
      });
    }

    // Check 3: Function integrity
    if (config.enableIntegrityChecks) {
      const integrityValid = verifyRuntimeIntegrity();
      if (!integrityValid) {
        handleViolation({
          type: 'integrity_violation',
          severity: 'critical',
          details: 'Runtime function integrity check failed',
        });
      }
    }

    // Check 4: Behavioral analysis
    if (config.enableBehavioralAnalysis) {
      analyzeBehavior();
    }

  } catch (error) {
    logError('RASP', 'Security scan failed', error);
  }
}

// ============================================
// VIOLATION HANDLING
// ============================================

/**
 * Handle a security violation
 */
function handleViolation(violation: Omit<RASPViolation, 'id' | 'timestamp' | 'action' | 'blocked'>): void {
  // Get action based on severity (default to 'log' for 'none' severity)
  const action = violation.severity === 'none' 
    ? 'log' as RASPAction
    : config.response[violation.severity];
  const blocked = action === 'block' || action === 'wipe' || action === 'terminate';

  const fullViolation: RASPViolation = {
    ...violation,
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    action,
    blocked,
  };

  violations.push(fullViolation);

  // Keep only last 100 violations
  if (violations.length > 100) {
    violations.shift();
  }

  logSecurityEvent('RASP', `Violation: ${violation.type}`, { severity: violation.severity, action });

  // Register as a threat
  registerThreat({
    category: 'runtime_tampering',
    severity: violation.severity,
    description: violation.details,
    indicators: [violation.type],
  });

  // Execute response action
  executeAction(action, fullViolation);
}

/**
 * Execute response action
 */
async function executeAction(action: RASPAction, violation: RASPViolation): Promise<void> {
  switch (action) {
    case 'log':
      // Just log, already done
      break;

    case 'warn':
      console.warn(`[RASP Security Warning] ${violation.type}: ${violation.details}`);
      break;

    case 'block':
      setBlocked(true);
      blockedOperations.add('sensitive');
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('rasp:blocked', JSON.stringify({
          blocked: true,
          reason: violation.type,
          timestamp: Date.now(),
        }));
      } catch {}
      break;

    case 'wipe':
      // Wipe sensitive data
      wipeAllProtectedData();
      
      // Clear AsyncStorage sensitive keys
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const sensitiveKeys = [
          'evidence:notes.enc:v1',
          'evidence:uploadQueue:v1',
          'crisis:plan:v1',
          'wellness:journal:v1',
        ];
        for (const key of sensitiveKeys) {
          try { await AsyncStorage.removeItem(key); } catch {}
        }
      } catch {}
      
      setBlocked(true);
      break;

    case 'terminate':
      // In production, this would force-close the app
      // For now, block everything and wipe
      wipeAllProtectedData();
      setBlocked(true);
      break;
  }
}

// ============================================
// BEHAVIORAL ANALYSIS
// ============================================

/**
 * Track an API call
 */
export function trackAPICall(): void {
  const now = Date.now();
  metrics.apiCalls.push(now);

  // Keep only last minute
  const oneMinuteAgo = now - 60000;
  metrics.apiCalls = metrics.apiCalls.filter(t => t > oneMinuteAgo);

  // Check threshold
  if (metrics.apiCalls.length > config.thresholds.apiCallsPerMinute) {
    handleViolation({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      details: `API calls exceeded: ${metrics.apiCalls.length}/min (threshold: ${config.thresholds.apiCallsPerMinute})`,
    });
  }
}

/**
 * Track a screen switch
 */
export function trackScreenSwitch(screenName: string): void {
  const now = Date.now();
  metrics.screenSwitches.push(now);

  // Keep only last 10 seconds
  const tenSecondsAgo = now - 10000;
  metrics.screenSwitches = metrics.screenSwitches.filter(t => t > tenSecondsAgo);

  // Check for automation
  if (metrics.screenSwitches.length > config.thresholds.screenSwitchesPerTenSec) {
    handleViolation({
      type: 'automation_detected',
      severity: 'medium',
      details: `Rapid screen switching detected: ${metrics.screenSwitches.length} in 10s`,
    });
  }

  // Check for sensitive screen access when blocked
  if (blockedOperations.has('sensitive') && config.sensitiveScreens.includes(screenName)) {
    handleViolation({
      type: 'integrity_violation',
      severity: 'high',
      details: `Attempt to access sensitive screen while blocked: ${screenName}`,
    });
  }
}

/**
 * Track an authentication attempt
 */
export function trackAuthAttempt(success: boolean): void {
  const now = Date.now();
  metrics.authAttempts.push({ time: now, success });

  // Keep only last minute
  const oneMinuteAgo = now - 60000;
  metrics.authAttempts = metrics.authAttempts.filter(a => a.time > oneMinuteAgo);

  // Check for brute force
  const failedAttempts = metrics.authAttempts.filter(a => !a.success);
  if (failedAttempts.length > config.thresholds.authAttemptsPerMinute) {
    handleViolation({
      type: 'brute_force',
      severity: 'high',
      details: `Excessive failed auth attempts: ${failedAttempts.length}/min`,
    });
  }
}

/**
 * Track an error
 */
export function trackError(): void {
  const now = Date.now();
  metrics.errors.push(now);

  // Keep only last minute
  const oneMinuteAgo = now - 60000;
  metrics.errors = metrics.errors.filter(t => t > oneMinuteAgo);
}

/**
 * Track user input (for automation detection)
 */
export function trackInput(): void {
  const now = Date.now();
  const interval = now - metrics.inputPatterns.lastInputTime;

  if (metrics.inputPatterns.lastInputTime > 0 && interval > 0) {
    // Update running average
    const count = metrics.inputPatterns.inputCount;
    const newAvg = (metrics.inputPatterns.avgInterval * count + interval) / (count + 1);
    metrics.inputPatterns.avgInterval = newAvg;
  }

  metrics.inputPatterns.lastInputTime = now;
  metrics.inputPatterns.inputCount++;

  // Check for robotic input (too regular timing)
  if (metrics.inputPatterns.inputCount > 20) {
    const variance = calculateInputVariance();
    if (variance < 5) {  // Less than 5ms variance is suspicious
      handleViolation({
        type: 'automation_detected',
        severity: 'medium',
        details: `Suspiciously regular input timing detected (variance: ${variance.toFixed(2)}ms)`,
      });
    }
  }
}

/**
 * Analyze behavioral patterns
 */
function analyzeBehavior(): void {
  const now = Date.now();

  // Calculate error rate
  const oneMinuteAgo = now - 60000;
  const recentErrors = metrics.errors.filter(t => t > oneMinuteAgo).length;
  const recentCalls = metrics.apiCalls.filter(t => t > oneMinuteAgo).length;

  if (recentCalls > 10) {
    const errorRate = (recentErrors / recentCalls) * 100;
    if (errorRate > config.thresholds.errorRatePercent) {
      handleViolation({
        type: 'automation_detected',
        severity: 'low',
        details: `High error rate: ${errorRate.toFixed(1)}% (threshold: ${config.thresholds.errorRatePercent}%)`,
      });
    }
  }
}

/**
 * Calculate input timing variance
 */
function calculateInputVariance(): number {
  // Simplified - real implementation would track actual intervals
  return metrics.inputPatterns.avgInterval > 0 
    ? Math.abs(metrics.inputPatterns.avgInterval - 100) 
    : 100;
}

// ============================================
// INTEGRITY VERIFICATION
// ============================================

/**
 * Verify runtime function integrity
 */
function verifyRuntimeIntegrity(): boolean {
  try {
    // Verify critical functions haven't been hooked
    const criticalFunctions = [
      { name: 'JSON.parse', fn: JSON.parse },
      { name: 'JSON.stringify', fn: JSON.stringify },
      { name: 'Array.prototype.push', fn: Array.prototype.push },
      { name: 'Object.keys', fn: Object.keys },
      { name: 'Function.prototype.call', fn: Function.prototype.call },
      { name: 'Function.prototype.apply', fn: Function.prototype.apply },
    ];

    for (const { name, fn } of criticalFunctions) {
      try {
        const str = Function.prototype.toString.call(fn);
        if (!str.includes('[native code]')) {
          logSecurityEvent('RASP', `Function ${name} appears to be hooked`);
          return false;
        }
      } catch {
        // If we can't check, assume compromised
        return false;
      }
    }

    // Verify prototype chains
    if (Array.prototype.constructor !== Array) {
      return false;
    }

    if (Object.prototype.constructor !== Object) {
      return false;
    }

    return true;
  } catch (error) {
    logError('RASP', 'Integrity check failed', error);
    return false;
  }
}

// ============================================
// ACCESS CONTROL
// ============================================

/**
 * Check if an operation is allowed
 */
export function isOperationAllowed(operation: string): boolean {
  // Check global block
  if (blockedOperations.has('all')) return false;

  // Check specific operation
  if (blockedOperations.has(operation)) return false;

  // Check security state
  const state = getSecurityState();
  if (state.blocked) return false;

  return true;
}

/**
 * Check if a sensitive screen can be accessed
 */
export function canAccessSensitiveScreen(screenName: string): { 
  allowed: boolean; 
  reason?: string 
} {
  if (!config.sensitiveScreens.includes(screenName)) {
    return { allowed: true };
  }

  const state = getSecurityState();

  if (state.blocked) {
    return { 
      allowed: false, 
      reason: 'Access blocked due to security concerns' 
    };
  }

  if (state.threatLevel === 'critical') {
    return { 
      allowed: false, 
      reason: 'Device security compromised' 
    };
  }

  if (blockedOperations.has('sensitive')) {
    return { 
      allowed: false, 
      reason: 'Sensitive operations temporarily disabled' 
    };
  }

  return { allowed: true };
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get violation history
 */
export function getViolationHistory(): readonly RASPViolation[] {
  return [...violations];
}

/**
 * Get current metrics
 */
export function getRASPMetrics(): {
  apiCallsLastMinute: number;
  screenSwitchesLast10s: number;
  authAttemptsLastMinute: number;
  errorsLastMinute: number;
  violationCount: number;
} {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const tenSecondsAgo = now - 10000;

  return {
    apiCallsLastMinute: metrics.apiCalls.filter(t => t > oneMinuteAgo).length,
    screenSwitchesLast10s: metrics.screenSwitches.filter(t => t > tenSecondsAgo).length,
    authAttemptsLastMinute: metrics.authAttempts.filter(a => a.time > oneMinuteAgo).length,
    errorsLastMinute: metrics.errors.filter(t => t > oneMinuteAgo).length,
    violationCount: violations.length,
  };
}

/**
 * Check if RASP is monitoring
 */
export function isRASPActive(): boolean {
  return monitoring;
}

/**
 * Reset RASP state (for testing)
 */
export function resetRASPState(): void {
  violations.length = 0;
  metrics.apiCalls = [];
  metrics.screenSwitches = [];
  metrics.authAttempts = [];
  metrics.errors = [];
  metrics.inputPatterns = {
    lastInputTime: 0,
    inputCount: 0,
    avgInterval: 0,
  };
  blockedOperations.clear();
}

/**
 * Unblock operations (after successful re-authentication)
 */
export async function unblockOperations(): Promise<void> {
  blockedOperations.clear();
  setBlocked(false);

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('rasp:blocked');
  } catch {}
}

// ============================================
// EXPORTS
// ============================================

export default {
  startRASPMonitoring,
  stopRASPMonitoring,
  trackAPICall,
  trackScreenSwitch,
  trackAuthAttempt,
  trackError,
  trackInput,
  isOperationAllowed,
  canAccessSensitiveScreen,
  getViolationHistory,
  getRASPMetrics,
  isRASPActive,
  resetRASPState,
  unblockOperations,
};
