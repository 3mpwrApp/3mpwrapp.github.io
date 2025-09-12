import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Linking, FlatList } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { advocates } from '../../../data/lawyers';

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

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return advocates.filter(a => {
      const text = `${a.name} ${a.org ?? ''} ${a.city ?? ''} ${a.province ?? ''} ${a.issues.join(' ')}`.toLowerCase();
      return (!q || text.includes(q))
        && (!issue || a.issues.includes(issue))
        && (!province || a.province === province)
        && (!proBono || a.proBono === true);
    });
  }, [query, issue, province, proBono]);

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Lawyer & Advocate Finder
      </Text>
      <TextInput placeholder="Search by name, city, org" placeholderTextColor={palette.text+"77"} value={query} onChangeText={setQuery} style={s.input} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <TextInput placeholder="Issue (e.g., WSIB)" placeholderTextColor={palette.text+"77"} value={issue} onChangeText={setIssue} style={[s.input,{flex:1}]} />
        <TextInput placeholder="Province (e.g., ON)" placeholderTextColor={palette.text+"77"} value={province} onChangeText={setProvince} style={[s.input,{width:100}]} />
        <Pressable onPress={() => setProBono(v=>!v)} style={[s.chip, proBono && s.chipActive]}>
          <Text style={{ color: proBono? palette.onPrimary: palette.text, fontWeight:'700' }}>{proBono? 'Pro bono only':'Include paid'}</Text>
        </Pressable>
      </View>
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
        </View>
      )} />
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
  });
}

