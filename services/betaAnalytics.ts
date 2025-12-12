/**
 * Beta Analytics Service
 * 
 * Provides enhanced analytics tracking specifically for beta testing.
 * Tracks key metrics for understanding beta user behavior:
 * - Session duration and frequency
 * - Feature discovery and first-use
 * - Tab navigation patterns
 * - Error rates and recovery
 * - NPS and feedback metrics
 * - Accessibility feature adoption
 */

import { AppState, Platform } from 'react-native';

import { logEvent } from './analytics';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

// Storage keys
const KEYS = {
  SESSION_COUNT: 'beta.analytics.session_count',
  FIRST_USE_FLAGS: 'beta.analytics.first_use',
  TAB_VISITS: 'beta.analytics.tab_visits',
  SESSION_START: 'beta.analytics.session_start',
  TOTAL_TIME: 'beta.analytics.total_time',
  LAST_SESSION: 'beta.analytics.last_session',
};

// Session tracking
let sessionStartTime: number | null = null;
let currentSessionId: string | null = null;

/**
 * Initialize beta analytics - call on app start
 */
export async function initBetaAnalytics(): Promise<void> {
  try {
    sessionStartTime = Date.now();
    currentSessionId = generateSessionId();
    
    // Increment session count
    const countStr = await AsyncStorage?.getItem?.(KEYS.SESSION_COUNT);
    const count = parseInt(countStr || '0', 10) + 1;
    await AsyncStorage?.setItem?.(KEYS.SESSION_COUNT, String(count));
    
    // Log session start
    logEvent('beta.session.start', {
      session_id: currentSessionId,
      session_number: count,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });

    // Set up app state listener for session end
    AppState.addEventListener('change', handleAppStateChange);
  } catch {
    // Silently fail
  }
}

/**
 * Handle app state changes for session tracking
 */
function handleAppStateChange(nextAppState: string): void {
  if (nextAppState === 'background' || nextAppState === 'inactive') {
    endSession();
  } else if (nextAppState === 'active' && !sessionStartTime) {
    // Resuming from background
    sessionStartTime = Date.now();
    currentSessionId = generateSessionId();
  }
}

/**
 * End the current session and log duration
 */
async function endSession(): Promise<void> {
  if (!sessionStartTime) return;
  
  const duration = Math.round((Date.now() - sessionStartTime) / 1000); // seconds
  
  try {
    // Log session end
    logEvent('beta.session.end', {
      session_id: currentSessionId,
      duration_seconds: duration,
      duration_minutes: Math.round(duration / 60),
    });

    // Update total time
    const totalStr = await AsyncStorage?.getItem?.(KEYS.TOTAL_TIME);
    const total = parseInt(totalStr || '0', 10) + duration;
    await AsyncStorage?.setItem?.(KEYS.TOTAL_TIME, String(total));
    await AsyncStorage?.setItem?.(KEYS.LAST_SESSION, new Date().toISOString());
  } catch {
    // Silently fail
  }

  sessionStartTime = null;
}

/**
 * Track first-time use of a feature
 */
