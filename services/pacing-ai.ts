/**
 * AI-Powered Pacing and Energy Management Service
 * Smart energy forecasting, adaptive pacing suggestions, compassion mode
 */

export interface ActivityLog {
  id?: string;
  minutes: number;
  type?: string;
  createdAt?: any;
  intensity?: 'low' | 'moderate' | 'high';
  painLevel?: number; // 0-10
  fatigueLevel?: number; // 0-10
  recovery?: number; // hours until felt recovered
}

export interface EnergyForecast {
  hour: number;
  energyLevel: 'low' | 'moderate' | 'high';
  confidence: number; // 0-1
  suggestion: string;
}

export interface PacingAlert {
  type: 'overexertion' | 'underactivity' | 'goodPace' | 'restNeeded';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  compassionateMessage: string;
  suggestion?: string;
}

export interface AdaptiveSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'rest' | 'gentle-movement' | 'breathing' | 'adjustment';
  estimatedMinutes: number;
  energyCost: 'minimal' | 'low' | 'moderate';
}

/**
 * Forecast energy levels for the day/week based on past activity
 */
export function forecastEnergyLevels(activities: ActivityLog[], _targetDate?: Date): EnergyForecast[] {
  const forecasts: EnergyForecast[] = [];
  
  if (activities.length < 7) {
    // Not enough data, return default pattern
    return [
      { hour: 8, energyLevel: 'moderate', confidence: 0.3, suggestion: 'Morning energy varies. Track more to learn your pattern.' },
      { hour: 12, energyLevel: 'moderate', confidence: 0.3, suggestion: 'Midday energy typical. Continue tracking.' },
      { hour: 16, energyLevel: 'low', confidence: 0.3, suggestion: 'Afternoon dip is common. Consider a rest break.' },
      { hour: 20, energyLevel: 'low', confidence: 0.3, suggestion: 'Evening wind-down. Gentle activities recommended.' },
    ];
  }

  // Analyze patterns by time of day
  const activityByHour: Record<number, { total: number; count: number; avgFatigue: number }> = {};
  
  activities.forEach(act => {
    if (!act.createdAt) return;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    const hour = date.getHours();
    
    if (!activityByHour[hour]) {
      activityByHour[hour] = { total: 0, count: 0, avgFatigue: 0 };
    }
    
    activityByHour[hour].total += act.minutes || 0;
    activityByHour[hour].count += 1;
    activityByHour[hour].avgFatigue += act.fatigueLevel || 0;
  });

  // Generate forecasts for key hours
  [8, 10, 12, 14, 16, 18, 20].forEach(hour => {
    const data = activityByHour[hour];
    let energyLevel: 'low' | 'moderate' | 'high' = 'moderate';
    let confidence = 0.5;
    let suggestion = 'Typical energy level expected.';

    if (data && data.count >= 3) {
      const avgActivity = data.total / data.count;
      const avgFatigue = data.avgFatigue / data.count;
      confidence = Math.min(0.9, 0.4 + (data.count / 10));

      if (avgFatigue > 6 || avgActivity < 15) {
        energyLevel = 'low';
        suggestion = 'Lower energy predicted. Plan lighter activities or rest breaks.';
      } else if (avgFatigue < 4 && avgActivity > 45) {
        energyLevel = 'high';
        suggestion = 'Higher energy expected. Good time for more demanding tasks.';
      } else {
        energyLevel = 'moderate';
        suggestion = 'Moderate energy. Balance activity with mindful pacing.';
      }
    }

    forecasts.push({ hour, energyLevel, confidence, suggestion });
  });

  return forecasts;
}

/**
 * Check for overexertion or pacing issues
 */
