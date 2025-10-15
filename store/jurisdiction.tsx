import React from "react";

import { getJurisdiction, listJurisdictions } from "../data/jurisdictions";
import { logEvent } from "../services/analytics";
import { ANALYTICS_EVENTS } from "../services/analyticsEvents";
import type { JurisdictionData } from "../types/jurisdiction";
import { logger } from "../utils/logger";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type JurisdictionState = {
  code: string; // e.g. ON, FED
};

type Ctx = JurisdictionState & {
  setCode: (c: string) => void;
  data: JurisdictionData | null;
  all: JurisdictionData[]; // cached list of all jurisdictions
};

const DEFAULT_CODE = "ON"; // fallback default (Ontario) until profile-driven
const STORAGE_KEY = "jurisdiction:selected:v1";

const JurisdictionContext = React.createContext<Ctx | undefined>(undefined);

export function JurisdictionProvider({ children }: { children: React.ReactNode }) {
  const [code, setCodeState] = React.useState<string>(DEFAULT_CODE);
  const [loaded, setLoaded] = React.useState(false);

  // Load persisted selection
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return setLoaded(true);
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setCodeState(raw);
        }
      } catch (e) {
        logger.warn("Failed to load jurisdiction", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist selection
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem(STORAGE_KEY, code);
      } catch (e) {
        logger.warn("Failed to save jurisdiction", e);
      }
    })();
  }, [code]);

  // Provide stable setter (validate code exists; fall back if bad)
  const setCode = React.useCallback((next: string) => {
    const exists = listJurisdictions().some((j) => j.code === next);
    const validCode = exists ? next : DEFAULT_CODE;
    setCodeState(validCode);
    
    // Track jurisdiction changes
    logEvent(ANALYTICS_EVENTS.JURISDICTION_CHANGED, {
      jurisdiction_code: validCode,
      jurisdiction_name: getJurisdiction(validCode)?.name || validCode,
    });
  }, []);

  const data = getJurisdiction(code) || null;
  const all = React.useMemo(() => listJurisdictions(), []);

  const value: Ctx = {
    code,
    setCode,
    data,
    all,
  };

  if (!loaded) return null; // simple gate until initial load resolves

  return (
    <JurisdictionContext.Provider value={value}>
      {children}
    </JurisdictionContext.Provider>
  );
}

export function useJurisdiction() {
  const ctx = React.useContext(JurisdictionContext);
  if (!ctx) throw new Error("useJurisdiction must be used within JurisdictionProvider");
  return ctx;
}
