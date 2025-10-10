// Consent flags to gate any remote writes. Conservative defaults (disabled).
// Persisted locally via AsyncStorage when available.

let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

let _cloudConsent = false;
let _telemetryConsent = false;

const KEY_CLOUD = 'consent:cloud:v1';
const KEY_TELEM = 'consent:telemetry:v1';

(async () => {
  try {
    const [c, t] = await Promise.all([
      AsyncStorage?.getItem?.(KEY_CLOUD),
      AsyncStorage?.getItem?.(KEY_TELEM),
    ]);
    if (c != null) _cloudConsent = c === '1' || c === 'true';
    if (t != null) _telemetryConsent = t === '1' || t === 'true';
  } catch {}
})();

export function setCloudConsent(v: boolean) {
  _cloudConsent = !!v;
  try { AsyncStorage?.setItem?.(KEY_CLOUD, _cloudConsent ? '1' : '0'); } catch {}
}

export function isCloudConsentEnabled() {
  return _cloudConsent === true;
}

export function setTelemetryConsent(v: boolean) {
  _telemetryConsent = !!v;
  try { AsyncStorage?.setItem?.(KEY_TELEM, _telemetryConsent ? '1' : '0'); } catch {}
}

export function isTelemetryConsentEnabled() {
  return _telemetryConsent === true;
}