export function checkPacingAlerts(activities: ActivityLog[]): PacingAlert[] {
  const alerts: PacingAlert[] = [];
  
  if (activities.length === 0) return alerts;

  // Check last 24 hours
  const last24h = activities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
  });

  const totalMinutes = last24h.reduce((sum, act) => sum + (act.minutes || 0), 0);
  const avgPain = last24h.reduce((sum, act) => sum + (act.painLevel || 0), 0) / (last24h.length || 1);
  const avgFatigue = last24h.reduce((sum, act) => sum + (act.fatigueLevel || 0), 0) / (last24h.length || 1);

  // Overexertion alert
  if (totalMinutes > 180 || avgPain > 7 || avgFatigue > 7) {
    alerts.push({
      type: 'overexertion',
      severity: 'critical',
      message: 'High activity detected. Risk of overexertion.',
      compassionateMessage: '💙 You\'ve been doing a lot. Your body is asking for rest, and that\'s completely okay. Resting is productive too.',
      suggestion: 'Consider taking the next 2-4 hours for gentle rest. Your body will thank you.',
    });
  }

  // Rest needed
  if (avgFatigue > 5 || avgPain > 5) {
    alerts.push({
      type: 'restNeeded',
      severity: 'warning',
      message: 'Elevated pain or fatigue levels detected.',
      compassionateMessage: '🌿 Your body is communicating its needs. Listening to these signals is strength, not weakness.',
      suggestion: 'Try a 20-minute rest break. Set a gentle alarm and allow yourself to truly relax.',
    });
  }

  // Check last 7 days for patterns
  const last7d = activities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const weeklyTotal = last7d.reduce((sum, act) => sum + (act.minutes || 0), 0);
  const weeklyAvgDaily = weeklyTotal / 7;

  // Under-activity (if average < 30 min/day)
  if (last7d.length >= 5 && weeklyAvgDaily < 30) {
    alerts.push({
      type: 'underactivity',
      severity: 'info',
      message: 'Activity levels are quite low this week.',
      compassionateMessage: '🌱 Starting small is perfectly fine. Even 5 minutes of gentle movement counts.',
      suggestion: 'Try a 10-minute gentle walk or stretching session. Every step forward matters.',
    });
  }

  // Good pacing
  if (last7d.length >= 5 && weeklyAvgDaily >= 30 && weeklyAvgDaily <= 90 && avgFatigue < 5) {
    alerts.push({
      type: 'goodPace',
      severity: 'info',
      message: 'Your pacing looks balanced!',
      compassionateMessage: '✨ You\'re finding a sustainable rhythm. This is what self-care looks like.',
      suggestion: 'Keep listening to your body and adjusting as needed. You\'re doing great.',
    });
  }

  return alerts;
}

/**
 * Generate adaptive suggestions based on current state
 */
export function generateAdaptiveSuggestions(
  recentActivities: ActivityLog[],
  currentPainLevel?: number,
  currentFatigueLevel?: number
): AdaptiveSuggestion[] {
  const suggestions: AdaptiveSuggestion[] = [];

  const pain = currentPainLevel || 0;
  const fatigue = currentFatigueLevel || 0;

  // High pain/fatigue = rest and breathing
  if (pain > 6 || fatigue > 6) {
    suggestions.push({
      id: 'deep-rest',
      title: 'Deep Rest Period',
      description: 'Your body needs recovery time. Rest without guilt.',
      category: 'rest',
      estimatedMinutes: 30,
      energyCost: 'minimal',
    });
    suggestions.push({
      id: 'gentle-breathing',
      title: 'Gentle Breathing Exercise',
      description: 'Slow, calming breaths to ease tension and pain.',
      category: 'breathing',
      estimatedMinutes: 5,
      energyCost: 'minimal',
    });
  }

  // Moderate pain/fatigue = gentle movement
  if (pain >= 3 && pain <= 6 && fatigue >= 3 && fatigue <= 6) {
    suggestions.push({
      id: 'gentle-stretch',
      title: 'Gentle Stretching',
      description: 'Slow, mindful stretches to maintain mobility without strain.',
      category: 'gentle-movement',
      estimatedMinutes: 10,
      energyCost: 'low',
    });
    suggestions.push({
      id: 'seated-movement',
      title: 'Seated Movement',
      description: 'Chair-based exercises that honor your current energy.',
      category: 'gentle-movement',
      estimatedMinutes: 15,
      energyCost: 'low',
    });
  }

  // Low pain/fatigue = opportunity for activity
  if (pain < 3 && fatigue < 3) {
    suggestions.push({
      id: 'moderate-walk',
      title: 'Moderate Walk',
      description: 'Take advantage of this energy window with a mindful walk.',
      category: 'gentle-movement',
      estimatedMinutes: 20,
      energyCost: 'moderate',
    });
    suggestions.push({
      id: 'activity-banking',
      title: 'Activity Banking',
      description: 'Tackle a task from your list while energy is available.',
      category: 'adjustment',
      estimatedMinutes: 30,
      energyCost: 'moderate',
    });
  }

  // Check recent activity patterns
  const last2h = recentActivities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 2 * 60 * 60 * 1000;
  });

  const recent2hTotal = last2h.reduce((sum, act) => sum + (act.minutes || 0), 0);

  if (recent2hTotal > 60) {
    suggestions.push({
      id: 'mandatory-rest',
      title: 'Mandatory Rest Break',
      description: 'You\'ve been active. Time to recharge before continuing.',
      category: 'rest',
      estimatedMinutes: 15,
      energyCost: 'minimal',
    });
  }

  return suggestions.slice(0, 3); // Return top 3
}

/**
 * Generate compassionate messages based on context
 */
