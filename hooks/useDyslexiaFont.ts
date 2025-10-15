/**
 * useDyslexiaFont
 *
 * Loads dyslexia-supporting fonts (OpenDyslexic, Lexend) on demand using expo-font.
 * Returns loading state and a boolean indicating readiness.
 *
 * The Cognitive / Dyslexia settings screen can call this to ensure fonts
 * are available before rendering previews.
 */

import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

// Local font asset paths (add font files under assets/fonts/)
// TODO: Add OpenDyslexic-Regular.ttf and Lexend-Regular.ttf to assets/fonts/
// Currently disabled until font files are added to the project
const FONT_SOURCES: Record<string, any> = {
  // OpenDyslexic: require('../assets/fonts/OpenDyslexic-Regular.ttf'),
  // Lexend: require('../assets/fonts/Lexend-Regular.ttf'),
};

export interface UseDyslexiaFontResult {
  ready: boolean; // true when fonts attempted and (if present) loaded
  loading: boolean; // true while loading
  error: Error | null;
}

export function useDyslexiaFont(load: boolean = true): UseDyslexiaFontResult {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!load) return; // Caller can defer
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Dynamically build available font map only if files exist
        const fontMap: Record<string, any> = {};
        for (const key of Object.keys(FONT_SOURCES)) {
          try {
            fontMap[key] = FONT_SOURCES[key];
          } catch {
            // If asset missing, skip silently
          }
        }
        if (Object.keys(fontMap).length > 0) {
          await Font.loadAsync(fontMap);
        }
        if (!cancelled) {
          setReady(true);
        }
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  return { ready, loading, error };
}

export default useDyslexiaFont;
