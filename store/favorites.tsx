import React from "react";

type Kind = "campaign" | "resource" | "advocate" | "podcast";

type FavoritesState = Record<Kind, Set<string>>;

type Ctx = {
  state: FavoritesState;
  toggle: (kind: Kind, id: string) => void;
  has: (kind: Kind, id: string) => boolean;
};

const FavoritesContext = React.createContext<Ctx | undefined>(undefined);

function createInitial(): FavoritesState {
  return {
    campaign: new Set(),
    resource: new Set(),
    advocate: new Set(),
    podcast: new Set(),
  };
}

let AsyncStorage: any;
try {
  // Optional persistence if AsyncStorage is installed
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

const STORAGE_KEY = "favorites:v1";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FavoritesState>(createInitial());

  // Load persisted
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Record<Kind, string[]>;
          setState({
            campaign: new Set(parsed.campaign ?? []),
            resource: new Set(parsed.resource ?? []),
            advocate: new Set(parsed.advocate ?? []),
            podcast: new Set(parsed.podcast ?? []),
          });
        }
      } catch {}
    })();
  }, []);

  // Persist changes
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      const toSave: Record<Kind, string[]> = {
        campaign: Array.from(state.campaign),
        resource: Array.from(state.resource),
        advocate: Array.from(state.advocate),
        podcast: Array.from(state.podcast),
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {}
    })();
  }, [state]);

  const toggle = React.useCallback((kind: Kind, id: string) => {
    setState((prev) => {
      const next: FavoritesState = {
        campaign: new Set(prev.campaign),
        resource: new Set(prev.resource),
        advocate: new Set(prev.advocate),
        podcast: new Set(prev.podcast),
      };
      const set = next[kind];
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return next;
    });
  }, []);

  const has = React.useCallback(
    (kind: Kind, id: string) => state[kind].has(id),
    [state],
  );

  return (
    <FavoritesContext.Provider value={{ state, toggle, has }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
