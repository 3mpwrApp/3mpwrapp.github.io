import React from 'react';
import { View, Text } from 'react-native';
import { useAppPalette } from '../theme/usePalette';

type Point = { id: string; title: string; lat: number; lng: number };

export default function MapEmbed({ points }: { points: Point[] }) {
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
  const center = points[0] || { lat: 43.653, lng: -79.383, id: 'c', title: 'Center' };
  return (
    <View style={{ height: 240, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, overflow: 'hidden' }}>
      <MapView style={{ flex: 1 }} initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.5, longitudeDelta: 0.5 }}>
        {points.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.title} />
        ))}
      </MapView>
    </View>
  );
}

