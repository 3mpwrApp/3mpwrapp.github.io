import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import AIDisclaimer from '../../../components/AIDisclaimer';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import OnlineStatusBadge from '../../../components/OnlineStatusBadge';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { llmInterpret } from "../../../services/llm";
import { useAppPalette } from "../../../theme/usePalette";

type DocumentAnalysis = {
  summary: string;
  next: string[];
  strength?: number; // 0-100
  weaknesses?: string[];
  strengths?: string[];
  detectedDeadlines?: Array<{ date: string; description: string }>;
  documentType?: 'denial' | 'approval' | 'request' | 'medical' | 'legal' | 'other';
};

function interpret(text: string): DocumentAnalysis {
  const lower = text.toLowerCase();
  const next: string[] = [];
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  const detectedDeadlines: Array<{ date: string; description: string }> = [];
  
  // Document type detection
  let documentType: DocumentAnalysis['documentType'] = 'other';
  if (lower.includes('denied') || lower.includes('rejection')) documentType = 'denial';
  else if (lower.includes('approved') || lower.includes('accept')) documentType = 'approval';
  else if (lower.includes('doctor') || lower.includes('diagnosis')) documentType = 'medical';
  else if (lower.includes('tribunal') || lower.includes('hearing')) documentType = 'legal';
  
  // Deadline extraction (simple regex for dates)
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|within \d+ days?|by [A-Z][a-z]+ \d{1,2})/gi;
  const matches = text.match(dateRegex);
  if (matches) {
    matches.forEach(match => {
      detectedDeadlines.push({ date: match, description: 'Deadline detected in document' });
    });
  }
  
  // Case strength analysis
  let strength = 50; // Base strength
  
  // Strengths
  if (lower.includes('objective medical evidence')) {
    strengths.push('✓ Objective medical evidence mentioned');
    strength += 20;
  }
  if (lower.includes('functional limitations') || lower.includes('unable to')) {
    strengths.push('✓ Functional limitations documented');
    strength += 15;
  }
  if (lower.includes('specialist') || lower.includes('consultant')) {
    strengths.push('✓ Specialist opinion cited');
    strength += 10;
  }
  if (lower.includes('consistent with') || lower.includes('corroborate')) {
    strengths.push('✓ Evidence consistency noted');
    strength += 10;
  }
  
  // Weaknesses
  if (lower.includes('subjective') || lower.includes('self-report')) {
    weaknesses.push('⚠ Relies on subjective reports');
    strength -= 15;
  }
  if (lower.includes('lack of') || lower.includes('insufficient')) {
    weaknesses.push('⚠ Insufficient evidence cited');
    strength -= 20;
  }
  if (lower.includes('inconsistent') || lower.includes('contradict')) {
    weaknesses.push('⚠ Inconsistencies mentioned');
    strength -= 25;
  }
  if (lower.includes('non-compliance') || lower.includes('failed to follow')) {
    weaknesses.push('⚠ Non-compliance noted');
    strength -= 15;
  }
  
  // Next steps based on document type
  if (documentType === 'denial') {
    next.push("📋 Request complete file copy within 7 days");
    next.push("📅 Note appeal deadline (usually 6 months from decision)");
    next.push("🩺 Gather updated medical evidence");
    next.push("⚖️ Consider legal aid or advocate consultation");
  } else if (documentType === 'medical') {
    next.push("💾 Save to Evidence Locker with 'medical' tag");
    next.push("📊 Check if functional limitations are clearly stated");
    next.push("📧 Request clarification if diagnosis codes missing");
  } else if (documentType === 'legal') {
    next.push("📅 Add all mentioned dates to Deadline Tracker");
    next.push("📚 Review relevant legislation cited");
    next.push("🤝 Share with your legal representative");
  }
  
  // Generic next steps
  if (detectedDeadlines.length > 0) {
    next.push(`⏰ ${detectedDeadlines.length} deadline(s) found - add to calendar immediately`);
  }
  if (lower.includes("medical")) {
    next.push("🩺 Gather medical notes focusing on functional limits, not just diagnoses");
  }
  if (lower.includes("overpayment")) {
    next.push("💰 Consider financial hardship and repayment plan options");
  }
  
  const summary = text.split(/\n|\./).slice(0, 5).join(". ").trim();
  
  return {
    summary: summary || "Summary could not be generated; please provide more context.",
    next: next.length ? next : ["📝 Document details and seek advice if unsure"],
    strength: Math.max(0, Math.min(100, strength)),
    weaknesses,
    strengths,
    detectedDeadlines,
    documentType
  };
}

export const options = { href: null };

