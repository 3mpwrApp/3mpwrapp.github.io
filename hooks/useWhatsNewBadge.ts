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
        const { getWhatsNewSplit } = await import('../services/localContent');
        const { current } = await getWhatsNewSplit();
        if (!current.length) {
          if (mounted) setCount(undefined);
          return;
        }
        let lastSeen = 0;
        try {
          const raw = await AsyncStorage?.getItem?.('whatsnew:lastSeen:v1');
          if (raw) lastSeen = new Date(raw).getTime();
        } catch {}
        const unread = current.filter((i) => new Date(i.date).getTime() > lastSeen);
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
