import React from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import MapEmbed from '../../../components/MapEmbed';
import ProvincePicker from '../../../components/ProvincePicker';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { advocates } from '../../../data/lawyers';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { fetchAdvocates } from '../../../services/advocates';
import { ANALYTICS_EVENTS, trackEvent } from '../../../services/analyticsClient';
import { useFavorites } from '../../../store/favorites';
import { useAppPalette } from '../../../theme/usePalette';
import { nativeOnly } from '../../../utils/platform';

export const options = { href: null };

export default function LawyerFinder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.finder.title','Lawyer & Advocate Finder'));
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState('');
  const [issue, setIssue] = React.useState('');
  const [province, setProvince] = React.useState('');
  const [proBono, setProBono] = React.useState(false);
  const [savedOnly, setSavedOnly] = React.useState(false);
  const [mode, setMode] = React.useState<'list' | 'map'>('list');
  const [sort, setSort] = React.useState<'relevance' | 'rating' | 'reviews'>('relevance');
  const [language, setLanguage] = React.useState('');
  const [accessible, setAccessible] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = React.useState<any>(null);
  const { state, toggle } = useFavorites();

  // Mock ratings data (in production, fetch from Firestore)
  const [ratingsData, setRatingsData] = React.useState<Record<string, { avgRating: number; reviewCount: number; reviews: Array<{ name: string; rating: number; comment: string; date: string }> }>>({
    'a1': { avgRating: 4.8, reviewCount: 24, reviews: [{ name: 'Sarah M.', rating: 5, comment: 'Helped me win my WSIB appeal. Professional and caring.', date: '2025-11-15' }] },
    'a7': { avgRating: 4.9, reviewCount: 67, reviews: [{ name: 'Mike T.', rating: 5, comment: 'Experts in WSIB. They know the system inside out.', date: '2025-11-20' }] },
    'a8': { avgRating: 4.7, reviewCount: 18, reviews: [{ name: 'Anonymous', rating: 5, comment: 'Paul\'s advocacy saved my life. Incredible resource.', date: '2025-11-18' }] },
  });

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
  React.useEffect(() => {
    // Debounced-ish analytics for search state change
    const id = setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.ADVOCACY_FINDER_SEARCH, {
        query: query || undefined,
        issue: issue || undefined,
        province: province || undefined,
        proBono,
        savedOnly,
        mode,
        total,
      });
    }, 400);
    return () => clearTimeout(id);
  }, [query, issue, province, proBono, savedOnly, mode, total]);
  const base = remoteItems.length ? remoteItems : advocates;
  let filtered = savedOnly ? base.filter((a)=> state.advocate.has(a.id)) : base;
  
  // Apply language filter
  if (language) {
    filtered = filtered.filter(a => {
      // In production, check advocate.languages array
      return language === 'English'; // Mock: assume all speak English
    });
  }
  
  // Apply accessibility filter
  if (accessible) {
    filtered = filtered.filter(a => {
      // In production, check advocate.accessibilityFeatures
      return a.id === 'a1' || a.id === 'a7'; // Mock: only some are accessible
    });
  }
  
  // Apply sorting
  if (sort === 'rating') {
    filtered = [...filtered].sort((a, b) => (ratingsData[b.id]?.avgRating || 0) - (ratingsData[a.id]?.avgRating || 0));
  } else if (sort === 'reviews') {
    filtered = [...filtered].sort((a, b) => (ratingsData[b.id]?.reviewCount || 0) - (ratingsData[a.id]?.reviewCount || 0));
  }

  const modeButtons = (
    <GapView style={{ flexDirection:'row', marginBottom: 8 }} gap={8}>
      <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setMode('list')} style={[s.chip, mode==='list'&&s.chipActive]}><Text style={{ color: mode==='list'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.finder.modeList','List')}</Text></A11yPressable>
      <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setMode('map')} style={[s.chip, mode==='map'&&s.chipActive]}><Text style={{ color: mode==='map'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.finder.modeMap','Map')}</Text></A11yPressable>
    </GapView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {mode==='list' ? (
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(a)=>a.id}
        ListHeaderComponent={
          <View style={{ padding: 20, paddingBottom: 12 }}>
            <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.finder.title','Lawyer & Advocate Finder')}</Text>
            <DisclaimerBanner type="legal" compact={true} />
            {modeButtons}
            <TextInput placeholder={t('advocacy.finder.searchPlaceholder','Search by name, city, org')} placeholderTextColor={palette.text+"77"} value={query} onChangeText={setQuery} style={s.input} accessibilityLabel={t('advocacy.finder.searchPlaceholder','Search by name, city, org')} />
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
              <TextInput placeholder={t('advocacy.finder.issuePlaceholder','Issue (e.g., WSIB)')} placeholderTextColor={palette.text+"77"} value={issue} onChangeText={setIssue} style={[s.input,{flex:1}]} accessibilityLabel={t('advocacy.finder.issuePlaceholder','Issue (e.g., WSIB)')} />
              <View style={{ flexBasis: '100%' }} />
              <ProvincePicker value={province} onChange={(p)=> setProvince(p as any)} />
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setProBono(v=>!v)} style={[s.chip, proBono && s.chipActive]}>
                <Text style={{ color: proBono? palette.onPrimary: palette.text, fontWeight:'700' }}>{proBono? t('advocacy.finder.proBonoOnly','Pro bono only'): t('advocacy.finder.includePaid','Include paid')}</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSavedOnly(v=>!v)} style={[s.chip, savedOnly && s.chipActive]}>
                <Text style={{ color: savedOnly? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('common.saved','Saved')}</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setAccessible(v=>!v)} style={[s.chip, accessible && s.chipActive]}>
                <MaterialCommunityIcons name="wheelchair-accessibility" size={14} color={accessible ? palette.onPrimary : palette.text} style={{ marginRight: 4 }} />
                <Text style={{ color: accessible? palette.onPrimary: palette.text, fontWeight:'700' }}>Accessible</Text>
              </A11yPressable>
            </GapView>
            
            <Text style={[s.cardText, { marginTop: 12, marginBottom: 4 }]}>Sort by:</Text>
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSort('relevance')} style={[s.chipSmall, sort === 'relevance' && s.chipActive]}>
                <Text style={{ color: sort === 'relevance' ? palette.onPrimary : palette.text }}>Relevance</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSort('rating')} style={[s.chipSmall, sort === 'rating' && s.chipActive]}>
                <Text style={{ color: sort === 'rating' ? palette.onPrimary : palette.text }}>★ Rating</Text>
              </A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSort('reviews')} style={[s.chipSmall, sort === 'reviews' && s.chipActive]}>
                <Text style={{ color: sort === 'reviews' ? palette.onPrimary : palette.text }}>Most Reviews</Text>
              </A11yPressable>
            </GapView>
          </View>
        }
        renderItem={({item}) => {
          const rating = ratingsData[item.id];
          return (
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={s.cardTitle}>{item.name}</Text>
            {rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="star" size={16} color="#FFB800" />
                <Text style={[s.cardText, { marginLeft: 4, fontWeight: '700' }]}>{rating.avgRating.toFixed(1)}</Text>
                <Text style={[s.cardText, { marginLeft: 4, opacity: 0.7 }]}>({rating.reviewCount})</Text>
              </View>
            )}
          </View>
          {item.org && <Text style={[s.cardText, { opacity: 0.8, fontSize: 13 }]}>{item.org}</Text>}
          <Text style={s.cardText}>{[item.city, item.province].filter(Boolean).join(', ') || t('advocacy.finder.locationUnknown','—')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginBottom: 6 }}>
            {item.issues.map((iss, idx) => (
              <View key={idx} style={{ backgroundColor: palette.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 6, marginBottom: 4 }}>
                <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '600' }}>{iss}</Text>
              </View>
            ))}
          </View>
          {item.website && (
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => { trackEvent(ANALYTICS_EVENTS.ADVOCACY_FINDER_OPEN_WEBSITE, { id: item.id }); Linking.openURL(item.website); }} style={s.btn}><Text style={s.btnText}>{t('advocacy.finder.openWebsite','Open website')}</Text></A11yPressable>
          )}
          {item.email && (
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => { trackEvent(ANALYTICS_EVENTS.ADVOCACY_FINDER_EMAIL, { id: item.id }); Linking.openURL(`mailto:${item.email}`); }} style={s.btn}><Text style={s.btnText}>{t('advocacy.finder.email','Email')}</Text></A11yPressable>
          )}
          <GapView style={{ flexDirection:'row', marginTop: 6, flexWrap: 'wrap' }} gap={8}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> { trackEvent(ANALYTICS_EVENTS.ADVOCACY_FINDER_OPEN_MAP, { id: item.id }); Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.name, item.city, item.province].filter(Boolean).join(' '))}`); }} style={s.btn}><Text style={s.btnText}>{t('advocacy.finder.openOnMap','Map')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> { const next = !state.advocate.has(item.id); trackEvent(ANALYTICS_EVENTS.ADVOCACY_FINDER_SAVE_TOGGLE, { id: item.id, next }); toggle('advocate', item.id); }} style={s.btn}>
              <Text style={s.btnText}>{state.advocate.has(item.id) ? '★ Saved' : '☆ Save'}</Text>
            </A11yPressable>
            {rating && (
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> { setSelectedAdvocate(item); setShowReviewModal(true); }} style={[s.btn, { backgroundColor: palette.primary + '15' }]}>
                <Text style={[s.btnText, { color: palette.primary }]}>📝 Write Review</Text>
              </A11yPressable>
            )}
            {rating && rating.reviews.length > 0 && (
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> Alert.alert(item.name + ' - Reviews', rating.reviews.map(r => `${r.name} (${r.rating}★):\n${r.comment}\n- ${r.date}`).join('\n\n'))} style={s.btn}>
                <Text style={s.btnText}>Read Reviews ({rating.reviewCount})</Text>
              </A11yPressable>
            )}
          </GapView>
        </View>
      );
        }}
        ListFooterComponent={
          total > filtered.length ? (
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => load(false)} style={[s.btn,{ alignSelf:'center', marginVertical: 12 }]}> 
              <Text style={s.btnText}>{loading? t('common.loading','Loading…'): t('common.loadMore','Load more')}</Text>
            </A11yPressable>
          ) : null
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        {...nativeOnly({ initialNumToRender: Math.min(10, filtered.length || 10) })}
      />) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.finder.title','Lawyer & Advocate Finder')}</Text>
          {modeButtons}
          <View style={s.mapWrap}>
            <Text style={s.cardTitle}>{t('advocacy.finder.modeMap','Map')}</Text>
            <MapEmbed points={filtered.slice(0,20).map((item)=> ({ id: item.id, title: item.name, ...placeToCoords(item.city, item.province) }))} />
            <Text style={s.cardText}>{t('advocacy.finder.mapHint','Tap a listing in List mode to open maps.')}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ReviewModal({ advocate, onClose, onSubmit, palette, t }: any) {
  const [rating, setRating] = React.useState(5);
  const [name, setName] = React.useState('');
  const [comment, setComment] = React.useState('');
  const s = styles(palette);
  
  return (
    <Modal visible={true} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: palette.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
          <Text style={s.title}>Review: {advocate?.name}</Text>
          <Text style={s.cardText}>Your rating:</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map(num => (
              <A11yPressable key={num} hitSlop={HIT_SLOP_8} onPress={() => setRating(num)} style={{ padding: 4 }}>
                <MaterialCommunityIcons name={num <= rating ? 'star' : 'star-outline'} size={32} color="#FFB800" />
              </A11yPressable>
            ))}
          </View>
          <TextInput placeholder="Your name (optional)" placeholderTextColor={palette.text+'77'} value={name} onChangeText={setName} style={s.input} />
          <TextInput placeholder="Your review (optional but helpful!)" placeholderTextColor={palette.text+'77'} value={comment} onChangeText={setComment} multiline={true} numberOfLines={4} style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} />
          <GapView gap={8} style={{ flexDirection: 'row', marginTop: 12 }}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => onSubmit({ name: name || 'Anonymous', rating, comment, date: new Date().toISOString().split('T')[0] })} style={[s.btn, { backgroundColor: palette.primary, flex: 1 }]}>
              <Text style={[s.btnText, { color: palette.onPrimary, textAlign: 'center' }]}>Submit Review</Text>
            </A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={onClose} style={[s.btn, { flex: 1 }]}>
              <Text style={[s.btnText, { textAlign: 'center' }]}>Cancel</Text>
            </A11yPressable>
          </GapView>
        </View>
      </View>
    </Modal>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text, marginBottom: 8 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginBottom: 8 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingVertical:6, paddingHorizontal:10, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
    chipSmall: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingVertical:4, paddingHorizontal:8, borderRadius: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 4, fontSize: 16 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 4, fontSize: 14 },
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 6 },
    btnText: { color: palette.text, fontWeight: '700', fontSize: 13 },
    mapWrap: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginTop: 8 },
    mapRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
  });
}

function placeToCoords(city?: string, province?: string) {
  // Very rough centroids; extend as needed
  const prov: Record<string, { lat: number; lng: number }> = {
    ON: { lat: 43.653, lng: -79.383 },
    BC: { lat: 49.2827, lng: -123.1207 },
    AB: { lat: 51.0447, lng: -114.0719 },
    QC: { lat: 45.5017, lng: -73.5673 },
    MB: { lat: 49.8951, lng: -97.1384 },
    NS: { lat: 44.6488, lng: -63.5752 },
    SK: { lat: 52.1332, lng: -106.6700 },
    NB: { lat: 45.9636, lng: -66.6431 },
    NL: { lat: 47.5615, lng: -52.7126 },
    PE: { lat: 46.2382, lng: -63.1311 },
    YT: { lat: 60.7212, lng: -135.0568 },
    NT: { lat: 62.4540, lng: -114.3718 },
    NU: { lat: 63.7467, lng: -68.5167 },
  };
  const base = (province && prov[province]) || prov.ON;
  // Small jitter based on city hash to spread markers a bit
  const h = (city || 'x').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const lat = base.lat + ((h % 100) - 50) / 5000; // ~ +/-0.01 deg
  const lng = base.lng + (((h / 3) % 100) - 50) / 5000;
  return { lat, lng };
}
