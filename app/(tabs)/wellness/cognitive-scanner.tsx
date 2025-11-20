import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from '../../../i18n';
import { useCognitiveDistortionScanner } from '../../../services/cognitiveDistortionScanner';

export default function CognitiveScannerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scanner = useCognitiveDistortionScanner();

  const [thought, setThought] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [topDistortions, setTopDistortions] = useState(scanner.getTopDistortions(5));

  const distortionColors: Record<string, string> = {
    catastrophizing: '#DC143C',
    black_white: '#000000',
    overgeneralization: '#8B4513',
    mind_reading: '#4B0082',
    fortune_telling: '#191970',
    emotional_reasoning: '#FF69B4',
    should_statements: '#FF4500',
    labeling: '#FFD700',
    personalization: '#9370DB',
    disqualifying_positive: '#696969',
    mental_filter: '#2F4F4F',
    jumping_conclusions: '#FF8C00',
    magnification_minimization: '#8B008B',
    blame: '#B22222',
  };

  const scanThought = () => {
    if (!thought.trim()) {
      alert('Please enter a thought to scan');
      return;
    }

    const result = scanner.scanThought(thought);
    setScanResult(result);
    setTopDistortions(scanner.getTopDistortions(5));
  };

  const startDialogue = (distortionType: string) => {
    const dialogue = scanner.generateSocraticDialogue(distortionType, thought);
    alert(`Socratic Dialogue:\n\n${dialogue.questions.join('\n\n')}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Cognitive Distortion Scanner'),
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Input */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Scan Your Thoughts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter a thought pattern you'd like to examine for cognitive distortions
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g., 'I always mess everything up' or 'Nobody likes me'"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={thought}
            onChangeText={setThought}
          />

          <Pressable
            style={[styles.scanButton, { backgroundColor: colors.primary }]}
            onPress={scanThought}
          >
            <Ionicons name="scan" size={20} color="#FFF" />
            <Text style={styles.scanButtonText}>Scan for Distortions</Text>
          </Pressable>
        </View>

        {/* Scan Results */}
        {scanResult && (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Detected Distortions
              </Text>

              {scanResult.distortions.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No cognitive distortions detected. This thought seems balanced!
                </Text>
              ) : (
                scanResult.distortions.map((distortion: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.distortionCard,
                      { borderColor: distortionColors[distortion.type] || colors.border },
                    ]}
                  >
                    <View style={styles.distortionHeader}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: distortionColors[distortion.type] || colors.border,
                          },
                        ]}
                      >
                        <Text style={styles.typeBadgeText}>
                          {distortion.type.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.confidence, { color: colors.textSecondary }]}>
                        {(distortion.confidence * 100).toFixed(0)}% confident
                      </Text>
                    </View>

                    <Text style={[styles.explanation, { color: colors.text }]}>
                      {distortion.explanation}
                    </Text>

                    <Pressable
                      style={[styles.dialogueButton, { backgroundColor: colors.primary + '20' }]}
                      onPress={() => startDialogue(distortion.type)}
                    >
                      <Ionicons name="chatbubbles" size={16} color={colors.primary} />
                      <Text style={[styles.dialogueButtonText, { color: colors.primary }]}>
                        Start Socratic Dialogue
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            {/* Counter-Thoughts */}
            {scanResult.counterThoughts.length > 0 && (
              <View style={[styles.card, { backgroundColor: '#D4EDDA' }]}>
                <View style={styles.counterHeader}>
                  <Ionicons name="bulb" size={24} color="#155724" />
                  <Text style={[styles.counterTitle, { color: '#155724' }]}>
                    Alternative Perspectives
                  </Text>
                </View>

                {scanResult.counterThoughts.map((counter: string, index: number) => (
                  <Text key={index} style={[styles.counterText, { color: '#155724' }]}>
                    • {counter}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* Top Distortions */}
        {topDistortions.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Pattern Analysis
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Most common distortion types you experience
            </Text>

            {topDistortions.map((pattern, index) => (
              <View key={index} style={[styles.patternCard, { borderColor: colors.border }]}>
                <View style={styles.patternHeader}>
                  <View
                    style={[
                      styles.patternBadge,
                      { backgroundColor: distortionColors[pattern.type] || colors.border },
                    ]}
                  >
                    <Text style={styles.patternBadgeText}>
                      {pattern.type.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.patternCount, { color: colors.textSecondary }]}>
                    {pattern.count} times
                  </Text>
                </View>

                <View style={styles.decaySection}>
                  <Text style={[styles.decayLabel, { color: colors.textSecondary }]}>
                    Belief strength decay:
                  </Text>
                  <View style={styles.decayBar}>
                    <View
                      style={[
                        styles.decayFill,
                        {
                          width: `${pattern.averageDecay}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.decayText, { color: colors.textSecondary }]}>
                    {pattern.averageDecay.toFixed(0)}% reduction
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Distortion Library */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                    { color: distortionColors[type] || colors.text },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#FFF',
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
    color: '#FFF',
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
    color: '#FFF',
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
    backgroundColor: '#E0E0E0',
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
