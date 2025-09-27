import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomeGuide } from '../../components/HomeGuide';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';

export default function HomeScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ color: palette.text, fontWeight: '700', fontSize: 20, marginBottom: 12 }}>
        {t('home.title','Home')}
      </Text>
      <RecentPrompts />
      <HomeGuide />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

function RecentPrompts(){
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [items, setItems] = React.useState<{ label: string; route?: string; ts: number }[]>([]);
  React.useEffect(()=>{
    try{
      const mod = require('../../services/usage') as any;
      const buf = mod.usage?.getBuffer?.() || [];
      const recent = buf.filter((e: any) => ['usage.view','usage.complete'].includes(e.type) && e.meta?.quickPrompt)
        .slice(-200).reverse();
      const seen = new Set<string>();
      const uniq: { label: string; route?: string; ts: number }[] = [];
      for(const e of recent){
        if(seen.has(e.meta.quickPrompt)) continue; seen.add(e.meta.quickPrompt);
        uniq.push({ label: e.meta.quickPrompt, route: e.route, ts: e.ts });
        if(uniq.length>=3) break;
      }
      setItems(uniq);
    }catch{}
  },[]);
  if(!items.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 6 }}>{t('assistant.home.recentPrompts','Recently used prompts')}</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {items.map(it=> (
          <Link key={it.label} href={(it.route as any) || '/(tabs)/advocacy/assistant-hub'} asChild>
            <View style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: palette.text, fontSize: 12 }}>{it.label}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}
