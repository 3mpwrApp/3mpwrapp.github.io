import { Link, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/a11y';
import { useSettings } from '../store/settings';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

/**
 * Floating global AI assistant entry point.
 * - Always available above tabs (root layout)
 * - Navigates to advocacy coach (can be re-routed later to a unified chat)
 */
export default function GlobalAssistant() {
  const palette = useAppPalette();
  const s = styles(palette);
  const pathname = usePathname();
  const { showAssistantPill = true, assistantPillPosition = 'left' } = useSettings();
  // Hide on auth routes or modal overlays
  if (pathname?.startsWith('/(auth)')) return null;
  if (!showAssistantPill) return null;
  return (
    <View pointerEvents="box-none" style={[s.wrap, assistantPillPosition === 'right' ? s.right : s.left]}>
      <Link href={('/(tabs)/advocacy/assistant-hub' as any)} asChild>
        <A11yPressable role="button" hitSlop={HIT_SLOP_8} accessibilityLabel={'Open assistant'} style={s.btn}>
          <Text style={s.text}>🤖 Ask</Text>
        </A11yPressable>
      </Link>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    wrap: { position: 'absolute', bottom: 24, zIndex: 1000 },
    left: { left: 16 },
    right: { right: 16 },
    btn: { backgroundColor: palette.primary, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
    text: { color: palette.onPrimary, fontWeight: '700' },
  });
}
