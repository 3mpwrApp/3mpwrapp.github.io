import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8, MAX_FONT_SCALE } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { type ICFDomain, type ICFQualifier, useFunctionalCapacity } from '../../../services/functionalCapacityEvaluator';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

export default function FunctionalCapacityWizard() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const capacity = useFunctionalCapacity();

  const domains = capacity.getDomains();
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [assessments, setAssessments] = useState<Record<string, ICFQualifier>>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentDomain = domains[currentDomainIndex];
  const progress = ((currentDomainIndex / domains.length) * 100).toFixed(0);

  const qualifierOptions: Array<{ value: ICFQualifier; label: string; description: string; color: string }> = [
    { value: 0, label: 'No Problem', description: '0-4% impairment', color: '#10B981' },
    { value: 1, label: 'Mild Problem', description: '5-24% impairment', color: '#3B82F6' },
    { value: 2, label: 'Moderate Problem', description: '25-49% impairment', color: '#F59E0B' },
    { value: 3, label: 'Severe Problem', description: '50-95% impairment', color: '#EF4444' },
    { value: 4, label: 'Complete Problem', description: '96-100% impairment', color: '#7C2D12' },
  ];

  const handleSelectQualifier = (qualifier: ICFQualifier) => {
    const newAssessments = { ...assessments, [currentDomain.code]: qualifier };
    setAssessments(newAssessments);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentDomainIndex < domains.length - 1) {
        setCurrentDomainIndex(currentDomainIndex + 1);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentDomainIndex < domains.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1);
    }
  };

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      await capacity.submitAssessment(assessments);
      
      // Navigate back to functional capacity screen
      router.back();
    } catch (err) {
      console.error('Error saving assessment:', err);
      alert('Failed to save assessment. Please try again.');
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: ICFDomain['category']): string => {
    const colors: Record<ICFDomain['category'], string> = {
      body_function: '#8B5CF6',
      body_structure: '#EC4899',
      activity: '#3B82F6',
      participation: '#10B981',
      environment: '#F59E0B',
    };
    return colors[category] || palette.primary;
  };

  const getCategoryName = (category: ICFDomain['category']): string => {
    const names: Record<ICFDomain['category'], string> = {
      body_function: 'Body Function',
      body_structure: 'Body Structure',
      activity: 'Activity',
      participation: 'Participation',
      environment: 'Environment',
    };
    return names[category] || category;
  };

  const answeredCount = Object.keys(assessments).length;
  const isComplete = answeredCount === domains.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'WHO ICF Assessment',
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (answeredCount > 0) {
                  const confirmExit = confirm('Are you sure? Your progress will be lost.');
                  if (confirmExit) router.back();
                } else {
                  router.back();
                }
              }}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="close" size={24} color={palette.text} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Progress Header */}
        <View style={[styles.progressCard, { backgroundColor: palette.surface }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: palette.text }]}>
              Question {currentDomainIndex + 1} of {domains.length}
            </Text>
            <Text style={[styles.progressPercent, { color: palette.primary }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: palette.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: palette.primary, width: `${progress}%` as any },
              ]}
            />
          </View>
          <Text style={[styles.answeredText, { color: palette.textSecondary }]}>
            {answeredCount} answered • {domains.length - answeredCount} remaining
          </Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(currentDomain.category) + '22' },
            ]}
          >
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: getCategoryColor(currentDomain.category) },
              ]}
            />
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(currentDomain.category) },
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {getCategoryName(currentDomain.category)}
            </Text>
          </View>

          {/* Question Card */}
          <View style={[styles.questionCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.domainCode, { color: palette.textSecondary }]}>
              ICF Code: {currentDomain.code}
            </Text>
            <Text style={[styles.domainName, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {currentDomain.name}
            </Text>
            <Text style={[styles.domainDescription, { color: palette.textSecondary }]}>
              {currentDomain.description}
            </Text>

            <View style={styles.divider} />

            <Text style={[styles.questionLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {currentDomain.assessmentQuestion}
            </Text>

            {/* Examples */}
            <View style={styles.examplesContainer}>
              <Text style={[styles.examplesLabel, { color: palette.textSecondary }]}>
                Examples:
              </Text>
              {currentDomain.examples.map((example, index) => (
                <Text key={index} style={[styles.exampleText, { color: palette.text }]}>
                  • {example}
                </Text>
              ))}
            </View>
          </View>

          {/* Qualifier Options */}
          <View style={styles.optionsContainer}>
            <Text style={[styles.optionsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Rate your level of difficulty:
            </Text>
            {qualifierOptions.map((option) => {
              const isSelected = assessments[currentDomain.code] === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectQualifier(option.value)}
                  style={[
                    styles.optionButton,
                    { borderColor: option.color },
                    isSelected && { backgroundColor: option.color + '22', borderWidth: 3 },
                  ]}
                  hitSlop={HIT_SLOP_8}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: option.color },
                        isSelected && { borderWidth: 2 },
                      ]}
                    >
                      {isSelected && (
                        <View style={[styles.radioInner, { backgroundColor: option.color }]} />
                      )}
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: palette.text },
                          isSelected && { fontWeight: '700' },
                        ]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                      >
                        {option.label}
                      </Text>
                      <Text style={[styles.optionDescription, { color: palette.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={option.color} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation Footer */}
        <View style={[styles.footer, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
          <Pressable
            onPress={handlePrevious}
            disabled={currentDomainIndex === 0}
            style={[
              styles.navButton,
              { borderColor: palette.border },
              currentDomainIndex === 0 && { opacity: 0.3 },
            ]}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="chevron-back" size={20} color={palette.text} />
            <Text style={[styles.navButtonText, { color: palette.text }]}>Previous</Text>
          </Pressable>

          {currentDomainIndex < domains.length - 1 ? (
            <Pressable
              onPress={handleNext}
              style={[styles.navButton, { backgroundColor: palette.primary, borderColor: palette.primary }]}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={[styles.navButtonText, { color: '#FFF' }]}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFinish}
              disabled={!isComplete || isSaving}
              style={[
                styles.finishButton,
                { backgroundColor: isComplete ? '#10B981' : palette.border },
              ]}
              hitSlop={HIT_SLOP_8}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={[styles.finishButtonText, { marginLeft: 8 }]}>Saving...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  <Text style={styles.finishButtonText}>
                    {isComplete ? 'Complete Assessment' : `Answer ${domains.length - answeredCount} more`}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  answeredText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  questionCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  domainCode: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  domainName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  domainDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  examplesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  examplesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  optionsContainer: {
    padding: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
