import React from 'react';
import { View, Text } from 'react-native';
import { useAppPalette } from '../theme/usePalette';

type Point = { id: string; title: string; lat: number; lng: number; kind?: 'law'|'protest'|'update' };

export default function MapEmbed({ points, cluster = true }: { points: Point[]; cluster?: boolean }) {
  const palette = useAppPalette();
  let MapView: any = null;
  let Marker: any = null;
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  } catch {}
  if (!MapView) {
    return (
      <View style={{ padding: 12, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, backgroundColor: palette.surface }}>
        <Text style={{ color: palette.text, fontWeight: '700' }}>Map unavailable</Text>
        <Text style={{ color: palette.text, opacity: 0.9 }}>Install react-native-maps for embedded map. Showing list fallback.</Text>
        {points.map((p) => (
          <Text key={p.id} style={{ color: palette.text }}>• {p.title} ({p.lat.toFixed(2)},{p.lng.toFixed(2)})</Text>
        ))}
      </View>
    );
  }
  const center = points[0] || { lat: 43.653, lng: -79.383, id: 'c', title: 'Center' } as any;
  // Simple grid clustering (very naive)
  const clusters = React.useMemo(() => {
    if (!cluster || points.length < 15) return points.map(p => ({ ...p, size: 1 }));
    const grid = new Map<string, { id: string; title: string; lat: number; lng: number; size: number }>();
    points.forEach((p) => {
      const key = `${Math.round(p.lat*20)}_${Math.round(p.lng*20)}`;
      if (!grid.has(key)) grid.set(key, { id: key, title: 'Cluster', lat: p.lat, lng: p.lng, size: 0 });
      const g = grid.get(key)!; g.size += 1; g.lat = (g.lat + p.lat)/2; g.lng = (g.lng + p.lng)/2;
    });
    return Array.from(grid.values());
  }, [points, cluster]);
  const pinColor = (k?: string) => k==='law'? '#0066cc' : k==='protest'? '#cc0000' : '#00a85a';
  return (
    <View style={{ height: 240, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, overflow: 'hidden' }}>
      <MapView style={{ flex: 1 }} initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.5, longitudeDelta: 0.5 }}>
        {(clusters as any[]).map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.title} pinColor={p.size>1 ? palette.primary : pinColor((p as any).kind)}>
            {p.size>1 ? <View style={{ backgroundColor: palette.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}><Text style={{ color: palette.onPrimary, fontWeight: '700' }}>{p.size}</Text></View> : null}
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
