/**
 * AI Co-Pilot Proactive Service
 * 
 * Watches user behavior and proactively suggests next steps.
 * Examples: Suggest logging mood after event, remind about appeal deadline, suggest pacing break.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface ProactiveSuggestion {
  id: string;
  type: 'mood-log' | 'pacing-break' | 'evidence-capture' | 'appeal-deadline' | 'community-checkin' | 'wellness-tip';
  title: string;
  message: string;
  action: {
    type: 'navigate' | 'quick-action';
    target: string;
    params?: Record<string, any>;
  };
  priority: 'low' | 'medium' | 'high';
  triggers: BehaviorTrigger[];
  conditions: ConditionCheck[];
  createdAt: number;
  expiresAt: number;
  dismissed: boolean;
  completed: boolean;
}

export interface BehaviorTrigger {
  type: 'time-since' | 'event-occurred' | 'pattern-detected' | 'threshold-reached';
  event?: string; // e.g., 'mood-logged', 'evidence-uploaded'
  threshold?: number;
  value?: any;
}

export interface ConditionCheck {
  type: 'time-of-day' | 'user-preference' | 'energy-level' | 'location';
  condition: string;
  value: any;
}

const SUGGESTIONS_KEY = 'copilot:suggestions:v1';
const BEHAVIOR_LOG_KEY = 'copilot:behavior:v1';
const PREFERENCES_KEY = 'copilot:preferences:v1';

/**
 * Log user behavior for pattern detection
 */
export async function logBehavior(
  event: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const log = await getBehaviorLog();
    log.push({
      event,
      metadata,
      timestamp: Date.now(),
    });
    
    // Keep last 1000 events
    if (log.length > 1000) {
      log.splice(0, log.length - 1000);
    }
    
    await AsyncStorage.setItem(BEHAVIOR_LOG_KEY, JSON.stringify(log));
    
    // Check if we should generate suggestions
    await checkAndGenerateSuggestions(event, metadata);
  } catch (error) {
    console.error('Error logging behavior:', error);
  }
}

/**
 * Get behavior log
 */
async function getBehaviorLog(): Promise<Array<{ event: string; metadata?: Record<string, any>; timestamp: number }>> {
  try {
    const raw = await AsyncStorage.getItem(BEHAVIOR_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Check if we should generate suggestions based on recent behavior
 */
async function checkAndGenerateSuggestions(
  event: string,
  _metadata?: Record<string, any>
): Promise<void> {
  const suggestions: ProactiveSuggestion[] = [];
  const log = await getBehaviorLog();
  const prefs = await getPreferences();
  
  if (!prefs.enabled) return;
  
  // Suggestion: Log mood after stressful event
  if (event === 'evidence-uploaded' || event === 'letter-sent') {
    const lastMoodLog = log.reverse().find(e => e.event === 'mood-logged');
    const timeSinceLastMood = lastMoodLog ? Date.now() - lastMoodLog.timestamp : Infinity;
    
    if (timeSinceLastMood > 2 * 60 * 60 * 1000) { // 2 hours
      suggestions.push({
        id: `suggest_mood_${Date.now()}`,
        type: 'mood-log',
        title: 'How are you feeling?',
        message: 'You just completed a task. Taking a moment to check in with yourself can help track patterns.',
        action: {
          type: 'navigate',
          target: '/(tabs)/wellness/mood-check',
        },
        priority: 'medium',
        triggers: [{ type: 'event-occurred', event }],
        conditions: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + (1 * 60 * 60 * 1000), // 1 hour
        dismissed: false,
        completed: false,
      });
    }
  }
  
  // Suggestion: Take pacing break
  const recentActivity = log.slice(-10).filter(e => 
    e.event === 'letter-drafted' || e.event === 'evidence-uploaded' || e.event === 'research-viewed'
  );
  
  if (recentActivity.length >= 5) {
    const firstActivity = recentActivity[0];
    const duration = Date.now() - (firstActivity?.timestamp || Date.now());
    
    if (duration < 30 * 60 * 1000) { // Lots of activity in 30 minutes
      suggestions.push({
        id: `suggest_break_${Date.now()}`,
        type: 'pacing-break',
        title: 'Time for a break?',
        message: "You've been active for a while. A short break can help prevent burnout.",
        action: {
          type: 'navigate',
          target: '/(tabs)/wellness/pacing',
        },
        priority: 'high',
        triggers: [{ type: 'pattern-detected', threshold: 5 }],
        conditions: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
        dismissed: false,
        completed: false,
      });
    }
  }
  
  // Suggestion: Join community after tough day
  const todayMoods = log.filter(e => 
    e.event === 'mood-logged' && 
    e.timestamp > Date.now() - (24 * 60 * 60 * 1000)
  );
  
  const lowMoodCount = todayMoods.filter(e => 
    e.metadata?.mood && ['sad', 'anxious', 'angry', 'frustrated'].includes(e.metadata.mood)
  ).length;
  
  if (lowMoodCount >= 2) {
    suggestions.push({
      id: `suggest_community_${Date.now()}`,
      type: 'community-checkin',
      title: 'You\'re not alone',
      message: 'It sounds like today has been tough. The community is here if you want to connect.',
      action: {
        type: 'navigate',
        target: '/(tabs)/community',
      },
      priority: 'medium',
      triggers: [{ type: 'pattern-detected', threshold: 2 }],
      conditions: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + (6 * 60 * 60 * 1000), // 6 hours
      dismissed: false,
      completed: false,
    });
  }
  
  // Save suggestions
  await saveSuggestions(suggestions);
  
  // Send notification for high-priority suggestions
  for (const suggestion of suggestions) {
    if (suggestion.priority === 'high' && prefs.allowNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: suggestion.title,
          body: suggestion.message,
          data: { suggestionId: suggestion.id },
        },
        trigger: null, // Immediate
      });
    }
  }
}

