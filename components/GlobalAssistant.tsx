import { Link, usePathname } from 'expo-router';
import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/a11y';
import { useTranslation } from '../i18n';
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
  const { t } = useTranslation();
  const { showAssistantPill = true, assistantPillPosition = 'left' } = useSettings();
  // Haptics optional
  let Haptics: any; try { Haptics = require('expo-haptics'); } catch {}
  const scale = React.useRef(new Animated.Value(1)).current as any;
  const animateTo = (v: number) => {
    Animated.timing(scale, { toValue: v, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  // Hide on auth routes or modal overlays
  if (pathname?.startsWith('/(auth)')) return null;
  if (!showAssistantPill) return null;
  return (
    <View pointerEvents="box-none" style={[s.wrap, assistantPillPosition === 'right' ? s.right : s.left]}>
      <Link href={('/(tabs)/advocacy/assistant-hub' as any)} asChild>
        <A11yPressable
          role="button"
          hitSlop={HIT_SLOP_8}
          accessibilityLabel={t('assistant.pill.open','Open assistant')}
          style={s.btn}
          onPressIn={() => { try { Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Light || 0); } catch {}; animateTo(0.96); }}
          onPressOut={() => animateTo(1)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Text style={s.text}>{t('assistant.pill.cta','🤖 Ask')}</Text>
          </Animated.View>
        </A11yPressable>
      </Link>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    wrap: { position: 'absolute', bottom: 72, zIndex: 1000 },
    left: { left: 16 },
    right: { right: 16 },
    btn: { backgroundColor: palette.primary, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
    text: { color: palette.onPrimary, fontWeight: '700' },
  });
}
