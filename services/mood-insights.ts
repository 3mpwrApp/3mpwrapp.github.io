/**
 * Mood Insights & Pattern Detection Service
 * Analyzes mood entries to detect patterns, triggers, and suggest coping strategies
 */

import type { MoodEntry } from '../store/mood';

export interface MoodPattern {
  type: 'daily' | 'weekly' | 'trigger' | 'seasonal';
  description: string;
  confidence: number; // 0-1
  suggestion?: string;
}

export interface MoodTrigger {
  factor: 'sleep' | 'weather' | 'exercise' | 'social' | 'work' | 'health';
  correlation: number; // -1 to 1
  description: string;
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  moodRange: [number, number]; // [-2, 2] scale
  category: 'breathing' | 'movement' | 'social' | 'mindfulness' | 'creative' | 'rest';
  estimatedMinutes: number;
}

export interface MoodStreak {
  type: 'logging' | 'positive' | 'stable';
  count: number;
  startDate: number;
  isActive: boolean;
}

export interface ExternalFactor {
  date: string; // YYYY-MM-DD
  sleep?: number; // hours
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  exercise?: number; // minutes
  socialInteractions?: number; // count or scale
  notes?: string;
}

/**
 * Detect mood patterns from history
 */
export function detectPatterns(entries: MoodEntry[]): MoodPattern[] {
  if (entries.length < 7) return [];

  const patterns: MoodPattern[] = [];

  // Daily pattern (time of day)
  const morningScores = entries.filter(e => {
    const hour = new Date(e.ts).getHours();
    return hour >= 6 && hour < 12;
  }).map(e => e.score);

  const eveningScores = entries.filter(e => {
    const hour = new Date(e.ts).getHours();
    return hour >= 18 && hour < 24;
  }).map(e => e.score);

  if (morningScores.length >= 3 && eveningScores.length >= 3) {
    const morningAvg = average(morningScores);
    const eveningAvg = average(eveningScores);
    
    if (Math.abs(morningAvg - eveningAvg) > 0.8) {
      patterns.push({
        type: 'daily',
        description: morningAvg > eveningAvg 
          ? 'Your mood tends to be better in the morning'
          : 'Your mood tends to improve throughout the day',
        confidence: 0.7,
        suggestion: morningAvg > eveningAvg
          ? 'Consider scheduling important tasks in the morning when your energy is higher'
          : 'Try gentle activities in the morning, saving demanding tasks for later',
      });
    }
  }

  // Weekly pattern
  const weekdayScores = entries.filter(e => {
    const day = new Date(e.ts).getDay();
    return day >= 1 && day <= 5;
  }).map(e => e.score);

  const weekendScores = entries.filter(e => {
    const day = new Date(e.ts).getDay();
    return day === 0 || day === 6;
  }).map(e => e.score);

  if (weekdayScores.length >= 5 && weekendScores.length >= 2) {
    const weekdayAvg = average(weekdayScores);
    const weekendAvg = average(weekendScores);

    if (Math.abs(weekdayAvg - weekendAvg) > 0.7) {
      patterns.push({
        type: 'weekly',
        description: weekendAvg > weekdayAvg
          ? 'Your mood improves significantly on weekends'
          : 'Weekdays bring more positive energy for you',
        confidence: 0.75,
        suggestion: weekendAvg > weekdayAvg
          ? 'Work stress may be a factor. Consider weekend self-care routines you can adapt for weekdays'
          : 'Your weekday structure may be helpful. Try maintaining some routines on weekends',
      });
    }
  }

  // Trend detection (last 14 days)
  const recent14 = entries.slice(0, 14);
  if (recent14.length >= 10) {
    const firstHalf = average(recent14.slice(7, 14).map(e => e.score));
    const secondHalf = average(recent14.slice(0, 7).map(e => e.score));
    const trend = secondHalf - firstHalf;

    if (Math.abs(trend) > 0.6) {
      patterns.push({
        type: 'weekly',
        description: trend > 0
          ? 'Your mood has been improving over the past two weeks'
          : 'Your mood has been declining recently',
        confidence: 0.8,
        suggestion: trend > 0
          ? 'Great progress! Keep track of what\'s been helping'
          : 'Consider reaching out to support systems or trying new coping strategies',
      });
    }
  }

  return patterns;
}

/**
 * Suggest coping strategies based on current mood
 */