export default function AiCaseInterpreter() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Case Interpreter");
  useFocusOnRefOnMount(titleRef);
  const [input, setInput] = React.useState("");
  const [out, setOut] = React.useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return '#4CAF50';
    if (strength >= 40) return '#FF9800';
    return '#F44336';
  };
  
  const getStrengthLabel = (strength: number) => {
    if (strength >= 70) return 'Strong Case';
    if (strength >= 40) return 'Moderate Case';
    return 'Weak Case - Needs Evidence';
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        AI Case Interpreter
      </Text>
      <OnlineStatusBadge />
      <DisclaimerBanner type="ai" compact={true} />
      <DisclaimerBanner type="legal" compact={true} />
      <Text
        style={[
          s.subtitle,
          { textDecorationLine: "underline", color: palette.primary },
        ]}
        onPress={() =>
          Alert.alert(
            "Tips",
            "Summaries are for guidance only. Confirm deadlines in original documents and seek advice when needed. Avoid sharing personal identifiers in pasted text.",
          )
        }
      >
        Help & tips
      </Text>
      <Text style={s.subtitle}>
        Paste tribunal/insurance/government letter text. Get a
        plain-language summary and next steps. ASL video/easy-read
        requires server integration.
      </Text>
      <TextInput
        style={[s.input, { minHeight: 120 }]}
        value={input}
        onChangeText={setInput}
        placeholder="Paste text here"
        multiline={true}
      />
      <Pressable
        onPress={async () => {
          setLoading(true);
          try {
            const remote = await llmInterpret(input);
            setOut(remote ?? interpret(input));
          } finally {
            setLoading(false);
          }
        }}
        style={s.button}
        disabled={!input.trim() || loading}
      >
        <Text style={s.buttonText}>{loading ? 'Analyzing...' : '🔍 Analyze Document'}</Text>
      </Pressable>
      {out && (
        <>
          {/* Document Type Badge */}
          {out.documentType && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <View style={[s.badge, { backgroundColor: out.documentType === 'denial' ? '#F44336' : out.documentType === 'approval' ? '#4CAF50' : '#2196F3' }]}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{out.documentType}</Text>
              </View>
            </View>
          )}

          {/* Case Strength Meter */}
          {out.strength !== undefined && (
            <View style={[s.card, { backgroundColor: getStrengthColor(out.strength) + '15', borderColor: getStrengthColor(out.strength) }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={s.cardTitle}>📊 Case Strength</Text>
                <Text style={{ color: getStrengthColor(out.strength), fontSize: 24, fontWeight: '700' }}>{out.strength}%</Text>
              </View>
              <Text style={{ color: palette.text, fontWeight: '600', marginTop: 4 }}>{getStrengthLabel(out.strength)}</Text>
              <View style={{ height: 8, backgroundColor: palette.background, borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                <View style={{ width: `${out.strength}%`, height: '100%', backgroundColor: getStrengthColor(out.strength) }} />
              </View>
            </View>
          )}

          {/* Detected Deadlines */}
          {out.detectedDeadlines && out.detectedDeadlines.length > 0 && (
            <View style={[s.card, { backgroundColor: '#FFA500' + '15', borderColor: '#FFA500' }]}>
              <Text style={s.cardTitle}>⚠️ Deadlines Detected ({out.detectedDeadlines.length})</Text>
              {out.detectedDeadlines.map((dl, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 6, borderTopWidth: idx > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: palette.muted }}>
                  <MaterialCommunityIcons name="calendar-alert" size={20} color="#FFA500" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: palette.text, fontWeight: '700' }}>{dl.date}</Text>
                    <Text style={{ color: palette.text, opacity: 0.8, fontSize: 12 }}>{dl.description}</Text>
                  </View>
                  <Pressable onPress={() => Alert.alert('Add to Calendar', 'Deadline tracking coming soon')} style={[s.chip, { backgroundColor: palette.primary }]}>
                    <Text style={{ color: palette.onPrimary, fontSize: 11, fontWeight: '700' }}>+ Add</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Strengths */}
          {out.strengths && out.strengths.length > 0 && (
            <View style={[s.card, { backgroundColor: '#4CAF50' + '10' }]}>
              <Text style={s.cardTitle}>💪 Case Strengths</Text>
              {out.strengths.map((str, idx) => (
                <Text key={idx} style={[s.cardText, { color: '#2E7D32', marginTop: 4 }]}>{str}</Text>
              ))}
            </View>
          )}

          {/* Weaknesses */}
          {out.weaknesses && out.weaknesses.length > 0 && (
            <View style={[s.card, { backgroundColor: '#F44336' + '10' }]}>
              <Text style={s.cardTitle}>⚠️ Potential Weaknesses</Text>
              {out.weaknesses.map((weak, idx) => (
                <Text key={idx} style={[s.cardText, { color: '#C62828', marginTop: 4 }]}>{weak}</Text>
              ))}
              <Text style={{ color: palette.text, opacity: 0.8, fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                Tip: Address these weaknesses by gathering additional evidence
              </Text>
            </View>
          )}

          {/* Summary */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📝 Plain Language Summary</Text>
            <Text style={s.cardText}>{out.summary}</Text>
          </View>

          {/* Next Steps */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🎯 Recommended Next Steps</Text>
            {out.next.map((n, i) => (
              <Text key={i} style={[s.cardText, { marginTop: 6 }]}>
                {n}
              </Text>
            ))}
          </View>

          {/* Action Buttons */}
          <GapView style={{ flexDirection: "row", marginTop: 12, flexWrap: "wrap" }} gap={8}>
            <Pressable
              onPress={() =>
                Share.share({
                  message: `Case Analysis\\n\\nStrength: ${out.strength}%\\n\\n${out.summary}\\n\\nNext steps:\\n${out.next.map((n) => "- " + n).join("\\n")}`,
                  title: "Case Analysis",
                }).catch(() => {})
              }
              style={s.button}
            >
              <MaterialCommunityIcons name="share-variant" size={16} color={palette.onPrimary} />
              <Text style={s.buttonText}> Share</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  const mod = await import("expo-clipboard");
                  await mod.setStringAsync(
                    `${out.summary}\\n\\nNext steps:\\n${out.next.map((n) => "- " + n).join("\\n")}`,
                  );
                  Alert.alert("Copied", "Analysis copied to clipboard");
                } catch {}
              }}
              style={s.button}
            >
              <MaterialCommunityIcons name="content-copy" size={16} color={palette.onPrimary} />
              <Text style={s.buttonText}> Copy</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert('Save to Evidence', 'This analysis will be saved to your Evidence Locker')}
              style={[s.button, { backgroundColor: palette.primary + 'CC' }]}
            >
              <MaterialCommunityIcons name="safe-square" size={16} color={palette.onPrimary} />
              <Text style={s.buttonText}> Save to Vault</Text>
            </Pressable>
          </GapView>
        </>
      )}
      <AIDisclaimer />
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
    chip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
  });
}
