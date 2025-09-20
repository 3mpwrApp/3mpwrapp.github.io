import React from "react";
import { logEvent } from "../services/analytics";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type Bookmark = {
  id: string;
  route: string; // expo-router path e.g. /(tabs)/resources/index
  label: string; // stored label fallback
  created: number;
  tKey?: string; // optional translation key for dynamic localization
};

type State = {
  items: Bookmark[];
};

const KEY = "bookmarks:v1";

interface BookmarksCtx extends State {
  addBookmark: (route: string, label: string, tKey?: string) => void;
  removeBookmark: (id: string) => void;
  clearBookmarks: () => void;
  isBookmarked: (route: string) => boolean;
  findByRoute: (route: string) => Bookmark | undefined;
}

const Ctx = React.createContext<BookmarksCtx | undefined>(undefined);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Bookmark[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setItems(parsed);
            else if (Array.isArray(parsed.items)) setItems(parsed.items);
        }
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        await AsyncStorage?.setItem?.(KEY, JSON.stringify(items));
      } catch {}
    })();
  }, [items]);

  const addBookmark = (route: string, label: string, tKey?: string) => {
    setItems((prev) => {
      if (prev.some((b) => b.route === route)) return prev; // avoid duplicate by route
      const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const next = [...prev, { id, route, label, created: Date.now(), tKey }];
      logEvent("bookmark_add", { route, has_tKey: !!tKey });
      return next;
    });
  };
  const removeBookmark = (id: string) => {
    setItems((prev) => {
      const target = prev.find(b => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      if (target) logEvent("bookmark_remove", { route: target.route });
      return next;
    });
  };
  const clearBookmarks = () => {
    if (items.length) logEvent("bookmark_clear_all", { count: items.length });
    setItems([]);
  };
  const isBookmarked = (route: string) => items.some((b) => b.route === route);
  const findByRoute = (route: string) => items.find((b) => b.route === route);

  return (
    <Ctx.Provider value={{ items, addBookmark, removeBookmark, clearBookmarks, isBookmarked, findByRoute }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookmarks() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
