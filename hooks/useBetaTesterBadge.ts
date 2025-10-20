import React from 'react';

import { awardBadge, hasBadge } from '../store/profileLocal';
import { logger } from '../utils/logger';

/**
 * Auto-awards beta tester badge on first app launch during beta phase
 * Only runs once per installation
 */
export function useBetaTesterBadge() {
  const [hasChecked, setHasChecked] = React.useState(false);

  React.useEffect(() => {
    // Only run once
    if (hasChecked) return;

    const checkAndAward = async () => {
      try {
        // Check if we're in beta mode
        const isBeta = process.env.EXPO_PUBLIC_BETA === '1';
        if (!isBeta) {
          setHasChecked(true);
          return;
        }

        // Check if user already has the badge
        const hasBetaBadge = await hasBadge('betaTester');
        if (hasBetaBadge) {
          logger.debug('[useBetaTesterBadge] User already has beta tester badge');
          setHasChecked(true);
          return;
        }

        // Determine beta phase from build or environment
        // Assume 'closed' during private beta, 'open' during public beta
        const phase: 'closed' | 'open' | 'rc' = 
          process.env.EXPO_PUBLIC_BETA_PHASE as any || 'closed';

        // Award the badge!
        await awardBadge('betaTester', { phase });
        
        if (__DEV__) {
          logger.debug(`[useBetaTesterBadge] Awarded beta tester badge (phase: ${phase})`);
        }
      } catch (error) {
        logger.error('[useBetaTesterBadge] Failed to award badge:', error);
      } finally {
        setHasChecked(true);
      }
    };

    checkAndAward();
  }, [hasChecked]);

  return null;
}
