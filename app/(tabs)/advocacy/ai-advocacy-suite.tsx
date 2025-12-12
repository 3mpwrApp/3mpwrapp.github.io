/**
 * AI Advocacy Suite - Unified Power Tool
 * 
 * Consolidates 8 AI-powered advocacy features into one tabbed interface:
 * - Translator (AI Advocate Translator - plain language conversion)
 * - Interpreter (AI Case Interpreter - document analysis)
 * - Navigator (AI Gov Navigator - government process help)
 * - Assistant (AI Assistant, Ask feature)
 * - Command (AI Command Center hub)
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import PowerTool, {
    PowerToolAction,
    PowerToolSection,
    PowerToolTabContent,
    type PowerToolTab,
    type PowerToolTabProps,
} from '../../../components/PowerTool';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { useAppPalette } from '../../../theme/usePalette';

// ============================================
// TAB 1: TRANSLATOR (Simple Mode)
// Plain language conversion for legal/medical jargon
// ============================================
function TranslatorTab(props: PowerToolTabProps) {
  const { navigateToTab } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [inputText, setInputText] = useState('');

  const handleQuickTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert(
        t('translator.noText', 'No text'),
        t('translator.enterText', 'Please enter some text to translate')
      );
      return;
    }
    
    trackEvent('ai.translator.quick_translate', { length: inputText.length });
    router.push({
      pathname: '/advocacy/ai-advocate-translator',
      params: { text: inputText },
    } as any);
  };

  const styles = createTranslatorStyles(palette);

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Quick Translate */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t('translator.quickTitle', '🔤 Quick Translate')}
        </Text>
        <Text style={styles.cardDesc}>
          {t('translator.quickDesc', 'Paste complex legal, medical, or government text to get a plain language explanation.')}
        </Text>
        
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('translator.placeholder', 'Paste text here...')}
          placeholderTextColor={palette.muted}
          multiline
          numberOfLines={4}
          maxLength={2000}
          accessibilityLabel={t('translator.inputLabel', 'Text to translate')}
        />
        
        <A11yPressable
          style={styles.translateButton}
          onPress={handleQuickTranslate}
          accessibilityRole="button"
          accessibilityLabel={t('translator.translate', 'Translate to plain language')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="language" size={20} color={palette.onPrimary} />
          <Text style={styles.translateButtonText}>
            {t('translator.translateBtn', 'Translate to Plain Language')}
          </Text>
        </A11yPressable>
      </View>

      {/* Common Translations */}
      <PowerToolSection title={t('translator.common', 'Common Translations')}>
        <PowerToolAction
          label={t('translator.denialLetter', 'Translate Denial Letter')}
          icon="📄"
          onPress={() => router.push('/advocacy/ai-advocate-translator')}
        />
        <PowerToolAction
          label={t('translator.medicalReport', 'Translate Medical Report')}
          icon="🏥"
          onPress={() => router.push('/advocacy/ai-advocate-translator')}
        />
        <PowerToolAction
          label={t('translator.legalDoc', 'Translate Legal Document')}
          icon="⚖️"
          onPress={() => router.push('/advocacy/ai-advocate-translator')}
        />
      </PowerToolSection>

      {/* Navigate to advanced features */}
      <View style={styles.moreCard}>
        <Text style={styles.moreTitle}>{t('translator.needMore', 'Need more AI help?')}</Text>
        <GapView gap={8}>
          <A11yPressable
            style={styles.moreLink}
            onPress={() => navigateToTab('interpreter')}
            accessibilityRole="button"
          >
            <Text style={styles.moreLinkIcon}>🔍</Text>
            <Text style={styles.moreLinkText}>{t('translator.goInterpreter', 'Analyze full documents')}</Text>
            <Ionicons name="arrow-forward" size={16} color={palette.primary} />
          </A11yPressable>
          <A11yPressable
            style={styles.moreLink}
            onPress={() => navigateToTab('assistant')}
            accessibilityRole="button"
          >
            <Text style={styles.moreLinkIcon}>💬</Text>
            <Text style={styles.moreLinkText}>{t('translator.goAssistant', 'Ask a question')}</Text>
            <Ionicons name="arrow-forward" size={16} color={palette.primary} />
          </A11yPressable>
        </GapView>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 2: INTERPRETER (Standard Mode)
// Document analysis and case interpretation
// ============================================
function InterpreterTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createInterpreterStyles(palette);

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Feature Overview */}
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>🔍</Text>
        <Text style={styles.heroTitle}>{t('interpreter.title', 'AI Case Interpreter')}</Text>
        <Text style={styles.heroDesc}>
          {t('interpreter.desc', 'Upload documents or paste text for AI-powered analysis. Get insights on key points, deadlines, and action items.')}
        </Text>
        <A11yPressable
          style={styles.heroButton}
          onPress={() => router.push('/advocacy/ai-case-interpreter')}
          accessibilityRole="button"
          accessibilityLabel={t('interpreter.start', 'Start AI case interpretation')}
        >
          <Text style={styles.heroButtonText}>{t('interpreter.startBtn', 'Start Interpreting')}</Text>
          <Ionicons name="arrow-forward" size={18} color={palette.onPrimary} />
        </A11yPressable>
      </View>

      {/* Features */}
      <PowerToolSection title={t('interpreter.features', 'What It Can Do')}>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={palette.success} />
          <Text style={styles.featureText}>{t('interpreter.f1', 'Extract key dates and deadlines')}</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={palette.success} />
          <Text style={styles.featureText}>{t('interpreter.f2', 'Identify required actions')}</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={palette.success} />
          <Text style={styles.featureText}>{t('interpreter.f3', 'Summarize in plain language')}</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={palette.success} />
          <Text style={styles.featureText}>{t('interpreter.f4', 'Flag potential issues')}</Text>
        </View>
      </PowerToolSection>

      {/* Related Tools */}
      <PowerToolSection title={t('interpreter.related', 'Related Tools')}>
        <PowerToolAction
          label={t('interpreter.denialDecoder', 'Denial Decoder')}
          icon="❌"
          onPress={() => router.push('/resources/denial-decoder')}
        />
        <PowerToolAction
          label={t('interpreter.evidenceManager', 'Evidence Manager')}
          icon="📁"
          onPress={() => router.push('/advocacy/evidence-manager')}
        />
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 3: NAVIGATOR (Standard Mode)
// Government process navigation
// ============================================
function NavigatorTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createNavigatorStyles(palette);

  const processes = [
    { id: 'wsib', icon: '🏭', label: 'WSIB Claims (Ontario)', route: '/advocacy/ai-gov-navigator' },
    { id: 'odsp', icon: '💵', label: 'ODSP Applications', route: '/advocacy/ai-gov-navigator' },
    { id: 'cpp-d', icon: '🇨🇦', label: 'CPP Disability', route: '/advocacy/ai-gov-navigator' },
    { id: 'ei', icon: '📋', label: 'EI Sickness Benefits', route: '/advocacy/ai-gov-navigator' },
    { id: 'hrto', icon: '⚖️', label: 'HRTO Complaints', route: '/advocacy/ai-gov-navigator' },
    { id: 'wsiat', icon: '🏛️', label: 'WSIAT Appeals', route: '/advocacy/ai-gov-navigator' },
  ];

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>🧭</Text>
        <Text style={styles.heroTitle}>{t('navigator.title', 'Government Navigator')}</Text>
        <Text style={styles.heroDesc}>
          {t('navigator.desc', 'Step-by-step guidance through complex government processes. Get jurisdiction-specific help for Canadian disability systems.')}
        </Text>
      </View>

      {/* Process List */}
      <PowerToolSection title={t('navigator.chooseProcess', 'Choose a Process')}>
        {processes.map(process => (
          <A11yPressable
            key={process.id}
            style={styles.processCard}
            onPress={() => router.push({
              pathname: process.route,
              params: { process: process.id },
            } as any)}
            accessibilityRole="button"
            accessibilityLabel={process.label}
          >
            <Text style={styles.processIcon}>{process.icon}</Text>
            <Text style={styles.processLabel}>{process.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={20} color={palette.warning} />
        <Text style={styles.tipText}>
          {t('navigator.tip', 'Set your province in Settings → Jurisdiction for province-specific forms and deadlines.')}
        </Text>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 4: ASSISTANT (Standard Mode)
// General AI Q&A
// ============================================
function AssistantTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [question, setQuestion] = useState('');

  const handleAsk = () => {
    if (!question.trim()) return;
    trackEvent('ai.assistant.question_asked', { length: question.length });
    router.push({
      pathname: '/advocacy/ask',
      params: { q: question },
    } as any);
  };

  const suggestedQuestions = [
    { q: 'How do I appeal a WSIB denial?', icon: '❓' },
    { q: 'What documents do I need for ODSP?', icon: '📄' },
    { q: 'How long do I have to file an appeal?', icon: '⏰' },
    { q: 'Can I work while on CPP Disability?', icon: '💼' },
  ];

  const styles = createAssistantStyles(palette);

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Ask Box */}
      <View style={styles.askCard}>
        <Text style={styles.askTitle}>{t('assistant.askTitle', '💬 Ask Anything')}</Text>
        <Text style={styles.askDesc}>
          {t('assistant.askDesc', 'Get answers about disability rights, benefits, appeals, and advocacy.')}
        </Text>
        
        <TextInput
          style={styles.textInput}
          value={question}
          onChangeText={setQuestion}
          placeholder={t('assistant.placeholder', 'Type your question...')}
          placeholderTextColor={palette.muted}
          multiline
          numberOfLines={3}
          maxLength={500}
          accessibilityLabel={t('assistant.inputLabel', 'Your question')}
        />
        
        <A11yPressable
          style={[styles.askButton, !question.trim() && styles.askButtonDisabled]}
          onPress={handleAsk}
          disabled={!question.trim()}
          accessibilityRole="button"
          accessibilityLabel={t('assistant.ask', 'Ask question')}
        >
          <Ionicons name="send" size={18} color={palette.onPrimary} />
          <Text style={styles.askButtonText}>{t('assistant.askBtn', 'Ask')}</Text>
        </A11yPressable>
      </View>

      {/* Suggested Questions */}
      <PowerToolSection title={t('assistant.suggested', 'Popular Questions')}>
        {suggestedQuestions.map((sq, i) => (
          <A11yPressable
            key={i}
            style={styles.suggestionCard}
            onPress={() => {
              setQuestion(sq.q);
              handleAsk();
            }}
            accessibilityRole="button"
            accessibilityLabel={sq.q}
          >
            <Text style={styles.suggestionIcon}>{sq.icon}</Text>
            <Text style={styles.suggestionText}>{sq.q}</Text>
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 5: COMMAND CENTER (Power User)
// Full AI hub with all tools
// ============================================
function CommandTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createCommandStyles(palette);

  const allTools = [
    { id: 'translator', icon: '🔤', label: 'Advocate Translator', route: '/advocacy/ai-advocate-translator', desc: 'Plain language conversion' },
    { id: 'interpreter', icon: '🔍', label: 'Case Interpreter', route: '/advocacy/ai-case-interpreter', desc: 'Document analysis' },
    { id: 'navigator', icon: '🧭', label: 'Gov Navigator', route: '/advocacy/ai-gov-navigator', desc: 'Process guidance' },
    { id: 'assistant', icon: '💬', label: 'AI Assistant', route: '/advocacy/ai-assistant', desc: 'General Q&A' },
    { id: 'ask', icon: '❓', label: 'Quick Ask', route: '/advocacy/ask', desc: 'Fast answers' },
    { id: 'decision', icon: '🎯', label: 'Decision Simplifier', route: '/resources/ai-decision-simplifier', desc: 'Complex decisions made simple' },
  ];

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>🤖</Text>
        <Text style={styles.heroTitle}>{t('command.title', 'AI Command Center')}</Text>
        <Text style={styles.heroDesc}>
          {t('command.desc', 'All AI-powered advocacy tools in one place. Choose the right tool for your task.')}
        </Text>
      </View>

      {/* All Tools Grid */}
      <PowerToolSection title={t('command.allTools', 'All AI Tools')}>
        {allTools.map(tool => (
          <A11yPressable
            key={tool.id}
            style={styles.toolCard}
            onPress={() => router.push(tool.route as any)}
            accessibilityRole="button"
            accessibilityLabel={`${tool.label}: ${tool.desc}`}
          >
            <Text style={styles.toolIcon}>{tool.icon}</Text>
            <View style={styles.toolText}>
              <Text style={styles.toolLabel}>{tool.label}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Usage Stats (placeholder) */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{t('command.usage', 'Your AI Usage')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>{t('command.translations', 'Translations')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>{t('command.questions', 'Questions')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>{t('command.documents', 'Documents')}</Text>
          </View>
        </View>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB DEFINITIONS
// ============================================
const AI_TABS: PowerToolTab[] = [
  {
    id: 'translator',
    label: 'Translator',
    icon: '🔤',
    complexity: 'simple',
    component: TranslatorTab,
    keywords: ['translate', 'plain', 'language', 'jargon', 'simple'],
  },
  {
    id: 'interpreter',
    label: 'Interpreter',
    icon: '🔍',
    complexity: 'standard',
    component: InterpreterTab,
    badge: 'beta',
    keywords: ['interpret', 'analyze', 'document', 'case', 'review'],
  },
  {
    id: 'navigator',
    label: 'Navigator',
    icon: '🧭',
    complexity: 'standard',
    component: NavigatorTab,
    keywords: ['government', 'process', 'wsib', 'odsp', 'cpp', 'navigate'],
  },
  {
    id: 'assistant',
    label: 'Assistant',
    icon: '💬',
    complexity: 'standard',
    component: AssistantTab,
    keywords: ['ask', 'question', 'help', 'chat', 'answer'],
  },
  {
    id: 'command',
    label: 'Command',
    icon: '🤖',
    complexity: 'power_user',
    component: CommandTab,
    badge: 'new',
    keywords: ['all', 'hub', 'center', 'tools', 'overview'],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function AIAdvocacySuite() {
  const { t } = useTranslation();

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('aiSuite.title', 'AI Advocacy Suite')}
        subtitle={t('aiSuite.subtitle', 'AI-powered tools for disability advocacy')}
        icon="🤖"
        tabs={AI_TABS}
        defaultTab="translator"
        searchPlaceholder={t('aiSuite.search', 'Search AI tools...')}
        analyticsPrefix="advocacy.ai_suite"
      />
    </ResponsiveScreenWrapper>
  );
}

// ============================================
// STYLES
// ============================================

function createTranslatorStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    card: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    cardDesc: {
      fontSize: 14,
      color: palette.muted,
      lineHeight: 21,
      marginBottom: 16,
    },
    textInput: {
      backgroundColor: palette.surface,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      color: palette.text,
      borderWidth: 1,
      borderColor: palette.border,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    translateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 14,
      borderRadius: 10,
      gap: 8,
    },
    translateButtonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    moreCard: {
      backgroundColor: palette.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    moreTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    moreLink: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: palette.card,
      borderRadius: 8,
      gap: 10,
    },
    moreLinkIcon: {
      fontSize: 18,
    },
    moreLinkText: {
      flex: 1,
      fontSize: 14,
      color: palette.text,
    },
  });
}

function createInterpreterStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    heroCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    heroIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    heroDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 16,
    },
    heroButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      gap: 8,
    },
    heroButtonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    featureText: {
      fontSize: 14,
      color: palette.text,
    },
  });
}

function createNavigatorStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    heroCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    heroIcon: {
      fontSize: 40,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    heroDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    processCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    processIcon: {
      fontSize: 24,
    },
    processLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: palette.text,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.warning + '15',
      padding: 14,
      borderRadius: 10,
      gap: 10,
      marginTop: 8,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: palette.text,
      lineHeight: 20,
    },
  });
}

function createAssistantStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    askCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    askTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    askDesc: {
      fontSize: 14,
      color: palette.muted,
      lineHeight: 21,
      marginBottom: 14,
    },
    textInput: {
      backgroundColor: palette.surface,
      borderRadius: 10,
      padding: 14,
      fontSize: 15,
      color: palette.text,
      borderWidth: 1,
      borderColor: palette.border,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    askButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      paddingVertical: 12,
      borderRadius: 10,
      gap: 8,
    },
    askButtonDisabled: {
      opacity: 0.5,
    },
    askButtonText: {
      color: palette.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    suggestionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 10,
    },
    suggestionIcon: {
      fontSize: 18,
    },
    suggestionText: {
      flex: 1,
      fontSize: 14,
      color: palette.text,
    },
  });
}

function createCommandStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    heroCard: {
      backgroundColor: palette.primary + '10',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.primary + '30',
    },
    heroIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    heroDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    toolCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    toolIcon: {
      fontSize: 28,
    },
    toolText: {
      flex: 1,
    },
    toolLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    toolDesc: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 2,
    },
    statsCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: palette.border,
    },
    statsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.primary,
    },
    statLabel: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 4,
    },
  });
}


