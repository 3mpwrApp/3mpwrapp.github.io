import React from "react";
import { I18nManager } from "react-native";

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
  t: (key: string, fallback?: string) => string;
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
    if (I18nManager.isRTL !== isRTL) {
      // Do not force reload; our current langs are LTR only.
    }
  }, [isRTL]);

  const setLanguage = (l: Lang) => setLang(l);

  const t = React.useCallback(
    (key: string, fallback: string = key) => {
      const dict = dictionaries[lang] ?? dictionaries.en;
      const v = get(dict, key, fallback);
      return typeof v === "string" ? v : fallback;
    },
    [lang],
  );

  const value: I18nContextType = { lang, t, setLanguage, isRTL };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
