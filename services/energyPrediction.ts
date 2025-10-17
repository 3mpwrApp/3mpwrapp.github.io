/**
 * Energy Prediction Service
 * Predicts user energy levels for upcoming times using ML-like heuristics
 * 
 * Algorithm:
 * - Moving average of historical energy data (weights recent data higher)
 * - Pattern matching with learned user patterns
 * - Time-of-day adjustments based on user's typical rhythms
 * - Confidence scoring based on data quality and consistency
 */

import type { Pattern} from './patternLearning';
import { PatternType, analyzePattern } from './patternLearning';

export interface EnergyPrediction {
  /** Predicted energy level (0-100) */
  level: number;

  /** Confidence score (0-100) */
  confidence: number;

  /** Time this prediction is for (milliseconds) */
  timestamp: number;

  /** Hour of day (0-23) */
  hourOfDay: number;

  /** Reasoning for this prediction */
  reasoning: string;

  /** Contributing factors */
  factors: {
    /** Moving average energy */
    averageEnergy?: number;

    /** Pattern-based prediction */
    patternPrediction?: number;

    /** Time-of-day adjustment */
    timeOfDayAdjustment?: number;

    /** Recent trend */
    recentTrend?: number;
  };
}

export interface EnergyForecast {
  /** Predictions for the next N hours */
  predictions: EnergyPrediction[];

  /** Overall trend (increasing, decreasing, stable) */
  trend: 'increasing' | 'decreasing' | 'stable';

  /** Best time in next 24h (highest predicted energy) */
  bestTime?: { hour: number; level: number };

  /** Worst time in next 24h (lowest predicted energy) */
  worstTime?: { hour: number; level: number };

  /** Recommendations based on forecast */
  recommendations: string[];
}

/**
 * Predict energy level for a specific time
 * @param currentEnergy - Current energy level (0-100)
 * @param energyHistory - Recent energy data points (last 7 days recommended)
 * @param patterns - User's learned energy patterns
 * @param targetHour - Hour of day to predict for (0-23)
 * @param targetDate - Date to predict for (default: today)
 */
export function predictEnergyForTime(
  currentEnergy: number,
  energyHistory: { timestamp: number; level: number }[],
  patterns: Pattern[],
  targetHour: number,
  targetDate: Date = new Date()
): EnergyPrediction {
  const now = Date.now();
  const targetTimestamp = new Date(targetDate);
  targetTimestamp.setHours(targetHour, 0, 0, 0);
  const targetMs = targetTimestamp.getTime();

  // 1. Calculate moving average (weights recent data higher)
  const averageEnergy = calculateWeightedMovingAverage(energyHistory);

  // 2. Get pattern-based prediction
  const energyPatterns = patterns.filter(p => p.type === 'energy');
  const patternPrediction = getPatternBasedPrediction(
    energyPatterns,
    targetHour,
    averageEnergy
  );

  // 3. Calculate time-of-day adjustment
  const timeOfDayAdjustment = calculateTimeOfDayAdjustment(
    targetHour,
    energyHistory
  );

  // 4. Calculate recent trend
  const recentTrend = calculateRecentTrend(energyHistory);

  // 5. Combine predictions using weighted average
  const weights = {
    average: 0.3,
    pattern: 0.4,
    timeOfDay: 0.2,
    trend: 0.1,
  };

  let predictedLevel = 0;
  let totalWeight = 0;

  if (averageEnergy !== null) {
    predictedLevel += averageEnergy * weights.average;
    totalWeight += weights.average;
  }

  if (patternPrediction !== null) {
    predictedLevel += patternPrediction * weights.pattern;
    totalWeight += weights.pattern;
  }

  if (timeOfDayAdjustment !== null) {
    predictedLevel += timeOfDayAdjustment * weights.timeOfDay;
    totalWeight += weights.timeOfDay;
  }

  if (recentTrend !== null) {
    predictedLevel += recentTrend * weights.trend;
    totalWeight += weights.trend;
  }

  // Normalize and clamp to 0-100
  predictedLevel = totalWeight > 0 ? predictedLevel / totalWeight : currentEnergy;
  predictedLevel = Math.max(0, Math.min(100, Math.round(predictedLevel)));

  // Calculate confidence based on data quality
  const confidence = calculateConfidence(
    energyHistory,
    patterns,
    targetHour
  );

  // Generate reasoning
  const reasoning = generateReasoningString(
    predictedLevel,
    patternPrediction,
    timeOfDayAdjustment,
    recentTrend
  );

  return {
    level: predictedLevel,
    confidence,
    timestamp: targetMs,
    hourOfDay: targetHour,
    reasoning,
    factors: {
      averageEnergy: averageEnergy !== null ? Math.round(averageEnergy) : undefined,
      patternPrediction: patternPrediction !== null ? Math.round(patternPrediction) : undefined,
      timeOfDayAdjustment: timeOfDayAdjustment !== null ? Math.round(timeOfDayAdjustment) : undefined,
      recentTrend: recentTrend !== null ? Math.round(recentTrend) : undefined,
    },
  };
}

