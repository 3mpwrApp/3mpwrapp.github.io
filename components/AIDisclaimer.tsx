import { Text } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

export default function AIDisclaimer({ style }: { style?: any }) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  return (
    <Text style={[{ fontSize:12, color: palette.textSecondary, marginTop:8 }, style]} accessibilityLabel={t('advocacy.disclaimer.notLegal')}>
      {t('advocacy.disclaimer.notLegal')} {t('advocacy.disclaimer.privacy')}
    </Text>
  );
}
