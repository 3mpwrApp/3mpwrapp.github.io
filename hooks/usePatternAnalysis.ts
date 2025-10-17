/**
 * usePatternAnalysis Hook
 * React hook for analyzing user behavior patterns
 * 
 * Provides:
 * - Loading, error, and data states
 * - Real-time pattern queries
 * - Pattern analysis and recommendations
 * - Refresh capability
 */

import { useCallback, useEffect, useState } from 'react';

import type {
    Pattern,
    PatternAnalysis,
    PatternType,
} from '../services/patternLearning';
import { analyzePattern, getUserPatterns } from '../services/patternLearning';

export interface UsePatternAnalysisResult {
  /** All loaded patterns */
  patterns: Pattern[];
  
  /** Patterns of specific type */
  patternsByType: { [key in PatternType]?: Pattern };
  
  /** Analysis of patterns */
  analyses: PatternAnalysis[];
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error if any */
  error: Error | null;
  
  /** Refresh patterns from Firestore */
  refresh: () => Promise<void>;
  
  /** Get pattern analysis by ID */
  getAnalysis: (patternId: string) => PatternAnalysis | undefined;
}

/**
 * Hook for analyzing user behavior patterns
 * 
 * @param userId - User UID
 * @param type - Optional pattern type filter
 * @param autoRefresh - Auto-refresh interval in ms (0 = disabled)
 */
export function usePatternAnalysis(
  userId: string,
  type?: PatternType,
  autoRefresh: number = 0
): UsePatternAnalysisResult {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [analyses, setAnalyses] = useState<PatternAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPatterns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const loadedPatterns = await getUserPatterns(userId, type);
      setPatterns(loadedPatterns);
      
      // Generate analyses
      const newAnalyses = loadedPatterns.map(pattern => analyzePattern(pattern));
      setAnalyses(newAnalyses);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error loading patterns:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadPatterns();
    }
  }, [userId, type, loadPatterns]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh > 0 && userId) {
      const interval = setInterval(loadPatterns, autoRefresh);
      return () => clearInterval(interval);
    }
  }, [userId, autoRefresh, loadPatterns]);

  const patternsByType: { [key in PatternType]?: Pattern } = patterns.reduce(
    (acc, pattern) => {
      acc[pattern.type] = pattern;
      return acc;
    },
    {} as { [key in PatternType]?: Pattern }
  );

  const getAnalysis = useCallback(
    (patternId: string) => {
      return analyses.find(a => {
        const pattern = patterns.find(p => p.id === patternId);
        return pattern && analyzePattern(pattern) === a;
      });
    },
    [analyses, patterns]
  );

  return {
    patterns,
    patternsByType,
    analyses,
    isLoading,
    error,
    refresh: loadPatterns,
    getAnalysis,
  };
}

export default usePatternAnalysis;
