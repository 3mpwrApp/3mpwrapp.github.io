import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { getCachedJSON, setCachedJSON } from '../../../services/cache';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

interface CBTEntry {
  id: string;
  thought: string;
  evidenceFor: string;
  evidenceAgainst: string;
  reframe: string;
  timestamp: number;
}

const EXTREME_THINKING_PATTERN = /always|never|everyone|no one|worst|terrible|awful/i;

export default function CBTCoach(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('CBT Virtual Coach');
  useFocusOnRefOnMount(titleRef);
  
  React.useEffect(()=>{ logView('wellness/cbt-coach'); loadHistory(); },[]);
  
  const [thought, setThought] = React.useState('');
  const [evidenceFor, setEvidenceFor] = React.useState('');
  const [evidenceAgainst, setEvidenceAgainst] = React.useState('');
  const [reframe, setReframe] = React.useState('');
  const [history, setHistory] = React.useState<CBTEntry[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const loadHistory = async () => {
    try {
      const saved = await getCachedJSON<CBTEntry[]>('cbt_coach_history') || [];
      setHistory(saved.slice(0, 5)); // Show last 5 entries
    } catch (err) {
      console.error('Error loading CBT history:', err);
    }
  };

  const saveToHistory = async (entry: CBTEntry) => {
    try {
      const saved = await getCachedJSON<CBTEntry[]>('cbt_coach_history') || [];
      const updated = [entry, ...saved].slice(0, 20); // Keep last 20
      await setCachedJSON('cbt_coach_history', updated);
      setHistory(updated.slice(0, 5));
    } catch (err) {
      console.error('Error saving CBT history:', err);
    }
  };

  const generate = async () => {
    if (!thought.trim()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate a more helpful reframe
      const parts: string[] = [];
      parts.push('💭 Reframed Perspective:');
      parts.push('');
      
      // Check for extreme thinking patterns
      const hasExtreme = EXTREME_THINKING_PATTERN.test(thought);
      if (hasExtreme) {
        parts.push('⚠️ Notice: This thought contains absolute language (always/never). Reality is often more nuanced.');
        parts.push('');
      }
      
      parts.push('📊 Evidence Review:');
      if (evidenceFor.trim()) {
        parts.push(`  Supporting: ${evidenceFor.trim()}`);
      } else {
        parts.push('  Supporting: None provided');
      }
      
      if (evidenceAgainst.trim()) {
        parts.push(`  Challenging: ${evidenceAgainst.trim()}`);
      } else {
        parts.push('  Challenging: None provided');
      }
      
      parts.push('');
      parts.push('🎯 Balanced Thought:');
      
      // Generate balanced reframe
      if (!evidenceFor.trim() && !evidenceAgainst.trim()) {
        parts.push('Consider gathering evidence before jumping to conclusions. What facts support or challenge this thought?');
      } else if (evidenceAgainst.trim() && !evidenceFor.trim()) {
        parts.push(`Given the evidence, this thought may not be fully accurate. A more balanced view: "While I initially thought '${thought}', the evidence suggests this may not be the case."`);
      } else {
        parts.push(`"While there may be some truth to '${thought}', I also need to consider the evidence that challenges it. The reality is likely more complex than my initial thought."`);
      }
      
      parts.push('');
      parts.push('💡 Next Steps:');
      parts.push('  • Look for additional evidence');
      parts.push('  • Consider alternative explanations');
      parts.push('  • Practice self-compassion');
      
      const generatedReframe = parts.join('\n');
      setReframe(generatedReframe);
      
      // Save to history
      const entry: CBTEntry = {
        id: Date.now().toString(),
        thought,
        evidenceFor,
        evidenceAgainst,
        reframe: generatedReframe,
        timestamp: Date.now(),
      };
      await saveToHistory(entry);
      
    } catch (err) {
      console.error('Error generating reframe:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearForm = () => {
    setThought('');
    setEvidenceFor('');
    setEvidenceAgainst('');
    setReframe('');
  };

  const loadFromHistory = (entry: CBTEntry) => {
    setThought(entry.thought);
    setEvidenceFor(entry.evidenceFor);
    setEvidenceAgainst(entry.evidenceAgainst);
    setReframe(entry.reframe);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={s.header}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('wellness.cbt.title','CBT Virtual Coach')}
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      
      {/* Info Card */}
      <View style={[s.card, { backgroundColor: palette.info + '22' }]}>
        <Text style={s.infoText}>
          💡 Cognitive Behavioral Therapy helps identify and challenge unhelpful thought patterns. Enter an automatic thought and examine the evidence.
        </Text>
      </View>

      {/* Input Card */}
      <View style={s.card}>
        <Text style={s.label}>Automatic Thought</Text>
        <TextInput 
          value={thought} 
          onChangeText={setThought} 
          placeholder={t('wellness.cbt.thought','What thought is bothering you?')} 
          placeholderTextColor={palette.text+'77'} 
          style={s.input}
          accessibilityLabel="Automatic thought input"
          multiline
          numberOfLines={3}
        />
        
        <Text style={s.label}>Evidence Supporting This Thought</Text>
        <TextInput 
          value={evidenceFor} 
          onChangeText={setEvidenceFor} 
          placeholder={t('wellness.cbt.evidenceFor','What supports this thought?')} 
          placeholderTextColor={palette.text+'77'} 
          style={s.input}
          accessibilityLabel="Evidence for input"
          multiline
          numberOfLines={2}
        />
        
        <Text style={s.label}>Evidence Against This Thought</Text>
        <TextInput 
          value={evidenceAgainst} 
          onChangeText={setEvidenceAgainst} 
          placeholder={t('wellness.cbt.evidenceAgainst','What challenges this thought?')} 
          placeholderTextColor={palette.text+'77'} 
          style={s.input}
          accessibilityLabel="Evidence against input"
          multiline
          numberOfLines={2}
        />

        <GapView gap={8}>
          <A11yPressable 
            onPress={generate} 
            style={s.button} 
            hitSlop={HIT_SLOP_8} 
            accessibilityRole="button" 
            accessibilityLabel="Generate reframe"
            disabled={!thought.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={palette.onPrimary} />
            ) : (
              <Text style={s.buttonText}>{t('wellness.cbt.generate','Generate Reframe')}</Text>
            )}
          </A11yPressable>
          
          {(thought || evidenceFor || evidenceAgainst || reframe) && (
            <A11yPressable 
              onPress={clearForm} 
              style={s.secondaryButton} 
              hitSlop={HIT_SLOP_8} 
              accessibilityRole="button" 
              accessibilityLabel="Clear form"
            >
              <Text style={s.secondaryButtonText}>Clear Form</Text>
            </A11yPressable>
          )}
        </GapView>
      </View>

      {/* Result Card */}
      {reframe && (
        <View style={[s.card, { backgroundColor: palette.success + '11' }]}>
          <Text style={s.cardTitle}>Your Reframe</Text>
          <Text style={s.reframeText}>{reframe}</Text>
        </View>
      )}

      {/* History Card */}
      {history.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Recent Entries</Text>
          {history.map((entry) => (
            <A11yPressable
              key={entry.id}
              onPress={() => loadFromHistory(entry)}
              style={s.historyItem}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`Load entry: ${entry.thought.substring(0, 50)}`}
            >
              <Text style={s.historyThought} numberOfLines={2}>
                {entry.thought}
              </Text>
              <Text style={s.historyDate}>
                {new Date(entry.timestamp).toLocaleDateString()}
              </Text>
            </A11yPressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container: { 
      flex:1, 
      backgroundColor: palette.background 
    },
    header: { 
      color: palette.text, 
      fontSize: 24, 
      fontWeight: '800', 
      marginBottom: 12 
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    cardTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    infoText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.9,
    },
    label: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 8,
    },
    input: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      color: palette.text, 
      padding: 12, 
      borderRadius: 8, 
      marginBottom: 12,
      fontSize: 14,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    button: { 
      backgroundColor: palette.primary, 
      padding: 14, 
      borderRadius: 10, 
      alignItems: 'center'
    },
    buttonText: { 
      color: palette.onPrimary, 
      fontWeight: '700',
      fontSize: 15,
    },
    secondaryButton: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 14,
    },
    reframeText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'monospace',
    },
    historyItem: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: palette.background,
      marginBottom: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    historyThought: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    historyDate: {
      color: palette.text,
      fontSize: 12,
      opacity: 0.6,
    },
  });
}