/**
 * Generate energy forecast for next N hours
 */
export function generateEnergyForecast(
  currentEnergy: number,
  energyHistory: { timestamp: number; level: number }[],
  patterns: Pattern[],
  hoursAhead: number = 24
): EnergyForecast {
  const predictions: EnergyPrediction[] = [];
  const now = new Date();

  // Generate predictions for each hour
  for (let i = 0; i < hoursAhead; i++) {
    const forecastDate = new Date(now);
    forecastDate.setHours(now.getHours() + i);

    const hour = forecastDate.getHours();
    const prediction = predictEnergyForTime(
      currentEnergy,
      energyHistory,
      patterns,
      hour,
      forecastDate
    );

    predictions.push(prediction);
  }

  // Calculate trend
  const trend = calculateTrendDirection(predictions);

  // Find best and worst times
  const bestTime = predictions.reduce((best, current) =>
    current.level > best.level ? current : best
  );
  const worstTime = predictions.reduce((worst, current) =>
    current.level < worst.level ? current : worst
  );

  // Generate recommendations
  const recommendations = generateRecommendations(predictions, patterns);

  return {
    predictions,
    trend,
    bestTime: { hour: bestTime.hourOfDay, level: bestTime.level },
    worstTime: { hour: worstTime.hourOfDay, level: worstTime.level },
    recommendations,
  };
}

/**
 * Calculate weighted moving average (recent data weighted higher)
 */
