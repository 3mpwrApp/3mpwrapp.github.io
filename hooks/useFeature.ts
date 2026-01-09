import React from 'react';

import type {
    FeatureFlag,
    FeatureFlagConfig} from '../services/featureFlags';
import {
    getFeatureFlagConfig,
    isFeatureEnabled,
} from '../services/featureFlags';
import { useAuth } from '../store/auth';

/**
 * Hook to check if a feature flag is enabled
 * Integrates with auth context for user ID and beta tester status
 */
export function useFeature(flag: FeatureFlag): boolean {
  const { state: authState } = useAuth();
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    const userId = authState.user?.id;
    const isBetaTester = (authState.user as any)?.isBetaTester ?? false;

    const enabled = isFeatureEnabled(flag, userId, isBetaTester);
    setIsEnabled(enabled);
  }, [flag, authState.user]);

  return isEnabled;
}

/**
 * Hook to get the full configuration for a feature flag
 */
export function useFeatureConfig(flag: FeatureFlag): FeatureFlagConfig | undefined {
  const [config, setConfig] = React.useState<FeatureFlagConfig | undefined>();

  React.useEffect(() => {
    const cfg = getFeatureFlagConfig(flag);
    setConfig(cfg);
  }, [flag]);

  return config;
}

/**
 * Hook to get both enabled status and config
 */
export function useFeatureWithConfig(
  flag: FeatureFlag
): {
  enabled: boolean;
  config: FeatureFlagConfig | undefined;
} {
  const enabled = useFeature(flag);
  const config = useFeatureConfig(flag);

  return { enabled, config };
}
