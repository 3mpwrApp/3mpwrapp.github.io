import React from "react";

import { CA_JURISDICTION_CODES, getJurisdiction, listJurisdictions, listJurisdictionsByCountry, US_JURISDICTION_CODES } from "../data/jurisdictions";
import { trackEvent } from "../services/analyticsClient";
import { ANALYTICS_EVENTS } from "../services/analyticsEvents";
import type { JurisdictionData } from "../types/jurisdiction";
import { logger } from "../utils/logger";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type Country = 'CA' | 'US';

export type JurisdictionState = {
  code: string; // e.g. ON, FED, US-CA, US-FED
  country: Country; // CA or US
};

type Ctx = JurisdictionState & {
  setCode: (c: string) => void;
  setCountry: (c: Country) => void;
  data: JurisdictionData | null;
  all: JurisdictionData[]; // cached list of all jurisdictions for current country
  allJurisdictions: JurisdictionData[]; // all jurisdictions regardless of country
};

const DEFAULT_CODE = "ON"; // fallback default (Ontario) until profile-driven
const DEFAULT_COUNTRY: Country = "CA";
const STORAGE_KEY = "jurisdiction:selected:v1";
const COUNTRY_STORAGE_KEY = "jurisdiction:country:v1";

const JurisdictionContext = React.createContext<Ctx | undefined>(undefined);

export function JurisdictionProvider({ children }: { children: React.ReactNode }) {
  const [code, setCodeState] = React.useState<string>(DEFAULT_CODE);
  const [country, setCountryState] = React.useState<Country>(DEFAULT_COUNTRY);
  const [loaded, setLoaded] = React.useState(false);

  // Load persisted selection
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return setLoaded(true);
      try {
        const [rawCode, rawCountry] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(COUNTRY_STORAGE_KEY),
        ]);
        if (rawCountry === 'CA' || rawCountry === 'US') {
          setCountryState(rawCountry);
        }
        if (rawCode) {
          setCodeState(rawCode);
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
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEY, code),
          AsyncStorage.setItem(COUNTRY_STORAGE_KEY, country),
        ]);
        // Trigger cloud sync
        try {
          const { scheduleSyncToCloud } = await import('../services/cloudSync');
          scheduleSyncToCloud();
        } catch {}
      } catch (e) {
        logger.warn("Failed to save jurisdiction", e);
      }
    })();
  }, [code, country]);

  // Provide stable setter for country
  const setCountry = React.useCallback((next: Country) => {
    setCountryState(next);
    // Set default jurisdiction for the new country
    const defaultCode = next === 'US' ? 'US-FED' : 'ON';
    setCodeState(defaultCode);
    
    trackEvent(ANALYTICS_EVENTS.JURISDICTION_CHANGED, {
      jurisdiction_code: defaultCode,
      jurisdiction_name: getJurisdiction(defaultCode)?.name || defaultCode,
      country: next,
    });
  }, []);

  // Provide stable setter (validate code exists; fall back if bad)
  const setCode = React.useCallback((next: string) => {
    const allCodes = country === 'CA' ? CA_JURISDICTION_CODES : US_JURISDICTION_CODES;
    const exists = allCodes.includes(next) || allCodes.includes(next.toUpperCase());
    const defaultCode = country === 'US' ? 'US-FED' : DEFAULT_CODE;
    const validCode = exists ? next : defaultCode;
    setCodeState(validCode);
    
    // Track jurisdiction changes
    trackEvent(ANALYTICS_EVENTS.JURISDICTION_CHANGED, {
      jurisdiction_code: validCode,
      jurisdiction_name: getJurisdiction(validCode)?.name || validCode,
      country,
    });
  }, [country]);

  const data = getJurisdiction(code) || null;
  const all = React.useMemo(() => listJurisdictionsByCountry(country), [country]);
  const allJurisdictions = React.useMemo(() => listJurisdictions(), []);

  const value: Ctx = {
    code,
    country,
    setCode,
    setCountry,
    data,
    all,
    allJurisdictions,
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
