import { StyleSheet, Text, View } from 'react-native';

// internal modules
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

export default function ComingSoon({ title, onFeedback }: { title: string; onFeedback?: () => void }) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container} accessibilityLabel={`${title} coming soon`}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{title}</Text>
      <Text style={s.subtitle}>{t('common.comingSoon','This feature is coming soon. We\'re working on it!')}</Text>
      {!!onFeedback && (
        <A11yPressable onPress={onFeedback} accessibilityRole="button" accessibilityLabel={t('about.sendLabel','Send email')} style={s.button}>
          <Text style={s.buttonText}>{t('about.sendLabel','Send email')}</Text>
        </A11yPressable>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text, marginBottom: 8 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    button: { alignSelf: 'flex-start', backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
    buttonText: { color: palette.primary, fontWeight: '700' },
  });
}
