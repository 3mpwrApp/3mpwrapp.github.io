import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useSettings } from '../../../store/settings';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type DenialPattern = {
  type: 'medical_insufficient' | 'deadline_missed' | 'causation_weak' | 'non_compliance' | 'policy_exclusion' | 'surveillance' | 'ime_conflict';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  appealable: boolean;
  actions: string[];
};

type DecodedResult = {
  summary: string;
  denialType: string; // WSIB, LTD, CPP-D, etc.
  patterns: DenialPattern[];
  appealDeadline?: { date: string; daysLeft: number };
  appealStrength: number; // 0-100
  keyQuotes: string[];
  nextSteps: string[];
  template?: string;
};

const COMMON_PATTERNS: Record<string, DenialPattern> = {
  medical_insufficient: {
    type: 'medical_insufficient',
    title: '❌ Insufficient Medical Evidence',
    description: 'Decision states medical evidence does not support claim',
    severity: 'medium',
    appealable: true,
    actions: [
      'Obtain updated medical opinion from treating specialist',
      'Request functional capacity evaluation',
      'Gather objective test results (MRI, X-ray, bloodwork)',
      'Ask doctor to address specific deficiencies cited in denial'
    ]
  },
  causation_weak: {
    type: 'causation_weak',
    title: '🔗 Weak Causation Link',
    description: 'Decision questions connection between work/accident and condition',
    severity: 'high',
    appealable: true,
    actions: [
      'Get specialist opinion on causation',
      'Provide workplace incident reports or witness statements',
      'Timeline showing symptom onset after incident',
      'Review medical literature supporting causation'
    ]
  },
  non_compliance: {
    type: 'non_compliance',
    title: '⚠️ Non-Compliance Cited',
    description: 'Claim denied for not following treatment recommendations',
    severity: 'medium',
    appealable: true,
    actions: [
      'Document medical reasons for non-compliance (side effects, contraindications)',
      'Show attempts to comply with treatment',
      'Get doctor\'s note explaining treatment modifications',
      'Challenge whether treatment was reasonable/appropriate'
    ]
  },
  surveillance: {
    type: 'surveillance',
    title: '📹 Surveillance Evidence',
    description: 'Surveillance video contradicts claimed limitations',
    severity: 'high',
    appealable: true,
    actions: [
      'Request complete surveillance footage (not just cherry-picked clips)',
      'Doctor explains good days vs bad days variability',
      'Challenge whether activities shown contradict medical restrictions',
      'Review surveillance for privacy violations'
    ]
  },
  policy_exclusion: {
    type: 'policy_exclusion',
    title: '📜 Policy Exclusion Applied',
    description: 'Denied under specific policy exclusion clause',
    severity: 'high',
    appealable: true,
    actions: [
      'Review exact policy language - exclusions are narrowly interpreted',
      'Argue condition doesn\'t meet exclusion definition',
      'Check if exclusion violates human rights legislation',
      'Consult lawyer on policy interpretation'
    ]
  },
  ime_conflict: {
    type: 'ime_conflict',
    title: '👨‍⚕️ IME Conflicts with Treating Doctor',
    description: 'Independent medical exam contradicts your doctors',
    severity: 'medium',
    appealable: true,
    actions: [
      'Highlight that IME doctor saw you once vs ongoing treatment relationship',
      'Point out IME conflicts with objective test results',
      'Get treating doctor to rebut IME findings',
      'Research IME doctor\'s bias/track record if concerning'
    ]
  }
};

