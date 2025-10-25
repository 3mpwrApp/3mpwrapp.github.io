import { ScrollView, StyleSheet, Text } from 'react-native';

import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function StudiesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Studies</Text>
      <Text style={s.text}>Clinical and workplace research studies will appear here. This dedicated screen keeps studies scoped within the Research tab.</Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 20 },
    title: { fontSize: Math.round(24 * factor), fontWeight:'700', color: palette.text, marginBottom: 12 },
    text: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.95, lineHeight: 22 },
  });
}
