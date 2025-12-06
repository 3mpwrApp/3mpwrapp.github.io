/**
 * Cognitive Comfort Store
 * 
 * Enhanced navigation memory and session tracking for users with
 * brain fog, memory challenges, and cognitive fatigue.
 * 
 * Features:
 * - Navigation history ("Where was I?")
 * - Session summaries ("What did I do last time?")
 * - Focus lock ("Stay on this screen")
 * - Screen explanations ("What does this screen do?")
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// Storage keys
const STORAGE_KEYS = {
  navigationHistory: 'cognitiveComfort:navigationHistory:v1',
  sessionSummary: 'cognitiveComfort:sessionSummary:v1',
  focusLock: 'cognitiveComfort:focusLock:v1',
  voiceNotes: 'cognitiveComfort:voiceNotes:v1',
  lastSessionEnd: 'cognitiveComfort:lastSessionEnd:v1',
  currentSessionStart: 'cognitiveComfort:currentSessionStart:v1',
  preferences: 'cognitiveComfort:preferences:v1',
};

// Types
export interface NavigationHistoryEntry {
  path: string;
  screenName: string;
  timestamp: number;
  tabName?: string;
  icon?: string;
  action?: string; // What user did on this screen
}

export interface SessionSummaryEntry {
  type: 'navigation' | 'action' | 'completion';
  description: string;
  timestamp: number;
  screenName?: string;
  path?: string;
}

export interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  createdAt: number;
  screenPath?: string;
  transcription?: string;
}

export interface CognitiveComfortPreferences {
  // Navigation
  showWhereWasI: boolean;
  maxHistoryItems: number;
  showBreadcrumbTrail: boolean;
  
  // Session
  showSessionSummary: boolean;
  summarizeAfterMinutes: number; // Show summary after X minutes away
  
  // Focus
  focusLockEnabled: boolean;
  focusLockConfirmExit: boolean;
  
  // Voice notes
  voiceNotesEnabled: boolean;
  autoTranscribe: boolean;
  
  // Screen help
  showExplainButton: boolean;
  useSimpleExplanations: boolean;
  
  // Visual aids
  colorCodedTabs: boolean;
  persistentLocationIndicator: boolean;
}

export const DEFAULT_COGNITIVE_COMFORT_PREFERENCES: CognitiveComfortPreferences = {
  showWhereWasI: true,
  maxHistoryItems: 10,
  showBreadcrumbTrail: true,
  showSessionSummary: true,
  summarizeAfterMinutes: 30,
  focusLockEnabled: false,
  focusLockConfirmExit: true,
  voiceNotesEnabled: true,
  autoTranscribe: false,
  showExplainButton: true,
  useSimpleExplanations: true,
  colorCodedTabs: false,
  persistentLocationIndicator: true,
};

// Screen explanations database
export const SCREEN_EXPLANATIONS: Record<string, { simple: string; detailed: string }> = {
  'home': {
    simple: 'Your main dashboard. See what\'s new and quick links to everything.',
    detailed: 'The Home screen shows your personalized dashboard with quick access to all app features, recent activity, and notifications.',
  },
  'wellness': {
    simple: 'Tools to help you feel better. Mood tracking, breathing, and self-care.',
    detailed: 'The Wellness Hub contains mental health tools, mood tracking, meditation exercises, sleep tracking, and self-care resources.',
  },
  'community': {
    simple: 'Connect with others. Chat, share stories, and find support.',
    detailed: 'The Community section lets you connect with other users, join discussions, share experiences, and find peer support.',
  },
  'resources': {
    simple: 'Helpful tools and information. Letters, trackers, and guides.',
    detailed: 'Resources contains practical tools like letter templates, evidence lockers, deadline trackers, and educational materials.',
  },
  'advocacy': {
    simple: 'Fight for your rights. Legal help, complaints, and support.',
    detailed: 'Advocacy tools help you document issues, find legal support, file complaints, and connect with advocates.',
  },
  'settings': {
    simple: 'Customize the app. Make it work better for you.',
    detailed: 'Settings let you customize accessibility features, notifications, privacy, and appearance to suit your needs.',
  },
  'campaigns': {
    simple: 'Join causes that matter. Petitions, actions, and collective voice.',
    detailed: 'Campaigns are collective advocacy efforts you can join to push for policy changes and raise awareness.',
  },
};

// State
let navigationHistory: NavigationHistoryEntry[] = [];
let sessionSummary: SessionSummaryEntry[] = [];
let voiceNotes: VoiceNote[] = [];
let preferences: CognitiveComfortPreferences = DEFAULT_COGNITIVE_COMFORT_PREFERENCES;
let focusLockScreen: string | null = null;
let lastSessionEnd: number | null = null;
let currentSessionStart: number = Date.now();
let isLoaded = false;

// Listeners
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Load from storage
export async function loadCognitiveComfortData(): Promise<void> {
  if (isLoaded) return;
  
  try {
    const [
      storedHistory,
      storedSummary,
      storedNotes,
      storedPrefs,
      storedLastEnd,
      storedSessionStart,
      storedFocusLock,
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.navigationHistory),
      AsyncStorage.getItem(STORAGE_KEYS.sessionSummary),
      AsyncStorage.getItem(STORAGE_KEYS.voiceNotes),
      AsyncStorage.getItem(STORAGE_KEYS.preferences),
      AsyncStorage.getItem(STORAGE_KEYS.lastSessionEnd),
      AsyncStorage.getItem(STORAGE_KEYS.currentSessionStart),
      AsyncStorage.getItem(STORAGE_KEYS.focusLock),
    ]);

    if (storedHistory) navigationHistory = JSON.parse(storedHistory);
    if (storedSummary) sessionSummary = JSON.parse(storedSummary);
    if (storedNotes) voiceNotes = JSON.parse(storedNotes);
    if (storedPrefs) preferences = { ...DEFAULT_COGNITIVE_COMFORT_PREFERENCES, ...JSON.parse(storedPrefs) };
    if (storedLastEnd) lastSessionEnd = parseInt(storedLastEnd, 10);
    if (storedSessionStart) currentSessionStart = parseInt(storedSessionStart, 10);
    if (storedFocusLock) focusLockScreen = storedFocusLock;

    isLoaded = true;
    
    // Start new session
    await startNewSession();
    
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to load data:', error);
    isLoaded = true;
  }
}

// Session management
async function startNewSession(): Promise<void> {
  const now = Date.now();
  
  // Save last session end time as "now" for next time
  if (lastSessionEnd && now - lastSessionEnd > preferences.summarizeAfterMinutes * 60 * 1000) {
    // Been away long enough - prepare session summary
    sessionSummary = sessionSummary.slice(-20); // Keep last 20 entries
  }
  
  currentSessionStart = now;
  await AsyncStorage.setItem(STORAGE_KEYS.currentSessionStart, now.toString());
}

export async function endSession(): Promise<void> {
  const now = Date.now();
  await AsyncStorage.setItem(STORAGE_KEYS.lastSessionEnd, now.toString());
  lastSessionEnd = now;
}

// Navigation history
export async function recordNavigation(entry: Omit<NavigationHistoryEntry, 'timestamp'>): Promise<void> {
  const newEntry: NavigationHistoryEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  
  // Don't duplicate consecutive entries
  if (navigationHistory.length > 0 && navigationHistory[0].path === entry.path) {
    navigationHistory[0].timestamp = newEntry.timestamp;
  } else {
    navigationHistory.unshift(newEntry);
  }
  
  // Trim to max items
  navigationHistory = navigationHistory.slice(0, preferences.maxHistoryItems);
  
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.navigationHistory, JSON.stringify(navigationHistory));
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to save navigation:', error);
  }
}

export async function recordAction(description: string, screenName?: string): Promise<void> {
  const entry: SessionSummaryEntry = {
    type: 'action',
    description,
    timestamp: Date.now(),
    screenName,
  };
  
  sessionSummary.unshift(entry);
  sessionSummary = sessionSummary.slice(0, 50); // Keep last 50 actions
  
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.sessionSummary, JSON.stringify(sessionSummary));
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to save action:', error);
  }
}

export function getNavigationHistory(): NavigationHistoryEntry[] {
  return [...navigationHistory];
}

export function getSessionSummary(): SessionSummaryEntry[] {
  return [...sessionSummary];
}

export function getRecentHistory(count: number = 5): NavigationHistoryEntry[] {
  return navigationHistory.slice(0, count);
}

export async function clearNavigationHistory(): Promise<void> {
  navigationHistory = [];
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.navigationHistory);
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to clear history:', error);
  }
}

// Focus lock
export async function setFocusLock(screenPath: string | null): Promise<void> {
  focusLockScreen = screenPath;
  try {
    if (screenPath) {
      await AsyncStorage.setItem(STORAGE_KEYS.focusLock, screenPath);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.focusLock);
    }
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to set focus lock:', error);
  }
}

export function getFocusLock(): string | null {
  return focusLockScreen;
}

export function isFocusLocked(): boolean {
  return focusLockScreen !== null;
}

// Voice notes
export async function addVoiceNote(note: Omit<VoiceNote, 'id' | 'createdAt'>): Promise<VoiceNote> {
  const newNote: VoiceNote = {
    ...note,
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  
  voiceNotes.unshift(newNote);
  
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.voiceNotes, JSON.stringify(voiceNotes));
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to save voice note:', error);
  }
  
  return newNote;
}

export async function deleteVoiceNote(id: string): Promise<void> {
  voiceNotes = voiceNotes.filter((n) => n.id !== id);
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.voiceNotes, JSON.stringify(voiceNotes));
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to delete voice note:', error);
  }
}

export function getVoiceNotes(): VoiceNote[] {
  return [...voiceNotes];
}

// Preferences
export async function updatePreferences(updates: Partial<CognitiveComfortPreferences>): Promise<void> {
  preferences = { ...preferences, ...updates };
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
    notifyListeners();
  } catch (error) {
    console.error('[CognitiveComfort] Failed to save preferences:', error);
  }
}

export function getPreferences(): CognitiveComfortPreferences {
  return { ...preferences };
}

// Screen explanations
export function getScreenExplanation(screenKey: string, simple: boolean = true): string | null {
  const explanation = SCREEN_EXPLANATIONS[screenKey];
  if (!explanation) return null;
  return simple ? explanation.simple : explanation.detailed;
}

// Utility: Get time since last visit
export function getTimeSinceLastSession(): { minutes: number; hours: number; days: number } | null {
  if (!lastSessionEnd) return null;
  
  const diff = Date.now() - lastSessionEnd;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return { minutes: minutes % 60, hours: hours % 24, days };
}

// Utility: Format relative time
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Check if loaded
export function isDataLoaded(): boolean {
  return isLoaded;
}

// Get current session start timestamp
export function getSessionStart(): number {
  return currentSessionStart;
}

// React hook for using cognitive comfort in components
export function useCognitiveComfort() {
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = subscribe(() => {
      forceUpdate(x => x + 1);
    });
    return unsubscribe;
  }, []);
  
  const recordNav = useCallback((path: string, screenName: string) => {
    recordNavigation({ path, screenName });
  }, []);
  
  return {
    // State
    whereWasIEnabled: preferences.showWhereWasI,
    focusLockEnabled: preferences.focusLockEnabled,
    breadcrumbEnabled: preferences.showBreadcrumbTrail,
    showExplainButton: preferences.showExplainButton,
    showSessionSummary: preferences.showSessionSummary,
    preferences,
    
    // Navigation history
    navigationHistory: getNavigationHistory(),
    getRecentHistory,
    recordNavigation: recordNav,
    clearNavigationHistory,
    
    // Session
    sessionSummary: getSessionSummary(),
    getTimeSinceLastSession,
    
    // Focus lock
    focusLockScreen: getFocusLock(),
    setFocusLock,
    clearFocusLock: () => setFocusLock(null),
    
    // Voice notes  
    voiceNotes: getVoiceNotes(),
    addVoiceNote,
    removeVoiceNote: deleteVoiceNote,
    
    // Screen explanations
    getScreenExplanation,
    
    // Preferences
    updatePreferences,
    getPreferences,
    
    // Utils
    formatRelativeTime,
    isLoaded: isDataLoaded(),
  };
}