export async function trackFeatureFirstUse(featureId: string, featureName: string): Promise<void> {
  try {
    const flagsStr = await AsyncStorage?.getItem?.(KEYS.FIRST_USE_FLAGS);
    const flags: Record<string, boolean> = flagsStr ? JSON.parse(flagsStr) : {};
    
    if (!flags[featureId]) {
      flags[featureId] = true;
      await AsyncStorage?.setItem?.(KEYS.FIRST_USE_FLAGS, JSON.stringify(flags));
      
      logEvent('beta.feature.first_use', {
        feature_id: featureId,
        feature_name: featureName,
        session_id: currentSessionId,
        features_discovered: Object.keys(flags).length,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Track tab visits for navigation patterns
 */
export async function trackTabVisit(tabName: string): Promise<void> {
  try {
    const visitsStr = await AsyncStorage?.getItem?.(KEYS.TAB_VISITS);
    const visits: Record<string, number> = visitsStr ? JSON.parse(visitsStr) : {};
    
    visits[tabName] = (visits[tabName] || 0) + 1;
    await AsyncStorage?.setItem?.(KEYS.TAB_VISITS, JSON.stringify(visits));
    
    logEvent('beta.tab.visit', {
      tab_name: tabName,
      visit_count: visits[tabName],
      session_id: currentSessionId,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track complexity mode changes
 */
export function trackComplexityModeChange(
  oldMode: string, 
  newMode: string, 
  source: 'settings' | 'bad_day_mode' | 'onboarding'
): void {
  logEvent('beta.complexity.mode.changed', {
    old_mode: oldMode,
    new_mode: newMode,
    source,
    session_id: currentSessionId,
  });
}

/**
 * Track accessibility feature enablement
 */
export function trackAccessibilityFeature(
  featureName: string, 
  enabled: boolean
): void {
  logEvent('beta.a11y.feature.enabled', {
    feature_name: featureName,
    enabled,
    session_id: currentSessionId,
  });
}

/**
 * Track tool usage with context
 */
export function trackToolUsage(
  toolId: string, 
  toolName: string, 
  action: 'open' | 'complete' | 'abandon',
  metadata?: Record<string, any>
): void {
  logEvent('beta.tool.usage', {
    tool_id: toolId,
    tool_name: toolName,
    action,
    session_id: currentSessionId,
    ...metadata,
  });
}

/**
 * Track errors for beta debugging
 */
export function trackBetaError(
  errorType: string, 
  errorMessage: string, 
  context?: string
): void {
  logEvent('beta.error.encountered', {
    error_type: errorType,
    error_message: errorMessage.slice(0, 200), // Truncate
    context,
    session_id: currentSessionId,
    platform: Platform.OS,
  });
}

/**
 * Get beta analytics summary for debugging/display
 */
export async function getBetaAnalyticsSummary(): Promise<{
  sessionCount: number;
  featuresDiscovered: number;
  totalTimeMinutes: number;
  lastSession: string | null;
  tabVisits: Record<string, number>;
}> {
  try {
    const [countStr, flagsStr, totalStr, lastSession, visitsStr] = await Promise.all([
      AsyncStorage?.getItem?.(KEYS.SESSION_COUNT),
      AsyncStorage?.getItem?.(KEYS.FIRST_USE_FLAGS),
      AsyncStorage?.getItem?.(KEYS.TOTAL_TIME),
      AsyncStorage?.getItem?.(KEYS.LAST_SESSION),
      AsyncStorage?.getItem?.(KEYS.TAB_VISITS),
    ]);

    const flags = flagsStr ? JSON.parse(flagsStr) : {};
    const visits = visitsStr ? JSON.parse(visitsStr) : {};

    return {
      sessionCount: parseInt(countStr || '0', 10),
      featuresDiscovered: Object.keys(flags).length,
      totalTimeMinutes: Math.round(parseInt(totalStr || '0', 10) / 60),
      lastSession: lastSession || null,
      tabVisits: visits,
    };
  } catch {
    return {
      sessionCount: 0,
      featuresDiscovered: 0,
      totalTimeMinutes: 0,
      lastSession: null,
      tabVisits: {},
    };
  }
}

/**
 * Reset beta analytics (for testing)
 */
export async function resetBetaAnalytics(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage?.removeItem?.(KEYS.SESSION_COUNT),
      AsyncStorage?.removeItem?.(KEYS.FIRST_USE_FLAGS),
      AsyncStorage?.removeItem?.(KEYS.TAB_VISITS),
      AsyncStorage?.removeItem?.(KEYS.TOTAL_TIME),
      AsyncStorage?.removeItem?.(KEYS.LAST_SESSION),
    ]);
  } catch {
    // Silently fail
  }
}

// Utility functions
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}
