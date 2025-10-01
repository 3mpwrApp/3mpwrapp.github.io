import { Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

export type Point = { id: string; title: string; lat: number; lng: number; kind?: 'law'|'protest'|'update' };

export default function MapEmbed({ points }: { points: Point[]; cluster?: boolean }) {
  const palette = useAppPalette();
  return (
    <View style={{ padding: 12, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, backgroundColor: palette.surface }}>
      <Text style={{ color: palette.text, fontWeight: '700' }}>Map unavailable on web</Text>
      <Text style={{ color: palette.text, opacity: 0.9 }}>Showing a list fallback. Install a web map provider for full support.</Text>
      {points.map((p) => (
        <Text key={p.id} style={{ color: palette.text }}>• {p.title} ({p.lat.toFixed(2)},{p.lng.toFixed(2)})</Text>
      ))}
    </View>
  );
}