export function suggestCopingStrategies(currentScore: number, recentEntries: MoodEntry[]): CopingStrategy[] {
  const strategies: CopingStrategy[] = [
    // Low mood strategies
    {
      id: 'box-breathing',
      title: '4-7-8 Breathing Exercise',
      description: 'Inhale for 4, hold for 7, exhale for 8. Calms the nervous system.',
      moodRange: [-2, 0],
      category: 'breathing',
      estimatedMinutes: 5,
    },
    {
      id: 'gentle-walk',
      title: 'Gentle 10-Minute Walk',
      description: 'Movement can shift your mood. Even a short walk helps.',
      moodRange: [-2, 0],
      category: 'movement',
      estimatedMinutes: 10,
    },
    {
      id: 'reach-out',
      title: 'Connect with Someone',
      description: 'Text or call a trusted friend. Connection matters.',
      moodRange: [-2, -1],
      category: 'social',
      estimatedMinutes: 15,
    },
    {
      id: 'body-scan',
      title: 'Body Scan Meditation',
      description: 'Notice tension and breathe into those areas. Release stress.',
      moodRange: [-2, 1],
      category: 'mindfulness',
      estimatedMinutes: 10,
    },
    {
      id: 'rest-permission',
      title: 'Permission to Rest',
      description: 'It\'s okay to pause. Take 20 minutes for yourself.',
      moodRange: [-2, 0],
      category: 'rest',
      estimatedMinutes: 20,
    },

    // Neutral mood strategies
    {
      id: 'gratitude-list',
      title: 'Three Good Things',
      description: 'List 3 things that went well today, no matter how small.',
      moodRange: [-1, 1],
      category: 'mindfulness',
      estimatedMinutes: 5,
    },
    {
      id: 'creative-outlet',
      title: 'Creative Expression',
      description: 'Draw, write, or play music. Express yourself freely.',
      moodRange: [-1, 2],
      category: 'creative',
      estimatedMinutes: 20,
    },
    {
      id: 'stretch-routine',
      title: 'Gentle Stretching',
      description: 'Release physical tension with slow, mindful stretches.',
      moodRange: [-1, 2],
      category: 'movement',
      estimatedMinutes: 10,
    },

    // Positive mood strategies
    {
      id: 'energy-activity',
      title: 'Engage in a Fulfilling Activity',
      description: 'Use this positive energy for something meaningful to you.',
      moodRange: [0, 2],
      category: 'movement',
      estimatedMinutes: 30,
    },
    {
      id: 'plan-ahead',
      title: 'Plan for Lower Days',
      description: 'When you feel good, prepare resources for harder times.',
      moodRange: [1, 2],
      category: 'mindfulness',
      estimatedMinutes: 15,
    },
    {
      id: 'share-joy',
      title: 'Share Your Joy',
      description: 'Spread positivity by connecting with others.',
      moodRange: [1, 2],
      category: 'social',
      estimatedMinutes: 20,
    },
  ];

  // Filter strategies relevant to current mood
  return strategies.filter(s => 
    currentScore >= s.moodRange[0] && currentScore <= s.moodRange[1]
  ).slice(0, 4); // Return top 4
}

/**
 * Calculate mood streaks
 */
export function calculateStreaks(entries: MoodEntry[]): MoodStreak[] {
  if (entries.length === 0) return [];

  const streaks: MoodStreak[] = [];
  const sortedEntries = [...entries].sort((a, b) => b.ts - a.ts);

  // Logging streak (consecutive days with entries)
  let loggingCount = 0;
  let loggingStart = sortedEntries[0].ts;
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i].ts).toDateString();
    const expectedDate = new Date(Date.now() - i * oneDayMs).toDateString();
    
    if (currentDate === expectedDate || i === 0) {
      loggingCount++;
      loggingStart = sortedEntries[i].ts;
    } else {
      break;
    }
  }

  if (loggingCount >= 2) {
    streaks.push({
      type: 'logging',
      count: loggingCount,
      startDate: loggingStart,
      isActive: true,
    });
  }

  // Positive mood streak (consecutive positive entries)
  let positiveCount = 0;
  let positiveStart = 0;
  for (const entry of sortedEntries) {
    if (entry.score >= 1) {
      positiveCount++;
      positiveStart = entry.ts;
    } else {
      break;
    }
  }

  if (positiveCount >= 3) {
    streaks.push({
      type: 'positive',
      count: positiveCount,
      startDate: positiveStart,
      isActive: true,
    });
  }

  // Stable mood streak (entries within ±1 range)
  if (sortedEntries.length >= 7) {
    const recent7 = sortedEntries.slice(0, 7);
    const scores = recent7.map(e => e.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    if (maxScore - minScore <= 1) {
      streaks.push({
        type: 'stable',
        count: 7,
        startDate: recent7[recent7.length - 1].ts,
        isActive: true,
      });
    }
  }

  return streaks;
}

/**
 * Generate adaptive reminder time based on patterns
 */
