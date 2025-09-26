import { ScrollView, StyleSheet, Text } from 'react-native';

import { HomeGuide } from '../../components/HomeGuide';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';

export default function HomeScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ color: palette.text, fontWeight: '700', fontSize: 20, marginBottom: 12 }}>
        {t('home.title','Home')}
      </Text>
      <HomeGuide />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