/**
 * Get active suggestions
 */
export async function getActiveSuggestions(): Promise<ProactiveSuggestion[]> {
  try {
    const raw = await AsyncStorage.getItem(SUGGESTIONS_KEY);
    if (!raw) return [];
    const all: ProactiveSuggestion[] = JSON.parse(raw);
    
    // Filter active (not dismissed, not expired)
    return all.filter(s => 
      !s.dismissed && 
      !s.completed && 
      s.expiresAt > Date.now()
    );
  } catch {
    return [];
  }
}

/**
 * Save suggestions
 */
async function saveSuggestions(newSuggestions: ProactiveSuggestion[]): Promise<void> {
  const existing = await getAllSuggestions();
  const combined = [...existing, ...newSuggestions];
  
  // Keep last 100
  const toSave = combined.slice(-100);
  
  await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(toSave));
}

/**
 * Get all suggestions (including dismissed/completed)
 */
async function getAllSuggestions(): Promise<ProactiveSuggestion[]> {
  try {
    const raw = await AsyncStorage.getItem(SUGGESTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Dismiss a suggestion
 */
export async function dismissSuggestion(id: string): Promise<void> {
  const all = await getAllSuggestions();
  const updated = all.map(s => s.id === id ? { ...s, dismissed: true } : s);
  await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(updated));
}

/**
 * Mark suggestion as completed
 */
export async function completeSuggestion(id: string): Promise<void> {
  const all = await getAllSuggestions();
  const updated = all.map(s => s.id === id ? { ...s, completed: true } : s);
  await AsyncStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(updated));
}

/**
 * Get user preferences for co-pilot
 */
export async function getPreferences(): Promise<{
  enabled: boolean;
  allowNotifications: boolean;
  suggestionTypes: string[];
  quietHours: { start: number; end: number } | null;
}> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return {
        enabled: true,
        allowNotifications: true,
        suggestionTypes: ['mood-log', 'pacing-break', 'evidence-capture', 'community-checkin', 'wellness-tip'],
        quietHours: null,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      enabled: true,
      allowNotifications: true,
      suggestionTypes: ['mood-log', 'pacing-break', 'evidence-capture', 'community-checkin', 'wellness-tip'],
      quietHours: null,
    };
  }
}

/**
 * Update preferences
 */
export async function updatePreferences(
  prefs: Partial<{
    enabled: boolean;
    allowNotifications: boolean;
    suggestionTypes: string[];
    quietHours: { start: number; end: number } | null;
  }>
): Promise<void> {
  const current = await getPreferences();
  const updated = { ...current, ...prefs };
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
}

/**
 * Smart workflow automation
 * Example: After winning an appeal, suggest sharing in community + updating impact score
 */
export async function suggestWorkflow(context: {
  trigger: string;
  userContext?: Record<string, any>;
}): Promise<ProactiveSuggestion[]> {
  const workflows: Record<string, ProactiveSuggestion[]> = {
    'appeal-won': [
      {
        id: `workflow_celebrate_${Date.now()}`,
        type: 'community-checkin',
        title: '🎉 Share your victory!',
        message: 'You won your appeal! Share your success to inspire others.',
        action: {
          type: 'navigate',
          target: '/(tabs)/community/create-post',
          params: { template: 'victory-story' },
        },
        priority: 'high',
        triggers: [],
        conditions: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        dismissed: false,
        completed: false,
      },
      {
        id: `workflow_update_impact_${Date.now()}`,
        type: 'evidence-capture',
        title: 'Update your Impact Score',
        message: 'Add this win to your Impact Dashboard to track your progress.',
        action: {
          type: 'navigate',
          target: '/(tabs)/settings/impact-dashboard',
        },
        priority: 'medium',
        triggers: [],
        conditions: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + (48 * 60 * 60 * 1000),
        dismissed: false,
        completed: false,
      },
    ],
  };
  
  return workflows[context.trigger] || [];
}
