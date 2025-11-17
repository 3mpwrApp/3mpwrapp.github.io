import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flag keys for consolidation features
export const CONSOLIDATION_FLAGS = {
  UNIFIED_HEALTH_TRACKER: 'unifiedHealthTracker',
  UNIFIED_AI_ASSISTANT: 'unifiedAIAssistant',
  ACCOUNTABILITY_HUB: 'accountabilityHub',
  EVIDENCE_MANAGER: 'evidenceManager',
} as const;

export type ConsolidationFlag = typeof CONSOLIDATION_FLAGS[keyof typeof CONSOLIDATION_FLAGS];

// Default feature flag states (all enabled for beta)
const DEFAULT_CONSOLIDATION_FLAGS: Record<ConsolidationFlag, boolean> = {
  [CONSOLIDATION_FLAGS.UNIFIED_HEALTH_TRACKER]: true,
  [CONSOLIDATION_FLAGS.UNIFIED_AI_ASSISTANT]: true,
  [CONSOLIDATION_FLAGS.ACCOUNTABILITY_HUB]: true,
  [CONSOLIDATION_FLAGS.EVIDENCE_MANAGER]: true,
};

// Storage key for consolidation feature flags
const CONSOLIDATION_FLAGS_STORAGE_KEY = 'empowr.consolidationFlags';

/**
 * Get the current state of all consolidation feature flags
 */
export async function getConsolidationFlags(): Promise<Record<ConsolidationFlag, boolean>> {
  try {
    const stored = await AsyncStorage.getItem(CONSOLIDATION_FLAGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure new flags are included
      return { ...DEFAULT_CONSOLIDATION_FLAGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load consolidation feature flags:', error);
  }
  return { ...DEFAULT_CONSOLIDATION_FLAGS };
}

/**
 * Check if a specific consolidation feature flag is enabled
 */
export async function isConsolidationFeatureEnabled(flag: ConsolidationFlag): Promise<boolean> {
  const flags = await getConsolidationFlags();
  return flags[flag] ?? false;
}

/**
 * Enable or disable a consolidation feature flag
 */
export async function setConsolidationFlag(flag: ConsolidationFlag, enabled: boolean): Promise<void> {
  try {
    const currentFlags = await getConsolidationFlags();
    const updatedFlags = { ...currentFlags, [flag]: enabled };
    await AsyncStorage.setItem(CONSOLIDATION_FLAGS_STORAGE_KEY, JSON.stringify(updatedFlags));
  } catch (error) {
    console.error('Failed to save consolidation feature flag:', error);
  }
}

/**
 * Reset all consolidation feature flags to defaults
 */
export async function resetConsolidationFlags(): Promise<void> {
  try {
    await AsyncStorage.setItem(CONSOLIDATION_FLAGS_STORAGE_KEY, JSON.stringify(DEFAULT_CONSOLIDATION_FLAGS));
  } catch (error) {
    console.error('Failed to reset consolidation feature flags:', error);
  }
}

/**
 * Get consolidation feature flag status for debugging/admin purposes
 */
export async function getConsolidationFlagStatus(): Promise<{
  flags: Record<ConsolidationFlag, boolean>;
  lastUpdated?: string;
}> {
  const flags = await getConsolidationFlags();
  let lastUpdated: string | undefined;

  try {
    // In a real app, you might store metadata about when flags were last updated
    const metadata = await AsyncStorage.getItem(`${CONSOLIDATION_FLAGS_STORAGE_KEY}_metadata`);
    if (metadata) {
      const parsed = JSON.parse(metadata);
      lastUpdated = parsed.lastUpdated;
    }
  } catch {
    // Ignore metadata errors
  }

  return { flags, lastUpdated };
}