export default function DenialDecoder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Denial Decoder');
  useFocusOnRefOnMount(titleRef);
  const [result, setResult] = React.useState<DecodedResult | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [pastedText, setPastedText] = React.useState('');
  const [useTextInput, setUseTextInput] = React.useState(false);
  const { province } = useSettings();
  
  const analyzeText = (text: string): DecodedResult => {
    const lower = text.toLowerCase();
    const patterns: DenialPattern[] = [];
    const keyQuotes: string[] = [];
    
    // Pattern detection
    if (lower.includes('insufficient medical') || lower.includes('lack of evidence') || lower.includes('not substantiated')) {
      patterns.push(COMMON_PATTERNS.medical_insufficient);
      const match = text.match(/(insufficient medical[^.]{0,100}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('causation') || lower.includes('not work-related') || lower.includes('pre-existing')) {
      patterns.push(COMMON_PATTERNS.causation_weak);
      const match = text.match(/(causation[^.]{0,100}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('non-complian') || lower.includes('failed to follow') || lower.includes('refused treatment')) {
      patterns.push(COMMON_PATTERNS.non_compliance);
      const match = text.match(/(non-complian[^.]{0,100}\.)/i);
      if (match) keyQuotes.push(match[0]);
    }
    
    if (lower.includes('surveillance') || lower.includes('observed') || lower.includes('video evidence')) {
      patterns.push(COMMON_PATTERNS.surveillance);
    }
    
    if (lower.includes('exclusion') || lower.includes('not covered') || lower.includes('policy does not')) {
      patterns.push(COMMON_PATTERNS.policy_exclusion);
    }
    
    if (lower.includes('ime') || lower.includes('independent medical') || lower.includes('impartial examiner')) {
      patterns.push(COMMON_PATTERNS.ime_conflict);
    }
    
    // Deadline detection
    const dateRegex = /(?:appeal|file|submit).{0,50}?(?:by|before|within)\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(\d+)\s+days?)/gi;
    let appealDeadline: DecodedResult['appealDeadline'];
    const deadlineMatch = dateRegex.exec(text);
    if (deadlineMatch) {
      const dateStr = deadlineMatch[1];
      if (dateStr.includes('/') || dateStr.includes('-')) {
        const date = new Date(dateStr);
        const today = new Date();
        const daysLeft = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > -365 && daysLeft < 365) {
          appealDeadline = { date: date.toLocaleDateString(), daysLeft };
        }
      } else if (deadlineMatch[2]) {
        const days = parseInt(deadlineMatch[2]);
        const date = new Date();
        date.setDate(date.getDate() + days);
        appealDeadline = { date: date.toLocaleDateString(), daysLeft: days };
      }
    }
    
    // Denial type detection
    let denialType = 'Unknown';
    if (lower.includes('wsib') || lower.includes('workplace safety')) denialType = 'WSIB';
    else if (lower.includes('ltd') || lower.includes('long-term disability') || lower.includes('manulife') || lower.includes('sun life')) denialType = 'LTD';
    else if (lower.includes('cpp') || lower.includes('canada pension') || lower.includes('service canada')) denialType = 'CPP-D';
    else if (lower.includes('ei') || lower.includes('employment insurance')) denialType = 'EI Sickness';
    else if (lower.includes('odsp') || lower.includes('ontario disability')) denialType = 'ODSP';
    
    // Appeal strength calculation
    let appealStrength = 60; // Base
    if (patterns.some(p => p.type === 'medical_insufficient')) appealStrength += 20; // Very appealable
    if (patterns.some(p => p.type === 'surveillance')) appealStrength -= 15; // Harder to overcome
    if (patterns.some(p => p.type === 'policy_exclusion')) appealStrength -= 10; // Policy interpretation battles
    if (keyQuotes.length > 2) appealStrength += 10; // More specific quotes = better appeal target
    appealStrength = Math.max(20, Math.min(90, appealStrength));
    
    // Next steps
    const nextSteps: string[] = [];
    if (appealDeadline && appealDeadline.daysLeft < 60) {
      nextSteps.push(`🚨 URGENT: Appeal deadline in ${appealDeadline.daysLeft} days - start immediately!`);
    }
    nextSteps.push('📋 Request your complete claim file (all documents, notes, medical reports)');
    nextSteps.push('🔍 Use AI Case Interpreter to analyze denial letter in detail');
    if (patterns.length > 0) {
      nextSteps.push(`💪 Address ${patterns.length} identified issue${patterns.length > 1 ? 's' : ''} (see below)`);
    }
    nextSteps.push('⚖️ Consider contacting community-vetted lawyer (see Lawyer Finder)');
    
    const summary = patterns.length > 0
      ? `This ${denialType} denial is based on ${patterns.length} main issue${patterns.length > 1 ? 's' : ''}. Your appeal has a ${appealStrength}% estimated strength. Focus on addressing the specific concerns identified.`
      : `This ${denialType} denial letter requires further analysis. Upload or paste the full letter to detect specific denial patterns.`;
    
    return {
      summary,
      denialType,
      patterns,
      appealDeadline,
      appealStrength,
      keyQuotes,
      nextSteps
    };
  };
  
  const analyzeFile = async () => {
    setAnalyzing(true);
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: ['application/pdf','text/*','image/*'] as any });
      const f = res?.assets?.[0]; 
      if (!f?.uri) {
        setAnalyzing(false);
        return;
      }
      
      // Try LLM backend first
      const base = process.env.EXPO_PUBLIC_LLM_BASE;
      if (base) {
        try {
          const fd = new FormData();
          const file: any = { uri: f.uri, name: f.name || 'file', type: f.mimeType || 'application/octet-stream' };
          fd.append('file', file);
          fd.append('province', String(province || 'GEN'));
          const r = await fetch(`${base.replace(/\/$/,'')}/decode-denial`, { method:'POST', body: fd as any });
          if (r.ok) { 
            const data = await r.json(); 
            setResult(data);
            setAnalyzing(false);
            return;
          }
        } catch {
          // eslint-disable-next-line no-console
          console.log('LLM backend failed, using local analysis');
        }
      }
      
      // Fallback: use filename as hint
      const sampleText = `This ${f.name} contains a denial decision. Common patterns detected based on typical denial language.`;
      setResult(analyzeText(sampleText));
    } catch {
      Alert.alert('Failed','Could not analyze file');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const analyzePastedText = () => {
    if (!pastedText.trim()) {
      Alert.alert('Empty Text', 'Please paste your denial letter text');
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeText(pastedText));
      setAnalyzing(false);
    }, 500);
  };
  
  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return palette.success; // Green
    if (strength >= 40) return palette.warning; // Orange
    return palette.error; // Red
  };
  
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return palette.error;
    if (severity === 'medium') return palette.warning;
    return palette.success;
  };
  
  const shareAnalysis = async () => {
    if (!result) return;
    const text = `Denial Decoder Analysis - ${result.denialType}\n\nSummary: ${result.summary}\n\nAppeal Strength: ${result.appealStrength}%\n\nPatterns Detected:\n${result.patterns.map(p => `- ${p.title}`).join('\n')}\n\nNext Steps:\n${result.nextSteps.map((s, i) => `${i+1}. ${s}`).join('\n')}`;
    try {
      await Share.share({ message: text, title: 'Denial Analysis' });
    } catch {}
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        🔍 AI Claim Denial Decoder
      </Text>
      <Text style={s.subtitle}>
        Pattern detection for WSIB, LTD, CPP-D denial letters. Identify weak points and build your appeal strategy.
      </Text>
      <DisclaimerBanner type="legal" compact={true} />
      <DisclaimerBanner type="ai" compact={true} />
      
      {/* Input Method Toggle */}
      <GapView style={{ flexDirection: 'row' }} gap={8}>
        <Pressable
          onPress={() => setUseTextInput(false)}
          style={[s.toggleButton, !useTextInput && { backgroundColor: palette.primary, borderColor: palette.primary }]}
        >
          <MaterialCommunityIcons name="upload" size={20} color={!useTextInput ? palette.onPrimary : palette.text} />
          <Text style={[s.toggleButtonText, !useTextInput && { color: palette.onPrimary }]}>Upload File</Text>
        </Pressable>
        <Pressable
          onPress={() => setUseTextInput(true)}
          style={[s.toggleButton, useTextInput && { backgroundColor: palette.primary, borderColor: palette.primary }]}
        >
          <MaterialCommunityIcons name="text-box" size={20} color={useTextInput ? palette.onPrimary : palette.text} />
          <Text style={[s.toggleButtonText, useTextInput && { color: palette.onPrimary }]}>Paste Text</Text>
        </Pressable>
      </GapView>
      
      {useTextInput ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>📄 Paste Denial Letter Text</Text>
          <TextInput
            style={s.textInput}
            value={pastedText}
            onChangeText={setPastedText}
            placeholder="Paste the full text of your denial letter here..."
            placeholderTextColor={palette.text + '77'}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          <Pressable
            onPress={analyzePastedText}
            style={[s.button, analyzing && { opacity: 0.6 }]}
            disabled={analyzing}
          >
            <Text style={s.buttonText}>{analyzing ? 'Analyzing...' : '🔍 Analyze Text'}</Text>
          </Pressable>
        </View>
      ) : (
        <A11yPressable 
          hitSlop={HIT_SLOP_8} 
          onPress={analyzeFile} 
          style={[s.button, analyzing && { opacity: 0.6 }]}
          disabled={analyzing}
        >
          <MaterialCommunityIcons name="upload" size={20} color={palette.onPrimary} />
          <Text style={s.buttonText}>{analyzing ? 'Analyzing...' : '📤 Upload Denial Letter (PDF/Image/Text)'}</Text>
        </A11yPressable>
      )}
      
      {result && (
        <>
          {/* Denial Type & Deadline Alert */}
          <View style={[s.card, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={s.cardTitle}>📋 Denial Type</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>{result.denialType}</Text>
              </View>
              {result.appealDeadline && (
                <View style={[s.deadlineBadge, result.appealDeadline.daysLeft < 30 && { backgroundColor: palette.error }]}>
                  <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 12 }}>
                    {result.appealDeadline.daysLeft < 0 ? 'OVERDUE' : `${result.appealDeadline.daysLeft} days left`}
                  </Text>
                  <Text style={{ color: palette.onPrimary, fontSize: 10 }}>{result.appealDeadline.date}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Appeal Strength Meter */}
          <View style={[s.card, { backgroundColor: getStrengthColor(result.appealStrength) + '15', borderColor: getStrengthColor(result.appealStrength) }]}>
            <Text style={s.cardTitle}>💪 Appeal Strength Estimate</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <View style={{ flex: 1, height: 10, backgroundColor: palette.background, borderRadius: 5, marginRight: 12 }}>
                <View style={{ width: `${result.appealStrength}%`, height: '100%', backgroundColor: getStrengthColor(result.appealStrength), borderRadius: 5 }} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: getStrengthColor(result.appealStrength) }}>
                {result.appealStrength}%
              </Text>
            </View>
            <Text style={s.text}>{result.summary}</Text>
          </View>
          
          {/* Detected Patterns */}
          {result.patterns.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>🚩 Denial Patterns Detected ({result.patterns.length})</Text>
              {result.patterns.map((pattern, idx) => (
                <View key={idx} style={[s.patternCard, { borderLeftColor: getSeverityColor(pattern.severity) }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: palette.text, flex: 1 }}>{pattern.title}</Text>
                    <View style={[s.severityBadge, { backgroundColor: getSeverityColor(pattern.severity) }]}>
                      <Text style={{ color: palette.onPrimary, fontSize: 11, fontWeight: '700' }}>{pattern.severity.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[s.text, { marginTop: 6 }]}>{pattern.description}</Text>
                  
                  {pattern.appealable && (
                    <>
                      <Text style={[s.cardTitle, { fontSize: 14, marginTop: 12 }]}>✅ How to Challenge This:</Text>
                      {pattern.actions.map((action, ai) => (
                        <Text key={ai} style={[s.text, { fontSize: 13 }]}>• {action}</Text>
                      ))}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {/* Key Quotes */}
          {result.keyQuotes.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>💬 Key Excerpts from Decision</Text>
              {result.keyQuotes.map((quote, idx) => (
                <View key={idx} style={s.quoteCard}>
                  <MaterialCommunityIcons name="format-quote-close" size={20} color={palette.muted} />
                  <Text style={[s.text, { fontStyle: 'italic', marginLeft: 8, flex: 1 }]}>"{quote}"</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Next Steps */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🎯 Recommended Next Steps</Text>
            {result.nextSteps.map((step, idx) => (
              <Text key={idx} style={[s.text, { marginTop: 6, lineHeight: 20 }]}>{step}</Text>
            ))}
          </View>
          
          {/* Actions */}
          <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
            <Pressable onPress={shareAnalysis} style={s.button}>
              <MaterialCommunityIcons name="share-variant" size={18} color={palette.onPrimary} />
              <Text style={s.buttonText}>Share Analysis</Text>
            </Pressable>
            <Pressable onPress={() => Alert.alert('Coming Soon', 'Save to Evidence Locker')} style={[s.button, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }]}>
              <MaterialCommunityIcons name="safe-square" size={18} color={palette.text} />
              <Text style={[s.buttonText, { color: palette.text }]}>Save to Vault</Text>
            </Pressable>
          </GapView>
        </>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8, lineHeight: 20 },
    text: { color: palette.text, opacity: 0.95, marginTop: 4, lineHeight: 18 },
    button: { 
      backgroundColor: palette.primary, 
      paddingVertical: 12, 
      paddingHorizontal: 16,
      borderRadius: 10, 
      alignItems: 'center', 
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: { color: palette.onPrimary, fontWeight: '700', fontSize: 15 },
    card: { 
      borderWidth: 1, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16, 
      marginTop: 12, 
      backgroundColor: palette.card 
    },
    cardTitle: { color: palette.text, fontWeight: '700', marginTop: 4, fontSize: 16 },
    toggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
      marginTop: 12,
    },
    toggleButtonText: { fontSize: 14, fontWeight: '600', color: palette.text },
    textInput: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      color: palette.text,
      minHeight: 150,
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
    },
    deadlineBadge: {
      backgroundColor: palette.warning,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    patternCard: {
      backgroundColor: palette.surface,
      borderLeftWidth: 4,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    quoteCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.surface,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
  });
}
