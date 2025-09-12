import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Linking, FlatList } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { advocates } from '../../../data/lawyers';
import { fetchAdvocates } from '../../../services/advocates';
import { useFavorites } from '../../../store/favorites';

export const options = { href: null };

export default function LawyerFinder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Lawyer & Advocate Finder');
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState('');
  const [issue, setIssue] = React.useState('');
  const [province, setProvince] = React.useState('');
  const [proBono, setProBono] = React.useState(false);
  const [mode, setMode] = React.useState<'list'|'map'>('list');
  const { state, toggle } = useFavorites();

  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [remoteItems, setRemoteItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const load = React.useCallback(async (reset = true) => {
    setLoading(true);
    try {
      const data = await fetchAdvocates(reset ? 1 : page + 1, pageSize, { query, issue, province, proBono });
      setTotal(data.total || 0);
      if (reset) { setRemoteItems(data.items || []); setPage(1); }
      else { setRemoteItems((prev) => prev.concat(data.items || [])); setPage((p)=>p+1); }
    } finally { setLoading(false); }
  }, [query, issue, province, proBono, page]);
  React.useEffect(() => { load(true); }, [query, issue, province, proBono]);
  const filtered = remoteItems.length ? remoteItems : advocates;

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Lawyer & Advocate Finder
      </Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
        <Pressable onPress={()=>setMode('list')} style={[s.chip, mode==='list'&&s.chipActive]}><Text style={{ color: mode==='list'? palette.onPrimary: palette.text, fontWeight:'700' }}>List</Text></Pressable>
        <Pressable onPress={()=>setMode('map')} style={[s.chip, mode==='map'&&s.chipActive]}><Text style={{ color: mode==='map'? palette.onPrimary: palette.text, fontWeight:'700' }}>Map</Text></Pressable>
      </View>
      <TextInput placeholder="Search by name, city, org" placeholderTextColor={palette.text+"77"} value={query} onChangeText={setQuery} style={s.input} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <TextInput placeholder="Issue (e.g., WSIB)" placeholderTextColor={palette.text+"77"} value={issue} onChangeText={setIssue} style={[s.input,{flex:1}]} />
        <TextInput placeholder="Province (e.g., ON)" placeholderTextColor={palette.text+"77"} value={province} onChangeText={setProvince} style={[s.input,{width:100}]} />
        <Pressable onPress={() => setProBono(v=>!v)} style={[s.chip, proBono && s.chipActive]}>
          <Text style={{ color: proBono? palette.onPrimary: palette.text, fontWeight:'700' }}>{proBono? 'Pro bono only':'Include paid'}</Text>
        </Pressable>
      </View>
      {mode==='list' ? (
      <FlatList data={filtered} keyExtractor={(a)=>a.id} renderItem={({item}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{item.name}{item.org? ` • ${item.org}`: ''}</Text>
          <Text style={s.cardText}>{[item.city, item.province].filter(Boolean).join(', ') || '—'}</Text>
          <Text style={s.cardText}>Issues: {item.issues.join(', ')}</Text>
          {item.website && (
            <Pressable onPress={() => Linking.openURL(item.website)} style={s.btn}><Text style={s.btnText}>Open website</Text></Pressable>
          )}
          {item.email && (
            <Pressable onPress={() => Linking.openURL(`mailto:${item.email}`)} style={s.btn}><Text style={s.btnText}>Email</Text></Pressable>
          )}
          <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
            <Pressable onPress={()=> Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.name, item.city, item.province].filter(Boolean).join(' '))}`)} style={s.btn}><Text style={s.btnText}>Open on Map</Text></Pressable>
            <Pressable onPress={()=> toggle('advocate', item.id, { name: item.name, city: item.city, province: item.province })} style={s.btn}>
              <Text style={s.btnText}>{state.advocate.has(item.id) ? '★ Saved' : '☆ Save'}</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListFooterComponent={
        total > filtered.length ? (
          <A11yPressable onPress={() => load(false)} style={[s.btn,{ alignSelf:'center', marginVertical: 12 }]}>
            <Text style={s.btnText}>{loading? 'Loading…':'Load more'}</Text>
          </A11yPressable>
        ) : null
      }
      />) : (
        <View style={s.mapWrap}>
          <Text style={s.cardTitle}>Map Preview</Text>
          <Text style={s.cardText}>Tap an item below to open in Maps.</Text>
          {filtered.map((item)=> (
            <Pressable key={item.id} onPress={()=> Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.name, item.city, item.province].filter(Boolean).join(' '))}`)} style={s.mapRow}>
              <Text style={{ color: palette.text }}>{item.name} — {[item.city, item.province].filter(Boolean).join(', ')}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text, marginBottom: 8 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginBottom: 8 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingVertical:6, paddingHorizontal:10, borderRadius: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 6 },
    btnText: { color: palette.text, fontWeight: '700' },
    mapWrap: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginTop: 8 },
    mapRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
  });
}