function calculateWeightedMovingAverage(
  energyHistory: { timestamp: number; level: number }[]
): number | null {
  if (energyHistory.length === 0) return null;

  const now = Date.now();
  let totalWeight = 0;
  let weightedSum = 0;

  energyHistory.forEach((point, index) => {
    // Weight decreases exponentially with age
    // Recent points get weight 1.0, older points get lower weight
    const ageHours = (now - point.timestamp) / (1000 * 60 * 60);
    const weight = Math.exp(-ageHours / 48); // Half-life of 48 hours

    if (weight > 0.01) {
      // Skip very old data
      weightedSum += point.level * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : null;
}

/**
 * Get prediction based on learned patterns
 */
function getPatternBasedPrediction(
  energyPatterns: Pattern[],
  targetHour: number,
  fallbackValue: number
): number | null {
  if (energyPatterns.length === 0) return null;

  // Get the energy pattern for this hour
  for (const pattern of energyPatterns) {
    const analysis = analyzePattern(pattern);

    // Check if target hour is in best times
    const isBestHour = analysis.bestTimes.some(t => t.hour === targetHour);
    if (isBestHour) {
      // Predict high energy
      return Math.min(100, fallbackValue + 20);
    }

    // Check if target hour is in worst times
    const isWorstHour = analysis.worstTimes.some(t => t.hour === targetHour);
    if (isWorstHour) {
      // Predict low energy
      return Math.max(0, fallbackValue - 20);
    }
  }

  return null;
}

/**
 * Calculate adjustment factor based on time of day
 */
function calculateTimeOfDayAdjustment(
  hour: number,
  energyHistory: { timestamp: number; level: number }[]
): number | null {
  if (energyHistory.length < 5) return null;

  // Group energy by hour of day
  const hourlyAverages: { [key: number]: number[] } = {};

  energyHistory.forEach(point => {
    const pointHour = new Date(point.timestamp).getHours();
    if (!hourlyAverages[pointHour]) {
      hourlyAverages[pointHour] = [];
    }
    hourlyAverages[pointHour].push(point.level);
  });

  // Calculate average for the target hour
  if (hourlyAverages[hour] && hourlyAverages[hour].length > 0) {
    return (
      hourlyAverages[hour].reduce((a, b) => a + b, 0) /
      hourlyAverages[hour].length
    );
  }

  return null;
}

/**
 * Calculate recent trend (is energy increasing or decreasing?)
 */
function calculateRecentTrend(
  energyHistory: { timestamp: number; level: number }[]
): number | null {
  if (energyHistory.length < 2) return null;

  // Look at last 24 hours
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const recentData = energyHistory
    .filter(p => p.timestamp > oneDayAgo)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (recentData.length < 2) return null;

  // Simple linear regression trend
  const first = recentData[0];
  const last = recentData[recentData.length - 1];
  const timeDiff = last.timestamp - first.timestamp;
  const energyDiff = last.level - first.level;

  // Normalize to 0-100 scale
  return 50 + (energyDiff / timeDiff) * 1000 * 60 * 60; // per hour change
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  energyHistory: { timestamp: number; level: number }[],
  patterns: Pattern[],
  targetHour: number
): number {
  let confidence = 20; // Base confidence

  // Add confidence based on data volume
  if (energyHistory.length >= 5) confidence += 15;
  if (energyHistory.length >= 10) confidence += 15;
  if (energyHistory.length >= 20) confidence += 15;

  // Add confidence based on pattern strength
  const energyPatterns = patterns.filter(p => p.type === 'energy');
  if (energyPatterns.length > 0) {
    const strongPatterns = energyPatterns.filter(p => p.strength > 60);
    if (strongPatterns.length > 0) confidence += 20;
  }

  // Reduce confidence if data is old
  if (energyHistory.length > 0) {
    const now = Date.now();
    const oldestData = energyHistory[0].timestamp;
    const daysSinceData = (now - oldestData) / (1000 * 60 * 60 * 24);

    if (daysSinceData > 14) confidence -= 10;
    if (daysSinceData > 30) confidence -= 20;
  }

  return Math.max(10, Math.min(100, confidence));
}

/**
 * Generate human-readable reasoning
 */
function generateReasoningString(
  predictedLevel: number,
  patternPrediction: number | undefined,
  timeOfDayAdjustment: number | undefined,
  recentTrend: number | undefined
): string {
  const reasons: string[] = [];

  if (predictedLevel >= 80) {
    reasons.push('Expected high energy');
  } else if (predictedLevel >= 50) {
    reasons.push('Expected moderate energy');
  } else {
    reasons.push('Expected low energy');
  }

  if (
    patternPrediction !== undefined &&
    patternPrediction > 60
  ) {
    reasons.push('Pattern suggests high energy');
  } else if (
    patternPrediction !== undefined &&
    patternPrediction < 40
  ) {
    reasons.push('Pattern suggests low energy');
  }

  if (recentTrend !== undefined && recentTrend > 52) {
    reasons.push('Energy trending upward');
  } else if (recentTrend !== undefined && recentTrend < 48) {
    reasons.push('Energy trending downward');
  }

  return reasons.join(' • ');
}

/**
 * Calculate trend direction for forecast
 */
function calculateTrendDirection(
  predictions: EnergyPrediction[]
): 'increasing' | 'decreasing' | 'stable' {
  if (predictions.length < 2) return 'stable';

  const first = predictions[0].level;
  const last = predictions[predictions.length - 1].level;
  const diff = last - first;

  if (Math.abs(diff) < 5) return 'stable';
  return diff > 0 ? 'increasing' : 'decreasing';
}

/**
 * Generate recommendations based on forecast
 */
function generateRecommendations(
  predictions: EnergyPrediction[],
  patterns: Pattern[]
): string[] {
  const recommendations: string[] = [];

  // Find times with very low energy
  const lowEnergyTimes = predictions.filter(p => p.level < 30);
  if (lowEnergyTimes.length > 0) {
    recommendations.push(
      `Plan rest or low-intensity activities during ${lowEnergyTimes
        .map(p => `${p.hourOfDay}:00`)
        .join(', ')}`
    );
  }

  // Find times with high energy
  const highEnergyTimes = predictions.filter(p => p.level > 75);
  if (highEnergyTimes.length > 0) {
    recommendations.push(
      `Best time for demanding tasks: ${highEnergyTimes[0].hourOfDay}:00`
    );
  }

  // Recovery patterns
  const recoveryPatterns = patterns.filter(p => p.type === 'recovery');
  if (recoveryPatterns.length > 0 && lowEnergyTimes.length > 0) {
    recommendations.push('Use recovery strategies during low-energy periods');
  }

  // General recommendations
  if (predictions.length > 0) {
    const avgEnergy =
      predictions.reduce((sum, p) => sum + p.level, 0) / predictions.length;
    if (avgEnergy < 40) {
      recommendations.push('Your energy is low overall. Consider getting more rest.');
    }
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

export default {
  predictEnergyForTime,
  generateEnergyForecast,
};
