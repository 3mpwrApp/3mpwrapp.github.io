import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import AIDisclaimer from '../../../components/AIDisclaimer';
import GapView from '../../../components/GapView';
import { LoadingWrapper } from '../../../components/LoadingWrapper';
import OnlineStatusBadge from '../../../components/OnlineStatusBadge';
import {
    MAX_FONT_SCALE,
    useAccessibleLoading,
    useAccessibleTabs,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from '../../../i18n';
import { aiCoachPrompt } from '../../../services/aiAdvocacy';
import { llmInterpret, llmSimplify } from "../../../services/llm";
import { usage } from '../../../services/usage';
import { s } from '../../../theme/spacing';
import { useAppPalette } from "../../../theme/usePalette";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: 'coach' | 'interpreter' | 'translator' | 'navigator';
};

type AIMode = 'coach' | 'interpreter' | 'translator' | 'navigator';

export const options = { href: null };

export default function UnifiedAIAssistant() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('advocacy.aiAssistant.title', 'AI Advocate Assistant'));
  useFocusOnRefOnMount(titleRef);

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [mode, setMode] = React.useState<AIMode>('coach');
  const [loading, setLoading] = React.useState(false);

  // Enhanced accessibility for loading states
  const loadingAccessibility = useAccessibleLoading(
    loading,
    t('advocacy.aiAssistant.thinking', 'AI is thinking...'),
    t('advocacy.aiAssistant.ready', 'AI response ready')
  );

  // Enhanced accessibility for tab navigation
  const modes = [
    { key: 'coach' as AIMode, label: t('advocacy.aiAssistant.modes.coach', 'Self-Advocacy Coach'), desc: t('advocacy.aiAssistant.modes.coachDesc', 'Get guidance on advocacy steps') },
    { key: 'interpreter' as AIMode, label: t('advocacy.aiAssistant.modes.interpreter', 'Case Interpreter'), desc: t('advocacy.aiAssistant.modes.interpreterDesc', 'Clarify forms and decisions') },
    { key: 'translator' as AIMode, label: t('advocacy.aiAssistant.modes.translator', 'Advocate Translator'), desc: t('advocacy.aiAssistant.modes.translatorDesc', 'Turn words into strong advocacy language') },
    { key: 'navigator' as AIMode, label: t('advocacy.aiAssistant.modes.navigator', 'Government Navigator'), desc: t('advocacy.aiAssistant.modes.navigatorDesc', 'Find who to contact and what to say') },
  ];

  const { announceTabChange, getTabAccessibilityProps } = useAccessibleTabs(
    modes.map(m => m.label),
    modes.findIndex(m => m.key === mode),
    (index) => setMode(modes[index].key)
  );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      mode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response = '';

      switch (mode) {
        case 'coach':
          response = await aiCoachPrompt(input);
          break;
        case 'interpreter':
          const interpretation = await llmInterpret(input);
          if (interpretation) {
            response = `${interpretation.summary}\n\nNext steps:\n${interpretation.next.map(step => `• ${step}`).join('\n')}`;
          } else {
            response = 'Unable to interpret the provided text. Please try again or provide more details.';
          }
          break;
        case 'translator':
          const translated = await llmSimplify(input);
          response = translated || 'Unable to simplify the provided text. Please try again.';
          break;
        case 'navigator':
          // Simplified navigator logic - in full implementation, this would use more complex logic
          response = `Based on your situation, here are recommended next steps:\n\n1. Contact your local disability services office\n2. Gather relevant medical documentation\n3. Consider reaching out to advocacy organizations\n\nWould you like me to help you find specific contact information?`;
          break;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        mode,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Log usage
      usage.view('ai_assistant_interaction', undefined, { mode, messageLength: input.length });

    } catch (error) {
      console.error('AI Assistant error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('advocacy.aiAssistant.error', 'Unable to get AI response. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.aiAssistant.title', 'AI Advocate Assistant')}
      </Text>

      <AIDisclaimer />

      {/* Mode Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeSelector}>
        <GapView style={{ paddingHorizontal: s('sm') }} gap={s('sm')}>
          {modes.map((m, index) => (
            <A11yPressable
              key={m.key}
              onPress={() => announceTabChange(index)}
              style={[
                styles.modeButton,
                mode === m.key && { backgroundColor: palette.primary, borderColor: palette.primary }
              ]}
              {...getTabAccessibilityProps(index)}
            >
              <Text style={[
                styles.modeButtonText,
                mode === m.key && { color: palette.onPrimary }
              ]}>
                {m.label}
              </Text>
            </A11yPressable>
          ))}
        </GapView>
      </ScrollView>

      {/* Chat Interface */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ padding: s('md') }}
        ref={scrollRef => scrollRef?.scrollToEnd()}
      >
        <LoadingWrapper
          isLoading={messages.length === 0 && !loading}
          skeletonType="text"
          skeletonCount={4}
          fallback={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t('advocacy.aiAssistant.welcome', 'Select a mode above and ask me anything about advocacy, accessibility, or disability rights.')}
              </Text>
            </View>
          }
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? { color: palette.onPrimary } : { color: palette.text }
              ]}>
                {message.content}
              </Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.message, styles.assistantMessage]}>
              <Text style={styles.loadingText}>
                {t('advocacy.aiAssistant.thinking', 'Thinking...')}
              </Text>
            </View>
          )}
        </LoadingWrapper>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('advocacy.aiAssistant.placeholder', 'Ask me about advocacy...')}
          multiline
          accessibilityLabel={t('advocacy.aiAssistant.inputLabel', 'Message input')}
          onSubmitEditing={sendMessage}
        />
        <A11yPressable
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={[
            styles.sendButton,
            (!input.trim() || loading) && { opacity: 0.5 }
          ]}
          accessibilityRole="button"
          accessibilityLabel={loading ? loadingAccessibility.accessibilityLabel : t('common.send', 'Send')}
          {...loadingAccessibility.accessibilityState}
        >
          <Text style={styles.sendButtonText}>
            {t('common.send', 'Send')}
          </Text>
        </A11yPressable>
      </View>

      <OnlineStatusBadge />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.primary,
      padding: s('md'),
      paddingBottom: s('sm'),
    },
    modeSelector: {
      maxHeight: 60,
      backgroundColor: palette.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    modeButton: {
      paddingHorizontal: s('md'),
      paddingVertical: s('sm'),
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: palette.background,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: s('xl'),
    },
    emptyText: {
      fontSize: 16,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 24,
    },
    message: {
      marginBottom: s('md'),
      padding: s('md'),
      borderRadius: 12,
      maxWidth: '80%',
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: palette.primary,
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
    },
    messageTime: {
      fontSize: 12,
      color: palette.muted,
      marginTop: s('xs'),
    },
    loadingText: {
      fontSize: 16,
      color: palette.muted,
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: s('md'),
      backgroundColor: palette.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.muted,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: s('sm'),
      marginRight: s('sm'),
      fontSize: 16,
      color: palette.text,
      backgroundColor: palette.background,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: s('md'),
      paddingVertical: s('sm'),
      borderRadius: 8,
      justifyContent: 'center',
    },
    sendButtonText: {
      color: palette.onPrimary,
      fontWeight: '600',
    },
  });
}