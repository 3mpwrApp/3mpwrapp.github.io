import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { logEvent } from '../../../services/analytics';
import A11yPressable from '../../../components/A11yPressable';
import MapEmbed from '../../../components/MapEmbed';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { fetchWorldItems } from '../../../services/worlddata';
import { useAppPalette } from '../../../theme/usePalette';

type MapItem = { id: string; title: string; country: string; city?: string; kind: 'law'|'protest'|'update'; lat: number; lng: number };
const seed: MapItem[] = [
  { id:'m1', title:'Accessibility Act Update', country:'Canada', city:'Ottawa', kind:'law', lat:45.4215, lng:-75.6972 },
  { id:'m2', title:'Protest for benefits reform', country:'UK', city:'London', kind:'protest', lat:51.5074, lng:-0.1278 },
  { id:'m3', title:'Inclusive hiring pilot', country:'Germany', city:'Berlin', kind:'update', lat:52.5200, lng:13.4050 },
  { id:'m4', title:'Disability rights march', country:'USA', city:'Washington, DC', kind:'protest', lat:38.9072, lng:-77.0369 },
  { id:'m5', title:'New clinic accessibility law', country:'Brazil', city:'Brasília', kind:'law', lat:-15.7939, lng:-47.8828 },
];

export const options = { href: null };

export default function WorldMap() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const [kind, setKind] = React.useState<'all'|'law'|'protest'|'update'>('all');
  const [remote, setRemote] = React.useState(seed);
  React.useEffect(()=>{ (async()=>{ try { const rows = await fetchWorldItems(); if (rows?.length) setRemote(rows as any); } catch {} })(); },[]);
  React.useEffect(()=>{ logEvent?.('advocacy.world.view', { kind }); },[kind]);
  const items = kind==='all' ? remote : remote.filter(i => i.kind === kind);
  return (
    <View style={s.container}>
      <Text style={s.title}>{t('advocacy.world.title','World Disability Map')}</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        {(['all','law','protest','update'] as const).map(k => (
          <A11yPressable key={k} hitSlop={HIT_SLOP_8} accessibilityLabel={t(`advocacy.world.filter.${k}`, k)} onPress={()=>setKind(k)} style={[s.chip, kind===k&&s.chipActive]}><Text style={{ color: kind===k? palette.onPrimary: palette.text, fontWeight:'700' }}>{t(`advocacy.world.filter.${k}`, k)}</Text></A11yPressable>
        ))}
      </View>
      <View style={{ marginTop: 8 }}>
        <MapEmbed points={items.map(i => ({ id: i.id, title: i.title, lat: i.lat, lng: i.lng, kind: i.kind }))} />
      </View>
      <Text style={[s.text,{ marginTop: 8 }]}>{t('advocacy.world.hint','Tap a card to open Google Maps')}</Text>
      {items.map(i => (
        <A11yPressable key={i.id} hitSlop={HIT_SLOP_8} onPress={()=> require('expo-linking').openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([i.title,i.city,i.country].filter(Boolean).join(' '))}`)} style={s.card}>
          <Text style={s.cardTitle}>{i.title}</Text>
          <Text style={s.cardText}>{[i.city, i.country].filter(Boolean).join(', ')} • {t(`advocacy.world.filter.${i.kind}`, i.kind)}</Text>
        </A11yPressable>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding:16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}
