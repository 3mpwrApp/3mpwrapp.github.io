/**
 * Analytics Integration Hook
 * 
 * Provides easy-to-use analytics hooks for screens and components.
 * Automatically tracks screen views, feature usage, and key interactions.
 */

import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
    trackDailyActive,
    trackFeatureOpened,
    trackSessionEnded,
    trackSessionStarted,
} from '../services/analyticsTracking';

// Session tracking
let sessionStartTime: number | null = null;
let screensVisited = 0;
let lastActiveDate: string | null = null;

/**
 * Hook to track screen views
 * Use in each screen component
 */
export function useScreenTracking(screenName: string, featureId?: string) {
  const hasTracked = useRef(false);
  
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    
    screensVisited++;
    
    if (featureId) {
      trackFeatureOpened(featureId, 'tab');
    }
  }, [screenName, featureId]);
}

/**
 * Hook to track session start/end
 * Use in app root component
 */
export function useSessionTracking() {
  useEffect(() => {
    // Start session
    const today = new Date().toISOString().split('T')[0];
    const isFirstToday = lastActiveDate !== today;
    const daysSinceLastSession = lastActiveDate 
      ? Math.floor((Date.now() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    sessionStartTime = Date.now();
    screensVisited = 0;
    
    trackSessionStarted(isFirstToday, daysSinceLastSession);
    
    if (isFirstToday) {
      trackDailyActive();
    }
    
    lastActiveDate = today;
    
    // Track session end when app goes to background
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && sessionStartTime) {
        const duration = Date.now() - sessionStartTime;
        trackSessionEnded(duration, screensVisited);
        sessionStartTime = null;
      } else if (nextAppState === 'active' && !sessionStartTime) {
        // Resume session
        sessionStartTime = Date.now();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (sessionStartTime) {
        const duration = Date.now() - sessionStartTime;
        trackSessionEnded(duration, screensVisited);
      }
    };
  }, []);
}

/**
 * Hook to track feature actions
 * Returns a function to call when user performs an action
 */
export function useFeatureTracking(featureId: string) {
  const trackAction = useCallback((action: string) => {
    const { trackFeatureActionCompleted } = require('../services/analyticsTracking');
    trackFeatureActionCompleted(featureId, action);
  }, [featureId]);
  
  return { trackAction };
}

/**
 * Hook to track wellness actions
 */
export function useWellnessTracking() {
  const trackMood = useCallback((mood: number, hasNote: boolean) => {
    const { trackMoodLogged } = require('../services/analyticsTracking');
    trackMoodLogged(mood, hasNote);
  }, []);
  
  const trackEnergy = useCallback((energy: number) => {
    const { trackEnergyLogged } = require('../services/analyticsTracking');
    trackEnergyLogged(energy);
  }, []);
  
  const trackSymptom = useCallback((symptomType: string, severity: number) => {
    const { trackSymptomLogged } = require('../services/analyticsTracking');
    trackSymptomLogged(symptomType, severity);
  }, []);
  
  return { trackMood, trackEnergy, trackSymptom };
}

/**
 * Hook to track advocacy actions
 */
export function useAdvocacyTracking() {
  const trackTranslator = useCallback((inputLength: number, outputGenerated: boolean) => {
    const { trackTranslatorUsed } = require('../services/analyticsTracking');
    trackTranslatorUsed(inputLength, outputGenerated);
  }, []);
  
  const trackLetter = useCallback((letterType: string, wordCount: number) => {
    const { trackLetterGenerated } = require('../services/analyticsTracking');
    trackLetterGenerated(letterType, wordCount);
  }, []);
  
  const trackEvidence = useCallback((fileType: string, fileSize: number) => {
    const { trackEvidenceUploaded } = require('../services/analyticsTracking');
    trackEvidenceUploaded(fileType, fileSize);
  }, []);
  
  return { trackTranslator, trackLetter, trackEvidence };
}
