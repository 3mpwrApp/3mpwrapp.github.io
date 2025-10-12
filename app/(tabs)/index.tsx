import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { HomeGuide } from '../../components/HomeGuide';
import { HIT_SLOP_8 } from '../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function HomeScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const titleRef = React.useRef<Text>(null);
  
  // Announce page load and focus title for screen readers
  useAnnounceOnMount(t('home.announcement', 'Home screen loaded. Beta features available.'));
  useFocusOnRefOnMount(titleRef);
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ padding: 16 }}
      accessibilityLabel={t('home.screenLabel', 'Home screen')}
      accessible
    >
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={[styles.title, { color: palette.text, fontSize: Math.round(20 * factor) }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.title','Home')} <Text style={{ fontSize: Math.round(14 * factor), opacity: 0.8 }}>(Beta)</Text>
      </Text>
      <RecentPrompts />
      <BetaTestersQuickLink />
      <HomeGuide />
      <Text 
        style={[styles.noteText, { color: palette.text, fontSize: Math.round(14 * factor) }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.personalization.note','Suggestions powered by the Personalization Engine (beta).')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontWeight: '700',
    marginBottom: 12,
  },
  noteText: {
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 20,
  },
});

function RecentPrompts(){
  const palette = useAppPalette();
  const { factor } = useTextScale();
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
    <View 
      style={{ marginBottom: 12 }}
      accessibilityLabel={t('assistant.home.recentPromptsRegion', 'Recent prompts section')}
      accessible
    >
      <Text 
        style={{ 
          color: palette.text, 
          fontWeight: '700', 
          marginBottom: 6,
          fontSize: Math.round(16 * factor)
        }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {t('assistant.home.recentPrompts','Recently used prompts')}
      </Text>
      <View 
        style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}
        accessibilityLabel={t('assistant.home.promptsList', 'List of recent prompts')}
      >
        {items.map((it, index) => (
          <Link key={it.label} href={(it.route as any) || '/(tabs)/advocacy/assistant-hub'} asChild>
            <A11yPressable
              style={{
                backgroundColor: palette.card,
                borderWidth: 1,
                borderColor: palette.muted,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
              }}
              accessibilityLabel={t('assistant.home.promptAccessibilityLabel', 'Recent prompt: {{prompt}}', { prompt: it.label })}
              accessibilityHint={t('assistant.home.promptHint', 'Double tap to use this prompt again')}
              hitSlop={HIT_SLOP_8}
            >
              <Text 
                style={{ 
                  color: palette.text, 
                  fontSize: Math.round(12 * factor)
                }}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {it.label}
              </Text>
            </A11yPressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

function BetaTestersQuickLink() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { t } = useTranslation();
  
  return (
    <View 
      style={{ marginBottom: 12 }}
      accessibilityLabel={t('home.quick.betaChat.section', 'Beta testers section')}
      accessible
    >
      <Text 
        style={{ 
          color: palette.text, 
          fontWeight: '700', 
          marginBottom: 6,
          fontSize: Math.round(16 * factor)
        }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {t('home.quick.betaChat.title','Beta Testers Chat')}
      </Text>
      <Link href={'/(tabs)/community/testers-chat' as any} asChild>
        <A11yPressable 
          accessibilityLabel={t('home.quick.betaChat.label','Join the Beta Testers Chat')} 
          accessibilityHint={t('home.quick.betaChat.hint', 'Opens the beta testers community chat')}
          style={{ 
            backgroundColor: palette.surface, 
            borderWidth: 1, 
            borderColor: palette.muted, 
            paddingHorizontal: 12, 
            paddingVertical: 10, 
            borderRadius: 8 
          }}
          hitSlop={HIT_SLOP_8}
        >
          <Text 
            style={{ 
              color: palette.text,
              fontSize: Math.round(16 * factor)
            }}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            🧪 {t('home.quick.betaChat.cta','Join the Beta Testers Chat')}
          </Text>
        </A11yPressable>
      </Link>
    </View>
  );
}
