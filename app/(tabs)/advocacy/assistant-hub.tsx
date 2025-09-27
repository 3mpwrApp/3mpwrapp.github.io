import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { MAX_FONT_SCALE, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { usage } from '../../../services/usage';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';

export default function AssistantHub() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  const titleRef = useRef<Text>(null);
  const { t } = useTranslation();
  useFocusOnRefOnMount(titleRef);
  const router = useRouter();

  const items: Array<{ label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; href: any }> = [
    { label: t('assistant.hub.selfCoach','Self-Advocacy Coach'), desc: t('assistant.hub.selfCoachDesc','Ask questions and get next-step guidance'), icon: 'chatbubbles', href: '/(tabs)/advocacy/self-advocacy-coach' },
    { label: t('assistant.hub.translator','Advocate Translator'), desc: t('assistant.hub.translatorDesc','Turn your words into strong advocacy language'), icon: 'language', href: '/(tabs)/advocacy/ai-advocate-translator' },
    { label: t('assistant.hub.policy','Policy Simplifier'), desc: t('assistant.hub.policyDesc','Summarize complex policy into plain language'), icon: 'document-text', href: '/(tabs)/advocacy/policy-simple' },
    { label: t('assistant.hub.gov','Government Navigator'), desc: t('assistant.hub.govDesc','Find who to contact and what to say'), icon: 'navigate', href: '/(tabs)/advocacy/ai-gov-navigator' },
    { label: t('assistant.hub.case','Case Interpreter'), desc: t('assistant.hub.caseDesc','Clarify forms, letters, and decisions'), icon: 'reader', href: '/(tabs)/advocacy/ai-case-interpreter' },
    { label: t('assistant.hub.directory','Support Directory'), desc: t('assistant.hub.directoryDesc','Connect with advocates and services'), icon: 'people', href: '/(tabs)/advocacy/support-directory' },
    { label: t('assistant.hub.ally','Ally Hub'), desc: t('assistant.hub.allyDesc','Coordinate actions with allies'), icon: 'hand-left', href: '/(tabs)/advocacy/ally-hub' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t('assistant.hub.screenLabel','Assistant hub')}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('assistant.hub.title','Assistant')}</Text>
      <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('assistant.hub.subtitle','Pick a tool below or return to your last task anytime.')}</Text>

      {/* Quick prompts */}
      <Text style={s.sectionHeader}>{t('assistant.hub.quickPrompts','Quick prompts')}</Text>
      <View style={s.promptRow}>
        {[
          { label: t('assistant.prompt.simplifyDecision','Simplify a decision letter'), route: '/(tabs)/advocacy/ai-advocate-translator', q: t('assistant.prompt.exampleDecision','Please simplify this decision letter and list deadlines:') },
          { label: t('assistant.prompt.callScript','Draft a call script to HR'), route: '/(tabs)/advocacy/self-advocacy-coach', q: t('assistant.prompt.exampleCall','Draft a brief call script to HR asking for accommodations:') },
          { label: t('assistant.prompt.policyPlain','Explain this policy in plain language'), route: '/(tabs)/advocacy/policy-simple', q: t('assistant.prompt.examplePolicy','Summarize key points and actions from this policy:') },
        ].map((p) => (
          <A11yPressable
            key={p.label}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={p.label}
            style={s.promptChip}
            onPress={() => {
              trackEvent('assistant.quick_prompt', { label: p.label });
              usage.view('assistant', p.route as any, { quickPrompt: p.label });
              router.push({ pathname: p.route as any, params: { q: p.q } } as any);
            }}
          >
            <Text style={s.promptText}>{p.label}</Text>
          </A11yPressable>
        ))}
      </View>

      {/* Recent tools */}
      <RecentTools />
      <View style={s.grid}>
        {items.map((it) => (
          <Link key={String(it.href)} href={it.href as any} asChild>
            <A11yPressable
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`${it.label}. ${it.desc}`}
              style={s.card}
            >
              <View style={s.iconWrap}>
                <Ionicons name={it.icon} size={22} color={palette.primary} />
              </View>
              <Text style={s.cardTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{it.label}</Text>
              <Text style={s.cardDesc} maxFontSizeMultiplier={MAX_FONT_SCALE}>{it.desc}</Text>
            </A11yPressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

function RecentTools() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  const { t } = useTranslation();
  const [items, setItems] = useState<{ tool: string; route?: string; ts: number }[]>([]);
  useEffect(() => {
    try {
      const mod = require('../../../services/usage') as any;
      const buf = mod.usage?.getBuffer?.() || [];
      const recent = buf
        .filter((e: any) => ['usage.view', 'usage.complete'].includes(e.type))
        .slice(-200)
        .reverse();
      const seen = new Set<string>();
      const uniq: { tool: string; route?: string; ts: number }[] = [];
      for (const e of recent) {
        if (seen.has(e.tool)) continue; seen.add(e.tool);
        uniq.push({ tool: e.tool, route: e.route, ts: e.ts });
        if (uniq.length >= 6) break;
      }
      setItems(uniq);
    } catch {}
  }, []);
  if (!items.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.sectionHeader}>{t('assistant.hub.recent','Recent')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((it) => (
          <Link key={it.tool} href={(it.route as any) || '/(tabs)/advocacy/assistant-hub'} asChild>
            <A11yPressable hitSlop={HIT_SLOP_8} style={s.recentChip} accessibilityRole="link" accessibilityLabel={t('assistant.hub.openRecent','Open recent tool')}>
              <Text style={s.recentText}>{mapToolLabel(it.tool, t)}</Text>
            </A11yPressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

function mapToolLabel(tool: string, t: (k: string, def?: string) => string) {
  switch (tool) {
    case 'coach': return t('assistant.tools.coach', 'Coach');
    case 'translator': return t('assistant.tools.translator', 'Translator');
    case 'policy_simplifier': return t('assistant.tools.policy', 'Policy');
    case 'wellness_mood': return t('assistant.tools.mood', 'Mood');
    case 'resources_search': return t('assistant.tools.resources', 'Resources');
    default: return tool;
  }
}

function styles(palette: ReturnType<typeof useAppPalette>, factor = 1) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: Math.round(24 * factor), fontWeight: '700', color: palette.text, marginBottom: 4 },
  subtitle: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.8, marginBottom: 12 },
  sectionHeader: { color: palette.text, fontWeight: '700', marginBottom: 6, marginTop: 8, fontSize: Math.round(14 * factor) },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  promptChip: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  promptText: { color: palette.text, fontSize: Math.round(13 * factor) },
  recentChip: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  recentText: { color: palette.text, fontSize: Math.round(12 * factor) },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { backgroundColor: palette.card, borderRadius: 12, borderWidth: 1, borderColor: palette.muted, padding: 12, width: '48%' },
    iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    cardTitle: { color: palette.text, fontWeight: '700', fontSize: Math.round(14 * factor), marginBottom: 4 },
    cardDesc: { color: palette.text, opacity: 0.7, fontSize: Math.round(12 * factor), lineHeight: Math.round(16 * factor) },
  });
}