export function suggestReminderTime(entries: MoodEntry[]): { hour: number; minute: number; reason: string } | null {
  if (entries.length < 7) return null;

  // Find time when user logs most frequently
  const hourCounts: Record<number, number> = {};
  entries.forEach(e => {
    const hour = new Date(e.ts).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostCommonHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0];

  if (mostCommonHour) {
    const [hour, count] = mostCommonHour;
    if (count >= 3) {
      return {
        hour: Number(hour),
        minute: 0,
        reason: `You tend to check in around ${hour}:00. Reminder set for this time.`,
      };
    }
  }

  // Default to evening check-in
  return {
    hour: 20,
    minute: 0,
    reason: 'Evening check-in to reflect on your day.',
  };
}

/**
 * Analyze correlation between external factors and mood
 */
export function analyzeFactorCorrelations(
  entries: MoodEntry[],
  factors: ExternalFactor[]
): MoodTrigger[] {
  const triggers: MoodTrigger[] = [];
  
  // Group entries by date
  const entriesByDate = new Map<string, number>();
  entries.forEach(e => {
    const date = new Date(e.ts).toISOString().split('T')[0];
    const existing = entriesByDate.get(date);
    if (!existing || e.ts > existing) {
      entriesByDate.set(date, e.score);
    }
  });

  // Sleep correlation
  const sleepPairs: Array<[number, number]> = [];
  factors.forEach(f => {
    const moodScore = entriesByDate.get(f.date);
    if (moodScore !== undefined && f.sleep !== undefined) {
      sleepPairs.push([f.sleep, moodScore]);
    }
  });

  if (sleepPairs.length >= 5) {
    const correlation = calculateCorrelation(
      sleepPairs.map(p => p[0]),
      sleepPairs.map(p => p[1])
    );

    if (Math.abs(correlation) > 0.3) {
      triggers.push({
        factor: 'sleep',
        correlation,
        description: correlation > 0
          ? `More sleep correlates with better mood (${Math.round(correlation * 100)}% correlation)`
          : `Sleep patterns may need adjustment`,
      });
    }
  }

  // Exercise correlation
  const exercisePairs: Array<[number, number]> = [];
  factors.forEach(f => {
    const moodScore = entriesByDate.get(f.date);
    if (moodScore !== undefined && f.exercise !== undefined) {
      exercisePairs.push([f.exercise, moodScore]);
    }
  });

  if (exercisePairs.length >= 5) {
    const correlation = calculateCorrelation(
      exercisePairs.map(p => p[0]),
      exercisePairs.map(p => p[1])
    );

    if (Math.abs(correlation) > 0.3) {
      triggers.push({
        factor: 'exercise',
        correlation,
        description: correlation > 0
          ? `Physical activity boosts your mood significantly`
          : `Consider adjusting exercise intensity or timing`,
      });
    }
  }

  return triggers;
}

// Helper functions
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate achievement data based on streaks and patterns
 */
export interface MoodAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number; // 0-100
}

export function getMoodAchievements(entries: MoodEntry[], streaks: MoodStreak[]): MoodAchievement[] {
  const achievements: MoodAchievement[] = [];

  // First entry
  if (entries.length >= 1) {
    achievements.push({
      id: 'first-entry',
      title: 'First Step',
      description: 'Logged your first mood entry',
      icon: '🌱',
      unlockedAt: entries[entries.length - 1].ts,
      progress: 100,
    });
  }

  // Week logging streak
  const loggingStreak = streaks.find(s => s.type === 'logging');
  if (loggingStreak && loggingStreak.count >= 7) {
    achievements.push({
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Logged mood for 7 days in a row',
      icon: '🔥',
      unlockedAt: loggingStreak.startDate,
      progress: 100,
    });
  } else if (loggingStreak) {
    achievements.push({
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Log mood for 7 days in a row',
      icon: '🔥',
      progress: (loggingStreak.count / 7) * 100,
    });
  }

  // Month logging streak
  if (loggingStreak && loggingStreak.count >= 30) {
    achievements.push({
      id: 'month-streak',
      title: 'Month Master',
      description: 'Logged mood for 30 days in a row',
      icon: '🏆',
      unlockedAt: loggingStreak.startDate,
      progress: 100,
    });
  } else if (loggingStreak && loggingStreak.count >= 7) {
    achievements.push({
      id: 'month-streak',
      title: 'Month Master',
      description: 'Log mood for 30 days in a row',
      icon: '🏆',
      progress: (loggingStreak.count / 30) * 100,
    });
  }

  // Variety in expression (using tags)
  const uniqueTags = new Set<string>();
  entries.forEach(e => e.tags?.forEach(tag => uniqueTags.add(tag)));
  if (uniqueTags.size >= 10) {
    achievements.push({
      id: 'expressive',
      title: 'Expressive Explorer',
      description: 'Used 10 different mood tags',
      icon: '🎨',
      progress: 100,
    });
  }

  // Early adopter (100 entries)
  if (entries.length >= 100) {
    achievements.push({
      id: 'dedicated',
      title: 'Dedicated Tracker',
      description: 'Logged 100 mood entries',
      icon: '⭐',
      progress: 100,
    });
  } else if (entries.length >= 10) {
    achievements.push({
      id: 'dedicated',
      title: 'Dedicated Tracker',
      description: 'Log 100 mood entries',
      icon: '⭐',
      progress: (entries.length / 100) * 100,
    });
  }

  return achievements;
}
