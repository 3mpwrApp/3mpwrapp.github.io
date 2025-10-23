import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import SimpleBarChart from '../../../components/SimpleBarChart';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../i18n';
import { flagItem } from '../../../services/moderation';
import { ensureTarget, listRatings, listTargets, upsertRating } from '../../../services/ratings';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function Ratings() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const [target, setTarget] = React.useState('Hospital X');
  const [kind, setKind] = React.useState('hospital');
  const [score, setScore] = React.useState('5');
  const [comment, setComment] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<'latest'|'score'>('latest');
  const [filter, setFilter] = React.useState<'all'|'approved'|'pending'|'trash'>(isAdmin? 'all':'approved');
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSug, setShowSug] = React.useState(false);
  const load = React.useCallback(async()=>{ try{ setItems(await listRatings(target)); } catch{} },[target]);
  React.useEffect(()=>{ load(); },[load]);
  const avg = items.length ? (items.reduce((s,i)=>s+(i.score||0),0)/items.length).toFixed(1) : '-';
  const visible = items.filter(i => {
    const approved = i.approved === true;
    const pending = i.approved === false && i.deleted !== true;
    const trash = i.deleted === true;
    if (!isAdmin) return approved;
    if (filter === 'approved') return approved && !trash;
    if (filter === 'pending') return pending;
    if (filter === 'trash') return trash;
    return !trash; // all non-deleted
  });
  const dist = [1,2,3,4,5].map(n => ({ n, c: items.filter(i => i.score===n).length }));
  return (
    <View style={s.container}>
      <Text style={s.title}>{t('advocacy.ratings.title','Disability Justice Ratings')}</Text>
      {isAdmin && (
        <View style={{ gap:8, marginBottom: 8 }}>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}><Text style={{ color: filter==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.filter.all','All')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('approved')} style={[s.chip, filter==='approved'&&s.chipActive]}><Text style={{ color: filter==='approved'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.filter.approved','Approved')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('pending')} style={[s.chip, filter==='pending'&&s.chipActive]}><Text style={{ color: filter==='pending'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.filter.pending','Pending')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('trash')} style={[s.chip, filter==='trash'&&s.chipActive]}><Text style={{ color: filter==='trash'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.filter.trash','Trash')}</Text></A11yPressable>
          </View>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=pending' as any)} style={s.button}><Text style={s.buttonText}>{t('advocacy.ratings.admin.pending','Admin Pending')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=approved' as any)} style={s.button}><Text style={s.buttonText}>{t('advocacy.ratings.admin.approved','Admin Approved')}</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=trash' as any)} style={s.button}><Text style={s.buttonText}>{t('advocacy.ratings.admin.trash','Admin Trash')}</Text></A11yPressable>
          </View>
        </View>
      )}
      <View>
        <TextInput
          placeholder={t('advocacy.ratings.targetPlaceholder','Target (name)')}
          placeholderTextColor={palette.text+'77'}
          value={target}
          onChangeText={async (t)=>{ setTarget(t); try { const sug = await listTargets(t || ''); setSuggestions(sug); setShowSug(!!t); } catch {} }}
          style={s.input}
        />
        {showSug && suggestions.length>0 && (
          <View style={s.suggestBox}>
            {suggestions.map(sug => (
              <A11yPressable key={sug} hitSlop={HIT_SLOP_8} onPress={()=> { setTarget(sug); setShowSug(false); }} style={s.suggestRow}>
                <Text style={{ color: palette.text }}>{sug}</Text>
              </A11yPressable>
            ))}
          </View>
        )}
      </View>
      <TextInput placeholder={t('advocacy.ratings.typePlaceholder','Type (hospital, clinic, law, employer, union)')} placeholderTextColor={palette.text+'77'} value={kind} onChangeText={setKind} style={s.input} />
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setSort('latest')} style={[s.chip, sort==='latest'&&s.chipActive]}><Text style={{ color: sort==='latest'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.sort.latest','Latest')}</Text></A11yPressable>
        <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setSort('score')} style={[s.chip, sort==='score'&&s.chipActive]}><Text style={{ color: sort==='score'? palette.onPrimary: palette.text, fontWeight:'700' }}>{t('advocacy.ratings.sort.top','Top')}</Text></A11yPressable>
      </View>
      <Text style={s.text}>{t('advocacy.ratings.average','Average rating: {{avg}} ({{count}})',{ avg, count: items.length })}</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={dist} labelKey="n" valueKey="c" />
      </View>
      <TextInput placeholder={t('advocacy.ratings.scorePlaceholder','Score 1-5')} placeholderTextColor={palette.text+'77'} value={score} onChangeText={setScore} style={s.input} />
      <TextInput placeholder={t('advocacy.ratings.commentPlaceholder','Comment (optional)')} placeholderTextColor={palette.text+'77'} value={comment} onChangeText={setComment} style={s.input} />
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        onPress={async()=>{
          try{
            const key = `rate:${target}`;
            const last = await AsyncStorage.getItem(key);
            if (last && (Date.now() - Number(last) < 5*60*1000)) {
              Alert.alert(t('advocacy.ratings.slowDownTitle','Slow down'), t('advocacy.ratings.slowDownBody','Please wait before submitting again.'));
              return;
            }
            await ensureTarget(target);
            await upsertRating({ target, kind: kind as any, score: Number(score)||0, comment });
            await AsyncStorage.setItem(key, String(Date.now()));
            setComment(''); setScore('5'); load();
          } catch (e:any) {
            Alert.alert(t('common.failed','Failed'), e?.message || t('advocacy.ratings.submitFailed','Could not submit'));
          }
        }}
        style={s.button}
        accessibilityLabel={t('advocacy.ratings.submit','Submit Rating')}
      >
        <Text style={s.buttonText}>{t('advocacy.ratings.submit','Submit Rating')}</Text>
      </A11yPressable>
      <FlatList data={[...visible].sort((a,b)=> sort==='latest'? ((b.createdAt?.toDate?.()?.getTime?.()||0) - (a.createdAt?.toDate?.()?.getTime?.()||0)) : ((b.score||0)-(a.score||0)))} keyExtractor={i=>i.id} renderItem={({item:i}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{i.score} ★</Text>
          {!!i.comment && <Text style={s.text}>{i.comment}</Text>}
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try{ await flagItem('rating', i.id, 'inaccurate'); Alert.alert(t('advocacy.ratings.flaggedTitle','Flagged'), t('advocacy.ratings.flaggedBody','Thanks for reporting.')); } catch {} }} style={s.button} accessibilityLabel={t('advocacy.ratings.flag','Flag')}><Text style={s.buttonText}>{t('advocacy.ratings.flag','Flag')}</Text></A11yPressable>
        </View>
      )} />
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
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
    suggestBox: { position:'absolute', left: 0, right: 0, top: 46, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6, zIndex: 10 },
    suggestRow: { padding: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
  });
}
