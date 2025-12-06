import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useCognitiveDistortionScanner } from '../../../services/cognitiveDistortionScanner';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function CognitiveScannerScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const scanner = useCognitiveDistortionScanner();

  const [thought, setThought] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [topDistortions, setTopDistortions] = useState(scanner.patterns.slice(0, 5));

  const distortionColors: Record<string, string> = {
    catastrophizing: palette.error,
    black_white: palette.text,
    overgeneralization: palette.text,
    mind_reading: palette.primary,
    fortune_telling: palette.primary,
    emotional_reasoning: palette.secondary,
    should_statements: palette.error,
    labeling: palette.warning,
    personalization: palette.primary,
    disqualifying_positive: palette.muted,
    mental_filter: palette.muted,
    jumping_conclusions: palette.warning,
    magnification_minimization: palette.primary,
    blame: palette.error,
  };

  const scanThought = () => {
    if (!thought.trim()) {
      alert('Please enter a thought to scan');
      return;
    }

    const result = scanner.scanThought(thought);
    setScanResult(result);
    setTopDistortions(scanner.patterns.slice(0, 5));
  };

  const startDialogue = (distortionType: string) => {
    alert(`Socratic dialogue for ${distortionType} coming soon!`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Cognitive Distortion Scanner'),
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Input */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.title, { color: palette.text }]}>Scan Your Thoughts</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            Enter a thought pattern you'd like to examine for cognitive distortions
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: palette.background,
                color: palette.text,
                borderColor: palette.border,
              },
            ]}
            placeholder="e.g., 'I always mess everything up' or 'Nobody likes me'"
            placeholderTextColor={palette.textSecondary}
            multiline
            numberOfLines={4}
            value={thought}
            onChangeText={setThought}
          />

          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.scanButton, { backgroundColor: palette.primary }]}
            onPress={scanThought}
          >
            <Ionicons name="scan" size={20} color={palette.onPrimary} />
            <Text style={styles.scanButtonText}>Scan for Distortions</Text>
          </Pressable>
        </View>

        {/* Scan Results */}
        {scanResult && (
          <>
            <View style={[styles.card, { backgroundColor: palette.surface }]}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Detected Distortions
              </Text>

              {scanResult.distortions.length === 0 ? (
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  No cognitive distortions detected. This thought seems balanced!
                </Text>
              ) : (
                scanResult.distortions.map((distortion: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.distortionCard,
                      { borderColor: distortionColors[distortion.type] || palette.border },
                    ]}
                  >
                    <View style={styles.distortionHeader}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: distortionColors[distortion.type] || palette.border,
                          },
                        ]}
                      >
                        <Text style={styles.typeBadgeText}>
                          {distortion.type.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.confidence, { color: palette.textSecondary }]}>
                        {(distortion.confidence * 100).toFixed(0)}% confident
                      </Text>
                    </View>

                    <Text style={[styles.explanation, { color: palette.text }]}>
                      {distortion.explanation}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.dialogueButton, { backgroundColor: palette.primary + '20' }]}
                      onPress={() => startDialogue(distortion.type)}
                    >
                      <Ionicons name="chatbubbles" size={16} color={palette.primary} />
                      <Text style={[styles.dialogueButtonText, { color: palette.primary }]}>
                        Start Socratic Dialogue
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            {/* Counter-Thoughts */}
            {scanResult.counterThoughts.length > 0 && (
              <View style={[styles.card, { backgroundColor: palette.successBackground }]}>
                <View style={styles.counterHeader}>
                  <Ionicons name="bulb" size={24} color={palette.success} />
                  <Text style={[styles.counterTitle, { color: palette.success }]}>
                    Alternative Perspectives
                  </Text>
                </View>

                {scanResult.counterThoughts.map((counter: string, index: number) => (
                  <Text key={index} style={[styles.counterText, { color: palette.success }]}>
                    • {counter}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* Top Distortions */}
        {topDistortions.length > 0 && (
          <View style={[styles.card, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Your Pattern Analysis
            </Text>
            <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
              Most common distortion types you experience
            </Text>

            {topDistortions.map((pattern, index) => (
              <View key={index} style={[styles.patternCard, { borderColor: palette.border }]}>
                <View style={styles.patternHeader}>
                  <View
                    style={[
                      styles.patternBadge,
                      { backgroundColor: distortionColors[pattern.distortionType] || palette.border },
                    ]}
                  >
                    <Text style={[styles.patternBadgeText, { color: palette.onPrimary }]}>
                      {pattern.distortionType.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.patternCount, { color: palette.textSecondary }]}>
                    {pattern.frequency} times
                  </Text>
                </View>

                <View style={styles.decaySection}>
                  <Text style={[styles.decayLabel, { color: palette.textSecondary }]}>
                    Average intensity:
                  </Text>
                  <View style={[styles.decayBar, { backgroundColor: palette.border }]}>
                    <View
                      style={[
                        styles.decayFill,
                        {
                          width: `${(pattern.averageIntensity / 10) * 100}%`,
                          backgroundColor: palette.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.decayText, { color: palette.textSecondary }]}>
                    {pattern.averageIntensity.toFixed(1)}/10
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Distortion Library */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            Distortion Types Reference
          </Text>

          <View style={styles.libraryGrid}>
            {Object.keys(distortionColors).map(type => (
              <View
                key={type}
                style={[
                  styles.libraryCard,
                  { backgroundColor: distortionColors[type] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.libraryType,
                    { color: distortionColors[type] || palette.text },
                  ]}
                >
                  {type.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  distortionCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  distortionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: 12,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dialogueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
  },
  dialogueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  counterText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  patternCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  patternBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  patternCount: {
    fontSize: 13,
  },
  decaySection: {
    marginTop: 8,
  },
  decayLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  decayBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  decayFill: {
    height: '100%',
  },
  decayText: {
    fontSize: 11,
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  libraryCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  libraryType: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});

