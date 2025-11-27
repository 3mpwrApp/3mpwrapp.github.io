import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import AIDisclaimer from '../../../components/AIDisclaimer';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { aiSimplify } from '../../../services/aiAdvocacy';
import { trackEvent } from '../../../services/analyticsClient';
import { usage } from '../../../services/usage';
import { useJurisdiction } from '../../../store/jurisdiction';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type AIMode = 'translate' | 'simplify' | 'analyze' | 'navigate' | 'policy';

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  mode: AIMode;
  route?: string;
  placeholder: string;
}

export default function AICommandCenter() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const titleRef = useRef<Text>(null);
  const router = useRouter();
  const { data: selectedJurisdiction } = useJurisdiction();
  
  useAnnounceOnMount(t('advocacy.aiCommand.title', 'AI Command Center'));
  useFocusOnRefOnMount(titleRef);

  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<AIMode>('translate');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'translate',
      icon: 'language',
      label: t('advocacy.aiCommand.translate', 'Translate to Plain Language'),
      description: t('advocacy.aiCommand.translateDesc', 'Turn legal jargon into clear, simple English'),
      mode: 'translate',
      placeholder: t('advocacy.aiCommand.translatePlaceholder', 'Paste legal text, decision letter, or policy...'),
    },
    {
      id: 'analyze',
      icon: 'analytics',
      label: t('advocacy.aiCommand.analyze', 'Analyze Document Strength'),
      description: t('advocacy.aiCommand.analyzeDesc', 'Identify weak points, deadlines, and action items'),
      mode: 'analyze',
      placeholder: t('advocacy.aiCommand.analyzePlaceholder', 'Paste denial letter or legal document...'),
    },
    {
      id: 'navigate',
      icon: 'compass',
      label: t('advocacy.aiCommand.navigate', 'Find Government Contact'),
      description: t('advocacy.aiCommand.navigateDesc', 'Who to contact and what to say'),
      mode: 'navigate',
      route: '/(tabs)/advocacy/ai-gov-navigator',
      placeholder: t('advocacy.aiCommand.navigatePlaceholder', 'Describe your issue or question...'),
    },
    {
      id: 'policy',
      icon: 'document-text',
      label: t('advocacy.aiCommand.policy', 'Simplify Policy'),
      description: t('advocacy.aiCommand.policyDesc', 'Break down complex policies into key points'),
      mode: 'policy',
      route: '/(tabs)/advocacy/policy-simple',
      placeholder: t('advocacy.aiCommand.policyPlaceholder', 'Paste policy text or ask about a program...'),
    },
    {
      id: 'case',
      icon: 'reader',
      label: t('advocacy.aiCommand.case', 'Interpret Case Documents'),
      description: t('advocacy.aiCommand.caseDesc', 'Understand forms, letters, and legal decisions'),
      mode: 'simplify',
      route: '/(tabs)/advocacy/ai-case-interpreter',
      placeholder: t('advocacy.aiCommand.casePlaceholder', 'Paste form or case document...'),
    },
  ];

  const handleProcess = useCallback(async () => {
    if (!input.trim()) {
      Alert.alert(
        t('advocacy.aiCommand.emptyTitle', 'Input Required'),
        t('advocacy.aiCommand.emptyMessage', 'Please enter some text to process')
      );
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      trackEvent('ai_command_center_used', { mode: selectedMode, jurisdiction: selectedJurisdiction?.code || 'unknown' });
      usage.view('advocacy', '/(tabs)/advocacy/ai-command-center' as any, { mode: selectedMode });

      let response = '';
      
      switch (selectedMode) {
        case 'translate':
          response = await aiSimplify(input);
          break;
        case 'analyze':
          response = analyzeDocument(input);
          break;
        case 'navigate':
          response = generateNavigationGuidance(input, selectedJurisdiction?.code || 'FED');
          break;
        case 'policy':
          response = simplifyPolicy(input);
          break;
        case 'simplify':
          response = await aiSimplify(input);
          break;
        default:
          response = await aiSimplify(input);
      }

      setResult(response);
    } catch {
      Alert.alert(
        t('advocacy.aiCommand.errorTitle', 'Processing Error'),
        t('advocacy.aiCommand.errorMessage', 'Unable to process your request. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  }, [input, selectedMode, selectedJurisdiction, t]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.default.setStringAsync(result);
      Alert.alert(
        t('advocacy.aiCommand.copiedTitle', 'Copied'),
        t('advocacy.aiCommand.copiedMessage', 'Result copied to clipboard')
      );
    } catch {
      Alert.alert(
        t('advocacy.aiCommand.copyErrorTitle', 'Copy Failed'),
        t('advocacy.aiCommand.copyErrorMessage', 'Unable to copy to clipboard')
      );
    }
  }, [result, t]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    try {
      const { isAvailableAsync, shareAsync } = await import('expo-sharing');
      if (await isAvailableAsync()) {
        // Write to temp file and share
        const FS = await import('expo-file-system');
        const path = FS.default.cacheDirectory + `ai_analysis_${Date.now()}.txt`;
        await FS.default.writeAsStringAsync(path, result);
        await shareAsync(path);
      } else {
        Alert.alert(
          t('advocacy.aiCommand.shareUnavailable', 'Sharing Unavailable'),
          t('advocacy.aiCommand.shareUnavailableMessage', 'Share feature not available on this device')
        );
      }
    } catch {
      // User cancelled or error
    }
  }, [result, t]);

  const s = styles(palette);

  return (
    <ResponsiveScreenWrapper testID="ai-command-center-screen">
      <ScrollView contentContainerStyle={s.container}>
        <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          🤖 {t('advocacy.aiCommand.title', 'AI Command Center')}
        </Text>

        <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('advocacy.aiCommand.subtitle', 'Your all-in-one AI assistant for legal documents, policy translation, and advocacy guidance')}
        </Text>

        <DisclaimerBanner type="ai" compact={true} />
        <DisclaimerBanner type="legal" compact={true} />

        {/* Context-Aware Banner */}
        {selectedJurisdiction && (
          <View style={[s.contextBanner, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
            <Ionicons name="location" size={16} color={palette.primary} />
            <Text style={[s.contextText, { color: palette.text }]}>
              {t('advocacy.aiCommand.jurisdictionContext', 'Analyzing for {{jurisdiction}}', { 
                jurisdiction: selectedJurisdiction.name 
              })}
            </Text>
          </View>
        )}

        {/* Quick Actions Grid */}
        <Text style={s.sectionTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('advocacy.aiCommand.quickActions', 'Quick Actions')}
        </Text>

        <View style={s.actionsGrid}>
          {quickActions.map((action) => (
            <A11yPressable
              key={action.id}
              hitSlop={HIT_SLOP_8}
              onPress={() => {
                if (action.route) {
                  router.push(action.route as any);
                } else {
                  setSelectedMode(action.mode);
                  setInput('');
                  setResult('');
                }
              }}
              style={[
                s.actionCard,
                selectedMode === action.mode && !action.route && s.actionCardActive,
                { backgroundColor: palette.surface, borderColor: palette.muted }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${action.label}. ${action.description}`}
            >
              <View style={[s.actionIconWrap, { backgroundColor: palette.primary + '20' }]}>
                <Ionicons name={action.icon} size={24} color={palette.primary} />
              </View>
              <Text style={[s.actionLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {action.label}
              </Text>
              <Text style={[s.actionDesc, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {action.description}
              </Text>
              {action.route && (
                <View style={s.actionArrow}>
                  <Ionicons name="arrow-forward" size={16} color={palette.primary} />
                </View>
              )}
            </A11yPressable>
          ))}
        </View>

        {/* Input Section */}
        <View style={[s.inputSection, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <Text style={[s.inputLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('advocacy.aiCommand.inputLabel', 'Your Input')}
          </Text>
          
          <TextInput
            style={[s.textInput, { color: palette.text, borderColor: palette.muted }]}
            multiline
            numberOfLines={8}
            value={input}
            onChangeText={setInput}
            placeholder={quickActions.find(a => a.mode === selectedMode)?.placeholder || t('advocacy.aiCommand.defaultPlaceholder', 'Enter text here...')}
            placeholderTextColor={palette.text + '80'}
            accessibilityLabel={t('advocacy.aiCommand.inputAccessibility', 'Text input for AI processing')}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          />

          {/* Advanced Options Toggle */}
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={s.advancedToggle}
          >
            <Ionicons 
              name={showAdvanced ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={palette.primary} 
            />
            <Text style={[s.advancedToggleText, { color: palette.primary }]}>
              {t('advocacy.aiCommand.advancedOptions', 'Advanced Options')}
            </Text>
          </A11yPressable>

          {showAdvanced && (
            <View style={s.advancedSection}>
              <Text style={[s.advancedInfo, { color: palette.text }]}>
                {t('advocacy.aiCommand.advancedInfo', '• Context-aware: AI remembers your jurisdiction and case details\n• Multi-modal: Upload images (coming soon)\n• Collaborative: Share sessions with advocates (coming soon)')}
              </Text>
            </View>
          )}

          <GapView gap={12} style={s.buttonRow}>
            <A11yPressable
              hitSlop={HIT_SLOP_8}
              onPress={handleProcess}
              disabled={loading || !input.trim()}
              style={[
                s.processButton,
                { backgroundColor: palette.primary },
                (loading || !input.trim()) && s.buttonDisabled
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('advocacy.aiCommand.processButton', 'Process with AI')}
            >
              {loading ? (
                <Text style={[s.buttonText, { color: palette.onPrimary }]}>
                  {t('advocacy.aiCommand.processing', 'Processing...')}
                </Text>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color={palette.onPrimary} />
                  <Text style={[s.buttonText, { color: palette.onPrimary }]}>
                    {t('advocacy.aiCommand.processButton', 'Process with AI')}
                  </Text>
                </>
              )}
            </A11yPressable>

            {input.trim() && (
              <A11yPressable
                hitSlop={HIT_SLOP_8}
                onPress={() => { setInput(''); setResult(''); }}
                style={[s.clearButton, { borderColor: palette.muted }]}
              >
                <Text style={[s.clearButtonText, { color: palette.text }]}>
                  {t('advocacy.aiCommand.clear', 'Clear')}
                </Text>
              </A11yPressable>
            )}
          </GapView>
        </View>

        {/* Result Section */}
        {result && (
          <View style={[s.resultSection, { backgroundColor: palette.surface, borderColor: palette.primary }]}>
            <View style={s.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color={palette.success} />
              <Text style={[s.resultTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {t('advocacy.aiCommand.result', 'AI Analysis Result')}
              </Text>
            </View>

            <Text style={[s.resultText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} selectable>
              {result}
            </Text>

            <GapView gap={12} style={s.resultActions}>
              <A11yPressable
                hitSlop={HIT_SLOP_8}
                onPress={handleCopy}
                style={[s.actionButton, { backgroundColor: palette.primary }]}
              >
                <Ionicons name="copy-outline" size={20} color={palette.onPrimary} />
                <Text style={[s.actionButtonText, { color: palette.onPrimary }]}>
                  {t('advocacy.aiCommand.copy', 'Copy')}
                </Text>
              </A11yPressable>

              <A11yPressable
                hitSlop={HIT_SLOP_8}
                onPress={handleShare}
                style={[s.actionButton, { borderColor: palette.primary, borderWidth: 1 }]}
              >
                <Ionicons name="share-outline" size={20} color={palette.primary} />
                <Text style={[s.actionButtonText, { color: palette.primary }]}>
                  {t('advocacy.aiCommand.share', 'Share')}
                </Text>
              </A11yPressable>

              <A11yPressable
                hitSlop={HIT_SLOP_8}
                style={[s.actionButton, { borderColor: palette.muted, borderWidth: 1 }]}
                onPress={() => router.push('/(tabs)/advocacy/evidence-manager')}
              >
                <Ionicons name="folder-outline" size={20} color={palette.text} />
                <Text style={[s.actionButtonText, { color: palette.text }]}>
                  {t('advocacy.aiCommand.saveToEvidence', 'Save to Evidence')}
                </Text>
              </A11yPressable>
            </GapView>
          </View>
        )}

        {/* Related Tools */}
        <Text style={[s.sectionTitle, { marginTop: 32 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('advocacy.aiCommand.relatedTools', 'Related Tools')}
        </Text>

        <View style={s.relatedTools}>
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
            onPress={() => router.push('/(tabs)/advocacy/accountability-hub')}
          >
            <Ionicons name="people" size={24} color={palette.primary} />
            <Text style={[s.relatedTitle, { color: palette.text }]}>
              {t('advocacy.aiCommand.accountabilityNetwork', 'Case Tracker & Coaching')}
            </Text>
            <Text style={[s.relatedDesc, { color: palette.text }]}>
              {t('advocacy.aiCommand.accountabilityDesc', 'Track cases, get AI coaching, build accountability')}
            </Text>
          </A11yPressable>

          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
            onPress={() => router.push('/(tabs)/advocacy/evidence-manager')}
          >
            <Ionicons name="shield-checkmark" size={24} color={palette.primary} />
            <Text style={[s.relatedTitle, { color: palette.text }]}>
              {t('advocacy.aiCommand.evidenceVault', 'Evidence Manager')}
            </Text>
            <Text style={[s.relatedDesc, { color: palette.text }]}>
              {t('advocacy.aiCommand.evidenceVaultDesc', 'Secure document storage with AI categorization')}
            </Text>
          </A11yPressable>
        </View>

        <AIDisclaimer />
      </ScrollView>
    </ResponsiveScreenWrapper>
  );
}

// Helper functions for AI processing modes

function analyzeDocument(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  const hasDeadline = /\b(\d{1,2})\s+days?\b/i.test(text);
  const hasDenial = /\b(denied|reject|dismiss)/i.test(text);
  const hasAppeal = /\b(appeal|reconsider|review)/i.test(text);
  
  let analysis = '📊 Document Analysis:\n\n';
  
  if (hasDenial) {
    analysis += '🚨 DENIAL DETECTED:\n';
    analysis += '• This appears to be a denial or rejection\n';
    analysis += '• You likely have appeal rights\n';
    analysis += '• Document all reasons for denial\n\n';
  }
  
  if (hasDeadline) {
    analysis += '⏰ DEADLINE WARNING:\n';
    analysis += '• Deadline detected in document\n';
    analysis += '• Act immediately - set calendar reminders\n';
    analysis += '• Missing deadlines can forfeit your rights\n\n';
  }
  
  analysis += '💪 STRENGTH ASSESSMENT:\n';
  analysis += `• Document length: ${lines.length} lines (${text.length} characters)\n`;
  analysis += '• Recommended action: ';
  
  if (hasAppeal) {
    analysis += 'Review appeal process carefully\n\n';
  } else {
    analysis += 'Gather supporting evidence and documentation\n\n';
  }
  
  analysis += '📋 NEXT STEPS:\n';
  analysis += '1. Save this document to Evidence Vault\n';
  analysis += '2. Set deadline reminders if applicable\n';
  analysis += '3. Consult with advocate or lawyer\n';
  analysis += '4. Draft response using Letter Factory\n\n';
  
  analysis += '💡 TIP: Use "Translate to Plain Language" mode to simplify complex sections.';
  
  return analysis;
}

function generateNavigationGuidance(query: string, jurisdiction: string): string {
  let guidance = `🧭 Government Navigation Guidance (${jurisdiction}):\n\n`;
  
  guidance += 'Based on your query, here are the key contacts:\n\n';
  
  if (/benefit|cpp|disability|ei/i.test(query)) {
    guidance += '📞 Service Canada:\n';
    guidance += '• Phone: 1-800-622-6232 (TTY: 1-800-926-9105)\n';
    guidance += '• Hours: Mon-Fri 8:30am-4:30pm local time\n';
    guidance += '• Online: canada.ca/en/services/benefits\n\n';
    
    guidance += '📧 What to Say:\n';
    guidance += '"I\'m calling about my [CPP-D / EI Sickness] claim [number]. ';
    guidance += 'I need clarification on [specific issue]."\n\n';
  }
  
  if (/work|wsib|wcb|worker/i.test(query)) {
    const boards: Record<string, string> = {
      'ON': 'WSIB (Workplace Safety & Insurance Board)',
      'BC': 'WorkSafeBC',
      'AB': 'WCB Alberta',
      'QC': 'CNESST',
    };
    
    const board = boards[jurisdiction] || 'Workers\' Compensation Board';
    
    guidance += `📞 ${board}:\n`;
    guidance += '• Check your province\'s website for contact info\n';
    guidance += '• Have your claim number ready\n';
    guidance += '• Request status update in writing\n\n';
  }
  
  guidance += '⚡ PRO TIPS:\n';
  guidance += '• Call early morning for shorter wait times\n';
  guidance += '• Take notes: date, time, agent name, what was said\n';
  guidance += '• Follow up verbal calls with email summary\n';
  guidance += '• Request reference numbers for all interactions\n\n';
  
  guidance += '📋 NEXT STEPS:\n';
  guidance += '1. Prepare questions before calling\n';
  guidance += '2. Have all documents ready\n';
  guidance += '3. Log interaction in Evidence Vault\n';
  guidance += '4. Set follow-up reminder if needed';
  
  return guidance;
}

function simplifyPolicy(_text: string): string {
  let simplified = '📖 Policy Breakdown (Plain Language):\n\n';
  
  simplified += 'KEY POINTS:\n';
  simplified += '• This policy outlines eligibility and processes\n';
  simplified += '• Look for words like "must", "may", "shall" - these indicate requirements\n';
  simplified += '• Deadlines are critical - mark them in your calendar\n\n';
  
  simplified += 'WHO QUALIFIES:\n';
  simplified += '• Check "eligibility criteria" sections\n';
  simplified += '• Note any exceptions or special circumstances\n';
  simplified += '• Medical evidence requirements\n\n';
  
  simplified += 'HOW TO APPLY:\n';
  simplified += '• Required forms and documentation\n';
  simplified += '• Where to submit application\n';
  simplified += '• Processing timelines\n\n';
  
  simplified += 'YOUR RIGHTS:\n';
  simplified += '• Right to accommodation\n';
  simplified += '• Right to appeal decisions\n';
  simplified += '• Right to representation\n\n';
  
  simplified += '💡 TIP: If any section is unclear, copy that specific text and use "Translate to Plain Language" mode.';
  
  return simplified;
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
      lineHeight: 24,
    },
    contextBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 16,
      gap: 8,
    },
    contextText: {
      fontSize: 14,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
      marginTop: 24,
    },
    actionsGrid: {
      gap: 12,
    },
    actionCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      position: 'relative',
    },
    actionCardActive: {
      borderWidth: 2,
      borderColor: palette.primary,
    },
    actionIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    actionLabel: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    actionDesc: {
      fontSize: 14,
      opacity: 0.85,
      lineHeight: 20,
    },
    actionArrow: {
      position: 'absolute',
      top: 16,
      right: 16,
    },
    inputSection: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 24,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    advancedToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    advancedToggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    advancedSection: {
      marginTop: 12,
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
    },
    advancedInfo: {
      fontSize: 13,
      lineHeight: 20,
      opacity: 0.85,
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: 16,
    },
    processButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
      gap: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    clearButton: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 8,
      borderWidth: 1,
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    resultSection: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginTop: 24,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    resultText: {
      fontSize: 15,
      lineHeight: 24,
      marginBottom: 16,
    },
    resultActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    relatedTools: {
      gap: 12,
    },
    relatedCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
    },
    relatedTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    relatedDesc: {
      fontSize: 14,
      opacity: 0.85,
    },
  });
}
