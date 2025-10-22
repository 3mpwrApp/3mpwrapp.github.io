import React from "react";

import type { ProvinceCode } from "../types/models";
import { logger } from "../utils/logger";

let AsyncStorage: any;
try {
  // Optional persistence if AsyncStorage is installed
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

/** Font scaling options */
export type TextScale = "normal" | "large" | "xlarge";

/** Shape of the settings state */
export type ResourceFormat = "text" | "audio" | "asl" | "easy";

export type SettingsState = {
  highContrast: boolean;
  textScale: TextScale;
  dyslexiaFriendly: boolean;
  plainLanguage: boolean;
  captionsPreferred: boolean;
  resourcePreferredFormat: ResourceFormat;
  province: ProvinceCode | null;
  includeProvincialHolidays: boolean;
  youtubeOpenPreference: "ask" | "app" | "browser";
  voiceMode: boolean;
  // UI preferences
  showAssistantPill?: boolean;
  assistantPillPosition?: 'left' | 'right';
  // Enhanced accessibility settings
  screenReaderOptimized: boolean;
  reduceMotion: boolean;
  focusIndicatorEnhanced: boolean;
  tapTargetMinimum: boolean;
  // Notification preferences
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  emergencyAlerts: boolean;
  wellnessReminders: boolean;
  eventReminders: boolean;
  // Privacy and security
  requirePasscodeOnLaunch: boolean;
  autoLockTimeout: number; // minutes
  analyticsOptOut: boolean;
  saveSearchHistory: boolean; // NEW: Allow users to opt-out of search history
  moodNudgesEnabled: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string; // '22:00'
  quietHoursEnd?: string;   // '07:00'
};

/** Context type including setters */
type Ctx = SettingsState & {
  setHighContrast: (v: boolean) => void;
  setTextScale: (v: TextScale) => void;
  setDyslexiaFriendly: (v: boolean) => void;
  setPlainLanguage: (v: boolean) => void;
  setCaptionsPreferred: (v: boolean) => void;
  setResourcePreferredFormat: (v: ResourceFormat) => void;
  setProvince: (p: SettingsState["province"]) => void;
  setIncludeProvincialHolidays: (v: boolean) => void;
  setYoutubeOpenPreference: (v: SettingsState["youtubeOpenPreference"]) => void;
  setVoiceMode: (v: boolean) => void;
  setShowAssistantPill: (v: boolean) => void;
  setAssistantPillPosition: (v: 'left'|'right') => void;
  // Enhanced accessibility setters
  setScreenReaderOptimized: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setFocusIndicatorEnhanced: (v: boolean) => void;
  setTapTargetMinimum: (v: boolean) => void;
  // Notification setters
  setNotificationsEnabled: (v: boolean) => void;
  setNotificationSound: (v: boolean) => void;
  setNotificationVibration: (v: boolean) => void;
  setEmergencyAlerts: (v: boolean) => void;
  setWellnessReminders: (v: boolean) => void;
  setEventReminders: (v: boolean) => void;
  // Privacy and security setters
  setRequirePasscodeOnLaunch: (v: boolean) => void;
  setAutoLockTimeout: (v: number) => void;
  setAnalyticsOptOut: (v: boolean) => void;
  setSaveSearchHistory: (v: boolean) => void;
  setMoodNudgesEnabled: (v: boolean) => void;
  setQuietHoursEnabled: (v: boolean) => void;
  setQuietHoursStart: (v: string) => void;
  setQuietHoursEnd: (v: string) => void;
};

/** Default values if nothing stored */
const DEFAULTS: SettingsState = {
  highContrast: false,
  textScale: "normal",
  dyslexiaFriendly: false,
  plainLanguage: false,
  captionsPreferred: true,
  resourcePreferredFormat: "text",
  province: null,
  includeProvincialHolidays: false,
  youtubeOpenPreference: "ask",
  voiceMode: false,
  showAssistantPill: true,
  assistantPillPosition: 'left',
  // Enhanced accessibility defaults
  screenReaderOptimized: false,
  reduceMotion: false,
  focusIndicatorEnhanced: false,
  tapTargetMinimum: true,
  // Notification defaults
  notificationsEnabled: true,
  notificationSound: true,
  notificationVibration: true,
  emergencyAlerts: true,
  wellnessReminders: false,
  eventReminders: false,
  // Privacy and security defaults
  requirePasscodeOnLaunch: false,
  autoLockTimeout: 5,
  analyticsOptOut: false,
  saveSearchHistory: true, // NEW: Default to saving search history (opt-out available)
  moodNudgesEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

const STORAGE_KEY = "settings:v1";

/** React Context */
const SettingsContext = React.createContext<Ctx | undefined>(undefined);

/** Provider component */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SettingsState>(DEFAULTS);

  // Load persisted state on mount
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({ ...DEFAULTS, ...parsed });
        }
      } catch (e) {
        logger.warn("Failed to load settings", e);
      }
    })();
  }, []);

  // Persist whenever state changes
  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        logger.warn("Failed to save settings", e);
      }
    })();
  }, [state]);

  // Setters
  const setHighContrast = (v: boolean) =>
    setState((s) => ({ ...s, highContrast: v }));
  const setTextScale = (v: TextScale) =>
    setState((s) => ({ ...s, textScale: v }));
  const setDyslexiaFriendly = (v: boolean) =>
    setState((s) => ({ ...s, dyslexiaFriendly: v }));
  const setPlainLanguage = (v: boolean) =>
    setState((s) => ({ ...s, plainLanguage: v }));
  const setCaptionsPreferred = (v: boolean) =>
    setState((s) => ({ ...s, captionsPreferred: v }));
  const setResourcePreferredFormat = (v: ResourceFormat) =>
    setState((s) => ({ ...s, resourcePreferredFormat: v }));
  const setProvince = (p: SettingsState["province"]) =>
    setState((s) => ({ ...s, province: p }));
  const setIncludeProvincialHolidays = (v: boolean) =>
    setState((s) => ({ ...s, includeProvincialHolidays: v }));
  const setYoutubeOpenPreference = (
    v: SettingsState["youtubeOpenPreference"],
  ) => setState((s) => ({ ...s, youtubeOpenPreference: v }));
  const setVoiceMode = (v: boolean) =>
    setState((s) => ({ ...s, voiceMode: v }));
  const setShowAssistantPill = (v: boolean) =>
    setState((s) => ({ ...s, showAssistantPill: v }));
  const setAssistantPillPosition = (v: 'left'|'right') =>
    setState((s) => ({ ...s, assistantPillPosition: v }));

  // Enhanced accessibility setters
  const setScreenReaderOptimized = (v: boolean) =>
    setState((s) => ({ ...s, screenReaderOptimized: v }));
  const setReduceMotion = (v: boolean) =>
    setState((s) => ({ ...s, reduceMotion: v }));
  const setFocusIndicatorEnhanced = (v: boolean) =>
    setState((s) => ({ ...s, focusIndicatorEnhanced: v }));
  const setTapTargetMinimum = (v: boolean) =>
    setState((s) => ({ ...s, tapTargetMinimum: v }));

  // Notification setters
  const setNotificationsEnabled = (v: boolean) =>
    setState((s) => ({ ...s, notificationsEnabled: v }));
  const setNotificationSound = (v: boolean) =>
    setState((s) => ({ ...s, notificationSound: v }));
  const setNotificationVibration = (v: boolean) =>
    setState((s) => ({ ...s, notificationVibration: v }));
  const setEmergencyAlerts = (v: boolean) =>
    setState((s) => ({ ...s, emergencyAlerts: v }));
  const setWellnessReminders = (v: boolean) =>
    setState((s) => ({ ...s, wellnessReminders: v }));
  const setEventReminders = (v: boolean) =>
    setState((s) => ({ ...s, eventReminders: v }));

  // Privacy and security setters
  const setRequirePasscodeOnLaunch = (v: boolean) =>
    setState((s) => ({ ...s, requirePasscodeOnLaunch: v }));
  const setAutoLockTimeout = (v: number) =>
    setState((s) => ({ ...s, autoLockTimeout: v }));
  const setAnalyticsOptOut = (v: boolean) =>
    setState((s) => ({ ...s, analyticsOptOut: v }));
  const setSaveSearchHistory = (v: boolean) =>
    setState((s) => ({ ...s, saveSearchHistory: v }));
  const setMoodNudgesEnabled = (v: boolean) =>
    setState((s) => ({ ...s, moodNudgesEnabled: v }));
  const setQuietHoursEnabled = (v: boolean) =>
    setState(s => ({ ...s, quietHoursEnabled: v }));
  const setQuietHoursStart = (v: string) =>
    setState(s => ({ ...s, quietHoursStart: v }));
  const setQuietHoursEnd = (v: string) =>
    setState(s => ({ ...s, quietHoursEnd: v }));

  const value: Ctx = {
    ...state,
    setHighContrast,
    setTextScale,
    setDyslexiaFriendly,
    setPlainLanguage,
    setCaptionsPreferred,
    setResourcePreferredFormat,
    setProvince,
    setIncludeProvincialHolidays,
    setYoutubeOpenPreference,
    setVoiceMode,
  setShowAssistantPill,
  setAssistantPillPosition,
    // Enhanced accessibility setters
    setScreenReaderOptimized,
    setReduceMotion,
    setFocusIndicatorEnhanced,
    setTapTargetMinimum,
    // Notification setters
    setNotificationsEnabled,
    setNotificationSound,
    setNotificationVibration,
    setEmergencyAlerts,
    setWellnessReminders,
    setEventReminders,
    // Privacy and security setters
    setRequirePasscodeOnLaunch,
    setAutoLockTimeout,
    setAnalyticsOptOut,
    setSaveSearchHistory,
    setMoodNudgesEnabled,
    setQuietHoursEnabled,
    setQuietHoursStart,
    setQuietHoursEnd,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Hook to consume settings */
export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
