/**
 * usePredictedEnergy Hook
 * React hook for predicting and tracking energy levels
 * 
 * Provides:
 * - Current energy prediction
 * - 24-hour energy forecast
 * - Recommendations based on predictions
 * - Real-time updates
 */

import { useCallback, useEffect, useState } from 'react';

import type {
    EnergyForecast,
    EnergyPrediction,
} from '../services/energyPrediction';
import {
    generateEnergyForecast,
    predictEnergyForTime,
} from '../services/energyPrediction';

import { usePatternAnalysis } from './usePatternAnalysis';

export interface UsePredictedEnergyResult {
  /** Current energy prediction */
  currentPrediction: EnergyPrediction | null;

  /** 24-hour energy forecast */
  forecast: EnergyForecast | null;

  /** Whether predictions are loading */
  isLoading: boolean;

  /** Error if any */
  error: Error | null;

  /** Current actual energy (if user has recorded) */
  currentEnergy: number | null;

  /** Set current energy manually */
  setCurrentEnergy: (level: number) => void;

  /** Refresh predictions */
  refresh: () => Promise<void>;

  /** Add energy data point */
  recordEnergy: (level: number) => void;
}

/**
 * Hook for predicting energy levels
 * 
 * @param userId - User UID
 * @param refreshInterval - Auto-refresh interval in ms (0 = disabled)
 */
export function usePredictedEnergy(
  userId: string,
  refreshInterval: number = 0
): UsePredictedEnergyResult {
  const [currentPrediction, setCurrentPrediction] = useState<EnergyPrediction | null>(null);
  const [forecast, setForecast] = useState<EnergyForecast | null>(null);
  const [currentEnergy, setCurrentEnergyState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [energyHistory, setEnergyHistory] = useState<
    { timestamp: number; level: number }[]
  >([]);

  // Get patterns for energy prediction
  const { patterns } = usePatternAnalysis(userId);

  const loadPredictions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use mock current energy if not set
      const energy = currentEnergy ?? 50;

      // Get current hour prediction
      const now = new Date();
      const currentHourPrediction = predictEnergyForTime(
        energy,
        energyHistory,
        patterns,
        now.getHours()
      );
      setCurrentPrediction(currentHourPrediction);

      // Get 24-hour forecast
      const energyForecast = generateEnergyForecast(
        energy,
        energyHistory,
        patterns,
        24
      );
      setForecast(energyForecast);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error loading energy predictions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentEnergy, energyHistory, patterns]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadPredictions();
    }
  }, [userId, loadPredictions]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0 && userId) {
      const interval = setInterval(loadPredictions, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined; // Explicit return for consistency
  }, [userId, refreshInterval, loadPredictions]);

  const setCurrentEnergy = useCallback((level: number) => {
    setCurrentEnergyState(Math.max(0, Math.min(100, level)));
  }, []);

  const recordEnergy = useCallback((level: number) => {
    const normalizedLevel = Math.max(0, Math.min(100, level));
    setCurrentEnergyState(normalizedLevel);

    // Add to history
    setEnergyHistory(prev => [
      ...prev,
      {
        timestamp: Date.now(),
        level: normalizedLevel,
      },
    ]);
  }, []);

  return {
    currentPrediction,
    forecast,
    isLoading,
    error,
    currentEnergy,
    setCurrentEnergy,
    refresh: loadPredictions,
    recordEnergy,
  };
}

export default usePredictedEnergy;
