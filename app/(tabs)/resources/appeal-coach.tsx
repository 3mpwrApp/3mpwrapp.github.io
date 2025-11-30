import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { aiCoachPrompt } from '../../../services/aiAdvocacy';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Msg = { role: 'user' | 'coach'; text: string };

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  daysFromDenial?: number; // Suggested timeline
};

type AppealTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
};

export default function AppealCoach() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('appealCoach.title','Appeal Coach'));
  useFocusOnRefOnMount(titleRef);

  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [denialDate, setDenialDate] = React.useState('');
  const [showChecklist, setShowChecklist] = React.useState(true);
  const [showTemplates, setShowTemplates] = React.useState(false);

  // Comprehensive appeal checklist
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([
    { id: '1', title: '📋 Request your complete file', description: 'Get all documents and notes about your claim', done: false, daysFromDenial: 7 },
    { id: '2', title: '📅 Note all deadlines', description: 'Add appeal deadline (usually 6 months) to calendar', done: false, daysFromDenial: 1 },
    { id: '3', title: '🩺 Gather updated medical evidence', description: 'Recent reports, functional capacity evaluations, specialist opinions', done: false, daysFromDenial: 30 },
    { id: '4', title: '📝 Document functional limitations', description: 'Daily activity log, work restrictions, pain journal', done: false, daysFromDenial: 14 },
    { id: '5', title: '🔍 Identify weaknesses in denial', description: 'Use AI Case Interpreter to analyze decision', done: false, daysFromDenial: 3 },
    { id: '6', title: '⚖️ Consider legal representation', description: 'Contact community-vetted lawyers (see Lawyer Finder)', done: false, daysFromDenial: 60 },
    { id: '7', title: '✍️ Draft appeal letter', description: 'Use templates below, address all denial reasons', done: false, daysFromDenial: 90 },
    { id: '8', title: '📬 Submit appeal', description: 'Include evidence, keep copies, get confirmation', done: false, daysFromDenial: 120 },
  ]);

  // Appeal letter templates
  const templates: AppealTemplate[] = [
    {
      id: 't1',
      name: 'WSIB Medical Appeal',
      description: 'Challenge denial based on medical evidence',
      content: `[Your Name]
[Your Address]
[Date]

Workplace Safety and Insurance Board
Appeals Branch
[Address]

RE: Appeal of Decision – Claim #[Your Claim Number]

Dear Appeals Officer,

I am writing to appeal the decision dated [denial date] denying my claim for [injury/condition].

GROUNDS FOR APPEAL:
1. The decision failed to consider [objective medical evidence / specialist opinion / functional limitations]
2. The adjudicator relied on [outdated information / incomplete file / subjective assessments]

SUPPORTING EVIDENCE:
- Medical report from Dr. [Name] dated [date] confirming [diagnosis]
- Functional capacity evaluation showing [limitations]
- Employer records documenting [workplace injury]

I respectfully request that the Board reconsider this decision in light of the attached evidence.

Sincerely,
[Your Name]`
    },
    {
      id: 't2',
      name: 'LTD Policy Interpretation',
      description: 'Argue policy language supports your claim',
      content: `[Your Name]
[Date]

[Insurance Company]
Appeals Department

RE: Appeal of LTD Claim Denial – Policy #[Number]

Dear Sir/Madam,

I am appealing the denial of my Long-Term Disability claim dated [date].

POLICY INTERPRETATION:
The policy defines "totally disabled" as [quote policy]. My condition meets this definition because:
1. [Specific limitation preventing your occupation]
2. [Medical evidence supporting inability to work]
3. [Unsuccessful accommodation attempts]

The denial letter states [quote reason]. However, this interpretation contradicts [policy language / case law / your doctor's opinion].

REQUESTED REMEDY:
Approve LTD benefits retroactive to [date] based on [treating physician's opinion / functional assessment / policy terms].

Attached: [List evidence]

Respectfully,
[Your Name]`
    },
    {
      id: 't3',
      name: 'CPP-D Reconsideration',
      description: 'Request reconsideration of CPP Disability denial',
      content: `[Your Name]
[SIN]
[Date]

Service Canada
CPP Disability Reconsideration
[Address]

RE: Request for Reconsideration – CPP-D Application

Dear Adjudicator,

I am requesting reconsideration of the decision dated [date] denying my CPP Disability benefits.

SEVERE AND PROLONGED DISABILITY:
My [condition] is both severe and prolonged per CPP-D criteria:
- SEVERE: Unable to regularly pursue substantially gainful employment due to [limitations]
- PROLONGED: Condition expected to be long-continued and of indefinite duration per [specialist name]

NEW EVIDENCE:
Since the initial decision, I have obtained:
1. Updated medical report from [specialist] confirming [prognosis]
2. Functional capacity evaluation showing [restrictions]
3. Failed return-to-work attempt documented by [employer]

The original decision did not adequately consider [factor].

I request approval of CPP-D benefits effective [date].

Sincerely,
[Your Name]`
    },
  ];

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const calculateDeadline = () => {
    if (!denialDate) {
      Alert.alert('Enter Denial Date', 'Please enter the date of your denial letter to calculate your appeal deadline.');
      return;
    }
    try {
      const denial = new Date(denialDate);
      const appeal = new Date(denial);
      appeal.setMonth(appeal.getMonth() + 6); // Standard 6-month appeal window
      const today = new Date();
      const daysLeft = Math.floor((appeal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        Alert.alert('⚠️ Deadline Passed', `Your appeal deadline was ${appeal.toLocaleDateString()}. You may still request an extension citing reasonable cause. Contact a lawyer immediately.`);
      } else if (daysLeft < 30) {
        Alert.alert('🚨 Urgent', `You have only ${daysLeft} days until your appeal deadline (${appeal.toLocaleDateString()}). Start your appeal immediately!`, [{ text: 'Add to Calendar', onPress: () => Alert.alert('Coming Soon') }, { text: 'OK' }]);
      } else {
        Alert.alert('📅 Appeal Deadline', `Your appeal must be filed by ${appeal.toLocaleDateString()} (${daysLeft} days from now).`, [{ text: 'Add to Calendar', onPress: () => Alert.alert('Coming Soon') }, { text: 'OK' }]);
      }
    } catch {
      Alert.alert('Invalid Date', 'Please enter a valid date (YYYY-MM-DD)');
    }
  };

  const loadTemplate = (template: AppealTemplate) => {
    setInput(template.content);
    setShowTemplates(false);
    Alert.alert('Template Loaded', `${template.name} template loaded. Edit the placeholders ([Your Name], [Date], etc.) with your information.`);
  };

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
      <DisclaimerBanner type="legal" compact={true} />
      <DisclaimerBanner type="ai" compact={true} />
      <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('appealCoach.instructions','Comprehensive appeal guidance with checklists, timelines, and templates.')}</Text>

      {/* Deadline Calculator */}
      <View style={[s.card, { backgroundColor: palette.primary + '10', borderColor: palette.primary }]}>
        <Text style={s.cardTitle}>⏰ Appeal Deadline Calculator</Text>
        <Text style={[s.cardText, { marginBottom: 8 }]}>Enter your denial letter date to calculate your appeal deadline:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TextInput
            value={denialDate}
            onChangeText={setDenialDate}
            placeholder="YYYY-MM-DD (e.g., 2025-01-15)"
            placeholderTextColor={palette.text + '77'}
            style={[s.input, { flex: 1 }]}
          />
          <Pressable 
            onPress={calculateDeadline} 
            style={[s.chipBtn, { backgroundColor: palette.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Calculate appeal deadline"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Calculate</Text>
          </Pressable>
        </View>
        <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 6 }}>
          Standard appeal window: 6 months from denial date
        </Text>
      </View>

      {/* Appeal Checklist */}
      <Pressable 
        onPress={() => setShowChecklist(!showChecklist)} 
        style={[s.card, { borderColor: palette.primary }]}
        accessibilityRole="button"
        accessibilityLabel={`${showChecklist ? 'Hide' : 'Show'} appeal preparation checklist`}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={s.cardTitle}>✅ Appeal Preparation Checklist ({checklist.filter(c => c.done).length}/{checklist.length})</Text>
          <MaterialCommunityIcons name={showChecklist ? 'chevron-up' : 'chevron-down'} size={24} color={palette.text} />
        </View>
        <View style={{ height: 6, backgroundColor: palette.background, borderRadius: 3, marginTop: 8 }}>
          <View style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%`, height: '100%', backgroundColor: palette.primary, borderRadius: 3 }} />
        </View>
      </Pressable>

      {showChecklist && checklist.map((item) => (
        <Pressable 
          key={item.id} 
          onPress={() => toggleChecklistItem(item.id)} 
          style={[s.checklistItem, item.done && s.checklistItemDone]}
          accessibilityRole="button"
          accessibilityLabel={`${item.done ? 'Uncheck' : 'Check'} ${item.title}`}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
            <MaterialCommunityIcons 
              name={item.done ? 'checkbox-marked' : 'checkbox-blank-outline'} 
              size={24} 
              color={item.done ? palette.primary : palette.text} 
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.checklistTitle, item.done && s.checklistTitleDone]}>{item.title}</Text>
              <Text style={s.checklistDesc}>{item.description}</Text>
              {item.daysFromDenial && (
                <Text style={s.timeline}>📅 Suggested timeline: Day {item.daysFromDenial} from denial</Text>
              )}
            </View>
          </View>
        </Pressable>
      ))}

      {/* Appeal Templates */}
      <Pressable onPress={() => setShowTemplates(!showTemplates)} style={[s.card, { borderColor: palette.success }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={s.cardTitle}>📝 Appeal Letter Templates</Text>
          <MaterialCommunityIcons name={showTemplates ? 'chevron-up' : 'chevron-down'} size={24} color={palette.text} />
        </View>
        <Text style={s.cardText}>Professional templates for WSIB, LTD, CPP-D appeals</Text>
      </Pressable>

      {showTemplates && templates.map((template) => (
        <View key={template.id} style={[s.card, { backgroundColor: palette.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{template.name}</Text>
              <Text style={s.cardText}>{template.description}</Text>
            </View>
            <Pressable 
              onPress={() => loadTemplate(template)} 
              style={[s.chipBtn, { backgroundColor: palette.primary }]}
              accessibilityRole="button"
              accessibilityLabel={`Use ${template.name} template`}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Use</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* AI Chat Section */}
      <View style={[s.card, { marginTop: 16, borderColor: palette.primary }]}>
        <Text style={s.cardTitle}>💬 AI Appeal Assistant</Text>
        <Text style={s.cardText}>Ask questions or paste your denial letter for personalized guidance</Text>
      </View>

      <GapView style={s.actionsRow} gap={8}>
        <A11yPressable onPress={share} hitSlop={HIT_SLOP_8} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.shareBtn','Share conversation')}><Text style={s.secondaryBtnText}>{t('appealCoach.share','Share')}</Text></A11yPressable>
        <A11yPressable onPress={reset} hitSlop={HIT_SLOP_8} style={s.secondaryBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.resetBtn','Clear')}><Text style={s.secondaryBtnText}>{t('appealCoach.reset','Reset')}</Text></A11yPressable>
      </GapView>
      <GapView style={s.inputRow} gap={8}>
        <TextInput value={input} onChangeText={setInput} placeholder={t('appealCoach.promptPlaceholder','Ask a question or paste text')} placeholderTextColor={palette.text+'77'} style={s.input} accessibilityLabel={t('appealCoach.promptPlaceholder','Ask a question or paste text')} multiline numberOfLines={4} />
        <A11yPressable onPress={send} style={s.sendBtn} accessibilityRole='button' accessibilityLabel={t('appealCoach.sendBtn','Send')} hitSlop={HIT_SLOP_8}><Text style={s.sendBtnText}>{t('appealCoach.sendBtn','Send')}</Text></A11yPressable>
      </GapView>
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
    card: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      backgroundColor: palette.card,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.9, lineHeight: 20 },
    actionsRow: { flexDirection: 'row', marginBottom: 8 },
    secondaryBtn: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: palette.surface },
    secondaryBtnText: { color: palette.text, fontWeight: '700' },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: palette.text },
    sendBtn: { backgroundColor: palette.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
    sendBtnText: { color: palette.onPrimary, fontWeight: '700' },
    msg: { padding: 12, borderRadius: 8, marginTop: 8 },
    msgUser: { backgroundColor: palette.card },
    msgCoach: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    msgLabel: { color: palette.textSecondary, marginBottom: 6, fontWeight: '600' },
    msgText: { color: palette.text },
    chipBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    checklistItem: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    checklistItemDone: {
      opacity: 0.7,
      backgroundColor: palette.surface,
    },
    checklistTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    checklistTitleDone: {
      textDecorationLine: 'line-through',
      opacity: 0.7,
    },
    checklistDesc: {
      fontSize: 13,
      color: palette.textSecondary,
      marginTop: 4,
    },
    timeline: {
      fontSize: 12,
      color: palette.primary,
      marginTop: 4,
      fontStyle: 'italic',
    },
  });
}
