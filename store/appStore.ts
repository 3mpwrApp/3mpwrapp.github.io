import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { notifyNewUser } from '../services/discordNotifications';
import type { ProvinceCode } from '../types/models';
import type { DeliveredNotification, NotificationPreferences } from '../types/notifications';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../types/notifications';
import { logger } from '../utils/logger';

// ============================================================================
// AUTH DOMAIN
// ============================================================================

type AuthStatus =
  | 'loading'
  | 'needsOnboarding'
  | 'signedOut'
  | 'anonymous'
  | 'signedIn';

type User = { id: string; name: string } | null;

interface AuthState {
  status: AuthStatus;
  user: User;
  isOnboarded: boolean;
}

interface AuthActions {
  completeOnboarding: () => Promise<void>;
  signIn: (name?: string) => Promise<void>;
  continueAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ============================================================================
// NOTIFICATIONS DOMAIN
// ============================================================================

interface NotificationsState {
  inbox: DeliveredNotification[];
  unread: number;
  prefs: NotificationPreferences;
  lastSent: Record<string, number>;
}

interface NotificationsActions {
  addNotifications: (n: DeliveredNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  updatePrefs: (updater: (p: NotificationPreferences) => NotificationPreferences) => void;
  setLastSent: (templateId: string, ts: number) => void;
}

// ============================================================================
// MOOD DOMAIN
// ============================================================================

export interface MoodEntry {
  id: string;
  ts: number;
  score: number;
  note?: string;
  tags?: string[];
  sleep?: number;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  exercise?: number;
  socialInteractions?: number;
}

interface MoodState {
  entries: MoodEntry[];
  recentAverage: number | null;
  todayEntries: MoodEntry[];
}

interface MoodActions {
  addEntry: (
    score: number,
    note?: string,
    tags?: string[],
    factors?: {
      sleep?: number;
      weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
      exercise?: number;
      socialInteractions?: number;
    }
  ) => void;
}

// ============================================================================
// MEDICATIONS DOMAIN
// ============================================================================

export type MedicationSchedule = {
  id: string;
  name: string;
  dose?: string;
  notes?: string;
  timezone?: string;
  daysOfWeek?: number[];
  times: string[];
  enabled: boolean;
  snoozeMinutes?: number;
};

interface MedicationsState {
  medications: MedicationSchedule[];
  loading: boolean;
}

interface MedicationsActions {
  addMedication: (m: MedicationSchedule) => Promise<void>;
  updateMedication: (id: string, patch: Partial<MedicationSchedule>) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  toggleMedication: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

// ============================================================================
// SETTINGS DOMAIN
// ============================================================================

export type TextScale = 'normal' | 'large' | 'xlarge';
export type ResourceFormat = 'text' | 'audio' | 'asl' | 'easy';

export type SettingsState = {
  highContrast: boolean;
  textScale: TextScale;
  dyslexiaFriendly: boolean;
  plainLanguage: boolean;
  captionsPreferred: boolean;
  resourcePreferredFormat: ResourceFormat;
  province: ProvinceCode | null;
  includeProvincialHolidays: boolean;
  youtubeOpenPreference: 'ask' | 'app' | 'browser';
  voiceMode: boolean;
  showAssistantPill?: boolean;
  assistantPillPosition?: 'left' | 'right';
  screenReaderOptimized: boolean;
  reduceMotion: boolean;
  focusIndicatorEnhanced: boolean;
  tapTargetMinimum: boolean;
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  emergencyAlerts: boolean;
  wellnessReminders: boolean;
  eventReminders: boolean;
  requirePasscodeOnLaunch: boolean;
  autoLockTimeout: number;
  analyticsOptOut: boolean;
  saveSearchHistory: boolean;
  moodNudgesEnabled: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
};

interface SettingsActions {
  setHighContrast: (v: boolean) => void;
  setTextScale: (v: TextScale) => void;
  setDyslexiaFriendly: (v: boolean) => void;
  setPlainLanguage: (v: boolean) => void;
  setCaptionsPreferred: (v: boolean) => void;
  setResourcePreferredFormat: (v: ResourceFormat) => void;
  setProvince: (p: ProvinceCode | null) => void;
  setIncludeProvincialHolidays: (v: boolean) => void;
  setYoutubeOpenPreference: (v: 'ask' | 'app' | 'browser') => void;
  setVoiceMode: (v: boolean) => void;
  setShowAssistantPill: (v: boolean) => void;
  setAssistantPillPosition: (v: 'left' | 'right') => void;
  setScreenReaderOptimized: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setFocusIndicatorEnhanced: (v: boolean) => void;
  setTapTargetMinimum: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setNotificationSound: (v: boolean) => void;
  setNotificationVibration: (v: boolean) => void;
  setEmergencyAlerts: (v: boolean) => void;
  setWellnessReminders: (v: boolean) => void;
  setEventReminders: (v: boolean) => void;
  setRequirePasscodeOnLaunch: (v: boolean) => void;
  setAutoLockTimeout: (v: number) => void;
  setAnalyticsOptOut: (v: boolean) => void;
  setSaveSearchHistory: (v: boolean) => void;
  setMoodNudgesEnabled: (v: boolean) => void;
  setQuietHoursEnabled: (v: boolean) => void;
  setQuietHoursStart: (v: string) => void;
  setQuietHoursEnd: (v: string) => void;
}

// ============================================================================
// COMBINED APP STORE
// ============================================================================

export interface AppState
  extends AuthState,
    NotificationsState,
    MoodState,
    MedicationsState,
    SettingsState,
    AuthActions,
    NotificationsActions,
    MoodActions,
    MedicationsActions,
    SettingsActions {}

// Fallback for AsyncStorage
let AsyncStorage: any = AsyncStorageLib;
try {
  if (!AsyncStorage) {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  }
} catch {
  // Web or environments without AsyncStorage
  AsyncStorage = null;
}

const DEFAULT_SETTINGS_STATE: SettingsState = {
  highContrast: false,
  textScale: 'normal',
  dyslexiaFriendly: false,
  plainLanguage: false,
  captionsPreferred: false,
  resourcePreferredFormat: 'text',
  province: null,
  includeProvincialHolidays: true,
  youtubeOpenPreference: 'ask',
  voiceMode: false,
  showAssistantPill: true,
  assistantPillPosition: 'right',
  screenReaderOptimized: false,
  reduceMotion: false,
  focusIndicatorEnhanced: false,
  tapTargetMinimum: false,
  notificationsEnabled: true,
  notificationSound: true,
  notificationVibration: true,
  emergencyAlerts: true,
  wellnessReminders: true,
  eventReminders: true,
  requirePasscodeOnLaunch: false,
  autoLockTimeout: 15,
  analyticsOptOut: false,
  saveSearchHistory: true,
  moodNudgesEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

// Helper to cap notifications
function enforceCap(
  list: DeliveredNotification[],
  cap = 100
): DeliveredNotification[] {
  if (list.length <= cap) return list;
  return [...list]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, cap);
}

// Helper to compute recent mood average
function computeRecentAverage(entries: MoodEntry[]): number | null {
  if (!entries.length) return null;
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  const recent = entries.filter((e) => e.ts >= cutoff);
  if (!recent.length) return null;
  return recent.reduce((sum, e) => sum + e.score, 0) / recent.length;
}

// Helper to get today's mood entries
function getTodayEntries(entries: MoodEntry[]): MoodEntry[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return entries.filter((e) => e.ts >= today.getTime() && e.ts < tomorrow.getTime());
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ========== AUTH STATE & ACTIONS ==========
      status: 'loading',
      user: null,
      isOnboarded: false,

      completeOnboarding: async () => {
        set({ isOnboarded: true, status: 'signedOut' });
      },

      signIn: async (name = '3mpwr User') => {
        const user: User = { id: 'local', name };
        set({ status: 'signedIn', isOnboarded: true, user });
        notifyNewUser({ isGuest: false, source: 'app' }).catch(() => {});
      },

      continueAnonymously: async () => {
        set({ status: 'anonymous', isOnboarded: true, user: null });
        notifyNewUser({ isGuest: true, source: 'app' }).catch(() => {});
      },

      signOut: async () => {
        set({ status: 'signedOut', isOnboarded: true, user: null });
      },

      // ========== NOTIFICATIONS STATE & ACTIONS ==========
      inbox: [],
      unread: 0,
      prefs: DEFAULT_NOTIFICATION_PREFERENCES(),
      lastSent: {},

      addNotifications: (notifications: DeliveredNotification[]) => {
        set((state) => {
          const newInbox = enforceCap([...state.inbox, ...notifications]);
          const newUnread = newInbox.filter((n) => !n.read).length;
          return { inbox: newInbox, unread: newUnread };
        });
      },

      markRead: (id: string) => {
        set((state) => {
          const newInbox = state.inbox.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const newUnread = newInbox.filter((n) => !n.read).length;
          return { inbox: newInbox, unread: newUnread };
        });
      },

      markAllRead: () => {
        set((state) => ({
          inbox: state.inbox.map((n) => ({ ...n, read: true })),
          unread: 0,
        }));
      },

      updatePrefs: (updater: (p: NotificationPreferences) => NotificationPreferences) => {
        set((state) => ({ prefs: updater(state.prefs) }));
      },

      setLastSent: (templateId: string, ts: number) => {
        set((state) => ({
          lastSent: { ...state.lastSent, [templateId]: ts },
        }));
      },

      // ========== MOOD STATE & ACTIONS ==========
      entries: [],
      recentAverage: null,
      todayEntries: [],

      addEntry: (score, note?, tags?, factors?) => {
        set((state) => {
          const id = `mood_${Date.now()}_${Math.random()}`;
          const newEntry: MoodEntry = {
            id,
            ts: Date.now(),
            score,
            note,
            tags,
            ...factors,
          };
          const newEntries = [...state.entries, newEntry];
          return {
            entries: newEntries,
            recentAverage: computeRecentAverage(newEntries),
            todayEntries: getTodayEntries(newEntries),
          };
        });
      },

      // ========== MEDICATIONS STATE & ACTIONS ==========
      medications: [],
      loading: false,

      addMedication: async (m: MedicationSchedule) => {
        set((state) => ({
          medications: [...state.medications, m],
        }));
      },

      updateMedication: async (id: string, patch: Partial<MedicationSchedule>) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        }));
      },

      removeMedication: async (id: string) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));
      },

      toggleMedication: async (id: string) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
          ),
        }));
      },

      reload: async () => {
        set({ loading: true });
        try {
          if (AsyncStorage) {
            const raw = await AsyncStorage.getItem('medications:v1');
            if (raw) {
              const meds = JSON.parse(raw);
              set({ medications: meds, loading: false });
              return;
            }
          }
        } catch (e) {
          logger.warn('Failed to load medications', e);
        }
        set({ loading: false });
      },

      // ========== SETTINGS STATE & ACTIONS ==========
      ...DEFAULT_SETTINGS_STATE,

      setHighContrast: (v: boolean) => set({ highContrast: v }),
      setTextScale: (v: TextScale) => set({ textScale: v }),
      setDyslexiaFriendly: (v: boolean) => set({ dyslexiaFriendly: v }),
      setPlainLanguage: (v: boolean) => set({ plainLanguage: v }),
      setCaptionsPreferred: (v: boolean) => set({ captionsPreferred: v }),
      setResourcePreferredFormat: (v: ResourceFormat) =>
        set({ resourcePreferredFormat: v }),
      setProvince: (p: ProvinceCode | null) => set({ province: p }),
      setIncludeProvincialHolidays: (v: boolean) =>
        set({ includeProvincialHolidays: v }),
      setYoutubeOpenPreference: (v: 'ask' | 'app' | 'browser') =>
        set({ youtubeOpenPreference: v }),
      setVoiceMode: (v: boolean) => set({ voiceMode: v }),
      setShowAssistantPill: (v: boolean) => set({ showAssistantPill: v }),
      setAssistantPillPosition: (v: 'left' | 'right') =>
        set({ assistantPillPosition: v }),
      setScreenReaderOptimized: (v: boolean) => set({ screenReaderOptimized: v }),
      setReduceMotion: (v: boolean) => set({ reduceMotion: v }),
      setFocusIndicatorEnhanced: (v: boolean) => set({ focusIndicatorEnhanced: v }),
      setTapTargetMinimum: (v: boolean) => set({ tapTargetMinimum: v }),
      setNotificationsEnabled: (v: boolean) => set({ notificationsEnabled: v }),
      setNotificationSound: (v: boolean) => set({ notificationSound: v }),
      setNotificationVibration: (v: boolean) => set({ notificationVibration: v }),
      setEmergencyAlerts: (v: boolean) => set({ emergencyAlerts: v }),
      setWellnessReminders: (v: boolean) => set({ wellnessReminders: v }),
      setEventReminders: (v: boolean) => set({ eventReminders: v }),
      setRequirePasscodeOnLaunch: (v: boolean) =>
        set({ requirePasscodeOnLaunch: v }),
      setAutoLockTimeout: (v: number) => set({ autoLockTimeout: v }),
      setAnalyticsOptOut: (v: boolean) => set({ analyticsOptOut: v }),
      setSaveSearchHistory: (v: boolean) => set({ saveSearchHistory: v }),
      setMoodNudgesEnabled: (v: boolean) => set({ moodNudgesEnabled: v }),
      setQuietHoursEnabled: (v: boolean) => set({ quietHoursEnabled: v }),
      setQuietHoursStart: (v: string) => set({ quietHoursStart: v }),
      setQuietHoursEnd: (v: string) => set({ quietHoursEnd: v }),
    }),
    {
      name: 'empowrapp-store',
      storage: createJSONStorage(() => AsyncStorage || {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      }),
      partialize: (state) => ({
        // Persist only these fields
        isOnboarded: state.isOnboarded,
        user: state.user,
        status: state.status,
        province: state.province,
        inbox: state.inbox,
        prefs: state.prefs,
        lastSent: state.lastSent,
        entries: state.entries,
        medications: state.medications,
        // All settings
        highContrast: state.highContrast,
        textScale: state.textScale,
        dyslexiaFriendly: state.dyslexiaFriendly,
        plainLanguage: state.plainLanguage,
        captionsPreferred: state.captionsPreferred,
        resourcePreferredFormat: state.resourcePreferredFormat,
        youtubeOpenPreference: state.youtubeOpenPreference,
        voiceMode: state.voiceMode,
        showAssistantPill: state.showAssistantPill,
        assistantPillPosition: state.assistantPillPosition,
        screenReaderOptimized: state.screenReaderOptimized,
        reduceMotion: state.reduceMotion,
        focusIndicatorEnhanced: state.focusIndicatorEnhanced,
        tapTargetMinimum: state.tapTargetMinimum,
        notificationsEnabled: state.notificationsEnabled,
        notificationSound: state.notificationSound,
        notificationVibration: state.notificationVibration,
        emergencyAlerts: state.emergencyAlerts,
        wellnessReminders: state.wellnessReminders,
        eventReminders: state.eventReminders,
        requirePasscodeOnLaunch: state.requirePasscodeOnLaunch,
        autoLockTimeout: state.autoLockTimeout,
        analyticsOptOut: state.analyticsOptOut,
        saveSearchHistory: state.saveSearchHistory,
        moodNudgesEnabled: state.moodNudgesEnabled,
        quietHoursEnabled: state.quietHoursEnabled,
        quietHoursStart: state.quietHoursStart,
        quietHoursEnd: state.quietHoursEnd,
      }),
    }
  )
);
