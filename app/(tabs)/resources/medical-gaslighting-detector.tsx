/**
 * Medical Gaslighting Detector
 * 
 * Privacy-first pattern detection tool to help users identify
 * potentially dismissive or invalidating language in medical notes
 */

/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { MAX_FONT_SCALE } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import {
  analyzeMedicalNotes,
  type AnalysisResult
} from '../../../services/medicalGaslighting';
import { useAppPalette } from '../../../theme/usePalette';

export default function MedicalGaslightingDetector() {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [noteText, setNoteText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleAnalyze = async () => {
    if (!noteText.trim()) return;
    
    setAnalyzing(true);
    try {
  const analysis = await analyzeMedicalNotes(noteText);
      setResult(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setNoteText('');
    setResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#dc2626'; // Red - high concern
    if (score >= 40) return palette.warning || palette.primary; // Orange - moderate
    return palette.success || palette.primary; // Green - low concern
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Concern';
    if (score >= 40) return 'Moderate Concern';
    return 'Low Concern';
  };

  const severityToColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return palette.warning || palette.primary;
      default:
        return palette.success || palette.primary;
    }
  };

  const severityLabel = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="shield-checkmark" size={32} color={palette.primary} />
          <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Medical Gaslighting Detector
          </Text>
        </View>
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => setShowInfo(!showInfo)}
          style={styles.infoButton}
          accessibilityRole="button"
          accessibilityLabel="Show information about this tool"
        >
          <Ionicons name={showInfo ? 'information-circle' : 'information-circle-outline'} size={24} color={palette.primary} />
        </Pressable>
      </View>

      {/* Info Panel */}
      {showInfo && (
        <View style={[styles.infoPanel, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <Text style={[styles.infoTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            About This Tool
          </Text>
          <Text style={[styles.infoText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            This tool analyzes medical notes for patterns that may indicate dismissive or invalidating language. 
            It's designed to help you identify potential medical gaslighting in a private, local-first way.
          </Text>
          <Text style={[styles.infoText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            • All analysis happens on your device{'\n'}
            • No data is sent to servers{'\n'}
            • Pattern detection uses local databases{'\n'}
            • Results are informational only
          </Text>
          <Text style={[styles.disclaimer, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            This tool provides educational information only and should not replace professional medical or legal advice.
          </Text>
        </View>
      )}

      {/* Input Section */}
      <View style={[styles.inputSection, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Enter Medical Note or Documentation
        </Text>
        <TextInput
          style={[styles.textInput, { 
            color: palette.text, 
            backgroundColor: palette.background,
            borderColor: palette.muted 
          }]}
          multiline
          numberOfLines={8}
          value={noteText}
          onChangeText={setNoteText}
          placeholder="Paste medical notes, doctor's comments, or documentation here..."
          placeholderTextColor={palette.textSecondary}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLabel="Medical note text input"
          accessibilityHint="Enter or paste medical documentation to analyze"
        />
        <View style={styles.inputActions}>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.clearButton, { borderColor: palette.muted }]}
            onPress={handleClear}
            disabled={!noteText}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
          >
            <Ionicons name="close-circle-outline" size={20} color={palette.textSecondary} />
            <Text style={[styles.clearButtonText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Clear
            </Text>
          </Pressable>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.analyzeButton, { 
              backgroundColor: noteText.trim() ? palette.primary : palette.muted 
            }]}
            onPress={handleAnalyze}
            disabled={!noteText.trim() || analyzing}
            accessibilityRole="button"
            accessibilityLabel="Analyze text"
          >
            {analyzing ? (
              <ActivityIndicator color={palette.onPrimary} />
            ) : (
              <>
                <Ionicons name="search" size={20} color={palette.onPrimary} />
                <Text style={styles.analyzeButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Analyze
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Results Section */}
      {result && (
        <View style={[styles.resultsSection, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Analysis Results
          </Text>

          {/* Overall Score */}
          <View style={[styles.scoreCard, { 
            backgroundColor: palette.background,
            borderColor: getScoreColor(result.overallScore) 
          }]}>
            <View style={styles.scoreHeader}>
              <Text style={[styles.scoreLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Overall Concern Level
              </Text>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(result.overallScore) }]}>
                <Text style={styles.scoreValue} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {result.overallScore}
                </Text>
              </View>
            </View>
            <Text style={[styles.scoreCategoryText, { color: getScoreColor(result.overallScore) }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {getScoreLabel(result.overallScore)}
            </Text>
          </View>

          {/* Pattern Breakdown */}
          {result.patterns.length > 0 && (
            <View style={styles.patternsSection}>
              <Text style={[styles.subsectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Detected Patterns
              </Text>
              {result.patterns.map((pattern, index) => (
                <View
                  key={index}
                  style={[styles.patternCard, { 
                    backgroundColor: palette.background,
                    borderLeftColor: severityToColor(pattern.severity)
                  }]}
                >
                  <View style={styles.patternHeader}>
                    <Text style={[styles.patternType, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)}
                    </Text>
                    <View style={[styles.severityBadge, { backgroundColor: severityToColor(pattern.severity) }]}>
                      <Text style={styles.severityText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {severityLabel(pattern.severity)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.matchText, { color: palette.textSecondary }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    • "{pattern.text}" — {pattern.explanation}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={[styles.subsectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Recommendations
              </Text>
              {result.recommendations.map((rec, index) => (
                <View
                  key={index}
                  style={[styles.recommendationCard, { backgroundColor: palette.background }]}
                >
                  <Ionicons name="bulb-outline" size={20} color={palette.primary} />
                  <Text style={[styles.recommendationText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {rec}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.resultActions}>
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.actionButton, { borderColor: palette.primary }]}
              onPress={() => {
                // TODO: Save to evidence locker
                console.warn('Save to evidence locker not yet implemented');
              }}
              accessibilityRole="button"
              accessibilityLabel="Save to evidence locker"
            >
              <Ionicons name="folder-outline" size={20} color={palette.primary} />
              <Text style={[styles.actionButtonText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Save to Evidence Locker
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!result && !noteText && (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={palette.muted} />
          <Text style={[styles.emptyStateText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Enter medical documentation above to analyze for potentially dismissive patterns
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  infoButton: {
    padding: 8,
  },
  infoPanel: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  inputSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 2,
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreCategoryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  patternsSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  patternCard: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternType: {
    fontSize: 14,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  matchText: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  resultActions: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
