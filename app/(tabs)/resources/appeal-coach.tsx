import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { aiCoachPrompt } from '../../../services/aiAdvocacy';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Msg = { role: 'user' | 'coach'; text: string };

export default function AppealCoach() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('appealCoach.title','Appeal Coach'));
  useFocusOnRefOnMount(titleRef);

  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Msg[]>([]);

  const send = React.useCallback(async () => {
    const text = input.trim(); if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role:'user', text }]);
    try {
      const resp = await aiCoachPrompt(text);
      setMessages(prev => [...prev, { role:'coach', text: resp }]);
    } catch { Alert.alert(t('common.error','Error'), t('appealCoach.error','Could not get a response.')); }
  }, [input, t]);

  const share = React.useCallback(async () => {
    try {
      const body = messages.map(m => `${m.role === 'user' ? t('appealCoach.you','You') : t('appealCoach.coach','Coach')}: ${m.text}`).join('\n\n');
      const FS = await import('expo-file-system');
      const path = FS.cacheDirectory + `appeal_coach_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, body);
      try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert(t('common.saved','Saved'), t('appealCoach.conversationCopied','Conversation copied')); }
      catch { Alert.alert(t('common.saved','Saved'), t('appealCoach.conversationCopied','Conversation copied')); }
    } catch { Alert.alert(t('common.error','Error'), t('appealCoach.shareFail','Share unavailable')); }
  }, [messages, t]);

  const reset = () => setMessages([]);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }} accessibilityLabel={t('appealCoach.screenLabel','Appeal Coach screen')}>
      <Text ref={titleRef} style={s.title} accessibilityRole='header' maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('appealCoach.title','Appeal Coach')}</Text>
      <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('appealCoach.instructions','Paste your denial letter or ask a question to get step-by-step guidance. Use Copy to reuse the assistant\'s last response.')}</Text>
      <View style={s.actionsRow}>
        <A11yPressable onPress={share} hitSlop={HIT_SLOP_8} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.shareBtn','Share conversation')}><Text style={s.secondaryBtnText}>{t('appealCoach.share','Share')}</Text></A11yPressable>
        <A11yPressable onPress={reset} hitSlop={HIT_SLOP_8} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.resetBtn','Clear')}><Text style={s.secondaryBtnText}>{t('appealCoach.reset','Reset')}</Text></A11yPressable>
      </View>
      <View style={s.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder={t('appealCoach.promptPlaceholder','Ask a question or paste text')} placeholderTextColor={palette.text+'77'} style={s.input} accessibilityLabel={t('appealCoach.promptPlaceholder','Ask a question or paste text')} />
        <A11yPressable onPress={send} style={s.sendBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.sendBtn','Send')} hitSlop={HIT_SLOP_8}><Text style={s.sendBtnText}>{t('appealCoach.sendBtn','Send')}</Text></A11yPressable>
      </View>
      {messages.map((m, i) => (
        <View key={i} style={[s.msg, m.role==='coach' ? s.msgCoach : s.msgUser]}>
          <Text style={s.msgLabel}>{m.role==='coach' ? t('appealCoach.coach','Coach') : t('appealCoach.you','You')}</Text>
          <Text style={s.msgText}>{m.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    secondaryBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: palette.surface },
    secondaryBtnText: { color: palette.text, fontWeight: '700' },
    inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text },
    sendBtn: { backgroundColor: palette.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
    sendBtnText: { color: palette.onPrimary, fontWeight: '700' },
    msg: { padding: 12, borderRadius: 8, marginTop: 8 },
    msgUser: { backgroundColor: palette.card },
    msgCoach: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    msgLabel: { color: palette.text, opacity: 0.7, marginBottom: 6, fontWeight: '600' },
    msgText: { color: palette.text },
  });
}
