import { createHash } from 'crypto';

export type FeatureFlag = 
  | 'COLLECTIVE_EVIDENCE'
  | 'AI_COACH'
  | 'ADVANCED_WELLNESS'
  | 'NEW_COMMUNITY_UI'
  | 'EXPERIMENTAL_DASHBOARD';

export interface FeatureFlagConfig {
  name: FeatureFlag;
  enabled: boolean;
  betaOnly?: boolean;
  rolloutPercentage?: number;
  description?: string;
}

type FlagOverrides = {
  [key in FeatureFlag]?: boolean;
};

interface FeatureFlagState {
  flags: FeatureFlagConfig[];
  overrides: FlagOverrides;
  lastUpdated: number;
}

const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  {
    name: 'COLLECTIVE_EVIDENCE',
    enabled: true,
    betaOnly: true,
    rolloutPercentage: 30,
    description: 'Beta feature for collective evidence tracking',
  },
  {
    name: 'AI_COACH',
    enabled: true,
    betaOnly: false,
    rolloutPercentage: 50,
    description: 'New AI coach feature for personalized support',
  },
  {
    name: 'ADVANCED_WELLNESS',
    enabled: false,
    betaOnly: false,
    rolloutPercentage: 0,
    description: 'Advanced wellness features coming soon',
  },
  {
    name: 'NEW_COMMUNITY_UI',
    enabled: true,
    betaOnly: false,
    rolloutPercentage: 100,
    description: 'New redesigned community interface',
  },
  {
    name: 'EXPERIMENTAL_DASHBOARD',
    enabled: false,
    betaOnly: true,
    rolloutPercentage: 10,
    description: 'Internal experimental dashboard',
  },
];

let state: FeatureFlagState = {
  flags: JSON.parse(JSON.stringify(DEFAULT_FLAGS)),
  overrides: {},
  lastUpdated: Date.now(),
};

/**
 * Consistent hash-based user ID for rollout calculation
 */
function hashUserId(userId: string): number {
  const hash = createHash('sha256').update(userId).digest();
  return Math.abs(hash.readUInt32BE(0)) % 100;
}

/**
 * Check if a feature flag is enabled for a given user
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string,
  isBetaTester?: boolean
): boolean {
  // Check overrides first (highest priority)
  if (flag in state.overrides) {
    return state.overrides[flag] ?? false;
  }

  const flagConfig = state.flags.find((f) => f.name === flag);
  if (!flagConfig) {
    return false;
  }

  // Check if feature is globally disabled
  if (!flagConfig.enabled) {
    return false;
  }

  // Check if beta-only and user is not a beta tester
  if (flagConfig.betaOnly && !isBetaTester) {
    return false;
  }

  // Check rollout percentage (100 means always enabled if other checks pass)
  if (flagConfig.rolloutPercentage !== undefined && flagConfig.rolloutPercentage < 100) {
    // If no userId, we cannot determine rollout - return false unless percentage is 100
    if (!userId) {
      return false;
    }
    const userHash = hashUserId(userId);
    return userHash < flagConfig.rolloutPercentage;
  }

  return true;
}

/**
 * Get the full configuration for a feature flag
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig | undefined {
  return state.flags.find((f) => f.name === flag);
}

/**
 * Reset to default state (for testing)
 */
export function resetToDefaults(): void {
  state = {
    flags: JSON.parse(JSON.stringify(DEFAULT_FLAGS)),
    overrides: {},
    lastUpdated: Date.now(),
  };
}

/**
 * Get all feature flags and their current state
 */
export function getAllFeatureFlags(): FeatureFlagConfig[] {
  return state.flags;
}

/**
 * Update a feature flag's enabled state (admin only)
 */
export function setFeatureFlagEnabled(flag: FeatureFlag, enabled: boolean): void {
  const flagIndex = state.flags.findIndex((f) => f.name === flag);
  if (flagIndex !== -1) {
    state.flags[flagIndex].enabled = enabled;
    state.lastUpdated = Date.now();
  }
}

/**
 * Update a feature flag's rollout percentage (admin only)
 */
export function setFeatureFlagRolloutPercentage(
  flag: FeatureFlag,
  percentage: number
): void {
  const percentage_clamped = Math.max(0, Math.min(100, percentage));
  const flagIndex = state.flags.findIndex((f) => f.name === flag);
  if (flagIndex !== -1) {
    state.flags[flagIndex].rolloutPercentage = percentage_clamped;
    state.lastUpdated = Date.now();
  }
}

/**
 * Override a feature flag for testing (highest priority)
 */
export function overrideFeatureFlag(flag: FeatureFlag, enabled: boolean | null): void {
  if (enabled === null) {
    delete state.overrides[flag];
  } else {
    state.overrides[flag] = enabled;
  }
  state.lastUpdated = Date.now();
}

/**
 * Get all current overrides
 */
export function getOverrides(): FlagOverrides {
  return { ...state.overrides };
}

/**
 * Clear all overrides
 */
export function clearAllOverrides(): void {
  state.overrides = {};
  state.lastUpdated = Date.now();
}

/**
 * Get current state (for persistence/rehydration)
 */
export function getFeatureFlagState(): FeatureFlagState {
  return {
    flags: state.flags.map((f) => ({ ...f })),
    overrides: { ...state.overrides },
    lastUpdated: state.lastUpdated,
  };
}

/**
 * Set feature flag state (for persistence/rehydration)
 */
export function setFeatureFlagState(newState: FeatureFlagState): void {
  state = {
    flags: newState.flags.map((f) => ({ ...f })),
    overrides: { ...newState.overrides },
    lastUpdated: newState.lastUpdated,
  };
}

/**
 * Get flag rollout status as human-readable stats
 */
export function getFlagRolloutStats(flag: FeatureFlag): {
  enabled: boolean;
  rolloutPercentage: number;
  betaOnly: boolean;
} | null {
  const flagConfig = getFeatureFlagConfig(flag);
  if (!flagConfig) return null;

  return {
    enabled: flagConfig.enabled,
    rolloutPercentage: flagConfig.rolloutPercentage ?? 100,
    betaOnly: flagConfig.betaOnly ?? false,
  };
}

// Cost-safe operation flags (legacy)
const envFree = (process.env.EXPO_PUBLIC_FREE_MODE || '').toLowerCase();
export const FREE_MODE = envFree === '1' || envFree === 'true' || envFree === 'yes';

export const FLAGS = {
  sentry: !FREE_MODE && !!(process.env.EXPO_PUBLIC_SENTRY_DSN),
  llm: !FREE_MODE && !!(process.env.EXPO_PUBLIC_LLM_BASE),
  mapsAndroid: !FREE_MODE && !!(process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY),
};

export function isDisabledReason(feature: keyof typeof FLAGS): string | null {
  if (!FREE_MODE) return null;
  return `Disabled in Free Mode: ${feature}`;
}
