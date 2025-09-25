import { Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import ProgressBar from './ProgressBar';

interface UploadProgressProps {
  type: 'queue' | 'upload';
  pct: number; // 0-100
  itemName?: string; // optional current file name when uploading
  style?: any;
}

/**
 * Unified progress indicator for evidence uploads / queue processing.
 * Handles i18n strings and accessible text.
 */
export default function UploadProgress({ type, pct, itemName, style }: UploadProgressProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const label = type === 'queue'
    ? `${t('templates.evidenceLocker.processingPct','Processing queue:')} ${clamped}%`
    : `${itemName ? t('common.uploadingItem','Uploading {{name}}',{ name: itemName }) : t('common.uploading','Uploading')} ${clamped}%`;
  return (
    <View style={[{ marginTop: 6 }, style]} accessibilityLabel={label} accessibilityRole="progressbar" accessibilityValue={{ now: clamped, min: 0, max: 100 }}>
      <Text style={{ color: palette.text, marginBottom: 4 }}>{label}</Text>
      <ProgressBar value={clamped} />
    </View>
  );
}