export function generateCompassionateMessage(context: {
  overexertion?: boolean;
  underactivity?: boolean;
  highPain?: boolean;
  guilt?: boolean;
}): string {
  const messages = {
    overexertion: [
      '💙 You\'ve been pushing hard. Your worth isn\'t measured in productivity. Rest is healing.',
      '🌿 Taking breaks isn\'t giving up—it\'s how you sustain yourself for the long journey.',
      '✨ Your body is communicating important needs. Listening is an act of self-compassion.',
    ],
    underactivity: [
      '🌱 Starting small is brave. Every tiny step forward is progress.',
      '💪 You don\'t have to do everything today. What matters is that you\'re trying.',
      '🌸 Be gentle with yourself. Healing isn\'t linear, and that\'s okay.',
    ],
    highPain: [
      '💜 Pain is real, and it\'s not your fault. You\'re allowed to rest.',
      '🫂 Managing chronic pain is exhausting work. You\'re stronger than you know.',
      '🌙 Some days, just getting through is enough. You\'re doing your best.',
    ],
    guilt: [
      '💖 You deserve rest without justification. Your needs are valid.',
      '🌈 Pacing isn\'t weakness—it\'s wisdom. You\'re learning to honor your limits.',
      '⭐ There\'s no "should" when it comes to your body. Trust what you need.',
    ],
  };

  if (context.overexertion) return messages.overexertion[Math.floor(Math.random() * messages.overexertion.length)];
  if (context.underactivity) return messages.underactivity[Math.floor(Math.random() * messages.underactivity.length)];
  if (context.highPain) return messages.highPain[Math.floor(Math.random() * messages.highPain.length)];
  if (context.guilt) return messages.guilt[Math.floor(Math.random() * messages.guilt.length)];

  return '💚 You\'re doing the best you can, and that\'s enough.';
}

/**
 * Body & mind sync check - detect misalignment
 */
export function checkBodyMindSync(
  activities: ActivityLog[],
  moodEntries?: Array<{ ts: number; score: number }>
): { aligned: boolean; message: string; suggestion: string } {
  if (!moodEntries || moodEntries.length < 3) {
    return {
      aligned: true,
      message: 'Enable mood tracking to detect body-mind patterns.',
      suggestion: 'Track both activity and mood for personalized insights.',
    };
  }

  // Check if high activity correlates with low mood (or vice versa)
  const last7d = activities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });

  const recentMood = moodEntries.filter(m => (Date.now() - m.ts) < 7 * 24 * 60 * 60 * 1000);

  const avgActivity = last7d.reduce((sum, act) => sum + (act.minutes || 0), 0) / (last7d.length || 1);
  const avgMood = recentMood.reduce((sum, m) => sum + m.score, 0) / (recentMood.length || 1);

  // Misalignment: high activity but low mood
  if (avgActivity > 100 && avgMood < 0) {
    return {
      aligned: false,
      message: '⚠️ Your activity is high, but mood is low. Possible overexertion.',
      suggestion: 'Consider scaling back activity and prioritizing rest and joy.',
    };
  }

  // Misalignment: low activity and low mood
  if (avgActivity < 30 && avgMood < -1) {
    return {
      aligned: false,
      message: '⚠️ Low activity and low mood detected. Gentle movement may help.',
      suggestion: 'Try 10 minutes of gentle activity or a short walk. Small steps count.',
    };
  }

  // Good alignment
  return {
    aligned: true,
    message: '✅ Your activity and mood are in harmony.',
    suggestion: 'Keep listening to your body and adjusting as needed.',
  };
}

/**
 * Calculate activity streaks and achievements
 */
export function calculateActivityStreaks(activities: ActivityLog[]): {
  consistentPacing: number;
  restDays: number;
  balancedWeeks: number;
} {
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Consistent pacing: logged activity 5+ days per week
  let consistentPacing = 0;
  const last30d = activities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 30 * oneDay;
  });

  // Group by week
  const weeklyGroups: Record<string, ActivityLog[]> = {};
  last30d.forEach(act => {
    if (!act.createdAt) return;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    const weekKey = getWeekKey(date);
    if (!weeklyGroups[weekKey]) weeklyGroups[weekKey] = [];
    weeklyGroups[weekKey].push(act);
  });

  let balancedWeeks = 0;
  Object.values(weeklyGroups).forEach(week => {
    const uniqueDays = new Set(week.map(act => {
      const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
      return date.toDateString();
    }));
    
    const weeklyTotal = week.reduce((sum, act) => sum + (act.minutes || 0), 0);
    const avgDaily = weeklyTotal / 7;

    if (uniqueDays.size >= 5) {
      consistentPacing++;
    }

    // Balanced: 30-90 min/day average
    if (avgDaily >= 30 && avgDaily <= 90) {
      balancedWeeks++;
    }
  });

  // Rest days: days with < 15 min activity
  const last14d = activities.filter(act => {
    if (!act.createdAt) return false;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    return (Date.now() - date.getTime()) < 14 * oneDay;
  });

  const dailyTotals: Record<string, number> = {};
  last14d.forEach(act => {
    if (!act.createdAt) return;
    const date = act.createdAt.toDate ? act.createdAt.toDate() : new Date(act.createdAt);
    const dayKey = date.toDateString();
    dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + (act.minutes || 0);
  });

  const restDays = Object.values(dailyTotals).filter(total => total < 15).length;

  return { consistentPacing, restDays, balancedWeeks };
}

function getWeekKey(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000);
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNumber}`;
}
