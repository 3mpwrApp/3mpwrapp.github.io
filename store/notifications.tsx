import React from "react";

import type { DeliveredNotification, NotificationPreferences } from "../types/notifications";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "../types/notifications";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const PREFS_KEY = "notifications:prefs:v1";
const INBOX_KEY = "notifications:inbox:v1";
const LAST_SENT_KEY = "notifications:lastSent:v1";
const INBOX_CAP = 100;

function enforceCap(list: DeliveredNotification[]): DeliveredNotification[] {
  if (list.length <= INBOX_CAP) return list;
  return [...list]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, INBOX_CAP);
}

type Ctx = {
  inbox: DeliveredNotification[];
  unread: number;
  prefs: NotificationPreferences;
  add: (n: DeliveredNotification[]) => void; // batch add
  markRead: (id: string) => void;
  markAllRead: () => void;
  updatePrefs: (updater: (p: NotificationPreferences) => NotificationPreferences) => void;
  lastSent: Record<string, number>;
  setLastSent: (templateId: string, ts: number) => void;
};

const NotificationsContext = React.createContext<Ctx | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [inbox, setInbox] = React.useState<DeliveredNotification[]>([]);
  const [prefs, setPrefs] = React.useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES());
  const [lastSent, setLastSentState] = React.useState<Record<string, number>>({});
  const [loaded, setLoaded] = React.useState(false);

  // Load persisted
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return setLoaded(true);
      try {
        const [rawPrefs, rawInbox, rawLast] = await Promise.all([
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(INBOX_KEY),
          AsyncStorage.getItem(LAST_SENT_KEY),
        ]);
        if (rawPrefs) {
          try { setPrefs({ ...DEFAULT_NOTIFICATION_PREFERENCES(), ...JSON.parse(rawPrefs) }); } catch {}
        }
        if (rawInbox) {
          try { setInbox(enforceCap(JSON.parse(rawInbox))); } catch {}
        }
        if (rawLast) {
          try { setLastSentState(JSON.parse(rawLast)); } catch {}
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist changes (debounced minimal via effect cascade)
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage || !loaded) return;
      try { await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(inbox)); } catch {}
    })();
  }, [inbox, loaded]);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage || !loaded) return;
      try { await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
    })();
  }, [prefs, loaded]);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage || !loaded) return;
      try { await AsyncStorage.setItem(LAST_SENT_KEY, JSON.stringify(lastSent)); } catch {}
    })();
  }, [lastSent, loaded]);

  const add = React.useCallback((arr: DeliveredNotification[]) => {
    if (!arr.length) return;
    setInbox((prev) => enforceCap([...arr, ...prev]));
  }, []);

  const markRead = React.useCallback((id: string) => {
    setInbox((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = React.useCallback(() => {
    setInbox((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const updatePrefs = React.useCallback((updater: (p: NotificationPreferences) => NotificationPreferences) => {
    setPrefs((prev) => ({ ...updater(prev), lastUpdated: Date.now() }));
  }, []);

  const setLastSent = React.useCallback((templateId: string, ts: number) => {
    setLastSentState((prev) => ({ ...prev, [templateId]: ts }));
  }, []);

  const unread = React.useMemo(() => inbox.filter((n) => !n.read).length, [inbox]);

  const value: Ctx = {
    inbox,
    unread,
    prefs,
    add,
    markRead,
    markAllRead,
    updatePrefs,
    lastSent,
    setLastSent,
  };

  if (!loaded) return null;

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
