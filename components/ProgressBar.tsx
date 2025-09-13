import { View } from 'react-native';
import { useAppPalette } from '../theme/usePalette';

export default function ProgressBar({ value, height = 8 }: { value: number; height?: number }) {
  const palette = useAppPalette();
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <View style={{ width: '100%', backgroundColor: palette.muted + '33', height, borderRadius: height/2, overflow: 'hidden' } as any}>
      <View style={{ width: `${pct}%`, backgroundColor: palette.primary, height } as any} />
    </View>
  );
}
