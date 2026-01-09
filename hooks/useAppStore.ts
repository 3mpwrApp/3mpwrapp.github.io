import { useAppStore, type AppState } from '../store/appStore';

/**
 * Primary hook for accessing entire app state.
 * Use this for getting full store access.
 */
export function useAppState(): AppState {
  return useAppStore();
}

/**
 * Auth domain hook - provides authentication state and actions.
 * Replaces useAuth() from context/AuthContext.tsx
 */
export function useAuth() {
  return useAppStore((state) => ({
    status: state.status,
    user: state.user,
    isOnboarded: state.isOnboarded,
    completeOnboarding: state.completeOnboarding,
    signIn: state.signIn,
    continueAnonymously: state.continueAnonymously,
    signOut: state.signOut,
    // For compatibility with legacy useAuth from context/AuthContext
    loading: state.status === 'loading',
  }));
}

/**
 * Notifications domain hook.
 * Replaces useNotifications() from store/notifications.tsx
 */
export function useNotifications() {
  return useAppStore((state) => ({
    inbox: state.inbox,
    unread: state.unread,
    prefs: state.prefs,
    lastSent: state.lastSent,
    addNotifications: state.addNotifications,
    markRead: state.markRead,
    markAllRead: state.markAllRead,
    updatePrefs: state.updatePrefs,
    setLastSent: state.setLastSent,
  }));
}

/**
 * Mood domain hook.
 * Replaces useMood() from store/mood.tsx
 */
export function useMood() {
  return useAppStore((state) => ({
    entries: state.entries,
    recentAverage: state.recentAverage,
    todayEntries: state.todayEntries,
    addEntry: state.addEntry,
  }));
}

/**
 * Medications domain hook.
 * Replaces useMedications() from store/medications.tsx
 */
export function useMedications() {
  return useAppStore((state) => ({
    medications: state.medications,
    loading: state.loading,
    addMedication: state.addMedication,
    updateMedication: state.updateMedication,
    removeMedication: state.removeMedication,
    toggleMedication: state.toggleMedication,
    reload: state.reload,
  }));
}

/**
 * Settings domain hook.
 * Replaces useSettings() from store/settings.tsx
 */
export function useSettings() {
  return useAppStore((state) => ({
    highContrast: state.highContrast,
    textScale: state.textScale,
    dyslexiaFriendly: state.dyslexiaFriendly,
    plainLanguage: state.plainLanguage,
    captionsPreferred: state.captionsPreferred,
    resourcePreferredFormat: state.resourcePreferredFormat,
    province: state.province,
    includeProvincialHolidays: state.includeProvincialHolidays,
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
    // Setters
    setHighContrast: state.setHighContrast,
    setTextScale: state.setTextScale,
    setDyslexiaFriendly: state.setDyslexiaFriendly,
    setPlainLanguage: state.setPlainLanguage,
    setCaptionsPreferred: state.setCaptionsPreferred,
    setResourcePreferredFormat: state.setResourcePreferredFormat,
    setProvince: state.setProvince,
    setIncludeProvincialHolidays: state.setIncludeProvincialHolidays,
    setYoutubeOpenPreference: state.setYoutubeOpenPreference,
    setVoiceMode: state.setVoiceMode,
    setShowAssistantPill: state.setShowAssistantPill,
    setAssistantPillPosition: state.setAssistantPillPosition,
    setScreenReaderOptimized: state.setScreenReaderOptimized,
    setReduceMotion: state.setReduceMotion,
    setFocusIndicatorEnhanced: state.setFocusIndicatorEnhanced,
    setTapTargetMinimum: state.setTapTargetMinimum,
    setNotificationsEnabled: state.setNotificationsEnabled,
    setNotificationSound: state.setNotificationSound,
    setNotificationVibration: state.setNotificationVibration,
    setEmergencyAlerts: state.setEmergencyAlerts,
    setWellnessReminders: state.setWellnessReminders,
    setEventReminders: state.setEventReminders,
    setRequirePasscodeOnLaunch: state.setRequirePasscodeOnLaunch,
    setAutoLockTimeout: state.setAutoLockTimeout,
    setAnalyticsOptOut: state.setAnalyticsOptOut,
    setSaveSearchHistory: state.setSaveSearchHistory,
    setMoodNudgesEnabled: state.setMoodNudgesEnabled,
    setQuietHoursEnabled: state.setQuietHoursEnabled,
    setQuietHoursStart: state.setQuietHoursStart,
    setQuietHoursEnd: state.setQuietHoursEnd,
  }));
}
