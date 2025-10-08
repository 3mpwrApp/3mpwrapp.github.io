// Lightweight developer preferences (non-user facing)
// Provides a toggle for cost alerts that can be controlled from Settings (Developer section)

import React from 'react';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const KEY_COST_ALERTS = 'dev:costAlertsEnabled:v1';

// Default behavior matches prior implementation: enabled in dev, or when EXPO_PUBLIC_COST_ALERT=1
const ENV_ALERT_ENABLED = (process.env.EXPO_PUBLIC_COST_ALERT || '').toLowerCase() === '1';
let costAlertsEnabled = (__DEV__ || ENV_ALERT_ENABLED);

// In-memory pub/sub so non-React modules can listen if needed
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => {
    try { l(); } catch {}
  });
}

// Load any persisted value
(async () => {
  if (!AsyncStorage) return;
  try {
    const raw = await AsyncStorage.getItem(KEY_COST_ALERTS);
    if (raw != null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'boolean') {
        costAlertsEnabled = parsed;
        notify();
      }
    }
  } catch {}
})();

export function getCostAlertsEnabled() {
  return costAlertsEnabled;
}

export async function setCostAlertsEnabled(v: boolean) {
  costAlertsEnabled = !!v;
  notify();
  if (!AsyncStorage) return;
  try {
    await AsyncStorage.setItem(KEY_COST_ALERTS, JSON.stringify(!!v));
  } catch {}
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// React hook for convenience in UI
export function useDevPrefs() {
  const [enabled, setEnabled] = React.useState<boolean>(getCostAlertsEnabled());

  React.useEffect(() => {
    return subscribe(() => setEnabled(getCostAlertsEnabled()));
  }, []);

  const set = React.useCallback((v: boolean) => {
    setCostAlertsEnabled(v);
  }, []);

  return { costAlertsEnabled: enabled, setCostAlertsEnabled: set };
}
