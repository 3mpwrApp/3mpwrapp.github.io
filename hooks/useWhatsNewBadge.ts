import React from 'react';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

export function useWhatsNewBadge() {
  const [count, setCount] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { whatsnew: defaults } = await import('../data/whatsnew');
        const { getLocalWhatsNew } = await import('../services/localContent');
        const local = await getLocalWhatsNew();
        const all = [...local, ...defaults];
        if (!all.length) {
          if (mounted) setCount(undefined);
          return;
        }
        let lastSeen = 0;
        try {
          const raw = await AsyncStorage?.getItem?.('whatsnew:lastSeen:v1');
          if (raw) lastSeen = new Date(raw).getTime();
        } catch {}
        const unread = all.filter((i) => new Date(i.date).getTime() > lastSeen);
        if (mounted) setCount(unread.length > 0 ? unread.length : undefined);
      } catch {
        if (mounted) setCount(undefined);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return count;
}
