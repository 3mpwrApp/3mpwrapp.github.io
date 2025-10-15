import React from "react";
import { I18nManager } from "react-native";

import { announce } from "../utils/announce";
import { showToast } from "../utils/toast";
import { logger } from '../utils/logger';

// Lightweight i18n without external deps. Supports dot-notation keys and runtime language switch.

export type Lang = "en" | "fr" | "es";

type Dictionary = Record<string, any>;

const dictionaries: Record<Lang, Dictionary> = {
  en: require("../locales/en/common.json"),
  fr: require("../locales/fr/common.json"),
  es: require("../locales/es/common.json"),
};

function get(obj: any, path: string, fallback: string) {
  return (
    path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
        obj,
      ) ?? fallback
  );
}

type I18nContextType = {
  lang: Lang;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
  tCount: (baseKey: string, count: number, fallbackBase?: string) => string;
  setLanguage: (lang: Lang) => void;
  isRTL: boolean;
};

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

function detectLanguage(): Lang {
  try {
    // Use Intl to detect locale; prefer 'en' if unknown
    const l =
      Intl.DateTimeFormat().resolvedOptions().locale?.toLowerCase() || "en";
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("es")) return "es";
    return "en";
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>(detectLanguage());
  const isRTL = false; // Extend in future when adding Arabic/Hebrew

  React.useEffect(() => {
    // In web/test environments, I18nManager may be undefined; guard accordingly.
    try {
      if ((I18nManager as any)?.isRTL !== isRTL) {
        // Do not force reload; our current langs are LTR only.
      }
    } catch {
      // noop
    }
  }, [isRTL]);

  const setLanguage = (l: Lang) => {
    setLang(l);
    // Polite live region announcement for screen readers
    try {
      const name = l === 'fr' ? 'Français' : l === 'es' ? 'Español' : 'English';
      announce(name + ' selected');
      // Also show a non-intrusive visible toast for sighted users
      showToast(name + ' selected', { type: 'success', duration: 1600 });
    } catch {}
  };

  const showBadge = !!process.env.EXPO_PUBLIC_I18N_BADGE;
  const logMissing = !!process.env.EXPO_PUBLIC_I18N_LOG_MISSING;
  const TAG = "[T]";
  const interpolate = (template: string, vars?: Record<string, string | number>) =>
    vars ? template.replace(/{{(\w+)}}/g, (_, k) => String(vars[k] ?? '')) : template;

  const t = React.useCallback(
    (key: string, fallback: string = key, vars?: Record<string, string | number>) => {
      const dict = dictionaries[lang] ?? dictionaries.en;
      let v = get(dict, key, fallback);
      if (typeof v !== "string") {
        if (logMissing && fallback === key) {
          // Only log when true miss (fallback equals key)
             
            logger.warn("[i18n-missing]", key);
        }
        return fallback;
      }
      const tagged = v.startsWith(TAG);
      if (tagged) v = v.slice(TAG.length);
      if (tagged && showBadge) return interpolate(`${v} ◀`, vars);
      return interpolate(v, vars);
    },
    [lang, showBadge, logMissing],
  );

  const tCount = React.useCallback(
    (baseKey: string, count: number, fallbackBase?: string) => {
      const form = count === 1 ? "one" : "other";
      const key = `${baseKey}.${form}`;
      const baseFallback = fallbackBase || baseKey;
      // Fallback chain: explicit plural form -> baseKey.other -> baseKey.one -> fallbackBase
      let raw = t(key, "");
      if (!raw || raw === key) {
        raw = t(`${baseKey}.other`, "");
      }
      if ((!raw || raw === `${baseKey}.other`) && form === "other") {
        raw = t(`${baseKey}.one`, baseFallback);
      }
      if (!raw) raw = baseFallback;
      return interpolate(raw, { count });
    },
    [t],
  );

  const value: I18nContextType = { lang, t, tCount, setLanguage, isRTL };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

// Non-throwing variant for components optionally rendered in isolation (tests)
export function useTranslationSafe() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    return { t: (k: string, fb?: string) => fb || k, tCount: (_k:string, c:number, fb?:string)=> (fb||_k).replace('{{count}}', String(c)), setLanguage: ()=>{}, lang:'en', isRTL:false } as any;
  }
  return ctx;
}

