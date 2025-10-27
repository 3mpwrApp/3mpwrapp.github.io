import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useBookmarks } from '../../store/bookmarks';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';
import { a11yLiveRegion } from '../../utils/platform';

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number = 1) {
  return {
    description: { color: palette.text, fontSize: Math.round(14 * factor), opacity: 0.8, marginBottom: 12, lineHeight: Math.round(20 * factor) },
    rowLabel: { color: palette.text, opacity: 0.9, marginTop: 10, marginBottom: 6, fontSize: Math.round(14 * factor) },
    input: { borderWidth: 1, borderColor: palette.muted, padding: 12, borderRadius: 8, marginBottom: 10, color: palette.text, fontSize: Math.round(14 * factor), minHeight: 44 },
  } as const;
}

export default function BookmarksSection() {
  const { t } = useTranslation();
  const { items, addBookmark, removeBookmark, clearBookmarks, findByRoute } = useBookmarks();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = useMemo(() => createStyles(palette, factor), [palette, factor]);
  const [route, setRoute] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const registry = require('../../../utils/routeRegistry') as any;
  const all: any[] = registry.BOOKMARKABLE_ROUTES || [];
  const bookmarked = new Set(items.map(b => b.route));
  const suggestions = all.filter(r => !bookmarked.has(r.route)).filter(r => { if (!query.trim()) return true; const q = query.trim().toLowerCase(); return r.route.toLowerCase().includes(q) || r.fallback.toLowerCase().includes(q) || r.tKey.toLowerCase().includes(q); }).slice(0,8);
  const addEntry = (r: string, custom?: string) => { const entry = registry.findRouteEntry?.(r); if (!entry) { setError(t('settings.bookmarks.errInvalid','Route not bookmarkable')); return; } if (findByRoute(r)) { setError(t('settings.bookmarks.errDuplicate','Already bookmarked')); return; } addBookmark(r, custom || t(entry.tKey, entry.fallback), entry.tKey); setRoute(''); setLabel(''); setError(null); };
  const onAdd = () => { const r = route.trim(); const l = label.trim(); if (!r) { setError(t('settings.bookmarks.errEmptyRoute','Route required')); return; } addEntry(r, l || undefined); };

  return (
    <View>
      <Text style={s.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('settings.bookmarks.description','Add bookmarks to quickly open frequently used tools and screens.')}</Text>
      <Text style={s.rowLabel}>{t('settings.bookmarks.search','Search or filter available routes')}</Text>
      <TextInput style={s.input} placeholder={t('settings.bookmarks.searchPlaceholder','Type to filter suggestions')} value={query} onChangeText={setQuery} autoCapitalize='none' accessibilityLabel={t('settings.bookmarks.search','Search or filter available routes')} />
      {suggestions.length > 0 && (
        <View style={{ marginBottom:12 }}>
          <Text style={[s.rowLabel, { marginTop:0 }]}>{t('settings.bookmarks.suggestions','Suggestions')}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap' }}>
            {suggestions.map(sug => (
              <A11yPressable key={sug.route} hitSlop={HIT_SLOP_8} onPress={()=> addEntry(sug.route)} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.addSuggestion','Add bookmark for') + ' ' + t(sug.tKey, sug.fallback)} style={{ paddingHorizontal:12, paddingVertical:8, backgroundColor:palette.card, borderRadius:999, borderWidth:1, borderColor:palette.muted, marginRight:6, marginBottom:6, minHeight:40, justifyContent:'center' }}>
                <Text style={{ color:palette.text, fontSize:Math.round(13*factor) }}>{t(sug.tKey, sug.fallback)}</Text>
              </A11yPressable>
            ))}
          </View>
        </View>
      )}
      <Text style={s.rowLabel}>{t('settings.bookmarks.route','Route Path')}</Text>
      <TextInput style={s.input} placeholder={t('settings.bookmarks.routePlaceholder','e.g. /(tabs)/resources/index')} value={route} onChangeText={setRoute} autoCapitalize='none' />
      <Text style={s.rowLabel}>{t('settings.bookmarks.label','Label')}</Text>
      <TextInput style={s.input} placeholder={t('settings.bookmarks.labelPlaceholder','My Resources')} value={label} onChangeText={setLabel} />
      <Button title={t('settings.bookmarks.add','Add Bookmark')} onPress={onAdd} />
      {error && <Text style={{ color:palette.error, marginTop:6 }} {...a11yLiveRegion('polite')}>{error}</Text>}
      {items.length === 0 ? <Text style={[s.description, { marginTop:12 }]}>{t('settings.bookmarks.empty','No bookmarks yet.')}</Text> : (
        <View style={{ marginTop:12 }}>
          {items.slice().sort((a,b)=> b.created - a.created).map(b => (
            <View key={b.id} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:8 }}>
              <View style={{ flex:1, paddingRight:8 }}>
                <Text style={{ color:palette.text, fontWeight:'600' }}>{b.tKey ? t(b.tKey, b.label) : b.label}</Text>
                <Text style={{ color:palette.text, opacity:0.6, fontSize:12 }}>{b.route}</Text>
              </View>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> removeBookmark(b.id)} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.remove','Remove bookmark')} style={{ padding:8, minHeight:44, justifyContent:'center' }}>
                <Ionicons name='trash' size={18} color={palette.error} />
              </A11yPressable>
            </View>
          ))}
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> clearBookmarks()} accessibilityRole='button' accessibilityLabel={t('settings.bookmarks.clearAll','Clear all bookmarks')} style={{ padding:8, alignSelf:'flex-start', minHeight:44, justifyContent:'center' }}>
            <Text style={{ color:palette.error, fontWeight:'600' }}>{t('settings.bookmarks.clearAll','Clear All')}</Text>
          </A11yPressable>
        </View>
      )}
    </View>
  );
}
