import { usePathname } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useSettings } from '../store/settings';
import { useAppPalette } from '../theme/usePalette';


/**
 * Floating global AI assistant entry point.
 * - Always available above tabs (root layout)
 * - Smart routing: routes to different destinations based on context
 *   - If user has disability wizard suggestions: goes to home
 *   - If user has recent tools: goes to assistant hub
 *   - Default: goes to assistant hub
 */
export default function GlobalAssistant() {
  const pathname = usePathname();
  const { showAssistantPill = true } = useSettings();
  
  // Hide on auth routes or modal overlays
  if (pathname?.startsWith('/(auth)')) return null;
  if (!showAssistantPill) return null;
  
  // Hide global assistant pill since Ask button is now in header
  return null;
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    wrap: { position: 'absolute', bottom: 90, zIndex: 1000 }, // Increased from 72 to 90 to clear tab bar
    left: { left: 16 },
    right: { right: 16 },
    btn: { 
      backgroundColor: palette.primary, 
      borderRadius: 22, 
      paddingHorizontal: 14, 
      paddingVertical: 10, 
      ...(Platform.OS === 'web'
        ? { boxShadow: '0 2px 3.84px rgba(0,0,0,0.25)' as any }
        : {
            shadowColor: palette.text, 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: 0.25, 
            shadowRadius: 3.84, 
            elevation: 5 
          }),
    },
    text: { color: palette.onPrimary, fontWeight: '700' },
  });
}
