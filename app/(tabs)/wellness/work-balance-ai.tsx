import React from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import GapView from "../../../components/GapView";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON } from "../../../services/cache";
import { useAppPalette } from "../../../theme/usePalette";

type Mood = "low" | "ok" | "high";

export const options = { href: null };

export default function WorkBalanceAI() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Wellness + Work Balance AI");
  useFocusOnRefOnMount(titleRef);

  const [mood, setMood] = React.useState<Mood>("ok");
  const [notes, setNotes] = React.useState("");
  const [plan, setPlan] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [metrics, setMetrics] = React.useState<{
    lastPain: number;
    avgSleep: number;
    fatigue: number;
  } | null>(null);

  React.useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const sym = (await getCachedJSON<any[]>("wellness_symptom_entries")) || [];
      const slp = (await getCachedJSON<any[]>("wellness_sleep_entries")) || [];
      const lastPain = parseFloat(sym[0]?.pain || "0");
      const avgSleep = (() => {
        const hours = slp
          .slice(0, 7)
          .map((e) => parseFloat(e.sleepHours || "0"))
          .filter((n) => !isNaN(n));
        return hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
      })();
      const fatigue = slp[0] ? parseFloat(slp[0].energy || "0") : 3;
      setMetrics({ lastPain, avgSleep, fatigue });
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const generate = async () => {
    if (!metrics) {
      Alert.alert('No Data', 'Please log some sleep and symptom data first to generate a personalized plan.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { lastPain, avgSleep, fatigue } = metrics;
      const parts: string[] = [];
      parts.push("🎯 Today's Balance Plan:");
      parts.push("");
      
      // Heuristics with more detailed recommendations
      if (lastPain >= 7 || avgSleep < 5 || fatigue <= 2 || mood === "low") {
        parts.push("⚠️ High Support Mode Recommended");
        parts.push("");
        parts.push("🛌 Rest Blocks:");
        parts.push("  • Schedule 20-30 min rest every 2-3 hours");
        parts.push("  • Use timer alerts to remind yourself");
        parts.push("");
        parts.push("💼 Work Approach:");
        parts.push("  • Focus only on low-cognitive tasks");
        parts.push("  • Delegate or postpone demanding work");
        parts.push("  • Set realistic 1-2 hour work windows");
      } else if (lastPain >= 4 || avgSleep < 6 || fatigue <= 3 || mood === "ok") {
        parts.push("⚖️ Moderate Pacing Mode");
        parts.push("");
        parts.push("⏱️ Pacing Strategy:");
        parts.push("  • Work 50 min, rest 10 min (Pomodoro-style)");
        parts.push("  • Use timers for consistency");
        parts.push("");
        parts.push("💼 Work Approach:");
        parts.push("  • One focused task in the morning");
        parts.push("  • Admin/light tasks in the afternoon");
        parts.push("  • Avoid back-to-back meetings");
      } else {
        parts.push("✅ Active Mode - You're Doing Well!");
        parts.push("");
        parts.push("💪 Productive Strategy:");
        parts.push("  • Two focused work blocks (morning/early afternoon)");
        parts.push("  • Insert brief mobility or breath breaks");
        parts.push("  • Tackle challenging tasks first");
        parts.push("");
        parts.push("🎯 Optimize Your Energy:");
        parts.push("  • Still pace yourself - don't overdo it");
        parts.push("  • Build in recovery time after intense work");
      }
      
      parts.push("");
      
      // Symptom flare advocacy
      if (lastPain >= 6) {
        parts.push("📣 Advocacy Tip:");
        parts.push("  • Consider logging this flare");
        parts.push("  • Request accommodations if needed");
        parts.push("  • Document symptoms for healthcare provider");
        parts.push("");
      }
      
      // Self-monitoring
      parts.push("🔍 Self-Check Guidelines:");
      parts.push("  • Monitor at midday");
      parts.push("  • If pain rises >2 points, reduce workload");
      parts.push("  • Listen to your body's signals");
      
      // Personal note
      if (notes.trim()) {
        parts.push("");
        parts.push(`📝 Your Note: ${notes.trim()}`);
      }
      
      setPlan(parts.join("\n"));
    } catch (err) {
      console.error('Error generating plan:', err);
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMoodIcon = (m: Mood) => {
    switch (m) {
      case 'low': return '😔';
      case 'ok': return '😐';
      case 'high': return '😊';
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Wellness + Work Balance AI
      </Text>
      <DisclaimerBanner type="medical" compact={true} />
      <DisclaimerBanner type="ai" compact={true} />

      {/* Current Metrics Card */}
      {metrics && (
        <View style={s.card}>
          <Text style={s.cardTitle}>📊 Your Current Metrics</Text>
          <View style={s.metricRow}>
            <Text style={s.metricLabel}>Pain Level:</Text>
            <Text style={[s.metricValue, { color: metrics.lastPain >= 7 ? palette.error : metrics.lastPain >= 4 ? palette.warning : palette.success }]}>
              {metrics.lastPain.toFixed(1)}/10
            </Text>
          </View>
          <View style={s.metricRow}>
            <Text style={s.metricLabel}>Avg Sleep (7d):</Text>
            <Text style={[s.metricValue, { color: metrics.avgSleep < 6 ? palette.warning : palette.success }]}>
              {metrics.avgSleep.toFixed(1)} hrs
            </Text>
          </View>
          <View style={s.metricRow}>
            <Text style={s.metricLabel}>Energy Level:</Text>
            <Text style={[s.metricValue, { color: metrics.fatigue <= 2 ? palette.error : metrics.fatigue <= 3 ? palette.warning : palette.success }]}>
              {metrics.fatigue}/5
            </Text>
          </View>
        </View>
      )}

      {/* Input Card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>How are you feeling today?</Text>
        <GapView style={{ flexDirection: 'row', marginTop: 8 }} gap={8}>
          {(['low', 'ok', 'high'] as Mood[]).map((m) => (
            <A11yPressable
              key={m}
              onPress={() => setMood(m)}
              style={[
                s.moodChip,
                mood === m && s.moodChipSelected,
                { borderColor: mood === m ? palette.primary : palette.muted }
              ]}
              hitSlop={HIT_SLOP_8}
              accessibilityRole="button"
              accessibilityLabel={`Set mood to ${m}`}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{getMoodIcon(m)}</Text>
              <Text style={[s.moodText, mood === m && { fontWeight: '700' }]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </A11yPressable>
          ))}
        </GapView>
        
        <TextInput
          placeholder="Additional notes (optional)"
          placeholderTextColor={palette.text + '77'}
          value={notes}
          onChangeText={setNotes}
          style={s.input}
          accessibilityLabel="Additional notes input"
          multiline
          numberOfLines={3}
        />

        <A11yPressable
          onPress={generate}
          style={s.generateButton}
          hitSlop={HIT_SLOP_8}
          accessibilityRole="button"
          accessibilityLabel="Generate personalized balance plan"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={palette.onPrimary} />
          ) : (
            <Text style={s.generateButtonText}>🎯 Generate My Plan</Text>
          )}
        </A11yPressable>
      </View>

      {/* Plan Result Card */}
      {plan && (
        <View style={s.planCard}>
          <Text style={s.cardTitle}>Your Personalized Plan</Text>
          <Text style={s.planText}>{plan}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: palette.background 
    },
    title: { 
      fontSize: 24, 
      fontWeight: "700", 
      color: palette.text,
      marginBottom: 12,
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
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    metricLabel: {
      color: palette.text,
      fontSize: 14,
      opacity: 0.8,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    moodChip: {
      flex: 1,
      borderWidth: 2,
      borderColor: palette.muted,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodChipSelected: {
      borderWidth: 2,
      backgroundColor: palette.primary + '22',
    },
    moodText: {
      color: palette.text,
      fontSize: 13,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      color: palette.text,
      marginTop: 12,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    generateButton: {
      backgroundColor: palette.primary,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 16,
    },
    generateButtonText: { 
      color: palette.onPrimary, 
      fontWeight: "700",
      fontSize: 15,
    },
    planCard: {
      backgroundColor: palette.info + '11',
      borderRadius: 12,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.info + '44',
    },
    planText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'monospace',
    },
  });
}
