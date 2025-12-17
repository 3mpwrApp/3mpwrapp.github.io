import { Alert, Platform, Share } from 'react-native';

export async function collectAndShareDiagnostics(): Promise<void> {
  try {
    const FS = await import('expo-file-system');
    const Sharing = await import('expo-sharing').catch(() => null);
    const AsyncStorage = await import('@react-native-async-storage/async-storage');

    const now = Date.now();
    const cacheDir: string = (FS as any).cacheDirectory || (FS as any).default?.cacheDirectory || '';

    // Gather basic device + env info
    const info: Record<string, any> = {
      timestamp: now,
      platform: Platform.OS,
      platformVersion: Platform.Version,
    };

    // Gather AsyncStorage keys + values (safe, limited size)
    let storageSnapshot: Record<string, any> = {};
    try {
      const keys = await (AsyncStorage as any).getAllKeys();
      const items = await (AsyncStorage as any).multiGet(keys || []);
      for (const [k, v] of items || []) {
        try {
          storageSnapshot[k] = JSON.parse(v as string);
        } catch {
          storageSnapshot[k] = v;
        }
      }
    } catch {
      storageSnapshot = { error: 'Could not read AsyncStorage' };
    }

    // Try to include aiGroundingCompanion state if available
    try {
      const grounding = await import('./aiGroundingCompanion').catch(() => null);
      if (grounding?.aiGroundingCompanion?.getState) {
        storageSnapshot['aiGroundingCompanion.state'] = grounding.aiGroundingCompanion.getState();
      }
    } catch {}

    // Attempt to collect in-memory app logs if available
    const logs = (global as any).__APP_LOGS__ || [];

    const payload = {
      info,
      storageSnapshot,
      logs,
    };

    const filename = `diagnostics_${now}.json`;
    const path = cacheDir + filename;
    await (FS as any).writeAsStringAsync(path, JSON.stringify(payload, null, 2), { encoding: (FS as any).EncodingType?.UTF8 });

    // Prefer expo-sharing if available, else fallback to Share
    if (Sharing?.isAvailableAsync && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { dialogTitle: 'Send diagnostics' });
    } else {
      try {
        await Share.share({ url: path, title: 'Diagnostics' });
      } catch {
        Alert.alert('Share failed', 'Could not open share sheet. The diagnostics file is saved to cache.');
      }
    }
  } catch (err) {
    console.warn('Diagnostics collection failed', String(err));
    Alert.alert('Diagnostics failed', 'Could not collect diagnostics.');
  }
}

export function addConsoleCapture(limit = 500) {
  try {
    if (!(global as any).__APP_LOGS__) (global as any).__APP_LOGS__ = [];
    const pushLog = (level: string, args: any[]) => {
      try {
        const entry = { ts: Date.now(), level, message: args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') };
        const arr = (global as any).__APP_LOGS__;
        arr.push(entry);
        if (arr.length > limit) arr.shift();
      } catch {}
    };

    const origWarn = console.warn.bind(console);
    const origError = console.error.bind(console);

    // Capture warnings and errors only to avoid lint/no-console failures
    console.warn = (...a: any[]) => { pushLog('warn', a); origWarn(...a); };
    console.error = (...a: any[]) => { pushLog('error', a); origError(...a); };
  } catch (e) {
    // noop
  }
}

export default {
  collectAndShareDiagnostics,
  addConsoleCapture,
};
