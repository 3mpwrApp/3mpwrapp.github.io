import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';

import { useTranslation } from '../i18n';
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
  const palette = useAppPalette();
  const s = styles(palette);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { showAssistantPill = true, assistantPillPosition = 'left' } = useSettings();
  const [smartRoute, setSmartRoute] = React.useState<string>('/(tabs)/advocacy/assistant-hub');
  
  // Determine smart route based on context
  React.useEffect(() => {
    (async () => {
      try {
        // Check if user has disability wizard suggestions
        const { getWizardSuggestions } = await import('../services/disabilityWizard');
        const suggestions = await getWizardSuggestions();
        
        // Check if user has recent tool usage
        const { usage } = await import('../services/usage');
        const buffer = usage?.getBuffer?.() || [];
        const recentTools = buffer
          .filter((e: any) => ['usage.view', 'usage.complete'].includes(e.type))
          .slice(-5);
        
        // Smart routing logic:
        // 1. If on home and has suggestions -> assistant hub
        // 2. If on assistant hub -> home (toggle behavior)
        // 3. If has suggestions and not on home -> home
        // 4. Otherwise -> assistant hub
        if (pathname === '/(tabs)/index' || pathname === '/') {
          setSmartRoute('/(tabs)/advocacy/assistant-hub');
        } else if (pathname === '/(tabs)/advocacy/assistant-hub') {
          setSmartRoute('/(tabs)/index');
        } else if (suggestions.length > 0) {
          setSmartRoute('/(tabs)/index');
        } else if (recentTools.length > 0) {
          setSmartRoute('/(tabs)/advocacy/assistant-hub');
        } else {
          setSmartRoute('/(tabs)/advocacy/assistant-hub');
        }
      } catch {
        setSmartRoute('/(tabs)/advocacy/assistant-hub');
      }
    })();
  }, [pathname]);
  
  // Haptics optional (native only, not available on web)
  let Haptics: any = null;
  if (Platform.OS !== 'web') {
    try { Haptics = require('expo-haptics'); } catch {}
  }
  const scale = React.useRef(new Animated.Value(1)).current as any;
  const animateTo = (v: number) => {
    Animated.timing(scale, { toValue: v, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  
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
