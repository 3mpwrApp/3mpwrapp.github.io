// Central feature flags for cost-safe operation
// FREE_MODE: hard-disable networked/paid integrations to guarantee $0 operation.
// Can be overridden via EXPO_PUBLIC_FREE_MODE env or toggled per build profile.

const envFree = (process.env.EXPO_PUBLIC_FREE_MODE || '').toLowerCase();
export const FREE_MODE = envFree === '1' || envFree === 'true' || envFree === 'yes';

// External integrations
export const FLAGS = {
  sentry: !FREE_MODE && !!(process.env.EXPO_PUBLIC_SENTRY_DSN),
  llm: !FREE_MODE && !!(process.env.EXPO_PUBLIC_LLM_BASE),
  mapsAndroid: !FREE_MODE && !!(process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY),
};

// Utility to explain why something is disabled (optional UX wire-up)
export function isDisabledReason(feature: keyof typeof FLAGS): string | null {
  if (!FREE_MODE) return null;
  return `Disabled in Free Mode: ${feature}`;
}
