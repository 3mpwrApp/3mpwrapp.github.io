import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

import type {
    FeatureFlag} from '../services/featureFlags';
import {
    getFeatureFlagState,
    isFeatureEnabled,
    setFeatureFlagState,
} from '../services/featureFlags';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const FEATURE_FLAGS_STORAGE_KEY = 'empowr.featureFlags.v1';

/**
 * Zustand middleware for persisting and managing feature flags
 */
export function featureFlagsPersist<
  T extends Record<string, any>,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  options?: {
    name?: string;
  }
): StateCreator<T, Mps, Mcs> {
  return (set, get, api) => {
    let initialized = false;

    // Load persisted flags on startup
    if (AsyncStorage && !initialized) {
      AsyncStorage.getItem(FEATURE_FLAGS_STORAGE_KEY)
        .then((stored: string | null) => {
          if (stored) {
            try {
              const state = JSON.parse(stored);
              setFeatureFlagState(state);
            } catch (error) {
              console.warn('Failed to load feature flags from storage:', error);
            }
          }
        })
        .catch((error: any) => {
          console.warn('Failed to read feature flags from storage:', error);
        });

      initialized = true;
    }

    const wrappedSet: any = (
      state: T | Partial<T> | ((state: T) => T | Partial<T>),
      replace?: boolean,
      action?: { type: string }
    ) => {
      // Call the original set with proper type handling
      if (replace === true) {
        (set as any)(state, true, action);
      } else {
        (set as any)(state, undefined, action);
      }

      // Persist feature flags after any state change
      if (AsyncStorage) {
        const currentState = getFeatureFlagState();
        AsyncStorage.setItem(
          FEATURE_FLAGS_STORAGE_KEY,
          JSON.stringify(currentState)
        ).catch((error: any) => {
          console.warn('Failed to persist feature flags:', error);
        });
      }
    };

    return f(wrappedSet, get, api);
  };
}

/**
 * Add feature flag state to a Zustand store
 */
export interface FeatureFlagsStoreState {
  featureFlags: {
    isEnabled: (flag: FeatureFlag, userId?: string, isBetaTester?: boolean) => boolean;
    refreshFlags: () => Promise<void>;
  };
}

/**
 * Hook creator for feature flags in a store
 */
export function createFeatureFlagsSlice(): StateCreator<
  FeatureFlagsStoreState,
  [],
  []
> {
  return (set, get) => ({
    featureFlags: {
      isEnabled: (flag: FeatureFlag, userId?: string, isBetaTester?: boolean) => {
        return isFeatureEnabled(flag, userId, isBetaTester);
      },
      refreshFlags: async () => {
        if (!AsyncStorage) return;

        try {
          const stored = await AsyncStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
          if (stored) {
            const state = JSON.parse(stored);
            setFeatureFlagState(state);
          }
        } catch (error) {
          console.warn('Failed to refresh feature flags:', error);
        }
      },
    },
  });
}

/**
 * Broadcast feature flag changes to other tabs/windows
 * Useful for keeping multiple instances in sync
 */
export function broadcastFlagChange(
  flag: FeatureFlag,
  enabled: boolean | null
): void {
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    try {
      const channel = new BroadcastChannel('feature-flags');
      channel.postMessage({
        type: 'FLAG_CHANGE',
        flag,
        enabled,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (error) {
      console.warn('Failed to broadcast flag change:', error);
    }
  }
}

/**
 * Listen for feature flag changes from other sources
 */
export function listenForFlagChanges(
  callback: (flag: FeatureFlag, enabled: boolean | null) => void
): () => void {
  if (typeof window === 'undefined' || !window.BroadcastChannel) {
    return () => {};
  }

  try {
    const channel = new BroadcastChannel('feature-flags');
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'FLAG_CHANGE') {
        callback(event.data.flag, event.data.enabled);
      }
    };

    channel.addEventListener('message', handler);

    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  } catch (error) {
    console.warn('Failed to listen for flag changes:', error);
    return () => {};
  }
}
